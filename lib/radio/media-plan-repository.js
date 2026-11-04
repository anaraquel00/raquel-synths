import {
  randomUUID
} from 'node:crypto';

import {
  google
} from 'googleapis';

import {
  deriveMediaPlanStatus,
  MEDIA_PLAN_DRY_RUN_STATUSES,
  MEDIA_PLAN_KINDS,
  MEDIA_PLAN_STATUSES
} from './media-plan-state.js';

const PROJECT_ID =
  process.env
    .GOOGLE_CLOUD_PROJECT ||
  'raquel-synths-platform';

export const MEDIA_PLAN_COLLECTION =
  'media-plans';

const MAX_PAGES = 5;
const PAGE_SIZE = 100;

export class MediaPlanError
extends Error {
  constructor(
    status,
    code,
    message,
    details
  ) {
    super(message);

    this.name =
      'MediaPlanError';

    this.status =
      status;

    this.code =
      code;

    this.details =
      details;
  }
}

function firestoreAuth() {
  const raw =
    process.env
      .FIREBASE_ADMIN_SERVICE_ACCOUNT_JSON;

  if (!raw) {
    throw new MediaPlanError(
      500,
      'MISSING_FIRESTORE_CONFIGURATION',
      'Credencial Firestore não configurada.'
    );
  }

  let credentials;

  try {
    credentials =
      JSON.parse(raw);

    if (
      credentials
        .private_key
    ) {
      credentials
        .private_key =
        credentials
          .private_key
          .replace(
            /\\n/g,
            '\n'
          );
    }
  } catch {
    throw new MediaPlanError(
      500,
      'INVALID_FIRESTORE_CONFIGURATION',
      'Credencial Firestore inválida.'
    );
  }

  return new google.auth.GoogleAuth({
    credentials,

    projectId:
      credentials.project_id ||
      PROJECT_ID,

    scopes: [
      'https://www.googleapis.com/auth/datastore'
    ]
  });
}

async function accessToken() {
  const auth =
    await firestoreAuth()
      .getClient();

  const access =
    await auth
      .getAccessToken();

  const token =
    typeof access ===
    'string'
      ? access
      : access?.token;

  if (!token) {
    throw new MediaPlanError(
      502,
      'FIRESTORE_AUTH_FAILED',
      'Não foi possível autenticar no Firestore.'
    );
  }

  return token;
}

function collectionUrl() {
  return new URL(
    `https://firestore.googleapis.com/v1/projects/` +
    `${encodeURIComponent(PROJECT_ID)}/databases/(default)/documents/` +
    `${encodeURIComponent(MEDIA_PLAN_COLLECTION)}`
  );
}

function documentUrl(
  documentId
) {
  return new URL(
    `${collectionUrl().toString()}/` +
    encodeURIComponent(
      documentId
    )
  );
}

function parseFirestoreValue(
  value = {}
) {
  if (
    'stringValue' in value
  ) {
    return value.stringValue;
  }

  if (
    'booleanValue' in value
  ) {
    return Boolean(
      value.booleanValue
    );
  }

  if (
    'integerValue' in value
  ) {
    return Number(
      value.integerValue
    );
  }

  if (
    'doubleValue' in value
  ) {
    return Number(
      value.doubleValue
    );
  }

  if (
    'nullValue' in value
  ) {
    return null;
  }

  if (
    'arrayValue' in value
  ) {
    return (
      value
        .arrayValue
        ?.values || []
    )
      .map(
        parseFirestoreValue
      );
  }

  if (
    'mapValue' in value
  ) {
    return Object
      .fromEntries(
        Object.entries(
          value
            .mapValue
            ?.fields || {}
        )
          .map(
            ([key, item]) => [
              key,
              parseFirestoreValue(
                item
              )
            ]
          )
      );
  }

  return null;
}

function mapDocument(
  document
) {
  const id =
    String(
      document?.name || ''
    )
      .split('/')
      .pop() || '';

  return {
    id,

    updateTime:
      document
        ?.updateTime ||
      null,

    ...Object.fromEntries(
      Object.entries(
        document
          ?.fields || {}
      )
        .map(
          ([key, value]) => [
            key,
            parseFirestoreValue(
              value
            )
          ]
        )
    )
  };
}

function stringValue(
  value
) {
  return {
    stringValue:
      String(
        value ?? ''
      )
  };
}

function booleanValue(
  value
) {
  return {
    booleanValue:
      Boolean(value)
  };
}

function integerValue(
  value
) {
  return {
    integerValue:
      String(
        Math.trunc(
          Number(value) || 0
        )
      )
  };
}

