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
  Container,
  Menu,
  Snackbar,
  Alert,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';

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
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reload, setReload] = useState(false);

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

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  function MemberCard({ member, isChecked, onCheckChange }) {
    return (
      <Card
        sx={{
          borderRadius: '10px',
          minWidth: 250,
          position: 'relative',
          m: 2,
          bgcolor: '#FEFCF8',
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
    const [isDeleteMode, setIsDeleteMode] = useState(false);
    const [itemsToDelete, setItemsToDelete] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date();
    threeDaysLater.setHours(0, 0, 0, 0);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    const sortedItems = [...category.items].sort(
      (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate),
    );

    const handleMenuClick = (event) => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
      setAnchorEl(null);
    };

    const handleDeleteMode = () => {
      setIsDeleteMode(true);
      setAnchorEl(null);
    };

    const handleDeleteItems = (itemId) => {
      setItemsToDelete((prevItems) =>
        prevItems.includes(itemId)
          ? prevItems.filter((id) => id !== itemId)
          : [...prevItems, itemId],
      );
    };

    const confirmDelete = () => {
      const fridgeId = searchParams.get('id');
      apiClient
        .post(
          `/fridge/${fridgeId}/deleteItems`,
          { ids: itemsToDelete },
          { withCredentials: true },
        )
        .then((response) => {
          setOpenSuccessSnackbar(true);
          setSuccessMessage(response.data);
          setReload(!reload);
          setItemsToDelete([]);
          setIsDeleteMode(false);
        })
        .catch((error) => {
          setOpenErrorSnackbar(true);
          setErrorMessage('食材刪除失敗！');
          console.error('Error deleting items:', error);
        });
    };

    const cancelDelete = () => {
      setIsDeleteMode(false);
      setItemsToDelete([]);
    };

    return (
      <Card
        sx={{
          borderRadius: '10px',
          m: 1,
          overflow: 'visible',
          bgcolor: '#FEFCF8',
          minHeight: 300,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography
              sx={{ fontSize: 18, mb: 0, fontWeight: 500 }}
              color='text.primary'
              gutterBottom
            >
              {category.category}類
            </Typography>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleDeleteMode}>刪除</MenuItem>
            </Menu>
          </Box>
          <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
            <List dense>
              {sortedItems
                .filter((item) => !itemsToDelete.includes(item._id))
                .map((item) => {
                  const expirationDate = new Date(item.expirationDate);
                  expirationDate.setHours(0, 0, 0, 0);
                  let bgcolor = '#FCF8EE';
                  let color = 'inherit';
                  let fontWeight = 400;
                  if (expirationDate < today) {
                    bgcolor = '#C42615';
                    color = 'white';
                    fontWeight = 600;
                  } else if (expirationDate <= threeDaysLater) {
                    bgcolor = '#fff18a';
                  }

                  return (
                    <ListItem
                      key={item._id}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '8px',
                        margin: '8px 0',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                        backgroundColor: bgcolor,
                        height: 40,
                      }}
                    >
                      <Typography
                        variant='body2'
                        component='span'
                        sx={{
                          flexGrow: 1,
                          marginLeft: 1,
                          color: color,
                          fontWeight: fontWeight,
                        }}
                      >
                        {item.name}
                      </Typography>
                      <Typography
                        variant='body2'
                        component='span'
                        sx={{ color: color, fontWeight: fontWeight }}
                      >
                        到期日: {expirationDate.toLocaleDateString()}
                      </Typography>

                      {isDeleteMode && (
                        <IconButton
                          sx={{
                            marginLeft: 1,
                            padding: 0,
                            '& .MuiSvgIcon-root': {
                              fontSize: '20px', // 控制圖標大小
                            },
                          }}
                          onClick={() => handleDeleteItems(item._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      )}
                    </ListItem>
                  );
                })}
            </List>
          </Box>
          {isDeleteMode && (
            <Box
              sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}
            >
              <Button
                variant='contained'
                onClick={confirmDelete}
                disabled={itemsToDelete.length === 0}
                sx={{
                  backgroundColor: '#f59b51',
                  ':hover': {
                    backgroundColor: '#C6600C',
                  },
                }}
              >
                確認刪除
              </Button>
              <Button
                variant='outlined'
                onClick={cancelDelete}
                sx={{
                  color: 'grey',
                  border: '1px solid grey',
                  ':hover': { color: 'black', border: '1px solid black' },
                }}
              >
                取消
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  }

  function RecipeCard({ recipe }) {
    const image = recipe.coverImage ? recipe.coverImage : '/empty.jpg';
    return (
      <Card
        elevation={3}
        sx={{
          minHeight: 390,
          flexGrow: 1,
          position: 'relative',
          m: 2,
          borderRadius: '10px',
        }}
      >
        <CardContent>
          <Typography
            onClick={(event) =>
              handleRecipeDetails(recipe._id.toString(), event)
            }
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
  }, [searchParams, navigate, reload]);

  return (
    <>
      <Snackbar
        open={openSuccessSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSuccessSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          elevation={6}
          severity='success'
          variant='filled'
          onClose={handleCloseSuccessSnackbar}
        >
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={openErrorSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseErrorSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          elevation={3}
          severity='error'
          variant='filled'
          onClose={handleCloseErrorSnackbar}
        >
          {errorMessage}
        </Alert>
      </Snackbar>
      {Object.keys(fridgeData).length > 0 && (
        <Container
          component='main'
          maxWidth='lg'
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'flex-start',
            py: 4,
          }}
        >
          <Card
            elevation={6}
            sx={{
              borderRadius: '15px',
              bgcolor: '#FCF5E2',
              minHeight: '85vh',
            }}
          >
            <CardContent sx={{ mt: 3, mx: 3 }}>
              <Typography
                variant='h3'
                sx={{
                  fontWeight: 550,
                  mb: 2,
                  fontSize: '3.1rem',
                  letterSpacing: '0.1rem',
                  color: '#635954',
                }}
              >
                {fridgeData.name}
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
                      backgroundColor: '#C6600C',
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
                <Typography
                  variant='h5'
                  component='div'
                  sx={{ mb: 1, letterSpacing: '0.03em' }}
                >
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
                <Grid container>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 5 }}>
                    {fridgeData.members.map((member) => (
                      <Grid item xs={12} sm={6} md={4} xl={3} key={member._id}>
                        <MemberCard
                          member={member}
                          isChecked={checkedMembers[member._id]}
                          onCheckChange={handleMemberCheckChange}
                        />
                      </Grid>
                    ))}
                  </Box>
                </Grid>
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
                    <Typography
                      variant='h5'
                      component='div'
                      sx={{ mb: 1, letterSpacing: '0.03em' }}
                    >
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
                <Typography
                  variant='h5'
                  component='div'
                  sx={{ mb: 1, letterSpacing: '0.03em' }}
                >
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
                    mb: 2,
                    backgroundColor: '#f59b51',
                    ':hover': {
                      backgroundColor: '#C6600C',
                    },
                    px: '17px',
                  }}
                  onClick={handleCreateItems}
                >
                  新增食材
                </Button>

                <Grid container>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 5 }}>
                    {fridgeData.ingredients.map((category) => (
                      <Grid item xs={12} sm={6} md={4} key={category._id}>
                        <IngredientCard category={category} />
                      </Grid>
                    ))}
                  </Box>
                </Grid>
              </Collapse>
            </CardContent>
            <CardContent>
              <Typography
                variant='h5'
                component='div'
                sx={{ mb: 3, ml: 2, letterSpacing: '0.06em', fontWeight: 500 }}
              >
                食譜推薦清單
              </Typography>
              <Grid container>
                <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                  {recipeData.map((recipe) => (
                    <Grid item xs={12} md={6} lg={4} key={recipe._id}>
                      <RecipeCard recipe={recipe} />
                    </Grid>
                  ))}
                </Box>
              </Grid>
            </CardContent>
          </Card>
        </Container>
      )}
    </>
  );
}
