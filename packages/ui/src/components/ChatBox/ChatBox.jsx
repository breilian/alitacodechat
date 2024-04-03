import { forwardRef } from "react";
import {
  ActionButton,
  ActionContainer,
  ChatBodyContainer,
  ChatBoxContainer,
  MessageList,
  RunButton,
  SendButtonContainer,
  StyledCircleProgress
} from './StyledComponents';
import ChatInput from './ChatInput';

const ChatBox = forwardRef((props, boxRef) => {
  return (
    <>
      <ChatBoxContainer
        role="presentation"
      >
        <ChatBodyContainer>
          {
            <ChatInput
              // ref={chatInput}
              // onSend={USE_STREAM ? onPredictStream : onClickSend}
              // isLoading={isLoading || isStreaming}
              // disabledSend={isLoading || !model_name || isStreaming}
              shouldHandleEnter />
          }
        </ChatBodyContainer>
      </ChatBoxContainer>
    </>
  )
});

ChatBox.displayName = 'ChatBox'

ChatBox.propTypes = {}


export default ChatBox;