function arrayValue(
  values
) {
  return {
    arrayValue: {
      values:
        (values || [])
          .map(
            item =>
              stringValue(
                item
              )
          )
    }
  };
}

function mapValue(
  fields
) {
  return {
    mapValue: {
      fields
    }
  };
}

function nullableStringMap(
  value
) {
  if (
    !value ||
    typeof value !==
      'object'
  ) {
    return mapValue({});
  }

  return mapValue(
    Object.fromEntries(
      Object.entries(value)
        .filter(
          ([, item]) =>
            item !==
            undefined
        )
        .map(
          ([key, item]) => [
            key,
            stringValue(
              item ?? ''
            )
          ]
        )
    )
  );
}

function planFields(
  plan
) {
  return {
    schemaVersion:
      integerValue(
        plan.schemaVersion
      ),

    kind:
      stringValue(
        plan.kind
      ),

    status:
      stringValue(
        plan.status
      ),

    title:
      stringValue(
        plan.title
      ),

    description:
      stringValue(
        plan.description
      ),

    scheduledStartTime:
      stringValue(
        plan
          .scheduledStartTime
      ),

    visibility:
      stringValue(
        plan.visibility
      ),

    thumbnailUrl:
      stringValue(
        plan.thumbnailUrl
      ),

    playlistId:
      stringValue(
        plan.playlistId
      ),

    setlist:
      arrayValue(
        plan.setlist
      ),

    autoStart:
      booleanValue(
        plan.autoStart
      ),

    autoStop:
      booleanValue(
        plan.autoStop
      ),

    dryRunStatus:
      stringValue(
        plan.dryRunStatus
      ),

    dryRunAt:
      stringValue(
        plan.dryRunAt || ''
      ),

    youtubeVideoId:
      stringValue(
        plan.youtubeVideoId || ''
      ),

    youtubeBroadcastId:
      stringValue(
        plan.youtubeBroadcastId || ''
      ),

    youtubeStreamId:
      stringValue(
        plan.youtubeStreamId || ''
      ),

    revision:
      integerValue(
        plan.revision
      ),

    createdAt:
      stringValue(
        plan.createdAt
      ),

    updatedAt:
      stringValue(
        plan.updatedAt
      ),

    createdBy:
      stringValue(
        plan.createdBy ||
        'RQS_ADMIN'
      ),

    lastError:
      nullableStringMap(
        plan.lastError
      )
  };
}

function normalizeStoredPlan(
  raw
) {
  const kind =
    MEDIA_PLAN_KINDS
      .includes(
        raw.kind
      )
      ? raw.kind
      : 'weekly-video';

  const status =
    MEDIA_PLAN_STATUSES
      .includes(
        raw.status
      )
      ? raw.status
      : 'ERROR';

  const dryRunStatus =
    MEDIA_PLAN_DRY_RUN_STATUSES
      .includes(
        raw.dryRunStatus
      )
      ? raw.dryRunStatus
      : 'NOT_RUN';

  return {
    id:
      String(
        raw.id || ''
      ),

    updateTime:
      raw.updateTime ||
      null,

    schemaVersion:
      Number(
        raw.schemaVersion
      ) || 1,

    kind,
    status,

    title:
      String(
        raw.title || ''
      ),

    description:
      String(
        raw.description || ''
      ),

    scheduledStartTime:
      String(
        raw.scheduledStartTime ||
        ''
      ),

    visibility:
      String(
        raw.visibility ||
        'unlisted'
      ),

    thumbnailUrl:
      String(
        raw.thumbnailUrl ||
        ''
      ),

    playlistId:
      String(
        raw.playlistId ||
        ''
      ),

    setlist:
      Array.isArray(
        raw.setlist
      )
        ? raw.setlist
            .map(
              item =>
                String(item)
            )
        : [],

    autoStart:
      raw.autoStart ===
      true,

    autoStop:
      raw.autoStop ===
      true,

    dryRunStatus,

    dryRunAt:
      String(
        raw.dryRunAt ||
        ''
      ) || null,

    youtubeVideoId:
      String(
        raw.youtubeVideoId ||
        ''
      ) || null,

    youtubeBroadcastId:
      String(
        raw.youtubeBroadcastId ||
        ''
      ) || null,

    youtubeStreamId:
      String(
        raw.youtubeStreamId ||
        ''
      ) || null,

    revision:
      Number(
        raw.revision
      ) || 1,

    createdAt:
      String(
        raw.createdAt ||
        ''
      ),

    updatedAt:
      String(
        raw.updatedAt ||
        ''
      ),

    createdBy:
      String(
        raw.createdBy ||
        'RQS_ADMIN'
      ),

    lastError:
      raw.lastError &&
      typeof raw.lastError ===
        'object'
        ? raw.lastError
        : null
  };
}

