import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function MyFridge() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({});
  const [userFridge, setUserFridge] = useState([]);

  function FridgeCard({ fridge }) {
    const fridgeMembers = fridge.members.map((m) => m.name).join('、');
    const handleFridgeClick = () => {
      navigate(`/fridge/recipe?id=${fridge._id}`);
    };
    const expiringItems = fridge.ingredients
      .map((category) => ({
        category: category.category,
        items: category.items.filter((item) => {
          const today = new Date();
          const expirationDate = new Date(item.expirationDate);
          return (
            expirationDate > today &&
            (expirationDate - today) / (1000 * 60 * 60 * 24) <= 4
          );
        }),
      }))
      .filter((category) => category.items.length > 0)
      .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

    const calculateDaysLeft = (expirationDate) => {
      const today = new Date();
      const date = new Date(expirationDate);
      const timeDiff = date - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)); // 計算剩餘天數
      return daysLeft;
    };

    return (
      <>
        <Card
          elevation={3}
          onClick={handleFridgeClick}
          sx={{
            position: 'relative',
            mx: 2,
            my: 3,
            borderRadius: 4,
            minWidth: 150,
            cursor: 'pointer',
            '&:hover .card-header': {
              bgcolor: '#9c6644',
            },
          }}
        >
          <CardHeader
            className='card-header'
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
            sx={{
              bgcolor: '#6c584c',
            }}
          />

          <CardContent sx={{ bgcolor: '#FFFEFC' }}>
            <Typography
              sx={{
                fontSize: 16,
                m: 1,
                color: '#4D3F36',
                fontWeight: 'bold',
              }}
              component='div'
              gutterBottom
            >
              成員
            </Typography>
            <Typography sx={{ fontSize: 14, mx: 2, mb: 2, color: '#795E58' }}>
              {fridgeMembers}
            </Typography>
            <Typography
              sx={{ fontSize: 16, m: 1, color: '#4D3F36', fontWeight: 'bold' }}
            >
              即將到期
            </Typography>
            {expiringItems.length > 0 ? (
              expiringItems.map((category) => (
                <Box key={category.category} sx={{ my: 1, mx: 2 }}>
                  <Typography
                    sx={{
                      fontSize: 14,
                      fontWeight: 'bold',
                      mb: 1,
                      color: '#876A62',
                    }}
                  >
                    {category.category}類
                  </Typography>
                  {category.items.map((item) => (
                    <Typography
                      key={item._id}
                      sx={{ fontSize: 14, ml: 2, color: '#342926' }}
                    >
                      {item.name} ⇒{' '}
                      {new Date(item.expirationDate).toLocaleDateString()} ({' '}
                      {calculateDaysLeft(item.expirationDate)}天後 )
                    </Typography>
                  ))}
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: 14, ml: 2 }}>
                沒有即將到期的項目
              </Typography>
            )}
          </CardContent>
        </Card>
      </>
    );
  }

  useEffect(() => {
    apiClient('/user/profile', {
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
    <>
      {Object.keys(userData).length > 0 && (
        <Container
          component='main'
          maxWidth='md'
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            minHeight: '93vh',
            py: 4,
          }}
        >
          <Grid container display='flex' sx={{ minHeight: '93vh' }}>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 6,
                  mx: 'auto',
                  px: 1,
                  pb: 2,
                  bgcolor: '#FFFBF1',
                  my: 2,
                  maxWidth: 600,
                }}
              >
                <Typography
                  variant='h6'
                  sx={{ mx: 2, mt: 3, mb: 2, color: '#5C4742', fontSize: 22 }}
                >
                  我的冰箱
                </Typography>
                {userFridge.map((fridge) => (
                  <FridgeCard key={fridge._id} fridge={fridge} />
                ))}
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
}
