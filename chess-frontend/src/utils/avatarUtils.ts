const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

const SAFE_URL_PATTERN = /^(https?:\/\/|blob:|\/)/i;
const DANGEROUS_PROTOCOL_PATTERN = /^(javascript|data|vbscript):/i;

export const getFullAvatarUrl = (avatarPathOrUrl?: string | null): string | undefined => {
  if (!avatarPathOrUrl) return undefined;

  const trimmed = avatarPathOrUrl.trim();
  if (!trimmed || DANGEROUS_PROTOCOL_PATTERN.test(trimmed)) {
    return undefined;
  }

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('blob:')
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  const resolvedUrl = API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;

  return SAFE_URL_PATTERN.test(resolvedUrl) ? resolvedUrl : undefined;
};

export const getUsernameAvatarUrl = (username?: string | null, timestamp?: number): string | undefined => {
  if (!username) return undefined;
  const sanitizedUsername = encodeURIComponent(username.trim());
  const queryParam = timestamp !== undefined ? `?t=${timestamp}` : '';
  const path = `/api/users/${sanitizedUsername}/avatar${queryParam}`;
  return getFullAvatarUrl(path);
};
