import { useState } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';

import Create from './routes/create';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import ShowFridgeAndRecipe from './routes/showFridgeAndRecipe';
import Register from './routes/register';
import Login from './routes/login';
import Profile from './routes/profile';
import ForbiddenPage from './routes/forbidden';
import CreateGroup from './routes/createGroup';
import Invitation from './routes/invitation';
import RecipeDetails from './routes/recipeDetails';
import NavBar from './routes/navbar';

const defaultTheme = createTheme({
  palette: {
    background: {
      default: '#faedcd',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <BrowserRouter>
        <RouteStructure />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function RouteStructure() {
  const location = useLocation();

  const pathsWithoutNavBar = ['/login', '/register', '/user/invitation'];
  const showNavBar = !pathsWithoutNavBar.includes(location.pathname);

  return (
    <>
      {showNavBar && <NavBar />}
      <Routes>
        <Route path='create' element={<Create />}></Route>
        <Route path='fridge/recipe' element={<ShowFridgeAndRecipe />}></Route>
        <Route path='fridge/recipeDetails' element={<RecipeDetails />}></Route>
        <Route path='login' element={<Login />}></Route>
        <Route path='register' element={<Register />}></Route>
        <Route path='user/profile' element={<Profile />}></Route>
        <Route path='user/createGroup' element={<CreateGroup />}></Route>
        <Route path='user/invitation' element={<Invitation />}></Route>
        <Route path='/forbidden' element={<ForbiddenPage />} />
        <Route
          path='/'
          element={
            <>
              <h1>This is home!!</h1>
            </>
          }
        ></Route>
      </Routes>
    </>
  );
}

export default App;
