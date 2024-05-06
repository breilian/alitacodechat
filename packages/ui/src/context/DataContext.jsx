/* eslint-disable no-console */
import { ROLES } from '@/common/constants.js';
import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { UiMessageTypes, VsCodeMessageTypes } from 'shared';

const DataContext = createContext(undefined);

export default DataContext;

const filterByCodeTag = (list) => {
  if (!Array.isArray(list)) return []

  return (list || []).filter(p =>
    p.tags && p.tags.some(t => t.name.toLowerCase() === 'code'
    ));
}

export const DataProvider = ({ children }) => {
  const [socketConfig, setSocketConfig] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [applications, setApplications] = useState([]);
  const vscodeRef = useRef(null);
  const [modelSettings, setModelSettings] = useState(null);

  const [messageId, setMessageId] = useState(0);
  const [messagePromises, setMessagePromises] = useState({});

  const sendMessage = useCallback(({ type, data }) => {
    const id = messageId + 1;
    setMessageId(id);
    return new Promise((resolve, reject) => {
      setMessagePromises(prev => ({ ...prev, [id]: { resolve, reject } }));
      vscodeRef.current?.postMessage({
        id,
        type,
        data
      });
    });
  }, [messageId]);

  const loadCoreData = useCallback(() => {
    if (!vscodeRef.current) return
    // console.log('loadCoreData', VsCodeMessageTypes);

    vscodeRef.current?.postMessage({
      type: VsCodeMessageTypes.getSocketConfig,
    });
    vscodeRef.current?.postMessage({
      type: VsCodeMessageTypes.getModelSettings,
    });
    vscodeRef.current?.postMessage({
      type: VsCodeMessageTypes.getPrompts,
    });
    vscodeRef.current?.postMessage({
      type: VsCodeMessageTypes.getDatasources,
    });
    vscodeRef.current?.postMessage({
      type: VsCodeMessageTypes.getApplications,
    });
  }, []);

  useEffect(() => {
    if (!vscodeRef.current) {
      console.log('acquireVsCodeApi', vscodeRef.current)
      if (!window.acquireVsCodeApi) {
        console.log('window.acquireVsCodeApi not found')
        return;
      }
      const vscode = window.acquireVsCodeApi();
      vscodeRef.current = vscode;
      loadCoreData()
    }
  }, [loadCoreData]);

  // Message Receiving from Extension
  useEffect(() => {
    const messageHandler = event => {
      const message = event.data;
      console.log("message from vs code: ", message);
      switch (message.type) {
        case UiMessageTypes.getSelectedText:
          if (messagePromises[message.id]) {
            messagePromises[message.id].resolve(message.data);
            setMessagePromises(prev => ({ ...prev, [message.id]: null }));
          }
          break;
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
          setPrompts(filterByCodeTag(message.data));
          break;
        case UiMessageTypes.getDatasources:
          setDatasources(filterByCodeTag(message.data));
          break;
        case UiMessageTypes.getApplications:
          setApplications(filterByCodeTag(message.data));
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
  }, [messagePromises]);

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
        applications,
        sendMessage,
        loadCoreData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}