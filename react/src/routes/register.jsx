import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Link,
  TextField,
  Typography,
} from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

const theme = createTheme({
  palette: {
    background: {
      default: '#faedcd',
    },
  },
});

export default function Register() {
  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    axios
      .post('http://localhost:8080/user/register', {
        username: data.get('username'),
        email: data.get('email'),
        password: data.get('password'),
      })
      .then((response) => console.log(response.data));
  };

  return (
    <ThemeProvider theme={theme}>
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
              <Avatar sx={{ m: 2, bgcolor: '#F48C06' }}>
                <LockOutlinedIcon />
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
                  margin='normal'
                  required
                  fullWidth
                  name='username'
                  label='Username'
                  type='text'
                  id='username'
                  sx={{ bgcolor: '#fdf7e8' }}
                />
                <TextField
                  margin='normal'
                  required
                  fullWidth
                  id='email'
                  label='Email Address'
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
                  sx={{ mt: 3, mb: 2, bgcolor: '#DDA15E' }}
                >
                  註冊
                </Button>
                <Typography>
                  <Link href='/login' variant='body2'>
                    已經有帳戶了嗎？按這裡登入～
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}
