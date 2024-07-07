import axios from 'axios';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  Link,
  Snackbar,
  Alert,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const redirect = searchParams.get('redirect');

    apiClient
      .post(
        '/user/login',
        {
          provider: 'native',
          email: data.get('email'),
          password: data.get('password'),
        },
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        console.log(response.data);
        setOpenSuccessSnackbar(true);
        if (redirect === 'invitation') {
          setTimeout(() => {
            navigate('/user/invitation');
          }, 2000);
        } else {
          setTimeout(() => {
            navigate('/user/profile');
          }, 2000);
        }
      })
      .catch((err) => {
        setOpenErrorSnackbar(true);
        console.error(err.message);
      });
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };
  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  return (
    <>
      <Container
        component='main'
        maxWidth='md'
        sx={{ minHeight: '100vh', pt: 10 }}
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
            登入成功！
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
            登入失敗！
          </Alert>
        </Snackbar>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FFF9EE',
            p: 5,
            minHeight: '50vh',
            opacity: '95%',
            borderRadius: '15px',
          }}
        >
          <Box
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              mr: 5,
              display: { xs: 'none', md: 'flex' },
            }}
          >
            <img
              src='bigLogo.png'
              alt='Logo'
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              ml: 3,
            }}
          >
            <Avatar sx={{ m: 2, bgcolor: '#CC8156' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component='h1' variant='h5'>
              用戶登入
            </Typography>
            <Box
              component='form'
              onSubmit={handleSubmit}
              // noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin='normal'
                required
                fullWidth
                id='email'
                label='Email Address'
                type='email'
                name='email'
                sx={{ bgcolor: '#fdf7e8' }}
                autoFocus
              />
              <TextField
                margin='normal'
                required
                fullWidth
                name='password'
                label='Password'
                type='password'
                id='password'
                sx={{ bgcolor: '#fdf7e8' }}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: '#DDA15E',
                  ':hover': {
                    backgroundColor: '#e76f51',
                  },
                }}
              >
                登入
              </Button>
              <Typography>
                <Link href='/register' variant='body2'>
                  還沒有帳戶嗎？按這裡註冊新帳戶～
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>
      </Container>
    </>
  );
}
