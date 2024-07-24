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
  CardHeader,
  IconButton,
  Container,
  Grid,
} from '@mui/material';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import SuccessSnackbar from '../components/successSnackbar';
import ErrorSnackbar from '../components/errorSnackbar';

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
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };
  const handleButtonClick = () => {
    const recipeId = searchParams.get('id');

    apiClient
      .put(
        '/user/updateLikes',
        { recipeId, liked: !liked },
        {
          withCredentials: true,
        },
      )
      .then(() => {
        if (liked) {
          setRecipeLikes((prevCount) => prevCount - 1);
          setOpenSuccessSnackbar(true);
          setSuccessMessage('食譜已從收藏清單移除');
        } else {
          setRecipeLikes((prevCount) => prevCount + 1);
          setOpenSuccessSnackbar(true);
          setSuccessMessage('食譜已加入收藏');
        }
        setLiked(!liked);
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
        setOpenErrorSnackbar(true);
        setErrorMessage('收藏失敗');
      });
  };

  const handleRecommendedRecipeDetails = (id) => {
    navigate(`/recipe/details?id=${id}`);
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const recipeId = searchParams.get('id');
    apiClient
      .get(`recipe/details?id=${recipeId}`)
      .then((response) => {
        setRecipe(response.data);
        setRecipeLikes(response.data.likes);
      })
      .catch(() => {
        setErrorMessage('食譜載入失敗，請稍候再試！');
        setOpenErrorSnackbar(true);
      });
  }, [searchParams]);

  useEffect(() => {
    const recipeId = searchParams.get('id');
    apiClient
      .get(`/fridge/recipeBySimilarity?id=${recipeId}`)
      .then((response) => {
        setRecommendedRecipes(response.data);
      })
      .catch(() => {
        setTimeout(() => {
          setErrorMessage('無法取得食譜推薦，請稍候再試！');
          setOpenErrorSnackbar(true);
        }, 3500);
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
  }, [searchParams, navigate]);

  return (
    <Container
      component='main'
      maxWidth='lg'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        flexGrow: 1,
        py: 4,
      }}
    >
      <SuccessSnackbar
        openSuccessSnackbar={openSuccessSnackbar}
        autoHideDuration={3000}
        handleCloseSuccessSnackbar={handleCloseSuccessSnackbar}
        successMessage={successMessage}
      />
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={3000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />
      <Grid container display='flex' sx={{ minHeight: '93vh' }}>
        <Grid item xs={12} md={8}>
          <Card
            elevation={10}
            sx={{ borderRadius: '15px', mx: { xs: 0, md: 2 }, mb: 3 }}
          >
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
                      color: liked ? '#FB8A18' : 'black',
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
                  image={recipe.coverImage ? recipe.coverImage : '/empty.jpg'}
                  alt={recipe.title}
                  sx={{ height: { xs: 300, sm: 480, md: 450, lg: 480 } }}
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
                  <Typography color='gray'>
                    {recipe.servings && recipe.servings.trim() ? '份量' : ''}
                  </Typography>
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
                    gap: { xs: 0, md: 1 },
                  }}
                >
                  {recipe.ingredientsDetail?.map((ingredient, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        color: 'gray',
                        fontSize: { xs: 14, md: 16 },
                      }}
                    >
                      {ingredient}
                    </ListItem>
                  ))}
                </List>
              </Box>

              <List sx={{ mt: 3, p: 1 }}>
                {recipe.instructions?.map((step, index) => (
                  <Box key={index} sx={{ mt: 2 }}>
                    <Typography
                      variant='h6'
                      sx={{ fontSize: { xs: 15, md: 20 } }}
                    >{`步驟 ${index + 1}`}</Typography>

                    <Grid container>
                      <Grid item xs={8}>
                        <Typography
                          sx={{ mt: 1, mr: 1, fontSize: { xs: 13, md: 16 } }}
                        >
                          {step.stepText}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        {step.stepImage && (
                          <CardMedia
                            component='img'
                            image={step.stepImage}
                            alt={`步驟 ${index + 1}`}
                            sx={{
                              objectFit: 'cover',
                              objectPosition: 'center',
                            }}
                          />
                        )}
                      </Grid>
                    </Grid>

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
              mx: { lg: 2 },
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
                    mb: { xs: 2, lg: 3 },
                    mx: { xs: 1, lg: 2 },
                    height: { xs: 140, md: 130 },
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
                          height: { xs: 140, md: 130 },
                        }}
                      />
                    </Grid>
                    <Grid item xs={7}>
                      <CardContent>
                        <Typography
                          gutterBottom
                          variant='h6'
                          component='div'
                          sx={{
                            fontSize: { xs: 14, md: 13, lg: 16 },
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {recRecipe.title}
                        </Typography>
                        <Typography
                          variant='body2'
                          color='text.secondary'
                          sx={{
                            fontSize: { xs: 10, lg: 12 },
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
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
