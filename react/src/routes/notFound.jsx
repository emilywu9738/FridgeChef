import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        px: { sm: 5 },
        py: { xs: 8, sm: 5 },
      }}
    >
      <Card sx={{ m: 2, bgcolor: '#FFF9EE', borderRadius: 4 }}>
        <CardContent>
          <Typography variant='h4' component='h1'>
            404
          </Typography>
          <Typography variant='h5' component='h2' sx={{ my: 2 }}>
            抱歉，找不到這個頁面。
          </Typography>
          <Button variant='contained' color='warning' onClick={handleGoHome}>
            回到首頁
          </Button>
        </CardContent>
        <CardMedia
          component='img'
          width='90%'
          image='/404picture.png'
          sx={{ p: 2, objectFit: 'contain' }}
        />
      </Card>
    </Box>
  );
}
