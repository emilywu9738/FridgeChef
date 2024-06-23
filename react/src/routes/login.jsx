import { useNavigate, useSearchParams } from 'react-router-dom';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  TextField,
  Typography,
  Link,
} from '@mui/material';

import axios from 'axios';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const redirect = searchParams.get('redirect');

    axios
      .post(
        'http://localhost:8080/user/login',
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
        if (redirect === 'invitation') {
          navigate('/user/invitation');
        } else {
          navigate('/user/profile');
        }
      })
      .catch((err) => console.error(err.message));
  };

  return (
    <>
      <Container component='main' maxWidth='md' sx={{ bgcolor: '#faedcd' }}>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: 2,
            }}
          >
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mr: 5,
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
        </Box>
      </Container>
    </>
  );
}
