import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  List,
  ListItem,
} from '@mui/material';

export default function RecipeDetails() {
  const [recipe, setRecipe] = useState({});
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const recipeId = searchParams.get('id');
    axios
      .get(`http://localhost:8080/fridge/recipeDetails?id=${recipeId}`)
      .then((response) => {
        console.log(response.data);
        setRecipe(response.data);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', my: 5 }}>
      <Card raised>
        <CardMedia
          component='img'
          height='400'
          image={recipe.coverImage}
          alt={recipe.title}
        />
        <CardContent>
          <Typography variant='h4' component='div'>
            {recipe.title}
          </Typography>
          <Typography color='text.secondary' gutterBottom>
            喜歡數：{recipe.likes} | 份量：{recipe.servings}
          </Typography>
          <List>
            {recipe.ingredientsDetail?.map((ingredient, index) => (
              <ListItem key={index}>{ingredient}</ListItem>
            ))}
            {recipe.instructions?.map((step, index) => (
              <Box key={index} sx={{ mt: 2 }}>
                <Typography variant='h6'>{`步驟 ${index + 1}`}</Typography>
                <Typography>{step.stepText}</Typography>
                <CardMedia
                  component='img'
                  image={step.stepImage}
                  alt={`步驟 ${index + 1}`}
                  sx={{ width: '100%', mt: 1 }}
                />
              </Box>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
}
