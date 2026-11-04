import { google } from 'googleapis';
import {
  radioOAuthConfiguration,
  youtubeOAuthClient
} from './radio-oauth.js';

function safeError(error) {
  const status = Number(error?.response?.status || error?.code || 0);
  const reason =
    error?.response?.data?.error?.errors?.[0]?.reason ||
    error?.response?.data?.error?.status ||
    '';

  return {
    category:
      status === 401 ? 'AUTHENTICATION' :
      status === 403 ? 'PERMISSION_OR_QUOTA' :
      status === 429 ? 'RATE_LIMIT' :
      status >= 500 ? 'YOUTUBE_SERVICE' :
      'YOUTUBE_API_ERROR',
    httpStatus: Number.isFinite(status) && status > 0 ? status : null,
    reason: String(reason || '').slice(0, 120) || null
  };
}

function safeStream(stream) {
  return {
    id: String(stream?.id || ''),
    title: String(stream?.snippet?.title || ''),
    streamStatus: String(stream?.status?.streamStatus || ''),
    healthStatus: String(stream?.status?.healthStatus?.status || ''),
    isReusable: stream?.contentDetails?.isReusable === true
  };
}

export async function diagnoseYouTubeConnection({ env = process.env } = {}) {
  const config = radioOAuthConfiguration(env);

  if (!config.configured) {
    return {
      configurationStatus: 'NOT_CONFIGURED',
      missingConfiguration: config.missing,
      channelStatus: 'NOT_CHECKED',
      channel: null,
      reusableStream: null,
      streams: [],
      checkedAt: new Date().toISOString()
    };
  }

  try {
    const { client, expectedChannelId } = youtubeOAuthClient(env);
    const youtube = google.youtube({ version: 'v3', auth: client });

    const channelResult = await youtube.channels.list({
      part: ['id', 'snippet'],
      mine: true,
      maxResults: 1
    });

    const channel = channelResult.data.items?.[0] || null;
    const actualChannelId = String(channel?.id || '');
    const channelMatches = Boolean(
      actualChannelId &&
      expectedChannelId &&
      actualChannelId === expectedChannelId
    );

    let streams = [];
    try {
      const streamResult = await youtube.liveStreams.list({
        part: ['id', 'snippet', 'status', 'contentDetails'],
        mine: true,
        maxResults: 50
      });
      streams = (streamResult.data.items || []).map(safeStream);
    } catch {
      streams = [];
    }

    const reusableStream = streams.find(stream => stream.isReusable) || null;

    return {
      configurationStatus: 'READY',
      missingConfiguration: [],
      channelStatus: channelMatches ? 'MATCH' : 'MISMATCH',
      channel: channel
        ? {
            id: actualChannelId,
            title: String(channel.snippet?.title || '')
          }
        : null,
      reusableStream,
      streams,
      checkedAt: new Date().toISOString()
    };
  } catch (error) {
    return {
      configurationStatus: 'ERROR',
      missingConfiguration: [],
      channelStatus: 'ERROR',
      channel: null,
      reusableStream: null,
      streams: [],
      diagnostic: safeError(error),
      checkedAt: new Date().toISOString()
    };
  }
}
