const API_BASE = (typeof process !== 'undefined' && process.env && typeof process.env.REACT_APP_API_BASE === 'string') ? process.env.REACT_APP_API_BASE.trim() : '';

export { API_BASE };

function buildUrl(path) {
  if (!path) return API_BASE || '';

  if (path.startsWith('http://') || path.startsWith('https://')) return path;

  const base = API_BASE || '';

  if (base.endsWith('/') && path.startsWith('/')) return base.slice(0, -1) + path;
  if (!base && path.startsWith('/')) return path;
  if (!base && !path.startsWith('/')) return '/' + path;
  if (base && !base.endsWith('/') && !path.startsWith('/')) return base + '/' + path;
  return base + path;
}

export async function apiFetch(path, { method = 'GET', body, token } = {}) {
  const headers = {};

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const effectiveToken = token || (typeof localStorage !== 'undefined' && localStorage.getItem('token'));
  if (effectiveToken) headers['Authorization'] = `Bearer ${effectiveToken}`;

  const url = buildUrl(path);

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  const ct = res.headers.get('content-type') || '';

  const parseBody = async () => {
    try {
      if (ct.includes('application/json')) return await res.json();
      return await res.text();
    } catch (e) {
      return null;
    }
  };

  if (!res.ok) {
    const parsed = await parseBody();
    const msg = parsed && typeof parsed === 'object' ? (parsed.error || parsed.message || JSON.stringify(parsed)) : (parsed || `HTTP ${res.status}`);
    throw new Error(msg);
  }

  if (res.status === 204) return null;
  const parsed = await parseBody();
  return parsed;
}
