import {vitest} from 'vitest'

export default () => {
  vitest.mock('socket.io-client', () => {
    const emit = vitest.fn();
    const on = vitest.fn().mockImplementation((event, listener) => {
      console.log(`SOCKET_FN_ON: ${event}`);
    });
    const off = vitest.fn();
    const disconnect = vitest.fn();
    const socket = {emit, on, off, disconnect};
    return {
      default: vitest.fn(() => socket),
    }
  })
};