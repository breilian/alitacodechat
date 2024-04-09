import { Box, useTheme, Popper, MenuItem, Button, ClickAwayListener } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { forwardRef, useCallback, useEffect, useState, useImperativeHandle } from 'react';
import SendIcon from '@/components/Icons/SendIcon';
import CommandIcon from '@/components/Icons/CommandIcon';
import {
  ChatInputContainer,
  SendButton,
  SendButtonContainer,
  StyledCircleProgress,
  StyledTextField,
  StyledUnfoldLessIcon,
  StyledUnfoldMoreIcon
} from '@/components/ChatBox/StyledComponents';
import { useCtrlEnterKeyEventsHandler } from '@/components/ChatBox/hooks';
import { useRef } from 'react';


const MAX_ROWS = 15;
const MIN_ROWS = 3;
const MIN_HEIGHT = 70;

const PromptPopper = ({
  anchorEl,
  setAnchorEl,
  prompts,
  handleSelect,
}) => {
  const handleClickAway = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const handleSelectClose = useCallback(prompt => () => {
    handleSelect(prompt)()
    handleClickAway();
  }, [handleClickAway, handleSelect])

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

  console.log('prompts', prompts)
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
            (prompts || []).map((prompt, i) => {
              return (
                <MenuItem key={i} onClick={handleSelectClose(prompt)}>{prompt.name}</MenuItem>
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
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [filteredPrompts, setFilteredPrompts] = useState(prompts);
  const handleSelectPrompt = useCallback((prompt) => () => {
    setSelectedPrompt(prompt);
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
      if (value.startsWith('/')) {
        const filterString = value.substring(1).toLowerCase()
        const selectedPrompts = prompts.filter((prompt) => prompt.name.toLowerCase().startsWith(filterString))
        setFilteredPrompts(selectedPrompts.length ? selectedPrompts : prompts)
        console.log('selectedPrompts: ', selectedPrompts)
        setAnchorEl(chatInputRef.current)
      } else {
        setAnchorEl(null)
        setFilteredPrompts(prompts)
      }
      setInputContent(value);
      setQuestion(value?.trim() ? value : '');
      setShowExpandIcon(event.target.offsetHeight > MIN_HEIGHT);
    },
    [prompts],
  );

  const onCtrlEnterDown = useCallback(() => {

    setInputContent((prevContent) => prevContent + '\n');
  }, [])

  const onEnterDown = useCallback(() => {
    if (question.trim() && !disabledSend) {
      onSend(question, selectedPrompt.id);
      if (clearInputAfterSubmit) {
        setTimeout(() => {
          setInputContent('');
          setQuestion('');
        }, 0);
        setShowExpandIcon(false);
      }
    }
  }, [question, disabledSend, onSend, selectedPrompt, clearInputAfterSubmit]);

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

      <Box padding='0 12px' display='flex' alignItems='center' gap='8px'>
        {selectedPrompt && <CommandIcon fontSize="1rem" />}
        <Box>{selectedPrompt?.name}</Box>
        <PromptPopper
          anchorEl={anchorEl}
          setAnchorEl={setAnchorEl}
          prompts={filteredPrompts}
          handleSelect={handleSelectPrompt}
        />
      </Box>

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