/* eslint-disable no-console */
import { Box } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import './App.css';
import { ROLES, UiMessageTypes, VsCodeMessageTypes } from './common/constants.js';
import ChatBox from './components/ChatBox/ChatBox.jsx';


function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [datasources, setDatasources] = useState([]);
  const vscodeRef = useRef(null);

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
      }
    }

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  return (
    <Box width='100vw' height='100vh' display='flex' flexDirection='column' justifyContent='flex-end'>
      <ChatBox
        postMessageToVsCode={vscodeRef.current?.postMessage}
        chatHistory={chatHistory}
        setChatHistory={setChatHistory}
        isLoading={isLoading}
        prompts={prompts}
        datasources={datasources}
      />
    </Box>

  )
}

export default App
