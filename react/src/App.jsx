import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  Navigate,
} from 'react-router-dom';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import ShowFridgeAndRecipe from './routes/ShowFridgeAndRecipe/showFridgeAndRecipe';
import Register from './routes/register';
import Login from './routes/login';
import Profile from './routes/profile';
import ForbiddenPage from './routes/forbidden';
import CreateItems from './routes/createItems';
import CreateGroup from './routes/createGroup';
import Invitation from './routes/invitation';
import RecipeDetails from './routes/recipeDetails';
import NavBar from './routes/navbar';
import LikedRecipes from './routes/likedRecipes';
import { Box, CssBaseline } from '@mui/material';
import SearchRecipes from './routes/searchRecipe';
import MyFridge from './routes/myFridge';
import LandingPage from './routes/LandingPage/landingPage';
import Footer from './routes/footer';
import Settings from './routes/settings';

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
            backgroundSize: 'contain', // 確保背景圖像覆蓋整個頁面
            backgroundPosition: 'center',
            opacity: 0.6, // 設置透明度
            zIndex: -1, // 確保背景圖像位於所有內容的後面
          },
        },
        '#root': {
          position: 'relative', // 確保應用內容正常顯示在背景圖像之上
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
          <Route
            path='fridge/recipeDetails'
            element={<RecipeDetails />}
          ></Route>
          <Route path='searchRecipes' element={<SearchRecipes />}></Route>
          <Route path='login' element={<Login />}></Route>
          <Route path='register' element={<Register />}></Route>
          <Route path='user/profile' element={<Profile />}></Route>
          <Route path='user/myfridge' element={<MyFridge />}></Route>
          <Route path='user/createGroup' element={<CreateGroup />}></Route>
          <Route path='user/invitation' element={<Invitation />}></Route>
          <Route path='user/likedRecipe' element={<LikedRecipes />}></Route>
          <Route path='user/settings' element={<Settings />}></Route>
          <Route path='/forbidden' element={<ForbiddenPage />} />
        </Routes>
      </Box>
      {showNavBar && <Footer />}
    </>
  );
}

export default App;
