import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'

vi.mock('socket.io-client', () => {
  const emit = vi.fn();
  const on = vi.fn().mockImplementation((event, listener) => {
    console.log(`SOCKET_FN_ON: ${event}`);
  });
  const off = vi.fn();
  const disconnect = vi.fn();
  const socket = { emit, on, off, disconnect };
  return {
    default: vi.fn(() => socket),
  }
});

// runs a clean after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
})