import { Box, Button, Card, Container, Grid, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/register');
  };

  return (
    <Container maxWidth='xl' id='features' sx={{ py: { xs: 8, sm: 16 } }}>
      <Grid container>
        <Grid
          item
          xs={12}
          md={4}
          sx={{ display: 'flex', alignItems: 'center', mb: 3, px: 4 }}
        >
          <Box>
            <Typography
              variant='h3'
              color='text.primary'
              sx={{ mb: 1, fontWeight: 500 }}
            >
              剩食不浪費，
            </Typography>
            <Typography variant='h3' color='text.primary'>
              美味料理輕鬆上桌！
            </Typography>
            <Typography variant='h6' color='text.secondary' sx={{ mt: 4 }}>
              食譜智慧推薦，拯救剩餘食材，讓每一餐都充滿創意和美味！
            </Typography>
            <Button
              onClick={handleLogin}
              variant='contained'
              sx={{
                mt: 3,
                backgroundColor: '#f59b51',
                ':hover': {
                  backgroundColor: '#C6600C',
                },
                height: 50,
                width: 110,
                fontSize: 18,
              }}
            >
              立即體驗
            </Button>
          </Box>
        </Grid>
        <Grid item xs={12} md={8} sx={{ display: 'flex' }}>
          <Card
            variant='outlined'
            sx={{
              height: '100%',
              width: '100%',
              border: 'none',
              pointerEvents: 'none',
              mx: 2,
            }}
          >
            <Box
              sx={{
                width: 'auto',
                height: { xs: 300, sm: 380, md: 350, lg: 500, xl: 600 },
                backgroundPosition: 'center',
                backgroundSize: 'cover',
                backgroundImage: 'url(/landingPageCover.png)',
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
