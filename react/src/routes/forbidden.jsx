import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';

const theme = createTheme({
  palette: {
    background: {
      default: '#faedcd',
    },
  },
});

function ForbiddenPage() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/user/profile');
  };

  return (
    <ThemeProvider theme={theme}>
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
        <Card sx={{ width: 500, textAlign: 'center', borderRadius: 5 }}>
          <CardHeader
            title={
              <Typography
                variant='h5'
                sx={{ fontSize: '2.5rem', color: '#5c4742' }}
              >
                403 - Forbidden
              </Typography>
            }
            subheader={
              <Typography variant='subtitle1' sx={{ color: '#FFFBF1' }}>
                您沒有權限訪問此頁面。
              </Typography>
            }
            sx={{ bgcolor: '#ddb892' }}
          />

          <CardContent sx={{ bgcolor: '#FFFBF1' }}>
            <Typography
              sx={{
                mb: 2,
                mt: 1.2,
                fontSize: '1.2rem',
                color: '#6b705c',
                fontWeight: 500,
              }}
            >
              請檢查您的權限或聯繫管理員以獲得更多信息。
            </Typography>
            <Button
              variant='contained'
              sx={{ mt: 2, bgcolor: '#6c584c' }}
              onClick={handleBackToHome}
            >
              返回主頁
            </Button>
          </CardContent>
        </Card>
      </Box>
    </ThemeProvider>
  );
}

export default ForbiddenPage;
