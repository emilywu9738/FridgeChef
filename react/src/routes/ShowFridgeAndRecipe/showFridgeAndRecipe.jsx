import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardContent,
  Select,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
  IconButton,
  styled,
  Collapse,
  Grid,
  Container,
} from '@mui/material';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SuccessSnackbar from '../../components/successSnackbar';
import ErrorSnackbar from '../../components/errorSnackbar';
import InvitingMemberCard from './invitingMemberCard';
import MemberCard from './memberCard';
import RecipeCard from './recipeCard';
import IngredientCard from './ingredientCard';

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
  const [membersCheckStatus, setMemberCheckStatus] = useState({});
  const [recommendCategory, setRecommendCategory] = useState('');
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [reload, setReload] = useState(false);

  const fridgeId = searchParams.get('id');

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
    setMemberCheckStatus((prev) => ({
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
        fridgeData,
        membersCheckStatus,
      });

      const { recipes } = response.data;
      setRecipeData(recipes);
    } catch (err) {
      if (err.response.status === 404) {
        setErrorMessage('冰箱無食材，無法推薦食譜');
        setOpenErrorSnackbar(true);
        return;
      } else {
        setErrorMessage('食譜推薦失敗，請稍候再試');
        setOpenErrorSnackbar(true);
      }
    }
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  const navigateToAddMembers = () => {
    const fridgeId = searchParams.get('id');
    navigate(`/fridge/addMembers?id=${fridgeId}`);
  };

  const navigateToRecipeDetails = (id, event) => {
    event.stopPropagation();
    navigate(`/recipe/details?id=${id}`);
  };

  const navigateToCreateItems = () => {
    navigate(`/fridge/create?fridgeId=${fridgeData._id.toString()}`);
  };

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
          setMemberCheckStatus(initialChecks);
        })
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            navigate('/login');
            return;
          }
          if (err.response && err.response.status === 403) {
            navigate('/forbidden');
            return;
          }
          if (err.response && err.response.status === 404) {
            setErrorMessage(err.response.data.error);
            setOpenErrorSnackbar(true);
            setTimeout(() => navigate('/user/myFridge'), 2000);
            return;
          }
          setErrorMessage('讀取冰箱資料失敗，請稍候再試');
          setOpenErrorSnackbar(true);
        });
    }
  }, [searchParams, navigate, reload]);

  return (
    <>
      <SuccessSnackbar
        openSuccessSnackbar={openSuccessSnackbar}
        autoHideDuration={6000}
        handleCloseSuccessSnackbar={handleCloseSuccessSnackbar}
        successMessage={successMessage}
      />
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={6000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />

      {Object.keys(fridgeData).length > 0 && (
        <Container
          component='main'
          maxWidth='lg'
          sx={{
            justifyContent: 'center',
            alignItems: 'flex-start',
            py: 4,
            position: 'relative',
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
                  fontSize: { xs: '2.3rem', md: '3.1rem' },
                  letterSpacing: { xs: 0, md: '0.1rem' },
                  color: '#635954',
                }}
              >
                {fridgeData.name}
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  mb: 2,
                  color: '#635954',
                }}
              >
                {fridgeData.description}
              </Typography>
              <Box
                sx={{
                  display: 'flex',

                  alignItems: 'center',
                  mb: 4,
                }}
              >
                <FormControl
                  fullWidth
                  sx={{
                    minWidth: { xs: 0, md: 240 },
                    maxWidth: { xs: 150, md: 275 },
                    my: 2,
                    mr: 1,
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
                    sx={{ bgcolor: '#FFFBF0', width: { xs: 150, md: 262 } }}
                  >
                    <MenuItem value={'All'}>All</MenuItem>
                    <MenuItem value={'奶蛋素'}>奶蛋素</MenuItem>
                    <MenuItem value={'全素'}>全素</MenuItem>
                  </Select>
                </FormControl>
                <Button
                  variant='contained'
                  sx={{
                    ml: 1,
                    backgroundColor: '#f59b51',
                    ':hover': {
                      backgroundColor: '#C6600C',
                    },
                    height: 50,
                    width: { xs: 90, md: 107 },
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
                  mb: 1,
                }}
              >
                <Typography
                  variant='h5'
                  component='div'
                  sx={{
                    letterSpacing: '0.03em',
                    fontSize: { xs: 20, md: 24 },
                  }}
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
                  onClick={navigateToAddMembers}
                >
                  新增成員
                </Button>
                <Grid container sx={{ mb: 3 }}>
                  {fridgeData.members.map((member) => (
                    <Grid item xs={12} sm={6} md={4} xl={3} key={member._id}>
                      <MemberCard
                        member={member}
                        isChecked={membersCheckStatus[member._id]}
                        onCheckChange={handleMemberCheckChange}
                      />
                    </Grid>
                  ))}
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
                      sx={{
                        mb: 1,
                        letterSpacing: '0.03em',
                        fontSize: { xs: 20, md: 24 },
                      }}
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
                      {fridgeData.inviting.map((invitation) => (
                        <InvitingMemberCard
                          key={invitation._id}
                          invitation={invitation}
                        />
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
                  sx={{
                    mb: 1,
                    letterSpacing: '0.03em',
                    fontSize: { xs: 20, md: 24 },
                  }}
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
                  onClick={navigateToCreateItems}
                >
                  新增食材
                </Button>

                <Grid container>
                  {fridgeData.ingredients.map((category) => (
                    <Grid item xs={12} sm={6} md={4} key={category._id}>
                      <IngredientCard
                        category={category}
                        setOpenSuccessSnackbar={setOpenSuccessSnackbar}
                        setSuccessMessage={setSuccessMessage}
                        setReload={setReload}
                        setOpenErrorSnackbar={setOpenErrorSnackbar}
                        setErrorMessage={setErrorMessage}
                        apiClient={apiClient}
                        fridgeId={fridgeId}
                        reload={reload}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Collapse>
            </CardContent>
            <CardContent>
              <Typography
                variant='h5'
                component='div'
                sx={{
                  mb: { xs: 1, md: 3 },
                  ml: 2,
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                  fontSize: { xs: 20, md: 24 },
                }}
              >
                食譜推薦清單
              </Typography>
              <Grid container>
                {recipeData.map((recipe) => (
                  <Grid item xs={12} sm={6} lg={4} key={recipe._id}>
                    <RecipeCard
                      recipe={recipe}
                      handleRecipeDetails={navigateToRecipeDetails}
                    />
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Container>
      )}
    </>
  );
}
