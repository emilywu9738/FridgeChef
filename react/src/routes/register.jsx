import axios from 'axios';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Link,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function Register() {
  const navigate = useNavigate();

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('註冊失敗');

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    apiClient
      .post(
        '/user/register',
        {
          provider: 'native',
          name: data.get('name'),
          email: data.get('email'),
          password: data.get('password'),
        },
        {
          withCredentials: true, // 確保設置了此選項
        },
      )
      .then((response) => {
        setOpenSuccessSnackbar(true);
        console.log(response.data);
        setTimeout(() => {
          navigate('/user/profile');
        }, 2000);
      })
      .catch((err) => {
        if (err.response && err.response.status === 403) {
          setErrorMessage('使用者已存在，將為您跳轉至登入頁面');
          setOpenErrorSnackbar(true);
          console.error(err);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setErrorMessage('註冊失敗！');
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
    <Container
      component='main'
      maxWidth='md'
      sx={{ display: 'flex', minHeight: '100vh', alignItems: 'center' }}
    >
      <Snackbar
        open={openSuccessSnackbar}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          elevation={3}
          severity='success'
          variant='filled'
          onClose={handleCloseSuccessSnackbar}
        >
          註冊成功！
        </Alert>
      </Snackbar>
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={6000} // 6 秒後自動關閉
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          elevation={6}
          severity='warning'
          variant='filled'
          onClose={handleCloseErrorSnackbar}
        >
          {errorMessage}
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
            新戶註冊
          </Typography>
          <Box
            component='form'
            onSubmit={handleSubmit}
            // noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              autoFocus
              margin='normal'
              required
              fullWidth
              name='name'
              color='success'
              id='name'
              type='text'
              label='Username'
              sx={{ bgcolor: '#fdf7e8' }}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='email'
              color='success'
              id='email'
              type='email'
              label='Email Address'
              sx={{ bgcolor: '#fdf7e8' }}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              color='success'
              id='password'
              type='password'
              label='Password'
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
                  backgroundColor: '#C07A29',
                },
              }}
            >
              註冊
            </Button>
            <Typography>
              <Link
                href='/login'
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
                已經有帳戶了嗎？按這裡登入～
              </Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Container>
  );
}
