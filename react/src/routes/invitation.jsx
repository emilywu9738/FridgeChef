import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';

function Invitation() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleGroupInvitation = () => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    axios
      .get(
        `http://localhost:8080/user/createGroup?token=${token}&email=${email}`,
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        alert(response.data);
        navigate('/user/profile');
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login?redirect=invitation');
        } else if (err.response && err.response.status === 403) {
          navigate('/forbidden');
        }
      });
  };

  return (
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
              Invitation
            </Typography>
          }
          subheader={
            <Typography variant='subtitle1' sx={{ color: '#FFFBF1' }}>
              歡迎您來到 FridgeChef
            </Typography>
          }
          sx={{ bgcolor: '#ddb892' }}
        />

        <CardContent sx={{ bgcolor: '#FFFBF1' }}>
          <Button
            variant='contained'
            sx={{ mt: 1, bgcolor: '#6c584c', ':hover': { bgcolor: '#80604C' } }}
            onClick={handleGroupInvitation}
          >
            接受邀請
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default Invitation;
