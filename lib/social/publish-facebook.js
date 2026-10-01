import { claimDelivery, deliveryDecision, getDelivery, updateDelivery } from './deliveries.js';
import { FacebookPublishError, publishFacebookFeedPost } from './facebook-publisher.js';
import { diagnoseMetaConnection } from './meta-client.js';
import { getPackage, isSourceCurrent, transitionPackagePublication, validHttps } from './packages.js';
import { resolveSource } from './source-adapters.js';
import { facebookWriteGateDiagnostics } from './write-gates.js';

function check(code, pass, message) {
  return { code, status: pass ? 'PASS' : 'FAIL', message };
}

export function evaluateFacebookPilot(packageValue, source, meta, delivery, {
  authorizedSourceId = '',
  expectedPageId = '',
  writeGateEnabled = false,
  ownerConfirmation = false
} = {}) {
  const decision = deliveryDecision(delivery);
  const checks = [
    check('PILOT_SOURCE', packageValue?.sourceType === 'music_release' &&
      Boolean(authorizedSourceId) && packageValue?.sourceId === authorizedSourceId,
    'Este piloto está restrito ao release Facebook autorizado.'),
    check('PACKAGE_APPROVED', packageValue?.status === 'APPROVED', 'O pacote deve estar aprovado.'),
    check('FACEBOOK_ONLY', Array.isArray(packageValue?.destinations) &&
      packageValue.destinations.length === 1 && packageValue.destinations[0] === 'facebook',
    'O piloto aceita somente Facebook como destino.'),
    check('FACEBOOK_CAPTION', Boolean(packageValue?.facebookCaption), 'A legenda aprovada do Facebook é obrigatória.'),
    check('DESTINATION_URL', validHttps(packageValue?.destinationUrl), 'A URL de destino deve usar HTTPS.'),
    check('SOURCE_CURRENT', isSourceCurrent(packageValue || {}, source), 'A fonte deve existir, permanecer elegível e manter a revisão aprovada.'),
    check('TOKEN_VALID', meta?.token?.valid === true, 'O Page Access Token deve permanecer válido.'),
    check('APP_ID_MATCH', meta?.token?.appIdMatches === true, 'O token deve continuar vinculado ao Meta App configurado.'),
    check('FACEBOOK_READY', meta?.facebook?.status === 'READY' && meta?.facebook?.capabilities?.feed === true,
      'A Facebook Page deve estar pronta para publicações de feed.'),
    check('PAGE_IDENTITY', Boolean(expectedPageId) && meta?.facebook?.identity?.id === expectedPageId,
      'A identidade retornada deve corresponder à Facebook Page configurada.'),
    check('DELIVERY_READY', decision === 'READY', decision === 'ALREADY_PUBLISHED'
      ? 'A publicação já possui remotePostId e não pode ser repetida.'
      : decision === 'RECONCILE_REQUIRED'
        ? 'A entrega está ambígua; reconciliação manual é obrigatória.'
        : decision === 'MANUAL_REVIEW_REQUIRED'
          ? 'A tentativa anterior exige revisão manual; retries automáticos estão desabilitados.'
          : 'A entrega deve estar inédita e pronta.'),
    check('WRITE_GATE', writeGateEnabled, 'O write gate específico do Facebook Pilot deve estar habilitado.'),
    check('OWNER_CONFIRMATION', ownerConfirmation === true, 'A confirmação explícita do Owner é obrigatória.')
  ];
  return { status: checks.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', checks };
}

class FacebookPilotError extends Error {
  constructor(status, code, message, diagnostics, metaDiagnostic) {
    super(message);
    this.status = status;
    this.code = code;
    this.diagnostics = diagnostics;
    this.metaDiagnostic = metaDiagnostic;
  }
}

function sanitizedFailure(error) {
  if (error instanceof FacebookPublishError) {
    return { code: error.code, diagnostic: error.diagnostic };
  }
  if (error?.code === 'DELIVERY_ALREADY_PUBLISHED' || error?.code === 'DELIVERY_RECONCILE_REQUIRED') {
    return { code: error.code, diagnostic: null };
  }
  return { code: 'FACEBOOK_PUBLISH_FAILED', diagnostic: null };
}

const defaultRepository = {
  getPackage,
  resolveSource,
  getDelivery,
  claimDelivery,
  updateDelivery,
  transitionPackagePublication
};

export async function publishFacebookPilot(packageId, ownerConfirmation, {
  env = process.env,
  fetchImpl = fetch,
  now = () => new Date(),
  repository = defaultRepository,
  diagnoseMeta = diagnoseMetaConnection
} = {}) {
  if (ownerConfirmation !== true) {
    throw new FacebookPilotError(409, 'OWNER_CONFIRMATION_REQUIRED', 'A confirmação explícita do Owner é obrigatória.');
  }

  const baseGate = facebookWriteGateDiagnostics(env);
  if (!baseGate.configurationEnabled) {
    throw new FacebookPilotError(403, 'FACEBOOK_SOCIAL_WRITES_DISABLED', 'A publicação real no Facebook está desabilitada neste ambiente.');
  }

  const packageValue = await repository.getPackage(packageId);
  if (!packageValue) throw new FacebookPilotError(404, 'PACKAGE_NOT_FOUND', 'Pacote social não encontrado.');

  const gate = facebookWriteGateDiagnostics(env, {
    sourceId: packageValue.sourceId,
    destination: packageValue.destinations?.length === 1 ? packageValue.destinations[0] : null
  });
  if (!gate.enabled) {
    throw new FacebookPilotError(403, 'FACEBOOK_SOCIAL_WRITES_DISABLED', 'A publicação real no Facebook está desabilitada neste ambiente.');
  }

  const [source, delivery, meta] = await Promise.all([
    repository.resolveSource(packageValue.sourceType, packageValue.sourceId, packageValue.language),
    repository.getDelivery(packageValue.id, 'facebook'),
    diagnoseMeta({ env, fetchImpl })
  ]);
  const diagnostics = evaluateFacebookPilot(packageValue, source, meta, delivery, {
    authorizedSourceId: gate.authorizedSourceId,
    expectedPageId: env.META_FACEBOOK_PAGE_ID,
    writeGateEnabled: gate.enabled,
    ownerConfirmation
  });
  if (diagnostics.status !== 'PASS') {
    throw new FacebookPilotError(409, 'FACEBOOK_PILOT_NOT_ELIGIBLE', 'O pacote não está elegível para publicação.', diagnostics);
  }

  let publishingPackage = null;
  let claimedDelivery = null;
  let remotePostId = null;
  try {
    publishingPackage = await repository.transitionPackagePublication(packageValue, 'PUBLISHING');
    claimedDelivery = await repository.claimDelivery(packageValue.id, 'facebook', 'PUBLISHING');

    remotePostId = await publishFacebookFeedPost({
      pageId: env.META_FACEBOOK_PAGE_ID,
      accessToken: env.META_FACEBOOK_PAGE_ACCESS_TOKEN,
      message: packageValue.facebookCaption,
      link: packageValue.destinationUrl,
      fetchImpl
    });
    const publishedAt = now().toISOString();
    claimedDelivery = await repository.updateDelivery(claimedDelivery, {
      status: 'PUBLISHED',
      remotePostId,
      publishedAt,
      lastError: null
    });
    publishingPackage = await repository.transitionPackagePublication(publishingPackage, 'PUBLISHED', { publishedAt });
    return {
      package: { ...publishingPackage, facebookDelivery: claimedDelivery },
      delivery: claimedDelivery,
      diagnostics
    };
  } catch (error) {
    const failure = sanitizedFailure(error);
    if (remotePostId) {
      throw new FacebookPilotError(
        409,
        'FACEBOOK_RECONCILE_REQUIRED',
        'A publicação foi criada no Facebook, mas a persistência exige reconciliação manual.',
        null,
        { requestPurpose: 'DELIVERY_PERSISTENCE', category: 'RECONCILE_REQUIRED', remotePostId }
      );
    }
    if (claimedDelivery) {
      await repository.updateDelivery(claimedDelivery, {
        status: 'FAILED',
        lastError: failure.code
      }).catch(() => {});
    }
    if (publishingPackage) {
      await repository.transitionPackagePublication(publishingPackage, 'FAILED').catch(() => {});
    }
    throw new FacebookPilotError(
      error?.status === 409 ? 409 : 502,
      failure.code,
      'A publicação no Facebook falhou sem retry automático.',
      null,
      failure.diagnostic
    );
  }
}
