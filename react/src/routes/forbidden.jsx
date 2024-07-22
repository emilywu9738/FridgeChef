import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Typography,
} from '@mui/material';

function ForbiddenPage() {
  const navigate = useNavigate();

  const handleBackToHome = () => {
    navigate('/user/myFridge');
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
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
            sx={{ mt: 2, bgcolor: '#6c584c', ':hover': { bgcolor: '#80604C' } }}
            onClick={handleBackToHome}
          >
            返回主頁
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}

export default ForbiddenPage;
