import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardMedia,
  Container,
  Grid,
  InputAdornment,
  List,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function SearchRecipes() {
  const [search, setSearch] = useState('');
  const [result, setResult] = useState([]);
  const [isComposing, setIsComposing] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const handleSubmit = () => {
    apiClient(`/fridge/searchRecipe?ingredient=${search}`)
      .then((response) => {
        setResult(response.data);
        navigate(`/searchRecipes?ingredient=${search}`);
      })
      .catch((err) => console.error(err));
  };

  const handleSearchedRecipeDetails = (id) => {
    navigate(`/fridge/recipeDetails?id=${id}`);
  };

  useEffect(() => {
    const ingredient = searchParams.get('ingredient');
    if (ingredient) {
      setSearch(ingredient);
      apiClient(`/fridge/searchRecipe?ingredient=${ingredient}`)
        .then((response) => setResult(response.data))
        .catch((err) => console.error(err));
    }
  }, [searchParams]);

  return (
    <Container
      component='main'
      maxWidth='md'
      sx={{
        justifyContent: 'center',
        alignItems: 'flex-start',
        py: 4,
        minHeight: '93vh',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '100%',
        }}
      >
        <TextField
          color='success'
          placeholder='以食材搜尋食譜'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (!isComposing && e.key === 'Enter') {
              handleSubmit();
            }
          }}
          sx={{
            mt: 3,
            ml: 3,
            bgcolor: '#fdf7e8',
            width: '100%',
            borderRadius: '16px 0 0 16px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px 0 0 16px',
            },
            boxShadow:
              '0px 2px 2px 0px rgba(0,0,0,0.14),0px 1px 5px 0px rgba(0,0,0,0.12)',
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant='contained'
          color='primary'
          onClick={handleSubmit}
          sx={{
            mt: 3,
            mr: 3,
            height: 55.5,
            borderRadius: '0 16px 16px 0',
            marginLeft: '-1px',
            bgcolor: '#41764C',
            ':hover': { bgcolor: '#305738' },
          }}
        >
          Go!
        </Button>
      </Box>
      {result.length > 0 && (
        <Card
          sx={{
            minHeight: '80vh',
            borderRadius: 5,
            m: 3,
          }}
        >
          <CardHeader
            title={
              <Typography
                variant='h5'
                sx={{
                  fontSize: '1rem',
                  fontWeight: 400,
                  color: '#453931',
                }}
              >
                搜尋結果如下：
              </Typography>
            }
            sx={{ bgcolor: '#FFFBF1', py: 3 }}
          />

          <CardContent>
            <Grid container>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                <List>
                  {result.map((recipe, index) => (
                    <Card
                      onClick={(event) =>
                        handleSearchedRecipeDetails(recipe._id, event)
                      }
                      elevation={1}
                      key={index}
                      sx={{
                        mb: 3,
                        mx: 2,
                        height: '250px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      <Grid container>
                        <Grid item xs={5}>
                          <CardMedia
                            component='img'
                            image={
                              recipe.coverImage
                                ? recipe.coverImage
                                : '/empty.jpg'
                            }
                            alt={recipe.title}
                            sx={{
                              objectFit: 'cover',
                              objectPosition: 'center',
                              height: '250px',
                            }}
                          />
                        </Grid>
                        <Grid item xs={7}>
                          <CardContent
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              height: '100%',
                            }}
                          >
                            <Typography
                              gutterBottom
                              variant='h5'
                              component='div'
                              sx={{ fontWeight: 500 }}
                            >
                              {recipe.title}
                            </Typography>

                            <Typography variant='body2' color='#7C7C7C'>
                              {recipe.tags.map((tag) => `#${tag}`).join(' ')}
                            </Typography>
                            <Typography
                              variant='body1'
                              color='#424242'
                              sx={{
                                my: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 3,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              食材：
                              {recipe.ingredients.join('、')}
                            </Typography>
                            <Box display='flex' sx={{ mt: 'auto' }}>
                              <BookmarkIcon sx={{ color: '#3A3A3A' }} />
                              <Typography sx={{ ml: 1 }}>
                                {recipe.likes} 人收藏
                              </Typography>
                            </Box>
                          </CardContent>
                        </Grid>
                      </Grid>
                    </Card>
                  ))}
                </List>
              </Box>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}