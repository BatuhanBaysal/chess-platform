import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

window.scrollTo = () => {};
window.HTMLElement.prototype.scrollIntoView = function() {};
window.HTMLElement.prototype.scrollTo = function() {};
