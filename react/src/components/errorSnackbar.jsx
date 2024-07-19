import { Alert, Snackbar } from '@mui/material';

export default function ErrorSnackbar({
  openErrorSnackbar,
  autoHideDuration,
  handleCloseErrorSnackbar,
  errorMessage,
}) {
  return (
    <Snackbar
      open={openErrorSnackbar}
      autoHideDuration={autoHideDuration}
      onClose={handleCloseErrorSnackbar}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
    >
      <Alert
        elevation={3}
        severity='error'
        variant='filled'
        onClose={handleCloseErrorSnackbar}
      >
        {errorMessage}
      </Alert>
    </Snackbar>
  );
}
