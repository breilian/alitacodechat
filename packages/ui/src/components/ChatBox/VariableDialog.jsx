import {
  StyledConfirmButton,
  StyledDialog,
  StyledDialogActions,
} from '@/components/StyledDialog';
import VariableList from '@/pages/Prompts/Components/Form/VariableList';
import { DialogContent, DialogTitle, Typography } from '@mui/material';

export function VariableDialog({
  open,
  variables,
  onChangeVariable,
  onCancel,
}) {

  return (
    <StyledDialog
      disableBackdropClick={true}
      open={open}
      onClose={onCancel}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        <Typography variant='headingSmall' >
          Variables
        </Typography>
      </DialogTitle>
      <DialogContent sx={{
        width: '100%',
        maxHeight: '400px',
        overflow: 'auto',
      }}>
        <VariableList
          variables={variables}
          onChangeVariable={onChangeVariable}
          showexpandicon='true'
          multiline
          collapseContent
        />
      </DialogContent>
      <StyledDialogActions>
        <StyledConfirmButton danger onClick={onCancel} disableRipple>OK</StyledConfirmButton>
      </StyledDialogActions>
    </StyledDialog>
  )
}