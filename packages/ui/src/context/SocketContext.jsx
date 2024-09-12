import { createContext } from 'react';

const SocketContext = createContext({
  socket: null,
  createSocket: () => {},
  disconnectSocket: () => {},
  resetSocket: () => {},
});

export default SocketContext;
