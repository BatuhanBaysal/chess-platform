const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

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
  const path = `/api/users/${username}/avatar${timestamp ? `?t=${timestamp}` : ''}`;
  return getFullAvatarUrl(path);
};
