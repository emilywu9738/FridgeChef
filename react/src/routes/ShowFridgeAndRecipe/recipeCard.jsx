import { Card, CardContent, CardMedia, Typography } from '@mui/material';

export default function RecipeCard({ recipe, handleRecipeDetails }) {
  const image = recipe.coverImage ? recipe.coverImage : '/empty.jpg';
  return (
    <Card
      elevation={3}
      onClick={(event) => handleRecipeDetails(recipe._id.toString(), event)}
      sx={{
        minHeight: 390,

        position: 'relative',
        m: 2,
        borderRadius: '10px',
      }}
    >
      <CardContent>
        <Typography
          sx={{
            fontSize: 18,
            mb: 1,
            fontWeight: 500,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {recipe.title}
        </Typography>
        <CardMedia
          component='img'
          height='250'
          image={image}
          alt={recipe.title}
          sx={{ mb: 2 }}
        />
        <Typography
          sx={{
            fontSize: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
          color='text.secondary'
          gutterBottom
        >
          食材：{recipe.ingredients.join('、')}
        </Typography>
      </CardContent>
    </Card>
  );
}
