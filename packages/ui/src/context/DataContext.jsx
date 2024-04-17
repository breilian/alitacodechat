/* eslint-disable no-console */
import { createContext, useEffect, useRef, useState } from 'react';
import { ROLES, UiMessageTypes, VsCodeMessageTypes } from '@/common/constants.js';

const DataContext = createContext(undefined);

export default DataContext;

export const DataProvider = ({ children}) => {
  const [socketConfig, setSocketConfig] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const vscodeRef = useRef(null);
  const [modelSettings, setModelSettings] = useState(null);

  useEffect(() => {
    if (!vscodeRef.current) {
      console.log('acquireVsCodeApi', vscodeRef.current)
      if (!window.acquireVsCodeApi) {
        console.log('window.acquireVsCodeApi not found')
        return;
      }
      const vscode = window.acquireVsCodeApi();
      vscodeRef.current = vscode;
      vscode.postMessage({
        type: VsCodeMessageTypes.getPrompts,
      });
      vscode.postMessage({
        type: VsCodeMessageTypes.getDatasources,
      });
    }
  }, []);

  // Message Receiving from Extension
  useEffect(() => {
    const messageHandler = event => {
      const message = event.data;
      console.log("message from vs code: ", message);
      switch (message.type) {
        case UiMessageTypes.error:
          console.error(message.message);
          break;
        case UiMessageTypes.startLoading:
          setIsLoading(true);
          break;
        case UiMessageTypes.stopLoading:
          setIsLoading(false);
          break;
        case UiMessageTypes.getPrompts:
          setPrompts(message.data.rows);
          break;
        case UiMessageTypes.getDatasources:
          setDatasources(message.data.rows);
          break;
        case UiMessageTypes.getChatResponse:
          setChatHistory(prev => [...prev, {
            ...message.data,
            id: new Date().getTime(),
            role: ROLES.Assistant,
          }]);
          break;
        case UiMessageTypes.getSocketConfig:
          setSocketConfig(message.data);
          break;
        case UiMessageTypes.getModelSettings:
          setModelSettings(message.data);
          break;
      }
    }

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <DataContext.Provider
      value={{
        vscodeRef,
        postMessageToVsCode: vscodeRef.current?.postMessage,
        socketConfig,
        modelSettings,
        chatHistory,
        setChatHistory,
        isLoading,
        prompts,
        datasources,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}