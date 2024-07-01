import axios from 'axios';
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  List,
  ListItem,
  Divider,
  Button,
} from '@mui/material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function RecipeDetails() {
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState({});
  const [recipeLikes, setRecipeLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [searchParams] = useSearchParams();

  const handleButtonClick = () => {
    const recipeId = searchParams.get('id');

    apiClient
      .post(
        '/user/updateLikes',
        { recipeId, liked: !liked },
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        console.log(response.data);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
        console.log(err);
      });

    if (liked) {
      setRecipeLikes((prevCount) => prevCount - 1);
    } else {
      setRecipeLikes((prevCount) => prevCount + 1);
    }
    setLiked(!liked);
  };

  useEffect(() => {
    const recipeId = searchParams.get('id');
    apiClient
      .get(`/fridge/recipeDetails?id=${recipeId}`)
      .then((response) => {
        setRecipe(response.data);
        setRecipeLikes(response.data.likes);
      })
      .catch((err) => {
        console.error(err);
      });
  }, [searchParams]);

  useEffect(() => {
    const recipeId = searchParams.get('id');
    apiClient
      .get('/user/profile', {
        withCredentials: true,
      })
      .then((response) => {
        const { liked_recipes } = response.data.userData;
        const isLiked = liked_recipes.some(
          (likedRecipe) => likedRecipe === recipeId,
        );
        setLiked(isLiked);
      });
  }, [searchParams]);

  return (
    <Box style={{ backgroundColor: '#faedcd', minHeight: '100vh' }}>
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Card elevation={10}>
          <CardContent>
            <Box display='flex' justifyContent='space-between'>
              <Typography variant='h4' component='div' sx={{ mt: 1, mb: 2 }}>
                {recipe.title}
              </Typography>
              <Button onClick={handleButtonClick}>
                <BookmarksIcon
                  sx={{ color: liked ? 'red' : 'black', fontSize: '35px' }}
                />
              </Button>
            </Box>

            <CardMedia
              component='img'
              height='480'
              image={recipe.coverImage}
              alt={recipe.title}
            />
            <Box
              sx={{
                display: 'flex',
                width: '100%',
                height: '100px',
                textAlign: 'center',
                mt: 1,
              }}
            >
              <Box
                sx={{
                  width: '50%',
                  margin: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography color='gray'>已收藏</Typography>
                <Typography sx={{ mt: '3px', fontSize: '19px' }}>
                  {recipeLikes} 人
                </Typography>
              </Box>
              <Box
                sx={{
                  width: '50%',
                  margin: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Typography color='gray'>份量</Typography>
                <Typography sx={{ mt: '3px', fontSize: '19px' }}>
                  {recipe.servings}
                </Typography>
              </Box>
            </Box>
            <Divider sx={{ my: 1 }} />

            <Box sx={{ mx: 1 }}>
              <Typography
                sx={{ mt: 2, mb: 1, fontSize: '19px', fontWeight: 500 }}
              >
                食材
              </Typography>
              <Divider sx={{ my: 1 }} />
              <List
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: 1,
                }}
              >
                {recipe.ingredientsDetail?.map((ingredient, index) => (
                  <ListItem key={index} sx={{ py: '5px', color: 'gray' }}>
                    {ingredient}
                  </ListItem>
                ))}
              </List>
            </Box>

            <List sx={{ mt: 3, p: 1 }}>
              {recipe.instructions?.map((step, index) => (
                <Box key={index} sx={{ mt: 2 }}>
                  <Typography variant='h6'>{`步驟 ${index + 1}`}</Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      mr: 1,
                      width: '100%',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Typography sx={{ mt: 1, mr: 1 }}>
                      {step.stepText}
                    </Typography>
                    <CardMedia
                      component='img'
                      image={step.stepImage}
                      alt={`步驟 ${index + 1}`}
                      sx={{ width: '35%' }}
                    />
                  </Box>
                  <Divider sx={{ mt: 2 }} />
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
