import { ThemeProvider, createTheme } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const theme = createTheme({
  palette: {
    background: {
      default: '#faedcd',
    },
  },
});

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    axios
      .get('http://localhost:8080/user/profile', {
        withCredentials: true,
      })
      .then((response) => console.log(response.data))
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      });
  }, [navigate]);

  return (
    <ThemeProvider theme={theme}>
      <h1>profile</h1>
    </ThemeProvider>
  );
}
