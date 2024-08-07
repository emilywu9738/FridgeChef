import axios from 'axios';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';
import SuccessSnackbar from '../components/successSnackbar';
import ErrorSnackbar from '../components/errorSnackbar';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

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

    apiClient(`/user/validateInvitation?id=${id}&email=${email}`, {
      withCredentials: true,
    })
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage(response.data.message);
        setTimeout(() => {
          navigate('/user/profile');
        }, 2000);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入，將為您轉移至登入頁面');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login?redirect=invitation');
          }, 2000);
          return;
        }
        if (err.response && err.response.status === 403) {
          navigate('/forbidden');
          return;
        }
        if (
          err.response &&
          (err.response.status === 400 || err.response.status === 404)
        ) {
          setErrorMessage(err.response.data.error);
          setOpenErrorSnackbar(true);
          return;
        }

        setErrorMessage('群組加入失敗');
        setOpenErrorSnackbar(true);
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
      }}
    >
      <SuccessSnackbar
        openSuccessSnackbar={openSuccessSnackbar}
        autoHideDuration={3000}
        handleCloseSuccessSnackbar={handleCloseSuccessSnackbar}
        successMessage={successMessage}
      />
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={3000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />
      <Card sx={{ width: 500, textAlign: 'center', borderRadius: 5, mx: 1 }}>
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
              歡迎加入 FridgeChef
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
