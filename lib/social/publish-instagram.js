import { getDelivery, claimDelivery, deliveryDecision, updateDelivery } from './deliveries.js';
import { createInstagramImageContainer, InstagramPublishError, publishInstagramContainer } from './instagram-publisher.js';
import { diagnoseMetaConnection } from './meta-client.js';
import { getPackage, isSourceCurrent, reconcilePackagePublication, validHttps } from './packages.js';
import { resolveSource } from './source-adapters.js';
import { instagramWriteGateDiagnostics } from './write-gates.js';

function check(code, pass, message) {
  return { code, status: pass ? 'PASS' : 'FAIL', message };
}

export function evaluateInstagramPilot(packageValue, source, meta, delivery, {
  authorizedSourceId = '',
  writeGateEnabled = false,
  ownerConfirmation = false
} = {}) {
  const decision = deliveryDecision(delivery);
  const checks = [
    check('AUTHORIZED_SOURCE', packageValue?.sourceType === 'music_release' &&
      Boolean(authorizedSourceId) && packageValue?.sourceId === authorizedSourceId,
    'O release deve corresponder à fonte Instagram autorizada.'),
    check('PACKAGE_APPROVED', packageValue?.status === 'APPROVED', 'O pacote deve estar aprovado.'),
    check('INSTAGRAM_SELECTED', Array.isArray(packageValue?.destinations) &&
      packageValue.destinations.includes('instagram'),
    'O Instagram deve estar selecionado como destino.'),
    check('IMAGE_ONLY', packageValue?.socialAssetType === 'IMAGE', 'O piloto aceita somente imagem.'),
    check('ASSET_URL', validHttps(packageValue?.socialAssetUrl), 'O asset deve usar uma URL HTTPS válida.'),
    check('INSTAGRAM_CAPTION', Boolean(packageValue?.instagramCaption), 'A legenda aprovada do Instagram é obrigatória.'),
    check('SOURCE_CURRENT', isSourceCurrent(packageValue || {}, source), 'A fonte deve existir, permanecer elegível e manter a revisão aprovada.'),
    check('TOKEN_VALID', meta?.token?.valid === true && meta?.token?.appIdMatches === true, 'O token deve permanecer válido e vinculado ao App configurado.'),
    check('INSTAGRAM_READY', meta?.instagram?.status === 'READY' && meta?.instagram?.capabilities?.feed === true, 'A conexão Instagram deve estar pronta para feed.'),
    check('PAGE_IG_RELATIONSHIP', meta?.relationship?.status === 'MATCH', 'O vínculo Page/Instagram deve continuar válido.'),
    check('DELIVERY_READY', decision === 'READY', decision === 'ALREADY_PUBLISHED'
      ? 'A publicação já possui remotePostId e não pode ser repetida.'
      : decision === 'RECONCILE_REQUIRED'
        ? 'Já existe um container remoto; reconciliação manual é obrigatória.'
        : decision === 'MANUAL_REVIEW_REQUIRED'
          ? 'A tentativa anterior exige revisão manual; retries automáticos estão desabilitados.'
          : 'A entrega deve estar inédita e pronta.'),
    check('WRITE_GATE', writeGateEnabled, 'O write gate específico do Instagram deve estar habilitado.'),
    check('OWNER_CONFIRMATION', ownerConfirmation === true, 'A confirmação explícita do Owner é obrigatória.')
  ];
  return { status: checks.every(item => item.status === 'PASS') ? 'PASS' : 'FAIL', checks };
}

class InstagramPilotError extends Error {
  constructor(status, code, message, diagnostics, metaDiagnostic) {
    super(message);
    this.status = status;
    this.code = code;
    this.diagnostics = diagnostics;
    this.metaDiagnostic = metaDiagnostic;
  }
}

function sanitizedFailure(error) {
  if (error instanceof InstagramPublishError) {
    return { code: error.code, diagnostic: error.diagnostic };
  }
  if (error?.code === 'DELIVERY_ALREADY_PUBLISHED' || error?.code === 'DELIVERY_RECONCILE_REQUIRED') {
    return { code: error.code, diagnostic: null };
  }
  return { code: 'INSTAGRAM_PUBLISH_FAILED', diagnostic: null };
}

const defaultRepository = {
  getPackage,
  resolveSource,
  getDelivery,
  claimDelivery,
  updateDelivery,
  reconcilePackagePublication
};

