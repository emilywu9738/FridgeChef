import { useState } from 'react';
import * as React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Create from './routes/create';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, Stack, TextField, Typography } from '@mui/material';
import Button from '@mui/material/Button';

const defaultTheme = createTheme();

function App() {
  const [count, setCount] = useState(0);

  return (
    <ThemeProvider theme={defaultTheme}>
      <BrowserRouter>
        <Routes>
          <Route path='create' element={<Create />}></Route>
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
