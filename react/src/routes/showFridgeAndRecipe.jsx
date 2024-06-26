import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  List,
  ListItem,
  Select,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  styled,
  Collapse,
  Grid,
  CardMedia,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const ExpandMoreMembers = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

const ExpandMoreIngredients = styled((props) => {
  const { expand, ...other } = props;
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest,
  }),
}));

export default function ShowFridgeAndRecipe() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [memberExpanded, setMemberExpanded] = useState(true);
  const [invitingMemberExpanded, setInvitingMemberExpanded] = useState(true);
  const [ingredientExpanded, setIngredientExpanded] = useState(true);
  const [fridgeData, setFridgeData] = useState({
    name: '',
    members: [],
    ingredients: [],
    inviting: [],
  });
  const [recipeData, setRecipeData] = useState([]);
  const [checkedMembers, setCheckedMembers] = useState({});
  const [recommendCategory, setRecommendCategory] = useState('');

  const handleMemberExpandClick = () => {
    setMemberExpanded(!memberExpanded);
  };

  const handleInvitingMemberExpandClick = () => {
    setInvitingMemberExpanded(!invitingMemberExpanded);
  };

  const handleIngredientExpandClick = () => {
    setIngredientExpanded(!ingredientExpanded);
  };

  const handleMemberCheckChange = (memberId, isChecked) => {
    setCheckedMembers((prev) => ({
      ...prev,
      [memberId]: isChecked,
    }));
  };

  const handleCategoryChange = (event) => {
    setRecommendCategory(event.target.value);
  };

  const handleRecommendRecipes = async () => {
    try {
      setIngredientExpanded(false);
      setMemberExpanded(false);
      const fridgeId = searchParams.get('id');
      const response = await apiClient.post(`/fridge/recipe?id=${fridgeId}`, {
        recipeCategory: recommendCategory,
        fridgeData: fridgeData,
        checkedMembers: checkedMembers,
      });
      const { fullRecipes } = response.data;
      setRecipeData(fullRecipes);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRecipeDetails = (id, event) => {
    event.stopPropagation();
    navigate(`/fridge/recipeDetails?id=${id}`);
  };

  const handleCreateItems = () => {
    navigate(`/fridge/create?fridgeId=${fridgeData._id.toString()}`);
  };

  function MemberCard({ member, isChecked, onCheckChange }) {
    return (
      <Card
        sx={{
          borderRadius: '10px',
          minWidth: 275,
          position: 'relative',
          m: 1,
          bgcolor: '#FFFBF0',
        }}
      >
        <Checkbox
          checked={isChecked}
          onChange={(event) => onCheckChange(member._id, event.target.checked)}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            Member
          </Typography>
          <Typography variant='h5' component='div' sx={{ mb: 1 }}>
            {member.name}
          </Typography>
          <Typography sx={{ mb: 1.5, color: '#606c38' }}>
            飲食習慣: {member.preference}
          </Typography>
          <Typography variant='body2' sx={{ color: '#bc6c25' }}>
            排除食材：
            <br />
            {member.omit.join('、')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  function InvitingMemberCard({ member }) {
    return (
      <Card
        sx={{
          borderRadius: '10px',
          minWidth: 275,
          position: 'relative',
          m: 1,
          bgcolor: '#FFFBF0',
        }}
      >
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            邀請中
          </Typography>
          <Typography variant='h5' component='div' sx={{ mb: 1 }}>
            {member.name}
          </Typography>
          <Typography
            sx={{ fontSize: 13, fontStyle: 'italic' }}
            color='text.secondary'
          >
            {member.email}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  function IngredientCard({ category }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date();
    threeDaysLater.setHours(0, 0, 0, 0);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // 初始化每個食材的選中狀態為未選中
    const [checkedStates, setCheckedStates] = useState(
      new Array(category.items.length).fill(false),
    );

    // 處理 Checkbox 的點擊事件
    const handleCheckboxChange = (index) => {
      const newCheckedStates = [...checkedStates];
      newCheckedStates[index] = !newCheckedStates[index];
      setCheckedStates(newCheckedStates);
    };

    return (
      <Card
        sx={{
          borderRadius: '10px',
          minWidth: 275,
          m: 2,
          overflow: 'visible',
          bgcolor: '#FFFBF0',
        }}
      >
        <CardContent>
          <Typography
            sx={{ fontSize: 18, mb: 1, fontWeight: 500 }}
            color='text.primary'
            gutterBottom
          >
            {category.category}類
          </Typography>
          <List dense>
            {category.items.map((item, index) => {
              const expirationDate = new Date(item.expirationDate);
              expirationDate.setHours(0, 0, 0, 0);
              let color = 'inherit';
              if (expirationDate < today) {
                color = '#ae2012';
              } else if (expirationDate <= threeDaysLater) {
                color = '#ee9b00';
              }

              return (
                <ListItem
                  key={item._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    margin: '5px 0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Checkbox
                    checked={checkedStates[index]}
                    onChange={() => handleCheckboxChange(index)}
                    sx={{ padding: 0 }}
                  />
                  <Typography
                    variant='body2'
                    component='span'
                    sx={{ flexGrow: 1, marginLeft: 1, color: color }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    component='span'
                    sx={{ color: color }}
                  >
                    到期日: {expirationDate.toLocaleDateString()}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
    );
  }

  function RecipeCard({ recipe }) {
    const image = recipe.coverImage ? recipe.coverImage : '/empty.jpg';
    return (
      <Grid item xs={12} sm={6} md={4}>
        <Card
          elevation={3}
          sx={{
            minWidth: 275,
            minHeight: 477,
            flexGrow: 1,
            position: 'relative',
            m: 2,
          }}
        >
          <CardContent>
            <Typography
              onClick={(event) =>
                handleRecipeDetails(recipe._id.toString(), event)
              }
              sx={{ fontSize: 18, mb: 1, fontWeight: 500, cursor: 'pointer' }}
            >
              {recipe.title}
            </Typography>
            <CardMedia
              component='img'
              height='300'
              image={image}
              alt={recipe.title}
              sx={{ mb: 2 }}
            />
            <Typography
              sx={{ fontSize: 12 }}
              color='text.secondary'
              gutterBottom
            >
              食材：{recipe.ingredients.join('、')}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  useEffect(() => {
    const fridgeId = searchParams.get('id');
    if (fridgeId) {
      apiClient(`/fridge?id=${fridgeId}`, {
        withCredentials: true,
      })
        .then((response) => {
          setFridgeData(response.data);
          // 初始化所有成員的勾選狀態為未選
          const initialChecks = response.data.members.reduce(
            (acc, member) => ({
              ...acc,
              [member._id]: false,
            }),
            {},
          );
          setCheckedMembers(initialChecks);
        })
        .catch((err) => {
          console.error('Failed to fetch fridge data:', err);
          if (err.response && err.response.status === 401) {
            navigate('/login');
          } else if (err.response && err.response.status === 403) {
            navigate('/forbidden');
          }
        });
    }
  }, [searchParams, navigate]);

  return (
    <>
      {Object.keys(fridgeData).length > 0 && (
        <Box component='div' sx={{ bgcolor: '#faedcd' }}>
          <Box component='div' sx={{ p: 4 }}>
            <Typography variant='h2' sx={{ fontWeight: 500 }}>
              {fridgeData.name}
            </Typography>
            <Typography sx={{ my: 1, ml: 1 }}>
              今日：
              {new Date().toLocaleDateString('zh-Hant-TW', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Typography>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                mb: 4,
              }}
            >
              <FormControl
                fullWidth
                sx={{
                  minWidth: 240,
                  maxWidth: 275,
                  my: 2,
                  mx: 1,
                }}
              >
                <InputLabel id='recipeCategory-label' color='success'>
                  食譜類別
                </InputLabel>
                <Select
                  labelId='recipeCategory-label'
                  id='recipeCategory'
                  value={recommendCategory}
                  label='食譜類別'
                  onChange={handleCategoryChange}
                  color='success'
                  sx={{ bgcolor: '#FFFBF0' }}
                >
                  <MenuItem value={'All'}>All</MenuItem>
                  <MenuItem value={'奶蛋素'}>奶蛋素</MenuItem>
                  <MenuItem value={'全素'}>全素</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant='contained'
                size='large'
                sx={{
                  ml: 1,
                  backgroundColor: '#f59b51',
                  ':hover': {
                    backgroundColor: '#e76f51',
                  },
                  height: 50,
                }}
                onClick={handleRecommendRecipes}
              >
                推薦食譜
              </Button>
            </Box>

            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                mb: 3,
              }}
            >
              <Typography variant='h5' component='div' sx={{ mb: 1 }}>
                成員名單
              </Typography>

              <ExpandMoreMembers
                expand={memberExpanded}
                onClick={handleMemberExpandClick}
                aria-expanded={memberExpanded}
                aria-label='show more'
              >
                <ExpandMoreIcon />
              </ExpandMoreMembers>
            </Box>

            <Collapse in={memberExpanded} timeout='auto' unmountOnExit>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 5 }}>
                {fridgeData.members.map((member) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    isChecked={checkedMembers[member._id]}
                    onCheckChange={handleMemberCheckChange}
                  />
                ))}
              </Box>
            </Collapse>
            {Object.keys(fridgeData.inviting).length > 0 && (
              <>
                <Box
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'flex-start',
                    mb: 3,
                  }}
                >
                  <Typography variant='h5' component='div' sx={{ mb: 1 }}>
                    邀請中成員
                  </Typography>

                  <ExpandMoreMembers
                    expand={invitingMemberExpanded}
                    onClick={handleInvitingMemberExpandClick}
                    aria-expanded={invitingMemberExpanded}
                    aria-label='show more'
                  >
                    <ExpandMoreIcon />
                  </ExpandMoreMembers>
                </Box>

                <Collapse
                  in={invitingMemberExpanded}
                  timeout='auto'
                  unmountOnExit
                >
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 5 }}>
                    {fridgeData.inviting.map((member) => (
                      <InvitingMemberCard key={member._id} member={member} />
                    ))}
                  </Box>
                </Collapse>
              </>
            )}
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'flex-start',
                mb: 1,
              }}
            >
              <Typography variant='h5' component='div' sx={{ mb: 1 }}>
                食材清單
              </Typography>
              <ExpandMoreIngredients
                expand={ingredientExpanded}
                onClick={handleIngredientExpandClick}
                aria-expanded={ingredientExpanded}
                aria-label='show more'
              >
                <ExpandMoreIcon />
              </ExpandMoreIngredients>
            </Box>

            <Collapse in={ingredientExpanded} timeout='auto' unmountOnExit>
              <Button
                variant='contained'
                size='large'
                sx={{
                  mb: 3,
                  ml: 2,
                  backgroundColor: '#d8572a',
                  ':hover': {
                    backgroundColor: '#C74617',
                  },
                }}
                onClick={handleCreateItems}
              >
                新增食材
              </Button>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 5 }}>
                {fridgeData.ingredients.map((category) => (
                  <IngredientCard key={category._id} category={category} />
                ))}
              </Box>
            </Collapse>
            <Typography variant='h5' component='div' sx={{ mb: 5 }}>
              食譜推薦清單
            </Typography>
            <Grid container spacing={2}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {recipeData.map((recipe) => (
                  <RecipeCard key={recipe._id} recipe={recipe} />
                ))}
              </Box>
            </Grid>
          </Box>
        </Box>
      )}
    </>
  );
}
