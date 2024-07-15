import axios from 'axios';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameError, setUsernameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const name = data.get('name');
    const email = data.get('email');
    const password = data.get('password');

    if (!name) {
      setUsernameError('使用者名稱不能為空');
      setErrorMessage('註冊失敗');
      setOpenErrorSnackbar(true);
      return;
    }

    if (!email) {
      setEmailError('電子郵件不能為空');
      setErrorMessage('註冊失敗');
      setOpenErrorSnackbar(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('無效的電子郵件格式');
      setErrorMessage('註冊失敗');
      setOpenErrorSnackbar(true);
      return;
    }

    if (!password) {
      setPasswordError('密碼不能為空');
      setErrorMessage('註冊失敗');
      setOpenErrorSnackbar(true);
      return;
    }

    if (password.length < 8) {
      setPasswordError('密碼長度需大於八位');
      setErrorMessage('註冊失敗！');
      setOpenErrorSnackbar(true);
      return;
    }

    setIsSubmitting(true);

    apiClient
      .post(
        '/user/register',
        {
          provider: 'native',
          name: name,
          email: email,
          password: password,
        },
        {
          withCredentials: true,
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
            noValidate
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
              label='使用者名稱'
              sx={{ bgcolor: '#fdf7e8' }}
              inputProps={{ maxLength: 20 }}
              onChange={() => {
                setUsernameError(false);
              }}
              error={usernameError}
              helperText={usernameError}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='email'
              color='success'
              id='email'
              type='email'
              label='電子郵件地址'
              sx={{ bgcolor: '#fdf7e8', autoComplete: 'new-email' }}
              onChange={() => {
                setEmailError(false);
              }}
              error={emailError}
              helperText={emailError}
            />
            <TextField
              margin='normal'
              required
              fullWidth
              name='password'
              color='success'
              id='password'
              type='password'
              label='密碼'
              onChange={() => {
                setPasswordError(false);
              }}
              sx={{ bgcolor: '#fdf7e8' }}
              error={passwordError}
              helperText={passwordError}
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