async function readPlan(
  documentId
) {
  const token =
    await accessToken();

  const response =
    await fetch(
      documentUrl(
        documentId
      ),
      {
        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  if (
    response.status ===
    404
  ) {
    return null;
  }

  if (!response.ok) {
    throw new MediaPlanError(
      502,
      'MEDIA_PLAN_READ_FAILED',
      'O Firestore recusou a leitura do plano.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return normalizeStoredPlan(
    mapDocument(
      await response.json()
    )
  );
}

async function writeExistingPlan(
  documentId,
  updateTime,
  plan
) {
  const token =
    await accessToken();

  const url =
    documentUrl(
      documentId
    );

  url.searchParams.set(
    'currentDocument.updateTime',
    updateTime
  );

  const response =
    await fetch(
      url,
      {
        method: 'PATCH',

        headers: {
          Authorization:
            `Bearer ${token}`,

          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify({
            fields:
              planFields(
                plan
              )
          })
      }
    );

  if (
    response.status === 409 ||
    response.status === 412
  ) {
    throw new MediaPlanError(
      409,
      'MEDIA_PLAN_CONFLICT',
      'O plano foi alterado em outra sessão. Recarregue a fila antes de salvar novamente.'
    );
  }

  if (!response.ok) {
    throw new MediaPlanError(
      502,
      'MEDIA_PLAN_UPDATE_FAILED',
      'O Firestore recusou a atualização do plano.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return normalizeStoredPlan(
    mapDocument(
      await response.json()
    )
  );
}

async function createPlan(
  documentId,
  plan
) {
  const token =
    await accessToken();

  const url =
    collectionUrl();

  url.searchParams.set(
    'documentId',
    documentId
  );

  const response =
    await fetch(
      url,
      {
        method: 'POST',

        headers: {
          Authorization:
            `Bearer ${token}`,

          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify({
            fields:
              planFields(
                plan
              )
          })
      }
    );

  if (
    response.status ===
    409
  ) {
    throw new MediaPlanError(
      409,
      'MEDIA_PLAN_ALREADY_EXISTS',
      'O identificador do plano já existe.'
    );
  }

  if (!response.ok) {
    throw new MediaPlanError(
      502,
      'MEDIA_PLAN_CREATE_FAILED',
      'O Firestore recusou a criação do plano.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return normalizeStoredPlan(
    mapDocument(
      await response.json()
    )
  );
}

export async function listMediaPlans() {
  const token =
    await accessToken();

  const output = [];
  let pageToken = null;

  for (
    let page = 0;
    page < MAX_PAGES;
    page += 1
  ) {
    const url =
      collectionUrl();

    url.searchParams.set(
      'pageSize',
      String(PAGE_SIZE)
    );

    if (pageToken) {
      url.searchParams.set(
        'pageToken',
        pageToken
      );
    }

    const response =
      await fetch(
        url,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );

    if (!response.ok) {
      throw new MediaPlanError(
        502,
        'MEDIA_PLAN_LIST_FAILED',
        'O Firestore recusou a leitura da Publishing Queue.',
        {
          firestoreStatus:
            response.status
        }
      );
    }

    const payload =
      await response.json();

    output.push(
      ...(
        payload.documents ||
        []
      )
        .map(
          mapDocument
        )
        .map(
          normalizeStoredPlan
        )
    );

    pageToken =
      payload.nextPageToken ||
      null;

    if (!pageToken) {
      break;
    }
  }

  return output;
}

export async function saveMediaPlan({
  id,
  sourceUpdateTime,
  draft,
  dryRunStatus
}) {
  const now =
    new Date()
      .toISOString();

  const currentId =
    String(
      id || ''
    )
      .trim();

  if (currentId) {
    const current =
      await readPlan(
        currentId
      );

    if (!current) {
      throw new MediaPlanError(
        404,
        'MEDIA_PLAN_NOT_FOUND',
        'O plano não existe.'
      );
    }

    if (
      !sourceUpdateTime ||
      sourceUpdateTime !==
        current.updateTime
    ) {
      throw new MediaPlanError(
        409,
        'MEDIA_PLAN_CONFLICT',
        'A versão local do plano está desatualizada. Recarregue a fila.'
      );
    }

    if (
      [
        'CANCELLED',
        'COMPLETE'
      ].includes(
        current.status
      )
    ) {
      throw new MediaPlanError(
        409,
        'MEDIA_PLAN_TERMINAL',
        'Planos concluídos ou cancelados não podem ser editados.'
      );
    }

    if (
      current.kind !==
      draft.kind
    ) {
      throw new MediaPlanError(
        409,
        'MEDIA_PLAN_KIND_IMMUTABLE',
        'O tipo de uma sessão existente não pode ser alterado.'
      );
    }

    const next = {
      ...current,
      ...draft,

      status:
        deriveMediaPlanStatus(
          draft,
          dryRunStatus
        ),

      dryRunStatus,

      dryRunAt:
        dryRunStatus ===
        'NOT_RUN'
          ? null
          : now,

      revision:
        current.revision + 1,

      updatedAt:
        now,

      lastError:
        null
    };

    return writeExistingPlan(
      current.id,
      current.updateTime,
      next
    );
  }

  const documentId =
    randomUUID();

  const plan = {
    id:
      documentId,

    schemaVersion: 1,

    ...draft,

    status:
      deriveMediaPlanStatus(
        draft,
        dryRunStatus
      ),

    dryRunStatus,

    dryRunAt:
      dryRunStatus ===
      'NOT_RUN'
        ? null
        : now,

    youtubeVideoId:
      null,

    youtubeBroadcastId:
      null,

    youtubeStreamId:
      null,

    revision: 1,

    createdAt:
      now,

    updatedAt:
      now,

    createdBy:
      'RQS_ADMIN',

    lastError:
      null
  };

  return createPlan(
    documentId,
    plan
  );
}

export async function cancelMediaPlan({
  id,
  sourceUpdateTime
}) {
  const current =
    await readPlan(id);

  if (!current) {
    throw new MediaPlanError(
      404,
      'MEDIA_PLAN_NOT_FOUND',
      'O plano não existe.'
    );
  }

  if (
    !sourceUpdateTime ||
    sourceUpdateTime !==
      current.updateTime
  ) {
    throw new MediaPlanError(
      409,
      'MEDIA_PLAN_CONFLICT',
      'A versão local do plano está desatualizada. Recarregue a fila.'
    );
  }

  if (
    current.status ===
    'COMPLETE'
  ) {
    throw new MediaPlanError(
      409,
      'MEDIA_PLAN_TERMINAL',
      'Um plano concluído não pode ser cancelado.'
    );
  }

  if (
    current.status ===
    'CANCELLED'
  ) {
    return current;
  }

  const next = {
    ...current,

    status:
      'CANCELLED',

    revision:
      current.revision + 1,

    updatedAt:
      new Date()
        .toISOString()
  };

  return writeExistingPlan(
    current.id,
    current.updateTime,
    next
  );
}

export async function deleteMediaPlan({
  id,
  sourceUpdateTime
}) {
  const current =
    await readPlan(id);

  if (!current) {
    return {
      id,
      deleted: true
    };
  }

  if (
    !sourceUpdateTime ||
    sourceUpdateTime !==
      current.updateTime
  ) {
    throw new MediaPlanError(
      409,
      'MEDIA_PLAN_CONFLICT',
      'A versão local do plano está desatualizada. Recarregue a fila.'
    );
  }

  if (
    ![
      'DRAFT',
      'CANCELLED'
    ].includes(
      current.status
    )
  ) {
    throw new MediaPlanError(
      409,
      'MEDIA_PLAN_DELETE_BLOCKED',
      'Apenas planos DRAFT ou CANCELLED podem ser excluídos permanentemente.'
    );
  }

  const token =
    await accessToken();

  const url =
    documentUrl(
      current.id
    );

  url.searchParams.set(
    'currentDocument.updateTime',
    current.updateTime
  );

  const response =
    await fetch(
      url,
      {
        method: 'DELETE',

        headers: {
          Authorization:
            `Bearer ${token}`
        }
      }
    );

  if (
    response.status === 409 ||
    response.status === 412
  ) {
    throw new MediaPlanError(
      409,
      'MEDIA_PLAN_CONFLICT',
      'O plano mudou antes da exclusão. Recarregue a fila.'
    );
  }

  if (!response.ok) {
    throw new MediaPlanError(
      502,
      'MEDIA_PLAN_DELETE_FAILED',
      'O Firestore recusou a exclusão do plano.',
      {
        firestoreStatus:
          response.status
      }
    );
  }

  return {
    id:
      current.id,
    deleted:
      true
  };
}
