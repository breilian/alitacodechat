/* eslint-disable no-console */
import { useCallback, useContext, useEffect, useState } from "react";
import io from 'socket.io-client';
import SocketContext from "./SocketContext";
import DataContext from "./DataContext";

export function SocketProvider({ children }) {
  const { socketConfig } = useContext(DataContext);
  const [socket, setSocket] = useState(null);

  const connectSocket = useCallback((config) => {
    if (!config || !config.host) return;
    const { host, path } = config

    const socketIo = io(host, {
      path,
      reconnectionDelayMax: 2000,
    })

    socketIo.on('connect', () => {
      console.log('sio connected', socketIo)
    })
    socketIo?.on("connect_error", (err) => {
      console.log(`Connection error due to ${err}`);
    });
    socketIo?.on('disconnect', () => {
      console.log('needs reconnecting', socketIo)
    })

    return socketIo
  }, []);

  useEffect(() => {
    if (!socketConfig) return;
    const socketIo = connectSocket(socketConfig)
    setSocket(socketIo)

    return () => {
      socketIo && socketIo.disconnect();
    };
  }, [connectSocket, socketConfig]);

  return (
    <SocketContext.Provider
      value={socket}
    >
      {children}
    </SocketContext.Provider>
  )
}