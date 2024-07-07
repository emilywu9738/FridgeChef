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
  CardHeader,
  IconButton,
  Container,
  Grid,
} from '@mui/material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function RecipeDetails() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [recipe, setRecipe] = useState({});
  const [recipeLikes, setRecipeLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [recommendedRecipes, setRecommendedRecipes] = useState([]);

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
        console.error(err);
      });

    if (liked) {
      setRecipeLikes((prevCount) => prevCount - 1);
    } else {
      setRecipeLikes((prevCount) => prevCount + 1);
    }
    setLiked(!liked);
  };

  const handleRecommendedRecipeDetails = (id) => {
    navigate(`/fridge/recipeDetails?id=${id}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
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
      .get(`/fridge/recipeBySimilarity?id=${recipeId}`)
      .then((response) => {
        setRecommendedRecipes(response.data);
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
    <Container
      component='main'
      maxWidth='lg'
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
        <Grid item xs={12} md={8}>
          <Card elevation={10} sx={{ borderRadius: '15px', mx: 2, mb: 4 }}>
            <CardHeader
              title={
                <Typography
                  variant='h4'
                  component='div'
                  sx={{
                    my: 1,
                    ml: 1,
                    fontSize: 28,
                    fontWeight: 500,
                    letterSpacing: '0.03em',
                  }}
                >
                  {recipe.title}
                </Typography>
              }
              action={
                <IconButton aria-label='settings' onClick={handleButtonClick}>
                  <BookmarksIcon
                    sx={{
                      color: liked ? 'red' : 'black',
                      fontSize: '35px',
                    }}
                  />
                </IconButton>
              }
              sx={{ bgcolor: '#FFFBF1', pr: 3 }}
            />

            <CardContent>
              <Box sx={{ mx: 1, mt: 1 }}>
                <CardMedia
                  component='img'
                  height='400'
                  image={recipe.coverImage ? recipe.coverImage : '/empty.jpg'}
                  alt={recipe.title}
                />
              </Box>

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
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            elevation={10}
            sx={{
              borderRadius: '15px',
              mx: 2,
              mb: 4,
              bgcolor: '#FFFBF1',
              p: 1,
            }}
          >
            <Typography variant='h6' sx={{ my: 2, mx: 2 }}>
              你可能也會喜歡
            </Typography>
            <List>
              {recommendedRecipes.map((recRecipe, index) => (
                <Card
                  onClick={(event) =>
                    handleRecommendedRecipeDetails(recRecipe._id, event)
                  }
                  elevation={1}
                  key={index}
                  sx={{
                    mb: 3,
                    mx: 2,
                    height: '130px',
                    display: 'flex',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                >
                  <Grid container>
                    <Grid item xs={5}>
                      <CardMedia
                        component='img'
                        image={
                          recRecipe.coverImage
                            ? recRecipe.coverImage
                            : '/empty.jpg'
                        }
                        alt={recRecipe.title}
                        sx={{
                          objectFit: 'cover',
                          objectPosition: 'center',
                          height: '130px',
                        }}
                      />
                    </Grid>
                    <Grid item xs={7}>
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant='h6'
                          component='div'
                          sx={{ fontSize: 16 }}
                        >
                          {recRecipe.title}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{ fontSize: 12 }}
                        >
                          {recRecipe.tags.map((tag) => `#${tag}`).join(' ')}
                        </Typography>
                      </CardContent>
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </List>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
