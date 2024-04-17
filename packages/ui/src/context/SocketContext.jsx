import { createContext } from 'react';

const SocketContext = createContext({
  socket: null,
  connectSocket: () => {
  },
  disconnectSocket: () => {
  }
});

export default SocketContext;