import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
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

  function FridgeCard({ fridge }) {
    const fridgeMembers = fridge.members.map((m) => m.name).join(' ');
    const handleFridgeClick = () => {
      navigate(`/fridge/recipe?id=${fridge._id}`);
    };

    return (
      <Grid item xs={12} md={6}>
        <Card
          elevation={3}
          sx={{
            flexGrow: 1,
            position: 'relative',
            m: 2,
          }}
        >
          <CardHeader
            title={
              <Typography
                variant='h5'
                sx={{
                  fontSize: '1rem',
                  color: 'white',
                  fontWeight: 550,
                }}
              >
                {fridge.name}
              </Typography>
            }
            onClick={handleFridgeClick}
            sx={{ bgcolor: '#6c584c', cursor: 'pointer' }}
          />

          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color='text.secondary'
              component='div'
              gutterBottom
            >
              成員
              <br />
              {fridgeMembers}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

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
        } else if (err.response && err.response.status === 403) {
          navigate('/forbidden');
        }
      });
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      {Object.keys(userData).length > 0 && (
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
                  {userData.name}
                </Typography>
              }
              subheader={
                <Typography
                  variant='subtitle1'
                  sx={{ color: '#FFFBF1', fontStyle: 'italic' }}
                >
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
                sx={{
                  mb: 2,
                  mt: 1.2,
                  fontSize: '1.2rem',
                  color: '#6b705c',
                  fontWeight: 500,
                }}
              >
                飲食習慣: {userData.preference}
              </Typography>
              <Typography sx={{ color: '#B47552', fontWeight: 500 }}>
                排除食材
              </Typography>
              <Typography sx={{ mb: 1.5, color: '#cb997e' }}>
                {userData.omit.join('、')}
              </Typography>
              <Typography sx={{ mb: 1.5, color: '#B47552', fontWeight: 500 }}>
                已收藏食譜
                <br />
                {Array.isArray(userData.liked_recipes)
                  ? userData.liked_recipes.length
                  : 0}
              </Typography>

              <Typography sx={{ color: '#B47552', fontWeight: 500 }}>
                群組
              </Typography>
              <Grid container justifyContent='center'>
                {userFridge.map((fridge) => (
                  <FridgeCard key={fridge._id} fridge={fridge} />
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      )}
    </ThemeProvider>
  );
}
