import axios from 'axios';
import {
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControlLabel,
  FormGroup,
  Grid,
  Switch,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SuccessSnackbar from '../components/successSnackbar';
import ErrorSnackbar from '../components/errorSnackbar';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function Settings() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [checked, setChecked] = useState('');
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    setChecked(event.target.checked);
    apiClient
      .post(
        '/user/updateReceiveNotifications',
        { checked: !checked },
        {
          withCredentials: true,
        },
      )
      .then(() => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage('通知設定已更新');
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入！將為您導向登入頁面...');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        if (err.response && err.response.status === 403) {
          setErrorMessage('請重新登入！將為您導向登入頁面...');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        setOpenErrorSnackbar(true);
        setErrorMessage('通知設定更新失敗');
      });
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  useEffect(() => {
    apiClient('/user/profile', {
      withCredentials: true,
    })
      .then((response) => {
        setUserData(response.data.userData);
        setChecked(response.data.userData.receiveNotifications);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入！將為您導向登入頁面...');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
        if (err.response && err.response.status === 403) {
          setErrorMessage('請重新登入！將為您導向登入頁面...');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
          return;
        }
      });
  }, [navigate]);

  return (
    <>
      <SuccessSnackbar
        openSuccessSnackbar={openSuccessSnackbar}
        autoHideDuration={3000}
        handleCloseSuccessSnackbar={handleCloseSuccessSnackbar}
        successMessage={successMessage}
      />
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={3000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />

      {Object.keys(userData).length > 0 && (
        <Container
          component='main'
          maxWidth='sm'
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 1,
            textAlign: 'center',
          }}
        >
          <Grid container>
            <Grid item xs={12}>
              <Card
                sx={{
                  borderRadius: 5,
                }}
              >
                <CardHeader
                  title={
                    <Typography
                      variant='h5'
                      sx={{
                        fontSize: 32,
                        color: '#5c4742',
                      }}
                    >
                      {userData.name}
                    </Typography>
                  }
                  subheader={
                    <Typography
                      variant='subtitle1'
                      sx={{
                        color: '#FFFBF1',
                        fontStyle: 'italic',
                        fontSize: 12,
                      }}
                    >
                      {userData.email}
                    </Typography>
                  }
                  sx={{ bgcolor: '#ddb892', pr: 2 }}
                />

                <CardContent sx={{ bgcolor: '#FFFBF1', p: 4 }}>
                  <>
                    <Typography
                      sx={{ color: '#5C4742', mb: 1, fontWeight: 'bold' }}
                    >
                      通知設定
                    </Typography>
                    <FormGroup>
                      <FormControlLabel
                        label='電子郵件通知'
                        labelPlacement='start'
                        control={
                          <Switch
                            checked={checked}
                            onChange={handleChange}
                            color='warning'
                          />
                        }
                        sx={{ mx: 'auto' }}
                      />
                    </FormGroup>
                  </>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
}
