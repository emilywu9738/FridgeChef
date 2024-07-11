import { Box, Container, Grid, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export default function Features() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Container
      id='features'
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Box
        sx={{
          width: '100%',

          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        <Typography
          variant='h3'
          color='text.primary'
          sx={{ mb: 4, fontSize: 36, fontWeight: 450 }}
        >
          使用 <b>冰箱大廚 FridgeChef</b>，輕鬆管理冰箱剩食！
        </Typography>
      </Box>
      <Grid container>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              component='img'
              src='/featureIcon1.png'
              sx={{ height: 280, px: 3, pt: 5, pb: '30px', mb: 3 }}
            />
            <Typography variant='h6' color='text.primary' sx={{ mb: 2 }}>
              食材過期通知
            </Typography>
            <Typography variant='body2' sx={{ mx: 2 }}>
              在食材過期前即時提醒，避免食物浪費，也不用再擔心食材何時會壞掉。這樣一來也可以在食材最佳保存期內食用，確保每一餐都新鮮健康。
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              component='img'
              src='/featureIcon2.png'
              sx={{
                height: '300px',
                px: 4,
                pt: '35px',
                pb: '35px',
              }}
            />
            <Typography variant='h6' color='text.primary' sx={{ mb: '20px' }}>
              食譜智慧推薦
            </Typography>
            <Typography variant='body2' sx={{ mx: 2 }}>
              根據冰箱內的現有食材和個人偏好，提供量身定制的美味食譜建議。無論是日常餐點還是創意料理，皆能滿足需求，讓每一餐都充滿驚喜和美味！
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
            }}
          >
            <Box
              component='img'
              src='/featureIcon3.png'
              sx={{ height: 280, py: 3, pt: '15px', pb: '20px', mb: '20px' }}
            />
            <Typography variant='h6' color='text.primary' sx={{ mb: '20px' }}>
              冰箱同步更新
            </Typography>
            <Typography variant='body2' sx={{ mx: 2 }}>
              實時同步冰箱食材庫存，自動更新數據，提供最佳的食譜建議。確保高效管理冰箱內的食材，避免食材過期和浪費，讓廚房管理變得更加輕鬆高效。
            </Typography>
          </Box>
        </Grid>
      </Grid>
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
          mt: 2,
        }}
      >
        立即體驗
      </Button>
    </Container>
  );
}
