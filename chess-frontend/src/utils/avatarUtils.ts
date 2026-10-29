const rawApiUrl = (import.meta.env.VITE_API_URL || '').trim();
const API_BASE_URL = rawApiUrl.endsWith('/') ? rawApiUrl.slice(0, -1) : rawApiUrl;

export const getFullAvatarUrl = (avatarPathOrUrl?: string | null): string | undefined => {
  if (!avatarPathOrUrl) return undefined;

  if (
    avatarPathOrUrl.startsWith('http://') ||
    avatarPathOrUrl.startsWith('https://') ||
    avatarPathOrUrl.startsWith('blob:')
  ) {
    return avatarPathOrUrl;
  }

  const cleanPath = avatarPathOrUrl.startsWith('/') ? avatarPathOrUrl : `/${avatarPathOrUrl}`;
  
  return API_BASE_URL ? `${API_BASE_URL}${cleanPath}` : cleanPath;
};

export const getUsernameAvatarUrl = (username?: string | null, timestamp?: number): string | undefined => {
  if (!username) return undefined;
  const queryParam = timestamp !== undefined ? `?t=${timestamp}` : '';
  const path = `/api/users/${username}/avatar${queryParam}`;
  return getFullAvatarUrl(path);
};
