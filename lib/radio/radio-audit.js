const SECRET_PATTERN =
  /(token|secret|stream.?key|stream.?name|authorization|credential)/i;

function sanitize(value) {
  if (Array.isArray(value)) return value.map(sanitize);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        SECRET_PATTERN.test(key) ? '[REDACTED]' : sanitize(item)
      ])
    );
  }

  if (typeof value === 'string') {
    return value.length > 300 ? `${value.slice(0, 300)}…` : value;
  }

  return value;
}

export function radioAudit(event, data = {}) {
  console.info('[RQS RADIO]', JSON.stringify({
    event,
    at: new Date().toISOString(),
    ...sanitize(data)
  }));
}
