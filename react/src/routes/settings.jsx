import axios from 'axios';
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControlLabel,
  FormGroup,
  Grid,
  Snackbar,
  Switch,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage('通知設定已更新');
        console.log(response.data);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
        setOpenErrorSnackbar(true);
        setErrorMessage('通知設定更新失敗');
        console.error(err);
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
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        } else if (err.response && err.response.status === 403) {
          navigate('/forbidden');
        }
      });
  }, [navigate]);

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
