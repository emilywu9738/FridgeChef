import axios from 'axios';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Avatar,
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SuccessSnackbar from '../components/successSnackbar';
import ErrorSnackbar from '../components/errorSnackbar';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const redirect = searchParams.get('redirect');

    const email = data.get('email');
    const password = data.get('password');

    if (!email || !password) {
      setErrorMessage('請填寫所有欄位');
      setOpenErrorSnackbar(true);
      return;
    }

    setIsSubmitting(true);

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
      .then(() => {
        setSuccessMessage('登入成功');
        setOpenSuccessSnackbar(true);

        if (redirect === 'invitation') {
          setTimeout(() => {
            navigate('/user/invitation');
          }, 2000);
        }

        setTimeout(() => {
          navigate('/user/profile');
        }, 2000);
      })
      .catch((err) => {
        if (err.response && err.response.status === 404) {
          setErrorMessage('使用者不存在！將為您導到註冊頁面');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/register');
          }, 2000);
        }
        setErrorMessage('登入失敗');
        setOpenErrorSnackbar(true);
        setIsSubmitting(false);
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
        sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#FFF9EE',
            p: 5,
            minHeight: '50vh',
            opacity: '90%',
            borderRadius: '15px',
          }}
        >
          <Box
            sx={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              mr: 5,
              display: { xs: 'none', sm: 'flex' },
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
              <LockOutlinedIcon sx={{ color: '#F4E0C9' }} />
            </Avatar>
            <Typography component='h1' variant='h5'>
              用戶登入
            </Typography>
            <Box
              component='form'
              onSubmit={handleSubmit}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                margin='normal'
                required
                fullWidth
                color='success'
                id='email'
                label='電子郵件地址'
                type='email'
                name='email'
                sx={{ bgcolor: '#fdf7e8' }}
                autoFocus
              />
              <TextField
                margin='normal'
                required
                fullWidth
                color='success'
                name='password'
                label='密碼'
                type='password'
                id='password'
                sx={{ bgcolor: '#fdf7e8' }}
              />
              <Button
                type='submit'
                fullWidth
                variant='contained'
                disabled={isSubmitting}
                sx={{
                  mt: 3,
                  mb: 2,
                  bgcolor: '#DDA15E',
                  ':hover': {
                    backgroundColor: '#C07A29',
                  },
                }}
              >
                登入
              </Button>
              <Typography>
                <Link
                  href='/register'
                  variant='body2'
                  sx={{
                    color: '#AD6D25',
                    textDecorationColor: '#AD6D25',
                    ':hover': {
                      color: '#261808',
                      textDecorationColor: '#261808',
                    },
                  }}
                >
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
