import { useState } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Create from './routes/create';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import ShowFridgeAndRecipe from './routes/showFridgeAndRecipe';
import Register from './routes/register';
import Login from './routes/login';
import Profile from './routes/profile';
import ForbiddenPage from './routes/forbidden';

const defaultTheme = createTheme({
  palette: {
    background: {
      default: '#faedcd',
    },
  },
});

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider theme={defaultTheme}>
      <BrowserRouter>
        <Routes>
          <Route path='create' element={<Create />}></Route>
          <Route path='fridge/recipe' element={<ShowFridgeAndRecipe />}></Route>
          <Route path='login' element={<Login />}></Route>
          <Route path='register' element={<Register />}></Route>
          <Route path='user/profile' element={<Profile />}></Route>
          <Route path='/forbidden' element={<ForbiddenPage />} />
          <Route
            path='/'
            element={
              <>
                <h1>Vite + React</h1>
                <div className='card'>
                  <button onClick={() => setCount((count) => count + 1)}>
                    count is {count}
                  </button>
                  <p>
                    Edit <code>src/App.jsx</code> and save to test HMR
                  </p>
                </div>
                <p className='read-the-docs'>
                  Click on the Vite and React logos to learn more
                </p>
              </>
            }
          ></Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
