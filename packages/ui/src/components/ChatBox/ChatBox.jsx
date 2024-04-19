/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-unused-vars */
import { ROLES, VsCodeMessageTypes, sioEvents, SocketMessageType, ChatTypes } from '@/common/constants';
import { buildErrorMessage } from '@/common/utils';
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import AlertDialog from '../AlertDialog';
import Toast from '../Toast';
import AIAnswer from './AIAnswer';
import ChatInput from './ChatInput';
import {
  ActionButton,
  ActionContainer,
  ChatBodyContainer,
  ChatBoxContainer,
  MessageList
} from './StyledComponents';
import UserMessage from "./UserMessage";
import useDeleteMessageAlert from './useDeleteMessageAlert';
import useSocket, { useManualSocket } from '@/hooks/useSocket';
import { AUTO_SCROLL_KEY } from './AutoScrollToggle';
import { Box } from '@mui/material'
import ActionButtons from './ActionButtons';
import { useStopStreaming } from './hooks';
import ClearIcon from '../Icons/ClearIcon';
import DataContext from '@/context/DataContext';
import SocketContext from '@/context/SocketContext';

const USE_STREAM = true
const MESSAGE_REFERENCE_ROLE = 'reference'

const generatePayload = ({
  projectId, prompt_id, type, name, currentVersionId, model_settings
}) => ({
  prompt_id,
  projectId,

  user_name: name,
  project_id: projectId,
  prompt_version_id: currentVersionId,
  model_settings,

  type,
  format_response: true,
})

const generateChatPayload = ({
  projectId, prompt_id, question, messages, chatHistory, name, currentVersionId, model_settings
}) => {
  const payload = generatePayload({
    projectId, prompt_id, type: 'chat', name, currentVersionId, model_settings
  })
  payload.chat_history = chatHistory ? chatHistory.map((message) => {
    const { role, content, name: userName } = message;
    if (userName) {
      return { role, content, name: userName };
    } else {
      return { role, content }
    }
  }) : []
  payload.user_input = question
  if (messages) {
    payload.messages = messages
  }
  return payload
}

