import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';

import Footer from './components/footer';
import NavBar from './components/navbar';

import ShowFridgeAndRecipe from './routes/ShowFridgeAndRecipe/showFridgeAndRecipe';
import Register from './routes/register';
import Login from './routes/login';
import Profile from './routes/profile';
import ForbiddenPage from './routes/forbidden';
import CreateItems from './routes/createItems';
import CreateGroup from './routes/createGroup';
import Invitation from './routes/invitation';
import RecipeDetails from './routes/recipeDetails';
import LikedRecipes from './routes/likedRecipes';
import SearchRecipes from './routes/searchRecipe';
import MyFridge from './routes/myFridge';
import LandingPage from './routes/LandingPage/landingPage';
import Settings from './routes/settings';
import AddMembers from './routes/addMembers';
import NotFound from './routes/notFound';

const defaultTheme = createTheme({
  palette: {
    background: {
      default: 'url(/bgImage.jpg)',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: 'url(/bgImage.jpg)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            opacity: 0.4,
            zIndex: -1,
          },
        },
        '#root': {
          position: 'relative',
          zIndex: 1,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <CssBaseline />
      <BrowserRouter>
        <Box
          sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
        >
          <RouteStructure />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function RouteStructure() {
  const location = useLocation();

  const pathsWithoutNavBar = ['/login', '/register', '/user/invitation', '/'];
  const showNavBar = !pathsWithoutNavBar.includes(location.pathname);

  return (
    <>
      {showNavBar && <NavBar />}
      <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Routes>
          <Route path='/' element={<LandingPage />}></Route>
          <Route path='fridge/create' element={<CreateItems />}></Route>
          <Route path='fridge/recipe' element={<ShowFridgeAndRecipe />}></Route>
          <Route path='fridge/addMembers' element={<AddMembers />}></Route>
          <Route
            path='fridge/recipeDetails'
            element={<RecipeDetails />}
          ></Route>
          <Route path='searchRecipes' element={<SearchRecipes />}></Route>
          <Route path='login' element={<Login />}></Route>
          <Route path='register' element={<Register />}></Route>
          <Route path='user/profile' element={<Profile />}></Route>
          <Route path='user/myFridge' element={<MyFridge />}></Route>
          <Route path='user/createGroup' element={<CreateGroup />}></Route>
          <Route path='user/invitation' element={<Invitation />}></Route>
          <Route path='user/likedRecipe' element={<LikedRecipes />}></Route>
          <Route path='user/settings' element={<Settings />}></Route>
          <Route path='/forbidden' element={<ForbiddenPage />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
      </Box>
      {showNavBar && <Footer />}
    </>
  );
}

export default App;
