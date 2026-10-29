import { describe, it, expect } from 'vitest';
import { getFullAvatarUrl, getUsernameAvatarUrl } from './avatarUtils';

describe('Avatar Utility Functions', () => {
  describe('getFullAvatarUrl', () => {
    it('returns undefined when input is null or undefined', () => {
      // Arrange & Act
      const resultNull = getFullAvatarUrl(null);
      const resultUndefined = getFullAvatarUrl(undefined);

      // Assert
      expect(resultNull).toBeUndefined();
      expect(resultUndefined).toBeUndefined();
    });

    it('returns original url if it starts with http, https or blob', () => {
      // Arrange
      const httpUrl = 'http://example.com/avatar.png';
      const httpsUrl = 'https://example.com/avatar.png';
      const blobUrl = 'blob:http://localhost/123-456';

      // Act & Assert
      expect(getFullAvatarUrl(httpUrl)).toBe(httpUrl);
      expect(getFullAvatarUrl(httpsUrl)).toBe(httpsUrl);
      expect(getFullAvatarUrl(blobUrl)).toBe(blobUrl);
    });

    it('prepends leading slash and base api url correctly when path is relative', () => {
      // Arrange
      const relativePath = 'api/users/batuhan/avatar';

      // Act
      const result = getFullAvatarUrl(relativePath);

      // Assert
      expect(result).toBe(`/${relativePath}`);
    });
  });

  describe('getUsernameAvatarUrl', () => {
    it('returns undefined when username is missing', () => {
      // Arrange & Act
      const resultNull = getUsernameAvatarUrl(null);
      const resultUndefined = getUsernameAvatarUrl(undefined);

      // Assert
      expect(resultNull).toBeUndefined();
      expect(resultUndefined).toBeUndefined();
    });

    it('generates correct avatar path with timestamp query param when provided', () => {
      // Arrange
      const username = 'batuhan';
      const timestamp = 1700000000000;

      // Act
      const result = getUsernameAvatarUrl(username, timestamp);

      // Assert
      expect(result).toContain(`/api/users/${username}/avatar?t=${timestamp}`);
    });

    it('generates correct avatar path without timestamp query param when omitted', () => {
      // Arrange
      const username = 'batuhan';

      // Act
      const result = getUsernameAvatarUrl(username);

      // Assert
      expect(result).toContain(`/api/users/${username}/avatar`);
      expect(result).not.toContain('?t=');
    });
  });
});