export async function publishInstagramPilot(packageId, ownerConfirmation, {
  env = process.env,
  fetchImpl = fetch,
  now = () => new Date(),
  repository = defaultRepository,
  diagnoseMeta = diagnoseMetaConnection
} = {}) {
  if (ownerConfirmation !== true) {
    throw new InstagramPilotError(
      409,
      'OWNER_CONFIRMATION_REQUIRED',
      'A confirmação explícita do Owner é obrigatória.'
    );
  }

  const baseGate = instagramWriteGateDiagnostics(env);

  if (!baseGate.configurationEnabled) {
    throw new InstagramPilotError(
      403,
      'INSTAGRAM_SOCIAL_WRITES_DISABLED',
      'A publicação real no Instagram está desabilitada neste ambiente.'
    );
  }

  const packageValue = await repository.getPackage(packageId);
  if (!packageValue) {
    throw new InstagramPilotError(
      404,
      'PACKAGE_NOT_FOUND',
      'Pacote social não encontrado.'
    );
  }

  const gate = instagramWriteGateDiagnostics(env, {
    sourceId: packageValue.sourceId,
    destination: 'instagram'
  });

  if (!gate.enabled) {
    throw new InstagramPilotError(
      403,
      'INSTAGRAM_SOCIAL_WRITES_DISABLED',
      'A publicação real no Instagram está desabilitada neste ambiente.'
    );
  }

  const [source, delivery, meta] = await Promise.all([
    repository.resolveSource(
      packageValue.sourceType,
      packageValue.sourceId,
      packageValue.language
    ),
    repository.getDelivery(packageValue.id, 'instagram'),
    diagnoseMeta({ env, fetchImpl })
  ]);

  const diagnostics = evaluateInstagramPilot(
    packageValue,
    source,
    meta,
    delivery,
    {
      authorizedSourceId: gate.authorizedSourceId,
      writeGateEnabled: gate.enabled,
      ownerConfirmation
    }
  );
  if (diagnostics.status !== 'PASS') {
    throw new InstagramPilotError(409, 'INSTAGRAM_PILOT_NOT_ELIGIBLE', 'O pacote não está elegível para publicação.', diagnostics);
  }

  let claimedDelivery = null;
  let remotePostRecorded = false;

  try {
    claimedDelivery = await repository.claimDelivery(
      packageValue.id,
      'instagram'
    );

    const remoteContainerId = await createInstagramImageContainer({
      igUserId: env.META_IG_USER_ID,
      accessToken: env.META_FACEBOOK_PAGE_ACCESS_TOKEN,
      imageUrl: packageValue.socialAssetUrl,
      caption: packageValue.instagramCaption,
      fetchImpl
    });

    claimedDelivery = await repository.updateDelivery(claimedDelivery, {
      status: 'CONTAINER_CREATED',
      remoteContainerId,
      lastError: null
    });

    const remotePostId = await publishInstagramContainer({
      igUserId: env.META_IG_USER_ID,
      accessToken: env.META_FACEBOOK_PAGE_ACCESS_TOKEN,
      creationId: remoteContainerId,
      fetchImpl
    });

    const publishedAt = now().toISOString();

    claimedDelivery = await repository.updateDelivery(claimedDelivery, {
      status: 'PUBLISHED',
      remotePostId,
      publishedAt,
      lastError: null
    });

    remotePostRecorded = true;

    const reconciledPackage = await repository.reconcilePackagePublication(
      packageValue.id,
      publishedAt
    );

    return {
      package: {
        ...reconciledPackage,
        instagramDelivery: claimedDelivery
      },
      delivery: claimedDelivery,
      diagnostics
    };
  } catch (error) {
    const failure = sanitizedFailure(error);

    if (claimedDelivery && !remotePostRecorded) {
      await repository.updateDelivery(claimedDelivery, {
        status: 'FAILED',
        lastError: failure.code
      }).catch(() => {});
    }

    throw new InstagramPilotError(
      error?.status === 409 ? 409 : 502,
      failure.code,
      remotePostRecorded
        ? 'A publicação foi criada, mas o pacote exige reconciliação manual.'
        : 'A publicação no Instagram falhou sem retry automático.',
      null,
      failure.diagnostic
    );
  }
}
