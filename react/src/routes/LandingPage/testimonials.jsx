import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const userTestimonials = [
  {
    avatar: <Avatar alt='張太太' src='/testimonial1.png' />,
    name: '張太太',
    occupation: '家庭主婦',
    testimonial:
      '「自從使用了 fridgeChef，家裡的食材再也不會被浪費。食材過期通知功能特別實用，每次都能在食材過期前收到提醒，確保每餐都能使用最新鮮的食材。」',
  },
  {
    avatar: <Avatar alt='李先生' src='/testimonial2.png' />,
    name: '李先生',
    occupation: '軟體工程師',
    testimonial:
      '「fridgeChef 的食譜智慧推薦功能真的太棒了！每次打開冰箱看到的剩餘食材，不再不知道該怎麼處理。根據冰箱內的食材，總能找到創意十足又美味的食譜。」',
  },
  {
    avatar: <Avatar alt='王小姐' src='/testimonial3.png' />,
    name: '買先生',
    occupation: '週末大廚',
    testimonial:
      '「fridgeChef 真的是廚房的好幫手。智能推薦和即時通知功能，讓我每餐都能創造出不同的驚喜和美味，再也不用為剩食煩惱了。」',
  },
  {
    avatar: <Avatar alt='陳先生' src='/testimonial4.png' />,
    name: '王小姐',
    occupation: '營養師',
    testimonial:
      '「有了 fridgeChef，冰箱管理變得非常簡單。冰箱同步更新功能讓我隨時了解庫存狀況，再也不會錯過任何即將過期的食材，廚房管理輕鬆高效。」',
  },
];

export default function Testimonials() {
  const navigate = useNavigate();

  const handleRegister = () => {
    navigate('/register');
  };

  return (
    <Container
      id='testimonials'
      maxWidth='lg'
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
          width: { sm: '100%', md: '60%' },
          textAlign: { sm: 'left', md: 'center' },
        }}
      >
        <Typography
          variant='h3'
          color='text.primary'
          sx={{
            mb: { xs: 1, md: 4 },
            fontSize: { xs: 32, md: 36 },
            fontWeight: 500,
          }}
        >
          眾多用戶，真情推薦！
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {userTestimonials.map((testimonial, index) => (
          <Grid item xs={12} sm={6} key={index} sx={{ display: 'flex' }}>
            <Card
              elevation={3}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                flexGrow: 1,
                p: 1,
                borderRadius: 4,
              }}
            >
              <CardContent>
                <Typography variant='body2' color='text.secondary'>
                  {testimonial.testimonial}
                </Typography>
              </CardContent>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  pr: 2,
                }}
              >
                <CardHeader
                  avatar={testimonial.avatar}
                  title={testimonial.name}
                  subheader={testimonial.occupation}
                />
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>
      <Button
        onClick={handleRegister}
        variant='contained'
        sx={{
          mt: 2,
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
    </Container>
  );
}
