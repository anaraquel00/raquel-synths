import {
  getPublicStoreCampaignSelection
} from '../lib/store/campaigns.js';

export default async function handler(
  req,
  res
) {
  res.setHeader(
    'Cache-Control',
    'no-store'
  );

  res.setHeader(
    'X-Content-Type-Options',
    'nosniff'
  );

  if (req.method !== 'GET') {
    res.setHeader(
      'Allow',
      'GET'
    );

    return res.status(405).json({
      message:
        'Método não permitido.'
    });
  }

  try {
    const selection =
      await getPublicStoreCampaignSelection();

    return res.status(200).json({
      generatedAt:
        new Date().toISOString(),

      ...selection
    });
  } catch (error) {
    console.error(
      '[RQS STORE CAMPAIGN]',
      error instanceof Error
        ? error.message
        : 'Unknown error'
    );

    return res.status(502).json({
      message:
        'Campaign signal temporarily unavailable.',

      heroSignal: null,
      currentSignal: null
    });
  }
}
