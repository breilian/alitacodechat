import { ChatTypes, ROLES } from '@/common/constants';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VsCodeMessageTypes } from 'shared';

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
  sendMessage,
}) => {
  const isStreaming = useMemo(() => chatHistory.some(msg => msg.isStreaming), [chatHistory]);

  const onStopStreaming = useCallback(
    (message) => async () => {
      const { id: streamId, task_id, participant } = message
      if (task_id) {
        const { type } = participant
        if (type == ChatTypes.datasource) {
          await sendMessage({ type: VsCodeMessageTypes.stopDatasourceTask, data: task_id })
        } else if (type === ChatTypes.application) {
          await sendMessage({ type: VsCodeMessageTypes.stopApplicationTask, data: task_id })
        }
      }
      manualEmit([streamId]);
      setTimeout(() => setChatHistory(prevState => prevState.map(msg => ({
        ...msg,
        isStreaming: msg.id === streamId ? false : msg.isStreaming,
        isLoading: msg.id === streamId ? false : msg.isLoading,
        task_id: undefined,
      }))
      ), 200);
    },
    [manualEmit, sendMessage, setChatHistory],
  );

  const onStopAll = useCallback(async () => {
    const streamIds = chatHistoryRef.current.filter(message => message.role !== ROLES.User && message.isStreaming).map(message => message.id);
    const messagesWithTaskId = chatHistoryRef.current.filter(message => message.role !== ROLES.User && message.task_id && message.isStreaming)
    messagesWithTaskId.forEach(async (message) => {
      const { participant, task_id } = message;
      if (task_id) {
        const { type } = participant
        if (type == ChatTypes.datasource) {
          await sendMessage({ type: VsCodeMessageTypes.stopDatasourceTask, data: task_id })
        } else if (type === ChatTypes.application) {
          await sendMessage({ type: VsCodeMessageTypes.stopApplicationTask, data: task_id })
        }
      }
    });
    manualEmit(streamIds);
    setTimeout(() => setChatHistory(prevState =>
      prevState.map(msg => ({ ...msg, isStreaming: false, isLoading: false, task_id: undefined }))
    ), 200);
  }, [chatHistoryRef, manualEmit, sendMessage, setChatHistory]);

  const stopAllRef = useRef(onStopAll)

  useEffect(() => {
    stopAllRef.current = onStopAll
  }, [onStopAll])

  useEffect(() => {
    return () => {
      stopAllRef.current?.();
    };
  }, [])

  return {
    isStreaming,
    onStopAll,
    onStopStreaming
  }
}

