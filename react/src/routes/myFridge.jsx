import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Container,
  Grid,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import KitchenIcon from '@mui/icons-material/Kitchen';

import ControlPointIcon from '@mui/icons-material/ControlPoint';
import ErrorSnackbar from '../components/errorSnackbar';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function MyFridge() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState({});
  const [userFridge, setUserFridge] = useState([]);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  const navigateToCreateGroup = () => {
    navigate('/user/createGroup');
  };

  function FridgeCard({ fridge }) {
    const fridgeMembers = fridge.members.map((m) => m.name).join('、');
    const handleFridgeClick = () => {
      navigate(`/fridge/recipe?id=${fridge._id}`);
    };
    const expiredItems = fridge.ingredients
      .map((category) => ({
        category: category.category,
        items: category.items.filter((item) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expirationDate = new Date(item.expirationDate);
          expirationDate.setHours(0, 0, 0, 0);
          return expirationDate < today;
        }),
      }))
      .filter((category) => category.items.length > 0)
      .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

    const expiringItems = fridge.ingredients
      .map((category) => ({
        category: category.category,
        items: category.items.filter((item) => {
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const expirationDate = new Date(item.expirationDate);
          expirationDate.setHours(0, 0, 0, 0);
          const daysDifference =
            (expirationDate - today) / (1000 * 60 * 60 * 24);
          return expirationDate >= today && daysDifference <= 3;
        }),
      }))
      .filter((category) => category.items.length > 0)
      .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate));

    const calculateDaysLeft = (expirationDate) => {
      const today = new Date();
      const date = new Date(expirationDate);
      const timeDiff = date - today;
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
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
            mb: 3,
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
              已過期
            </Typography>
            {expiredItems.length > 0 ? (
              expiredItems.map((category) => (
                <Box key={category.category} sx={{ mt: 1, mb: 2, mx: 2 }}>
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
                      {-calculateDaysLeft(item.expirationDate)}天前 )
                    </Typography>
                  ))}
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: 14, ml: 2 }}>
                沒有已過期食材
              </Typography>
            )}
            <Typography
              sx={{ fontSize: 16, m: 1, color: '#4D3F36', fontWeight: 'bold' }}
            >
              即將過期
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
                  {category.items.map((item) => {
                    const daysLeft = calculateDaysLeft(item.expirationDate);
                    return (
                      <Typography
                        key={item._id}
                        sx={{ fontSize: 14, ml: 2, color: '#342926' }}
                      >
                        {item.name} ⇒{' '}
                        {new Date(item.expirationDate).toLocaleDateString()} ({' '}
                        {daysLeft > 0 ? `${daysLeft}天後` : '今天過期'} )
                      </Typography>
                    );
                  })}
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: 14, ml: 2 }}>
                沒有即將到期食材
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
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入！將為您導向登入頁面...');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        if (err.response && err.response.status === 403) {
          setErrorMessage('請重新登入！將為您導向登入頁面...');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
      });
  }, [navigate]);

  return (
    <>
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={3000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />
      {Object.keys(userData).length > 0 && (
        <Container
          component='main'
          maxWidth='md'
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
          }}
        >
          <Grid container display='flex'>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 6,
                  px: 1,
                  pb: 2,
                  mx: 'auto',
                  my: 3,
                  bgcolor: '#FFFBF1',
                  maxWidth: 600,
                }}
              >
                <CardHeader
                  title={
                    <Box sx={{ display: 'flex' }}>
                      <KitchenIcon
                        sx={{ mt: 3, ml: 2, color: '#5C4742', fontSize: 30 }}
                      />
                      <Typography
                        variant='h5'
                        sx={{
                          ml: 1,
                          mt: 3,
                          color: '#5C4742',
                          fontWeight: 600,
                        }}
                      >
                        我的冰箱
                      </Typography>
                    </Box>
                  }
                  action={
                    <Tooltip title='新增群組'>
                      <IconButton onClick={navigateToCreateGroup}>
                        <ControlPointIcon
                          sx={{ fontSize: 30, color: '#f59b51' }}
                        />
                      </IconButton>
                    </Tooltip>
                  }
                />
                <CardContent>
                  {userFridge.map((fridge) => (
                    <FridgeCard key={fridge._id} fridge={fridge} />
                  ))}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
}
