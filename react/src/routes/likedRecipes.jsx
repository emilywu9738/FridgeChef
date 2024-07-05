import axios from 'axios';
import { useEffect, useState } from 'react';

import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Grid,
  Icon,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import { useNavigate } from 'react-router-dom';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function LikedRecipes() {
  const [likedRecipes, setLikedRecipes] = useState([]);

  const navigate = useNavigate();

  const handleRecipeDetails = (id) => {
    navigate(`/fridge/recipeDetails?id=${id}`);
  };

  useEffect(() => {
    apiClient('/user/likedRecipes', { withCredentials: true }).then(
      (response) => {
        setLikedRecipes(response.data.liked_recipes);
      },
    );
  }, []);

  return (
    <Box sx={{ py: 5 }}>
      <Card
        sx={{
          width: '80%',
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
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
              {likedRecipes.map((recipe) => (
                <Grid key={recipe._id} item xs={12} md={6} lg={4}>
                  <Box
                    onClick={() => handleRecipeDetails(recipe._id)}
                    sx={{
                      position: 'relative',
                      m: 1,
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
                      image={
                        recipe.coverImage ? recipe.coverImage : '/empty.jpg'
                      }
                      alt={recipe.title}
                      sx={{
                        width: '100%',
                        height: '300px',
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
            </Box>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
}
