/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useState } from "react";
import io from 'socket.io-client';
import SocketContext from "./SocketContext";
import DataContext from "./DataContext";

export function SocketProvider({ children }) {
  const { socketConfig } = useContext(DataContext);
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  const createSocket = useCallback(() => {
    if (!socketConfig || !socketConfig.host) return;
    const { host, path } = socketConfig

    const socketIo = io(host, {
      path,
      reconnectionDelayMax: 2000,
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
  }, [socketConfig]);

  useEffect(() => {
    console.log('socketConfig', socketConfig)
    if (!socketConfig || socket) return;
    const socketIo = createSocket()
    setSocket(socketIo)

    return () => {
      socketIo && socketIo.disconnect();
    };
  }, [createSocket, socket, socketConfig]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        createSocket,
        connected,
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}