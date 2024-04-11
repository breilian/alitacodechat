import { Box, ClickAwayListener, MenuItem, Popper } from '@mui/material';
import { useCallback } from 'react';


export default function OptionPopper ({
  anchorEl,
  setAnchorEl,
  options,
  handleSelect,
}) {
  const handleClickAway = useCallback(() => {
    setAnchorEl(null);
  }, [setAnchorEl]);

  const handleSelectClose = useCallback(option => () => {
    handleSelect(option)()
    handleClickAway();
  }, [handleClickAway, handleSelect])

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popper' : undefined;

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