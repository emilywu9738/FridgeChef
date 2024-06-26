import axios from 'axios';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Snackbar,
  Typography,
} from '@mui/material';

function Invitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleGroupInvitation = () => {
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    axios
      .get(`http://localhost:8080/user/createGroup?id=${id}&email=${email}`, {
        withCredentials: true,
      })
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage(response.data);
        navigate('/user/profile');
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入，將為您轉移至登入頁面');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login?redirect=invitation');
          }, 2000);
        } else if (err.response && err.response.status === 403) {
          navigate('/forbidden');
        } else {
          setErrorMessage('群組加入失敗');
          setOpenErrorSnackbar(true);
        }
      });
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: '#faedcd',
      }}
    >
      <Snackbar
        open={openSuccessSnackbar}
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
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={6000}
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
      <Card sx={{ width: 500, textAlign: 'center', borderRadius: 5 }}>
        <CardHeader
          title={
            <Typography
              variant='h5'
              sx={{ fontSize: '2.5rem', color: '#5c4742' }}
            >
              Invitation
            </Typography>
          }
          subheader={
            <Typography variant='subtitle1' sx={{ color: '#FFFBF1' }}>
              歡迎您來到 FridgeChef
            </Typography>
          }
          sx={{ bgcolor: '#ddb892' }}
        />

        <CardContent sx={{ bgcolor: '#FFFBF1' }}>
          <Button
            variant='contained'
            sx={{ mt: 1, bgcolor: '#6c584c', ':hover': { bgcolor: '#80604C' } }}
            onClick={handleGroupInvitation}
          >
            接受邀請
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Invitation;
