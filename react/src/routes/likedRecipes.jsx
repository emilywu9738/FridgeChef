import axios from 'axios';
import { useEffect, useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  Typography,
} from '@mui/material';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { useNavigate } from 'react-router-dom';
import ErrorSnackbar from '../components/errorSnackbar';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function LikedRecipes() {
  const [likedRecipes, setLikedRecipes] = useState([]);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const navigateToRecipeDetails = (id) => {
    navigate(`/recipe/details?id=${id}`);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  useEffect(() => {
    apiClient('/user/likedRecipes', { withCredentials: true })
      .then((response) => {
        setLikedRecipes(response.data.liked_recipes.reverse());
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
        setErrorMessage('載入失敗，請稍候再試！');
        setOpenErrorSnackbar(true);
      });
  }, [navigate]);

  return (
    <Container
      component='main'
      maxWidth='xl'
      sx={{
        justifyContent: 'center',
        alignItems: 'flex-start',
        py: 4,
        flexGrow: 1,
      }}
    >
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={3000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />
      <Card
        sx={{
          minHeight: '80vh',
          textAlign: 'center',
          borderRadius: 5,
          mx: 'auto',
        }}
      >
        <CardHeader
          title={<BookmarkRoundedIcon sx={{ fontSize: '35px', mt: 1 }} />}
          sx={{ bgcolor: '#FFFBF1' }}
        />

        <CardContent>
          <Grid container>
            {likedRecipes.map((recipe) => (
              <Grid key={recipe._id} item xs={4} xl={3}>
                <Box
                  onClick={() => navigateToRecipeDetails(recipe._id)}
                  sx={{
                    position: 'relative',
                    m: '3px',
                    '&:hover .overlay': {
                      opacity: 1,
                    },
                    '&:hover img': {
                      filter: 'brightness(110%)',
                    },
                    cursor: 'pointer',
                  }}
                >
                  <CardMedia
                    component='img'
                    image={recipe.coverImage ? recipe.coverImage : '/empty.jpg'}
                    alt={recipe.title}
                    sx={{
                      width: '100%',
                      height: { xs: 100, sm: 200, md: 270, lg: 300 },
                      objectFit: 'cover',
                    }}
                  />
                  <Box
                    className='overlay'
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      bgcolor: 'rgba(0, 0, 0, 0.5)',
                      color: 'white',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      opacity: 0,
                      transition: 'opacity 0.3s',
                      p: 2,
                    }}
                  >
                    <Typography variant='h6'>{recipe.title}</Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
}
