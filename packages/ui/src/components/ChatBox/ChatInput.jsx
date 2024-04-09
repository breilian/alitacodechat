import { Box, useTheme, Popper, MenuItem, Button, ClickAwayListener } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { forwardRef, useCallback, useEffect, useState, useImperativeHandle } from 'react';
import SendIcon from '@/components/Icons/SendIcon';
import CommandIcon from '@/components/Icons/CommandIcon';
import DatabaseIcon from '@/components/Icons/DatabaseIcon';
import {
  ChatInputContainer,
  SendButton,
  SendButtonContainer,
  StyledCircleProgress,
  StyledTextField,
  StyledUnfoldLessIcon,
  StyledUnfoldMoreIcon,
  ParticipantContainer
} from '@/components/ChatBox/StyledComponents';
import { useCtrlEnterKeyEventsHandler } from '@/components/ChatBox/hooks';
import { useRef } from 'react';


const MAX_ROWS = 15;
const MIN_ROWS = 3;
const MIN_HEIGHT = 70;

const OptionPopper = ({
  anchorEl,
  setAnchorEl,
  options,
  handleSelect,
}) => {
  const handleClickAway = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const handleSelectClose = useCallback(option => () => {
    handleSelect(option)()
    handleClickAway();
  }, [handleClickAway, handleSelect])

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  console.log('prompts', options)
  return (
    <ClickAwayListener onClickAway={handleClickAway} >
      <Popper
        id={id}
        open={open}
        anchorEl={anchorEl}
        placement='top-start'
      >
        <Box sx={{ border: 1, p: 1, bgcolor: 'background.paper' }}>
          {
            (options || []).map((option, i) => {
              return (
                <MenuItem key={i} onClick={handleSelectClose(option)}>{option.name}</MenuItem>
              )
            })
          }
        </Box>
      </Popper>
    </ClickAwayListener>
  );
}

const ChatInput = forwardRef(function ChatInput(props, ref) {
  const {
    datasources,
    prompts,
    onSend,
    isLoading,
    disabledSend,
    sx,
    placeholder = 'Type your message',
    clearInputAfterSubmit = true
  } = props;
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
  const [optionType, setOptionType] = useState('');
  const [selectedOption, setSelectedOption] = useState(null);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const handleSelectOption = useCallback((option) => () => {
    setSelectedOption(option);
    reset();
  }, [reset]);

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

  const onClickExpander = useCallback(
    () => {
      setRows((prevRows) => prevRows === MAX_ROWS ? MIN_ROWS : MAX_ROWS);
    },
    [],
  );

  const chatInputRef = useRef(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const onInputQuestion = useCallback(
    (event) => {
      const value = event.target.value;
      const isPrompt = value.startsWith('/');
      const isDatasource = value.startsWith('#');
      if (isPrompt || isDatasource) {
        const filterString = value.substring(1).toLowerCase()
        const options = isPrompt ? prompts : datasources
        const optionList = options.filter((item) => item.name.toLowerCase().startsWith(filterString))
        setFilteredOptions(optionList.length ? optionList : options)
        setOptionType(isPrompt ? 'prompt' : 'datasource')
        setAnchorEl(chatInputRef.current)
      } else {
        setAnchorEl(null)
        setFilteredOptions(prompts)
      }
      setInputContent(value);
      setQuestion(value?.trim() ? value : '');
      setShowExpandIcon(event.target.offsetHeight > MIN_HEIGHT);
    },
    [datasources, prompts],
  );

  const onCtrlEnterDown = useCallback(() => {

    setInputContent((prevContent) => prevContent + '\n');
  }, [])

  const onEnterDown = useCallback(() => {
    if (question.trim() && !disabledSend) {
      onSend(question, selectedOption.id);
      if (clearInputAfterSubmit) {
        setTimeout(() => {
          setInputContent('');
          setQuestion('');
        }, 0);
        setShowExpandIcon(false);
      }
    }
  }, [question, disabledSend, onSend, selectedOption, clearInputAfterSubmit]);

  const { onKeyDown, onKeyUp, onCompositionStart, onCompositionEnd } = useCtrlEnterKeyEventsHandler({
    onCtrlEnterDown,
    onEnterDown,
  });

  useEffect(() => {
    if (!showExpandIcon) {
      setRows(MAX_ROWS);
    }
  }, [showExpandIcon]);

  return (
    <>

      {selectedOption &&
        <ParticipantContainer >
          {optionType === 'prompt' && <CommandIcon fontSize="1rem" />}
          {optionType === 'datasource' && <DatabaseIcon fontSize="1rem" />}
          <Box>{selectedOption?.name}</Box>
        </ParticipantContainer>}
        
      <OptionPopper
        anchorEl={anchorEl}
        setAnchorEl={setAnchorEl}
        options={filteredOptions}
        handleSelect={handleSelectOption}
      />

      <ChatInputContainer sx={sx} ref={chatInputRef}>
        <Box sx={{ flex: 1, marginRight: 1 }}>
          <StyledTextField
            value={inputContent}
            fullWidth
            id="standard-multiline-static"
            label=""
            multiline
            maxRows={rows}
            variant="standard"
            onChange={onInputQuestion}
            onKeyDown={onKeyDown}
            onKeyUp={onKeyUp}
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
    </>
  )
});

ChatInput.propTypes = {
}


export default ChatInput;