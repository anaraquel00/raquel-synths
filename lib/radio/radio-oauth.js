import { google } from 'googleapis';

export const YOUTUBE_SCOPE = 'https://www.googleapis.com/auth/youtube';

const KEYS = [
  'RQS_YOUTUBE_CLIENT_ID',
  'RQS_YOUTUBE_CLIENT_SECRET',
  'RQS_YOUTUBE_REFRESH_TOKEN',
  'RQS_YOUTUBE_CHANNEL_ID'
];

function value(env, key) {
  return typeof env[key] === 'string' ? env[key].trim() : '';
}

export function radioOAuthConfiguration(env = process.env) {
  const values = Object.fromEntries(KEYS.map(key => [key, value(env, key)]));
  const missing = KEYS.filter(key => !values[key]);

  return {
    configured: missing.length === 0,
    missing,
    expectedChannelId: values.RQS_YOUTUBE_CHANNEL_ID || null,
    clientId: values.RQS_YOUTUBE_CLIENT_ID || null,
    clientSecret: values.RQS_YOUTUBE_CLIENT_SECRET || null,
    refreshToken: values.RQS_YOUTUBE_REFRESH_TOKEN || null
  };
}

export function youtubeOAuthClient(env = process.env) {
  const config = radioOAuthConfiguration(env);

  if (!config.configured) {
    const error = new Error('YOUTUBE_OAUTH_NOT_CONFIGURED');
    error.code = 'YOUTUBE_OAUTH_NOT_CONFIGURED';
    error.missing = config.missing;
    throw error;
  }

  const client = new google.auth.OAuth2(
    config.clientId,
    config.clientSecret
  );

  client.setCredentials({
    refresh_token: config.refreshToken
  });

  return {
    client,
    expectedChannelId: config.expectedChannelId
  };
}
