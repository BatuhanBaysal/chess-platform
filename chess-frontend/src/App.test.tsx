import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

describe('App Component', () => {
  it('renders without crashing', async () => {
    await act(async () => {
      render(
        <BrowserRouter>
          <App />
        </BrowserRouter>
      );
    });

    expect(document.body).toBeDefined();
  });
});
