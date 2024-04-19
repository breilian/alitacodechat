import { ChatTypes } from '@/common/constants';
import {
  ChatInputContainer,
  ParticipantContainer,
  SendButton,
  SendButtonContainer,
  StyledCircleProgress,
  StyledTextField,
  StyledUnfoldLessIcon,
  StyledUnfoldMoreIcon
} from '@/components/ChatBox/StyledComponents';
import { useCtrlEnterKeyEventsHandler } from '@/components/ChatBox/hooks';
import CommandIcon from '@/components/Icons/CommandIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import SendIcon from '@/components/Icons/SendIcon';
import DataContext from '@/context/DataContext';
import { Box, IconButton, Typography, useTheme } from '@mui/material';
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { UiMessageTypes, VsCodeMessageTypes } from 'shared';
import CancelIcon from '../Icons/CancelIcon';
import OptionPopper from './OptionPopper';


const MAX_ROWS = 15;
const MIN_ROWS = 3;
const MIN_HEIGHT = 70;

const ChatInput = forwardRef(function ChatInput(props, ref) {
  const {
    onSend,
    isLoading,
    disabledSend,
    sx,
    placeholder = 'Type your message',
    clearInputAfterSubmit = true,
    chatWith,
    setChatWith
  } = props;
  const {
    datasources,
    prompts,
    postMessageToVsCode,
  } = useContext(DataContext);
  const theme = useTheme();
  const [question, setQuestion] = useState('');
  const [inputContent, setInputContent] = useState('');
  const [showExpandIcon, setShowExpandIcon] = useState(false);
  const [rows, setRows] = useState(MAX_ROWS);

  const reset = useCallback(() => {
    setInputContent('');
    setQuestion('');
    setShowExpandIcon(false);
  }, [])

  const [participantDetail, setParticipantDetail] = useState(null);
  const getParticipantDetail = useCallback((option) => {
    if (postMessageToVsCode && option) {
      if (chatWith) {
        const type = chatWith === ChatTypes.prompt ?
          VsCodeMessageTypes.getPromptDetail :
          VsCodeMessageTypes.getDatasourceDetail
        postMessageToVsCode({
          type,
          data: option.id
        });
      }
    }
  }, [chatWith, postMessageToVsCode])
  const [selectedOption, setSelectedOption] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const handleSelectOption = useCallback((option) => () => {
    setSelectedOption(option);
    getParticipantDetail(option);
    reset();
  }, [reset, getParticipantDetail]);

  useEffect(() => {
    if (!isLoading) {
      chatInputRef.current?.focus();
    }
  }, [isLoading]);

  useImperativeHandle(ref, () => ({
    reset: () => {
      setInputContent('');
      setQuestion('');
      setShowExpandIcon(false);
    },
    setValue: (value) => {
      setInputContent(value);
    }
  }));

  useEffect(() => {
    if (!postMessageToVsCode || !selectedOption) {
      setParticipantDetail(null);
    }
  }, [postMessageToVsCode, selectedOption]);

  // Message Receiving from Extension
  useEffect(() => {
    const messageHandler = event => {
      const message = event.data;
      switch (message.type) {
        case UiMessageTypes.getPromptDetail:
          setParticipantDetail(message.data);
          break;
        case UiMessageTypes.getDatasourceDetail:
          setParticipantDetail(message.data);
          break;
      }
    }

    window.addEventListener('message', messageHandler);

    return () => {
      window.removeEventListener('message', messageHandler);
    };
  }, []);

  const onClickExpander = useCallback(
    () => {
      setRows((prevRows) => prevRows === MAX_ROWS ? MIN_ROWS : MAX_ROWS);
    },
    [],
  );

  const chatInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const onDeleteChatWith = useCallback(() => {
    setChatWith(undefined);
    setAnchorEl(null);
    setFilteredOptions([]);
    setSelectedOption(null);
  }, [setChatWith]);

  const onInputQuestion = useCallback(
    (event) => {
      const value = event.target.value;
      const isPrompt = value.startsWith('/');
      const isDatasource = value.startsWith('#');
      if (isPrompt || isDatasource) {
        const filterString = value.substring(1).toLowerCase()
        const options = isPrompt ? prompts : datasources
        const optionList = options.filter((item) => item.name.toLowerCase().startsWith(filterString))
        if (optionList.length < 1) {
          // eslint-disable-next-line no-console
          console.log(`No ${isPrompt ? 'prompt' : 'datasource'}options available`)
        } else {
          setFilteredOptions(optionList.length ? optionList : options)
          setChatWith(isPrompt ? ChatTypes.prompt : ChatTypes.datasource)
          setAnchorEl(chatInputRef.current)
        }
      } else {
        setAnchorEl(null);
        setFilteredOptions([]);
      }
      setInputContent(value);
      setQuestion(value?.trim() ? value : '');
      setShowExpandIcon(event.target.offsetHeight > MIN_HEIGHT);
    },
    [datasources, prompts, setChatWith],
  );

  const onCtrlEnterDown = useCallback(() => {

    setInputContent((prevContent) => prevContent + '\n');
  }, [])

  const onEnterDown = useCallback(() => {
    if (question.trim() && !disabledSend) {
      const sendData = { user_input: question };
      if (chatWith && selectedOption && participantDetail) {
        const latestVersionId = participantDetail.versions.find(v => v.name === 'latest')?.id
        if (latestVersionId) {
          sendData.currentVersionId = latestVersionId
        }
        if (chatWith === ChatTypes.prompt) {
          sendData.prompt_id = selectedOption.id
        } else if (chatWith === ChatTypes.datasource) {
          sendData.datasource_id = selectedOption.id
          const chatSettings = participantDetail.version_details?.datasource_settings?.chat
          if (chatSettings) {
            sendData.context = participantDetail.version_details?.context
            sendData.chat_settings_embedding = chatSettings.chat_settings_embedding
            sendData.chat_settings_ai = chatSettings.chat_settings_ai
          }
        }
      }
      onSend(sendData);
      if (clearInputAfterSubmit) {
        setTimeout(() => {
          setInputContent('');
          setQuestion('');
        }, 0);
        setShowExpandIcon(false);
      }
    }
  }, [question, disabledSend, chatWith, selectedOption, onSend, clearInputAfterSubmit, participantDetail]);

  const { onKeyDown, onCompositionStart, onCompositionEnd } = useCtrlEnterKeyEventsHandler({
    onCtrlEnterDown,
    onEnterDown,
  });

  useEffect(() => {
    if (!showExpandIcon) {
      setRows(MAX_ROWS);
    }
  }, [showExpandIcon]);

  return (
    <Box flex='0 0 auto'>
      {selectedOption &&
        <ParticipantContainer >
          <Box display='flex' alignItems='center' gap='8px'>
            {chatWith === ChatTypes.prompt && <CommandIcon fontSize="1rem" />}
            {chatWith === ChatTypes.datasource && <DatabaseIcon fontSize="1rem" />}
            <Typography variant='labelSmall'>{selectedOption?.name}</Typography>
          </Box>
          <IconButton
            size='small'
            onClick={onDeleteChatWith}
          >
            <CancelIcon />
          </IconButton>
        </ParticipantContainer>}

      <OptionPopper
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        options={filteredOptions}
        handleSelect={handleSelectOption}
      />

      <ChatInputContainer sx={sx} >
        <Box sx={{ flex: 1, marginRight: 1 }}>
          <StyledTextField
            inputRef={chatInputRef}
            value={inputContent}
            fullWidth
            id="standard-multiline-static"
            label=""
            multiline
            maxRows={rows}
            variant="standard"
            onChange={onInputQuestion}
            onKeyDown={onKeyDown}
            onCompositionStart={onCompositionStart}
            onCompositionEnd={onCompositionEnd}
            disabled={isLoading}
            placeholder={placeholder}
            InputProps={{
              style: { color: theme.palette.text.secondary },
              disableUnderline: true,
              endAdornment: showExpandIcon ? (
                <IconButton
                  size='small'
                  onClick={onClickExpander}
                >
                  {rows === MAX_ROWS ? (
                    <StyledUnfoldLessIcon />
                  ) : (
                    <StyledUnfoldMoreIcon />
                  )}
                </IconButton>
              ) : null
            }}
          />
        </Box>
        <SendButtonContainer>
          <SendButton
            disabled={disabledSend || !question}
            onClick={onEnterDown}
            aria-label="send your question">
            <SendIcon sx={{ fontSize: 18, fill: 'icon.fill.send' }} />
          </SendButton>
          {isLoading && <StyledCircleProgress />}
        </SendButtonContainer>
      </ChatInputContainer>
    </Box>
  )
});

ChatInput.propTypes = {
}


export default ChatInput;