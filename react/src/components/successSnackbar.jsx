import { Alert, Snackbar } from '@mui/material';

export default function SuccessSnackbar({
  openSuccessSnackbar,
  autoHideDuration,
  handleCloseSuccessSnackbar,
  successMessage,
}) {
  return (
    <Snackbar
      open={openSuccessSnackbar}
      autoHideDuration={autoHideDuration}
      onClose={handleCloseSuccessSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        elevation={6}
        severity='success'
        variant='filled'
        onClose={handleCloseSuccessSnackbar}
      >
        {successMessage}
      </Alert>
    </Snackbar>
  );
}
