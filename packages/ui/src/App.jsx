import { Box } from '@mui/material'
import './App.css'
import ChatBox from './components/ChatBox/ChatBox.jsx'
import { useState } from 'react';
import { useEffect } from 'react';
import { UiMessageTypes, VsCodeMessageTypes } from './common/constants.js';
import { useRef } from 'react';


function App() {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [prompts, setPrompts] = useState([]);
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
    }
  }, []);

  // Message Receiving from Extension
  useEffect(() => {
    const messageHandler = event => {
      const message = event.data;
      console.log("message from vs code: ", message);
      switch (message.type) {
        case UiMessageTypes.startLoading:
          setIsLoading(true);
          break;
        case UiMessageTypes.stopLoading:
          setIsLoading(false);
          break;
        case UiMessageTypes.getPrompts:
          setPrompts(message.data.rows);
          break;
        case UiMessageTypes.getCompletion:
          setChatHistory(prev => [...prev, message.data]);
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
      />
    </Box>

  )
}

export default App
