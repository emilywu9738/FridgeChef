import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  ThemeProvider,
  Typography,
  createTheme,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const theme = createTheme({
  palette: {
    background: {
      default: '#faedcd',
    },
  },
});

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [userFridge, setUserFridge] = useState([]);

  useEffect(() => {
    axios
      .get('http://localhost:8080/user/profile', {
        withCredentials: true,
      })
      .then((response) => {
        setUserData(response.data.userData);
        setUserFridge(response.data.userFridge);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      });
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      {Object.keys(userData).length > 0 && (
        <Box
          sx={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#faedcd',
          }}
        >
          <Card sx={{ width: 400, textAlign: 'center', borderRadius: 5 }}>
            <CardHeader
              title={
                <Typography
                  variant='h5'
                  sx={{ fontSize: '2.5rem', color: '#5c4742' }}
                >
                  {userData.name}
                </Typography>
              }
              subheader={
                <Typography variant='subtitle1' sx={{ color: '#FFFBF1' }}>
                  {userData.email}
                </Typography>
              }
              action={
                <IconButton aria-label='settings'>
                  <MoreVertIcon />
                </IconButton>
              }
              sx={{ bgcolor: '#ddb892' }}
            />

            <CardContent sx={{ bgcolor: '#FFFBF1' }}>
              <Typography
                sx={{ mb: 1.5, mt: 1.2, fontSize: '1.2rem', color: '#6b705c' }}
              >
                飲食習慣: {userData.preference}
              </Typography>
              <Typography sx={{ mb: 1.5, color: '#cb997e' }}>
                排除食材：
                <br />
                {userData.omit.join('、')}
              </Typography>
              <Typography sx={{ color: '#735751' }}>
                已收藏食譜：
                <br />
                {Array.isArray(userData.liked_recipes)
                  ? userData.liked_recipes.length
                  : 0}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      )}
    </ThemeProvider>
  );
}