const ChatBox = forwardRef(({
  messageListSX,
}, boxRef) => {
  const {
    isLoading,
    postMessageToVsCode,
    chatHistory = [],
    setChatHistory = () => { },
    loadCoreData,
  } = useContext(DataContext);
  const chatInput = useRef(null);
  const listRefs = useRef([]);
  const messagesEndRef = useRef();
  const name = 'User';

  const [isRegenerating, setIsRegenerating] = useState(false);
  const [answerIdToRegenerate, setAnswerIdToRegenerate] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const chatHistoryRef = useRef(chatHistory);
  const [chatWith, setChatWith] = useState('')


  const {
    openAlert,
    alertContent,
    onDeleteAnswer,
    onDeleteAll,
    onConfirmDelete,
    onCloseAlert
  } = useDeleteMessageAlert({
    setChatHistory,
    chatInput,
  });

  const onClickClearChat = useCallback(() => {
    if (chatHistory.length) {
      onDeleteAll();
    }
  }, [chatHistory.length, onDeleteAll])

  useImperativeHandle(boxRef, () => ({
    onClear: onClickClearChat,
  }));

  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  const getMessage = useCallback((messageId) => {
    const msgIdx = chatHistoryRef.current?.findIndex(i => i.id === messageId) || -1;
    let msg
    if (msgIdx < 0) {
      msg = {
        id: messageId,
        role: ROLES.Assistant,
        content: '',
        isLoading: false,
      }
    } else {
      msg = chatHistoryRef.current[msgIdx]
    }
    return [msgIdx, msg]
  }, [])

  const handleError = useCallback(
    (errorObj) => {
      setIsRunning(false);
      setToastMessage(buildErrorMessage(errorObj));
      setToastSeverity('error');
      setShowToast(true);
      if (isRegenerating) {
        setAnswerIdToRegenerate('');
        setIsRegenerating(false);
      }
    },
    [isRegenerating],
  )

  const scrollToMessageListEnd = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ block: "end" });
  }, [])

  const handleSocketEvent = useCallback(async message => {
    const { stream_id, type: socketMessageType, message_type, response_metadata } = message
    const [msgIndex, msg] = getMessage(stream_id, message_type)

    const scrollToMessageBottom = () => {
      if (sessionStorage.getItem(AUTO_SCROLL_KEY) === 'true') {
        const messageElement = listRefs.current[msgIndex]
        if (messageElement) {
          const parentElement = messageElement.parentElement;
          messageElement.scrollIntoView({ block: "end" });
          if (parentElement) {
            parentElement.scrollTop += 12;
          }
        } else {
          scrollToMessageListEnd();
        }
      }
    };

    switch (socketMessageType) {
      case SocketMessageType.StartTask:
        msg.isLoading = true
        msg.isStreaming = false
        msg.content = ''
        msg.references = []
        msgIndex === -1 ? setChatHistory(prevState => [...prevState, msg]) : setChatHistory(prevState => {
          prevState[msgIndex] = msg
          return [...prevState]
        })
        setTimeout(scrollToMessageBottom, 0);
        break
      case SocketMessageType.Chunk:
      case SocketMessageType.AIMessageChunk:
        msg.content += message.content
        msg.isLoading = false
        msg.isStreaming = true
        setTimeout(scrollToMessageBottom, 0);
        if (response_metadata?.finish_reason) {
          msg.isStreaming = false
        }
        break
      case SocketMessageType.References:
        msg.references = message.references
        setTimeout(scrollToMessageBottom, 0);
        break
      case SocketMessageType.Error:
        msg.isStreaming = false
        handleError({ data: message.content || [] })
        return
      case SocketMessageType.Freeform:
        break
      default:
        // eslint-disable-next-line no-console
        console.warn('unknown message type', socketMessageType)
        return
    }
    msgIndex > -1 && setChatHistory(prevState => {
      prevState[msgIndex] = msg
      return [...prevState]
    })
  }, [getMessage, handleError, scrollToMessageListEnd, setChatHistory])

  const dataContext = useContext(DataContext);
  const { emit } = useSocket(
    chatWith === ChatTypes.datasource ? sioEvents.datasource_predict : sioEvents.promptlib_predict,
    handleSocketEvent
  )

  // Message Sending to Extension
  const onClickSend = useCallback((data) => {
    postMessageToVsCode && postMessageToVsCode({
      type: VsCodeMessageTypes.getChatResponse,
      data: {
        ...data,
        chat_history: chatHistory,
      }
    });
    setChatHistory((prevMessages) => {
      return [...prevMessages, {
        ...data,
        id: new Date().getTime(),
        role: ROLES.User,
        name: 'User',
        content: data.user_input,
      }]
    })
    setTimeout(scrollToMessageListEnd, 0);
  }, [chatHistory, postMessageToVsCode, scrollToMessageListEnd, setChatHistory]);

  const onPredictStream = useCallback(async data => {
    setTimeout(scrollToMessageListEnd, 0);
    
    const { modelSettings, socketConfig, sendMessage } = dataContext
    
    const selectedText = await sendMessage({
      type: VsCodeMessageTypes.getSelectedText
    });
    const messages = []
    if (selectedText) {
      messages.push({
        role: ROLES.User,
        content: selectedText
      })
    }
    const question = data.user_input;
    setChatHistory((prevMessages) => {
      return [...prevMessages, {
        ...data,
        id: new Date().getTime(),
        role: ROLES.User,
        name,
        content: question,
      }]
    })

    const projectId = socketConfig?.projectId
    if (!projectId) {
      setToastMessage('AlitaCode extension Project ID settingis missing. Please set it to continue chat.');
      setToastSeverity('error');
      setShowToast(true);
      return
    }
    if (data.datasource_id) {
      if (!data.chat_settings_ai || !data.chat_settings_embedding) {
        setToastMessage('Datasource model or embedding setting is missing. Please select another one for chat.');
        setToastSeverity('error');
        setShowToast(true);
        return
      }
      emit({
        project_id: projectId,
        version_id: data.currentVersionId || data.datasource_id,
        input: question,
        chat_history: chatHistory.filter(i => i.role !== MESSAGE_REFERENCE_ROLE),
        context: data.context,
        chat_settings_ai: data.chat_settings_ai,
        chat_settings_embedding: data.chat_settings_embedding
      })
      return
    }

    const payloadData = {
      projectId,
      question,
      chatHistory,
      name,
      messages
    }
    if (data.prompt_id && data.currentVersionId) {
      payloadData.prompt_id = data.prompt_id
      payloadData.currentVersionId = data.currentVersionId
    } else {
      if (modelSettings) {
        payloadData.model_settings = modelSettings
      } else {
        setToastMessage('AlitaCode extension model settings are missing.');
        setToastSeverity('error');
        setShowToast(true);
        return
      }
    }
    const payload = generateChatPayload(payloadData)
    emit(payload)
  },
    [scrollToMessageListEnd, setChatHistory, dataContext, chatHistory, emit])

  const onSend = useCallback(
    (data) => {
      if (USE_STREAM) {
        onPredictStream(data);
      } else {
        onClickSend(data);
      }
    },
    [onClickSend, onPredictStream],
  );


  const { emit: manualEmit } = useManualSocket(
    chatWith === ChatTypes.datasource ? sioEvents.datasource_leave_rooms : sioEvents.promptlib_leave_rooms
  );
  const {
    isStreaming,
    onStopAll,
    onStopStreaming
  } = useStopStreaming({
    chatHistoryRef,
    chatHistory,
    setChatHistory,
    manualEmit,
  });

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState('info')
  const onCloseToast = useCallback(
    () => {
      setShowToast(false);
    },
    [],
  );
  const onCopyToClipboard = useCallback(
    (id) => async () => {
      const message = chatHistory.find(item => item.id === id);
      if (message) {
        await navigator.clipboard.writeText(message.content);
        setShowToast(true);
        setToastMessage('The message has been copied to the clipboard');
        setToastSeverity('success');
      }
    },
    [chatHistory],
  );

  return (
    <>
      <ChatBoxContainer
        role="presentation"
      >
        <ActionContainer>
          <Box display='flex' gap='8px'>
            <ActionButtons
              isStreaming={isStreaming}
              onStopAll={onStopAll}
              onRefresh={loadCoreData}
            />
            <ActionButton
              aria-label="clear the chat"
              disabled={isLoading || isStreaming || !chatHistory.length}
              onClick={onClickClearChat}
            >
              <ClearIcon sx={{ fontSize: 16 }} />
            </ActionButton>
          </Box>
        </ActionContainer>
        <MessageList sx={messageListSX}>
          {
            chatHistory.map((message, index) => {
              return message.role === 'user' ?
                <UserMessage
                  key={message.id}
                  ref={(ref) => (listRefs.current[index] = ref)}
                  content={message.content}
                  onCopy={onCopyToClipboard(message.id)}
                  onDelete={onDeleteAnswer(message.id)}
                />
                :
                <AIAnswer
                  key={message.id}
                  ref={(ref) => (listRefs.current[index] = ref)}
                  answer={message.content}
                  onStop={onStopStreaming(message.id)}
                  onCopy={onCopyToClipboard(message.id)}
                  onDelete={onDeleteAnswer(message.id)}
                  shouldDisableRegenerate={isLoading}
                  references={message.references}
                  isLoading={Boolean(message.isLoading)}
                  isStreaming={message.isStreaming}
                />
            })
          }
          <div ref={messagesEndRef} />
        </MessageList>
        <ChatInput
          onSend={onSend}
          ref={chatInput}
          isLoading={isLoading}
          disabledSend={isLoading}
          chatWith={chatWith}
          setChatWith={setChatWith}
          shouldHandleEnter />
        <Toast
          open={showToast}
          severity={toastSeverity}
          message={toastMessage}
          onClose={onCloseToast}
        />
        <AlertDialog
          title='Warning'
          alertContent={alertContent}
          open={openAlert}
          onClose={onCloseAlert}
          onCancel={onCloseAlert}
          onConfirm={onConfirmDelete}
        />
      </ChatBoxContainer>
    </>
  )
});

ChatBox.displayName = 'ChatBox'

ChatBox.propTypes = {}


export default ChatBox;