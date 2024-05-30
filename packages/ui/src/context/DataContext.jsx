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

const getFilteredModels = (integration, capabilities) => {
  return (integration?.settings?.models || [])
    .filter(modelItem => {
      return capabilities.some(capability => modelItem.capabilities[capability]);
    })
    .map(({ name }) => ({
      model_name: name,
      integration_uid: integration.uid,
    }));
}

const getIntegrationOptions = (integrations) => integrations.reduce((accumulator, integration) => {
  const filteredModels = getFilteredModels(integration, ['chat_completion', 'completion']);
  if (filteredModels.length > 0) {
    accumulator = [...accumulator, ...filteredModels];
  }
  return accumulator;
}, []);

export const DataProvider = ({ children }) => {
  const [socketConfig, setSocketConfig] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const [applications, setApplications] = useState([]);
  const [deployments, setDeployments] = useState([])
  const vscodeRef = useRef(null);
  const [modelSettings, setModelSettings] = useState(null);

  const [messagePromises, setMessagePromises] = useState({});
  const [alternativeCallsToIde, setAlternativeCallsToIde] = useState([]);

  const sendMessage = useCallback(({ type, data }) => {
    const id = new Date().getTime();
    return new Promise((resolve, reject) => {
      setMessagePromises(prev => ({ ...prev, [id]: { resolve, reject } }));
      vscodeRef.current?.postMessage({
        id,
        type,
        data
      });
    });
  }, []);

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
    vscodeRef.current?.postMessage({
      type: VsCodeMessageTypes.getDeployments,
    });
  }, []);

  useEffect(() => {
    if (!vscodeRef.current) {
      console.log('acquireVsCodeApi', vscodeRef.current)
      if (!window.acquireVsCodeApi) {
        console.log('window.acquireVsCodeApi not found')
        console.log('alternative method will be using to replace window.acquireVsCodeApi for integration with other Ide types (JetBrains)')
        vscodeRef.current = {
          postMessage: ({ id, type, data }) => {
            setAlternativeCallsToIde(prev => [...prev, { id, type, data }])
          }
        }
      } else {
        vscodeRef.current = window.acquireVsCodeApi();
      }
      loadCoreData()
    }
  }, [loadCoreData]);

  // Message Receiving from Extension
  useEffect(() => {
    const messageHandler = event => {
      const message = event.data;
      console.log("message from vs code: ", message);
      switch (message.type) {
        case UiMessageTypes.stopApplicationTask:
        case UiMessageTypes.stopDatasourceTask:
        case UiMessageTypes.getSelectedText:
          if (messagePromises[message.id]) {
            messagePromises[message.id].resolve(message.data);
            setMessagePromises(prev => ({ ...prev, [message.id]: null }));
          }
          break;
        case UiMessageTypes.error:
          console.error(message.message);
          if (messagePromises[message.id]) {
            messagePromises[message.id].resolve(message.message);
            setMessagePromises(prev => ({ ...prev, [message.id]: null }));
          }
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
        case UiMessageTypes.getDeployments:
          setDeployments(getIntegrationOptions(message.data || []));
          break;
        case UiMessageTypes.settingsChanged:
          loadCoreData();
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
  }, [loadCoreData, messagePromises]);

  // Alternative method to send/receive messages from Ide
  useEffect(() => {
    if (alternativeCallsToIde.length > 0) {
      alternativeCallsToIde.forEach(call => {
        if (import.meta.env.ALTERNATIVE_HOST) {
          const ideGetQuery = new URL(import.meta.env.ALTERNATIVE_HOST);
          ideGetQuery.search = new URLSearchParams(call).toString();

          fetch(ideGetQuery)
            .then(result => result.json())
            .then(message => {
              window.postMessage(message)
            })
        }
      })

      setAlternativeCallsToIde([])
    }
  }, [alternativeCallsToIde, messagePromises]);

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
        deployments,
        sendMessage,
        loadCoreData,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}