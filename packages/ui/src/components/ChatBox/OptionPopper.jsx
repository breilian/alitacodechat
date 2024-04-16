import { Menu, MenuItem } from '@mui/material';
import { useCallback } from 'react';


export default function OptionPopper({
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

  return (
    <Menu
      id="basic-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={handleClickAway}
      MenuListProps={{
        'aria-labelledby': 'basic-button',
      }}
    >
      {
        (options || []).map((option, i) => {
          return (
            <MenuItem key={i} onClick={handleSelectClose(option)}>{option.name}</MenuItem>
          )
        })
      }
    </Menu>
  );
}