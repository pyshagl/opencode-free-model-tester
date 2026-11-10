export const MARKER = 'MODEL_CHECK_OK_741';
export const PROMPT = `Reply with exactly ${MARKER}. Do not use tools, inspect files, or modify files.`;
export const ID_PATTERN = /^[a-z0-9][a-z0-9_.-]*\/[a-z0-9][a-z0-9_./:#-]*$/i;

export function safeText(input, max = 260) {
  return String(input ?? '')
    .replace(/AIza[A-Za-z0-9_-]{12,}/g, '[REDACTED_KEY]')
    .replace(/\bsk-[A-Za-z0-9_-]{12,}/g, '[REDACTED_KEY]')
    .replace(/\bBearer\s+[^\s"']+/gi, 'Bearer [REDACTED]')
    .replace(/([?&](?:key|token|api_key|access_token)=)[^\s&"']+/gi, '$1[REDACTED]')
    .replace(/[\r\n\t]+/g, ' ').replace(/\s{2,}/g, ' ').slice(0,max);
}

export function isFreeNamed(id) {
  const lower = id.toLowerCase();
  return /^opencode\/[a-z0-9._/-]+-free$/.test(lower)
    || /^openrouter\/.+:free$/.test(lower)
    || lower === 'openrouter/openrouter/free';
}

export function discoverModels(output, { approved = [], only = [], exclude = [], limit = 30 } = {}) {
  const approvedSet = new Set(approved.map(s => s.toLowerCase()));
  const onlySet = new Set(only.map(s => s.toLowerCase()));
  const excludeSet = new Set(exclude.map(s => s.toLowerCase()));
  return [...new Set(output.split(/\r?\n/).map(s => s.trim().toLowerCase()))]
    .filter(s => ID_PATTERN.test(s))
    .filter(s => isFreeNamed(s) || approvedSet.has(s))
    .filter(s => !onlySet.size || onlySet.has(s))
    .filter(s => !excludeSet.has(s.split('/')[0]))
    .sort().slice(0, limit);
}

export function parseEvents(stdout) {
  const texts = [];
  const errors = [];
  const actualModels = new Set();
  for (const line of stdout.split(/\r?\n/)) {
    if (!line.trim().startsWith('{')) continue;
    let event; try {event = JSON.parse(line);} catch {continue;}
    if (event.type === 'text') {
      const text = event.part?.text ?? event.properties?.part?.text;
      if (typeof text === 'string') texts.push(text);
    }
    if (event.type === 'error' || event.error || event.properties?.error) {
      errors.push(JSON.stringify(event.error || event.properties?.error || event));
    }
    const possibilities = [
      event, event.part, event.properties, event.properties?.part,
      event.model, event.part?.model, event.properties?.model, event.properties?.part?.model,
      event.info?.model, event.properties?.info?.model
    ];
    for (const item of possibilities) {
      if (!item || typeof item !== 'object') continue;
      const provider = item.providerID ?? item.providerId;
      const model = item.modelID ?? item.modelId;
      if (typeof provider === 'string' && typeof model === 'string') actualModels.add(`${provider}/${model}`.toLowerCase());
    }
  }
  return {texts, errors, actualModels:[...actualModels]};
}

export function classifyRun(result, requested) {
  const parsed = parseEvents(result.stdout || '');
  const details = [...parsed.errors, result.stderr || '', ...(result.code !== 0 ? [result.stdout || ''] : [])].join(' ');
  const lower = details.toLowerCase();
  const answer = parsed.texts.join(' ');
  const actual = parsed.actualModels;
  let status;
  if (result.timedOut) status = 'TIMEOUT';
  else if (/not available in your region|country not supported|geograph|geo.?block/.test(lower)) status = 'REGION';
  else if (/reset for security|invalid api key|invalid token|unauthori[sz]ed|revoked|\b401\b/.test(lower)) status = 'AUTH';
  else if (/wallet balance|insufficient balance|recharge|payment required|billing|\b402\b/.test(lower)) status = 'BILLING';
  else if (/free usage limit|rate.?limit|quota|free messages|too many requests|\b429\b/.test(lower)) status = 'QUOTA';
  else if (/no longer available|model not found|model is not available|\b404\b/.test(lower)) status = 'MODEL_UNAVAILABLE';
  else if (result.code !== 0 || parsed.errors.length) status = 'ERROR';
  else if (answer.includes(MARKER)) status = 'REPLY_UNVERIFIED';
  else if (answer.trim()) status = 'REPLIED_OTHER';
  else status = 'NO_REPLY';
  const normalized = requested.toLowerCase();
  if (['REPLY_UNVERIFIED','REPLIED_OTHER'].includes(status) && actual.length) {
    status = actual.length === 1 && actual[0] === normalized && answer.includes(MARKER)
      ? 'OK' : 'MODEL_MISMATCH';
  }
  return {model:requested, status, seconds:Number((result.ms/1000).toFixed(2)), actual_model:actual.join(';'), detail:safeText(details || (status==='REPLIED_OTHER' ? answer : ''))};
}

export function toCsv(rows) {
  const fields = ['model','status','seconds','actual_model','detail'];
  const quote = value => '"' + String(value ?? '').replace(/"/g,'""').replace(/^[=+@-]/,'\u0027$&') + '"';
  return [fields.join(','), ...rows.map(row=>fields.map(f=>quote(row[f])).join(','))].join('\r\n')+'\r\n';
}
