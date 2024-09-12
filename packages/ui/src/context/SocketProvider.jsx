/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useState } from "react";
import io from 'socket.io-client';
import SocketContext from "./SocketContext";
import DataContext from "./DataContext";

export function SocketProvider({ children }) {
  const { providerConfig } = useContext(DataContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const createSocket = useCallback(() => {
    if (!providerConfig || !providerConfig.socketHost) return;
    const { socketHost, socketPath, token } = providerConfig

    const socketIo = io(socketHost, {
      path: socketPath,
      reconnectionDelayMax: 2000,
      extraHeaders: {'Authorization': `Bearer ${token}`}
    })

    socketIo.on('connect', () => {
      console.log('sio connected', socketIo)
      setConnected(socketIo.connected)
    })
    socketIo?.on("connect_error", (err) => {
      console.log(`Connection error due to ${err}`);
      setConnected(socketIo.connected)
    });
    socketIo?.on('disconnect', () => {
      console.log('needs reconnecting', socketIo)
      setConnected(socketIo.connected)
    })

    return socketIo
  }, [providerConfig]);

  const resetSocket = () => {
    console.log("resetting socket");
    socket.disconnect();

    const socketIo = createSocket();
    setSocket(socketIo);
  };

  useEffect(() => {
    console.log('create socket with providerConfig', providerConfig)
    if (!providerConfig || socket) return;
    const socketIo = createSocket()
    setSocket(socketIo)

    return () => {
      socketIo && socketIo.disconnect();
    };
  }, [createSocket, socket, providerConfig]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        createSocket,
        connected,
        resetSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
