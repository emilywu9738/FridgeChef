import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppBar, Box, Button, Toolbar } from '@mui/material/';

export default function NavBar() {
  const navigate = useNavigate();
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleLogoClick = () => {
    navigate('#');
  };

  const handleScroll = () => {
    const position = window.scrollY;
    setScrollPosition(position);
  };

  const handleLogin = () => {
    navigate('/login');
  };

  const handleRegister = () => {
    navigate('/register');
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      <AppBar
        position='sticky'
        sx={{
          bgcolor: scrollPosition > 0 ? '#a98467' : '#E1D8C8',
          height: 80,
          width: '100%',
          boxShadow: 'none',
          transition: 'background-color 0.3s ease',
        }}
      >
        <Box sx={{ mt: 1, mx: { xs: 1, md: 3 } }}>
          <Toolbar
            disableGutters
            sx={{ justifyContent: 'space-between', width: '100%' }}
          >
            <Box
              onClick={handleLogoClick}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <Box
                component='img'
                src='/navbarLogo.png'
                sx={{
                  maxWidth: { xs: 38, md: 45 },
                  height: 'auto',
                  pb: 1,
                }}
              />
              <Box
                component='img'
                src='/logoText.png'
                alt='Logo'
                sx={{
                  maxWidth: { xs: 120, md: 150 },
                  height: 'auto',
                  mx: { xs: '10px', md: '15px' },
                }}
              />
            </Box>
            <Button
              onClick={handleLogin}
              variant='text'
              sx={{
                ml: 'auto',
                height: 50,
                width: 110,
                fontSize: 18,
                color: scrollPosition > 0 ? 'white' : 'grey',
                fontWeight: 500,
                ':hover': {
                  bgcolor: scrollPosition > 0 ? '#a98467' : '#E1D8C8',
                  color: scrollPosition > 0 ? '#FDEADA' : 'black',
                },
              }}
            >
              登入
            </Button>
            <Button
              onClick={handleRegister}
              variant='contained'
              sx={{
                backgroundColor: '#f59b51',
                ':hover': {
                  backgroundColor: '#C6600C',
                },
                height: 50,
                width: 110,
                fontSize: 18,
                whiteSpace: 'nowrap',
              }}
            >
              立即體驗
            </Button>
          </Toolbar>
        </Box>
      </AppBar>
    </>
  );
}
