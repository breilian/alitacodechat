/* eslint-disable react/jsx-no-bind */
/* eslint-disable no-console */
/* eslint-disable no-unused-vars */
import { ROLES, VsCodeMessageTypes } from '@/common/constants';
import { forwardRef, useCallback, useRef, useState } from "react";
import AlertDialog from '../AlertDialog';
import Toast from '../Toast';
import AIAnswer from './AIAnswer';
import ChatInput from './ChatInput';
import {
  ChatBodyContainer,
  ChatBoxContainer,
  MessageList
} from './StyledComponents';
import UserMessage from "./UserMessage";
import useDeleteMessageAlert from './useDeleteMessageAlert';

const ChatBox = forwardRef(({
  messageListSX,
  isLoading,
  postMessageToVsCode,
  chatHistory = [],
  setChatHistory = () => { },
  prompts,
  datasources,
}, boxRef) => {
  console.log('postMessageToVsCode', postMessageToVsCode)
  const chatInput = useRef(null);
  const listRefs = useRef([]);
  const messagesEndRef = useRef();
  // Message Sending to Extension
  const onSend = useCallback((question, prompt_id) => {
    setChatHistory((prevMessages) => {
      return [...prevMessages, {
        id: new Date().getTime(),
        role: ROLES.User,
        name: 'User',
        content: question,
        prompt_id: prompt_id ?? undefined
      }]
    })
    postMessageToVsCode && postMessageToVsCode({
      type: VsCodeMessageTypes.getCompletion,
      data: {
        prompt: question,
        chat_history: [],
        prompt_id: prompt_id ?? undefined
      }
    });
  }, [postMessageToVsCode, setChatHistory]);



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

  const {
    openAlert,
    alertContent,
    onDeleteAnswer,
    onConfirmDelete,
    onCloseAlert
  } = useDeleteMessageAlert({
    setChatHistory,
    chatInput,
  });

  const onStopStreaming = () => { };

  return (
    <>
    <div>
      {
        chatHistory.map((message, index) => {
          return (
            <div
              key={message.id}
            >{index}: {message.id}</div>
          )
        })
      }
    </div>
      <ChatBoxContainer
        role="presentation"
      >
        <ChatBodyContainer>
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
          {
            <ChatInput
              // onSend={USE_STREAM ? onPredictStream : onClickSend}
              onSend={onSend}
              ref={chatInput}
              isLoading={isLoading}
              disabledSend={isLoading}
              prompts={prompts}
              datasources={datasources}
              shouldHandleEnter />
          }
        </ChatBodyContainer>
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