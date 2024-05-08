import { ROLES } from '@/common/constants';
import { useCallback, useEffect, useMemo, useState } from 'react';

export const useCtrlEnterKeyEventsHandler = ({ onShiftEnterPressed, onCtrlEnterDown, onEnterDown }) => {
  const [isInComposition, setIsInComposition] = useState(false)
  const onKeyDown = useCallback(
    (event) => {
      if (isInComposition || event.key !== 'Enter') {
        return
      }

      if (event.ctrlKey) {
        onCtrlEnterDown && onCtrlEnterDown()
      } else if (event.shiftKey) {
        onShiftEnterPressed && onShiftEnterPressed()
      } else {
        onEnterDown && onEnterDown(event)
      }
    },
    [isInComposition, onCtrlEnterDown, onEnterDown, onShiftEnterPressed],
  );

  const onCompositionStart = useCallback(() => {
    setIsInComposition(true)
  }, [])
  const onCompositionEnd = useCallback(() => {
    setIsInComposition(false)
  }, [])

  return { onKeyDown, onCompositionStart, onCompositionEnd }
}

export const useStopStreaming = ({
  chatHistoryRef,
  chatHistory,
  setChatHistory,
  manualEmit,
}) => {
  const isStreaming = useMemo(() => chatHistory.some(msg => msg.isStreaming), [chatHistory]);

  const onStopStreaming = useCallback(
    (streamId) => () => {
      manualEmit([streamId]);
      setTimeout(() => setChatHistory(prevState =>
        prevState.map(msg => ({
          ...msg,
          isStreaming: msg.id === streamId ? false : msg.isStreaming,
          isLoading: msg.id === streamId ? false : msg.isLoading
        }))
      ), 200);
    },
    [manualEmit, setChatHistory],
  );

  const onStopAll = useCallback(() => {
    const streamIds = chatHistoryRef.current.filter(message => message.role !== ROLES.User).map(message => message.id);
    manualEmit(streamIds);
    setTimeout(() => setChatHistory(prevState =>
      prevState.map(msg => ({ ...msg, isStreaming: false, isLoading: false }))
    ), 200);
  }, [chatHistoryRef, manualEmit, setChatHistory]);


  useEffect(() => {
    return () => {
      onStopAll();
    };
  }, [onStopAll])

  return {
    isStreaming,
    onStopAll,
    onStopStreaming
  }
}

