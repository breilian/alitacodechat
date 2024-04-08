import { forwardRef } from "react";
import ChatInput from './ChatInput';
import {
  ChatBodyContainer,
  ChatBoxContainer,
  MessageList
} from './StyledComponents';
import { ROLES } from "../../common/constants";

import { VsCodeMessageTypes } from '@/common/constants';
import UserMessage from "./UserMessage";
import AIAnswer from './AIAnswer'
import { useCallback, useRef, useState } from "react";
import Toast from '../Toast';
import AlertDialog from '../AlertDialog';
import useDeleteMessageAlert from './useDeleteMessageAlert'

const ChatBox = forwardRef(({
  messageListSX,
  isLoading,
  postMessageToVsCode,
  chatHistory = [],
  setChatHistory = () => { },
}, boxRef) => {
  console.log('postMessageToVsCode', postMessageToVsCode)
  const chatInput = useRef(null);
  const listRefs = useRef([]);
  const messagesEndRef = useRef();
  // Message Sending to Extension
  const onSend = useCallback(question => {
    setChatHistory((prevMessages) => {
      return [...prevMessages, {
        id: new Date().getTime(),
        role: ROLES.User,
        name: 'User',
        content: question,
      }]
    })
    postMessageToVsCode && postMessageToVsCode({
      type: VsCodeMessageTypes.getCompletion,
      data: {
        prompt: question,
        chat_history: []
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
                    onCopyToMessages={() => { }}
                    onDelete={onDeleteAnswer(message.id)}
                  />
                  :
                  <AIAnswer
                    key={message.id}
                    ref={(ref) => (listRefs.current[index] = ref)}
                    answer={message.content}
                    onStop={onStopStreaming(message.id)}
                    onCopy={onCopyToClipboard(message.id)}
                    onCopyToMessages={() => { }}
                    onDelete={onDeleteAnswer(message.id)}
                    onRegenerate={() => { }}
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