import {StyledConfirmButton, StyledDialog, StyledDialogActions,} from '@/components/StyledDialog';
import VariableList from '@/pages/Prompts/Components/Form/VariableList';
import {DialogContent, DialogTitle, InputLabel, ListItemIcon, MenuItem, Stack, Typography} from '@mui/material';
import {StyledSelect} from "@/components/ChatBox/StyledComponents.jsx";
import ListItemText from "@mui/material/ListItemText";
import {Circle} from "@mui/icons-material";
import React from "react";
import {lightBlue} from "@mui/material/colors";

export function VariableDialog({
  open,
  detail,
  onChangeVariable,
  onChangeVersion,
  onCancel,
}) {

  return (
    <StyledDialog
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Typography variant='headingSmall'>
          {detail.name}
        </Typography>
      </DialogTitle>
      <DialogContent sx={{
        width: '100%',
        maxHeight: '400px',
        overflow: 'auto',
      }}>
        {detail.versions?.length > 0 && <div>
          <InputLabel id="vesion-select-label">Version</InputLabel>
          <StyledSelect
            labelId="version-select-label"
            value={detail.version_details.name}
            onChange={onChangeVersion}
            autoWidth
          >
            {detail.versions.map(version =>
              // <MenuItem key={version.id} value={version.name}>{version.name}</MenuItem>
              <MenuItem key={version.id} value={version.name}>
                <Stack direction="row" alignItems="center" spacing={1}>
                  {/*<ListItemIcon>*/}
                    <Circle style={{ fontSize: 12, color: lightBlue[500] }}/>
                  {/*</ListItemIcon>*/}
                  <ListItemText primary={version.name}/>
                </Stack>
              </MenuItem>
            )}
          </StyledSelect>
        </div>}
        {detail.version_details?.variables?.length > 0 && <VariableList
          variables={detail.version_details.variables}
          onChangeVariable={onChangeVariable}
          showexpandicon='true'
          multiline
          collapseContent
        />}
      </DialogContent>
      <StyledDialogActions>
        <StyledConfirmButton danger onClick={onCancel} disableRipple>OK</StyledConfirmButton>
      </StyledDialogActions>
    </StyledDialog>
  )
}