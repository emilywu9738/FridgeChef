import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function CreateGroup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [input, setInput] = useState('');
  const [userData, setUserData] = useState({});
  const [previewList, setPreviewList] = useState([]);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [nameError, setNameError] = useState(false);
  const [emailError, setEmailError] = useState('');

  const handleClick = () => {
    if (input.trim() === '') {
      setEmailError('請輸入有效的電子郵件');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input)) {
      setEmailError('無效的電子郵件格式');
      return;
    }

    if (previewList.some((item) => item.email === input)) {
      setEmailError('成員已存在於列表中');
      return;
    }

    apiClient(`/fridge/searchUserForInvite?email=${input}`)
      .then((response) => {
        const user = response.data;
        setPreviewList((prevList) => [...prevList, user]);
        console.log(previewList);
        setInput('');
      })
      .catch((err) => {
        if (err.response && err.response.status === 409) {
          setEmailError(err.response.data);
          return;
        }
        if (err.response && err.response.status === 404) {
          setEmailError(err.response.data);
          return;
        }
        console.error(err);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!name.trim()) {
      setNameError('冰箱名稱不得為空！');
      setErrorMessage('群組新增失敗');
      setOpenErrorSnackbar(true);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (input) {
      if (!emailRegex.test(input)) {
        setEmailError('無效的電子郵件格式');
        return;
      }
    }
    const trimmedName = name.trim();
    console.log({
      name: trimmedName,
      description,
      host: userData,
      inviting: previewList,
    });

    apiClient
      .post(
        '/user/createGroup',
        {
          name: trimmedName,
          description,
          host: userData,
          inviting: previewList,
        },
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage(response.data);
        setTimeout(() => {
          navigate('/user/myfridge');
        }, 2000);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入，將為您轉移至登入頁面');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setErrorMessage('群組新增失敗');
          setOpenErrorSnackbar(true);
        }
      });
  };

  const handleDelete = (index) => {
    const newList = previewList.filter((_, i) => i !== index);
    setPreviewList(newList);
  };

  const cancelCreateGroup = () => {
    navigate('/user/myfridge');
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
        autoHideDuration={3000}
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
        autoHideDuration={3000}
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
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            flexGrow: 1,
          }}
        >
          <Card
            sx={{
              maxWidth: 480,
              textAlign: 'center',
              borderRadius: 5,
              mx: 1,
            }}
          >
            <CardHeader
              title={
                <Typography
                  variant='h5'
                  sx={{ fontSize: 27, color: '#5c4742', my: '5px' }}
                >
                  新增冰箱
                </Typography>
              }
              subheader={
                <Typography
                  variant='subtitle1'
                  sx={{
                    color: '#FFFBF1',
                    fontSize: 13,
                    fontWeight: 500,
                    fontStyle: 'italic',
                  }}
                >
                  請輸入您的冰箱名稱及描述，並選取一起使用冰箱的成員！
                </Typography>
              }
              sx={{ bgcolor: '#ddb892' }}
            />

            <CardContent sx={{ bgcolor: '#FFFBF1' }}>
              <Box
                component='form'
                onSubmit={handleSubmit}
                noValidate
                sx={{ mt: 1 }}
              >
                <TextField
                  id='name'
                  label='冰箱名稱'
                  name='name'
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError(false);
                  }}
                  autoFocus
                  fullWidth
                  color='success'
                  sx={{ my: 2 }}
                  required
                  error={nameError}
                  helperText={nameError}
                  inputProps={{ maxLength: 20 }}
                />
                <TextField
                  id='description'
                  label='冰箱描述'
                  name='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  fullWidth
                  color='success'
                  sx={{ my: 1 }}
                />

                <TextField
                  label='新增成員'
                  variant='outlined'
                  value={input}
                  color='success'
                  placeholder='請輸入想新增之成員Email'
                  onChange={(e) => {
                    setInput(e.target.value);
                    setEmailError('');
                  }}
                  sx={{ mt: 2, width: { xs: '78%', sm: '83%' } }}
                  error={emailError}
                  helperText={emailError}
                />
                <Button
                  onClick={handleClick}
                  variant='contained'
                  size='large'
                  sx={{
                    mt: 2,
                    height: 55,
                    backgroundColor: '#f59b51',
                    ':hover': {
                      backgroundColor: '#C6600C',
                    },
                    px: '17px',
                    ml: 1,
                  }}
                >
                  新增
                </Button>
                {previewList.length > 0 && (
                  <List
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      maxWidth: '100%',
                    }}
                  >
                    {previewList.map((item, index) => (
                      <ListItem
                        key={index}
                        sx={{
                          bgcolor: '#FFEDC0',
                          marginBottom: 1,
                          borderRadius: '16px',
                          height: 30,
                          width: 'auto',
                          display: 'flex',
                          justifyContent: 'flex-end',
                          mr: 1,
                        }}
                      >
                        <Typography variant='body2' sx={{ mr: 1 }}>
                          {item.name}
                        </Typography>
                        <IconButton
                          edge='end'
                          aria-label='delete'
                          onClick={() => handleDelete(index)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </ListItem>
                    ))}
                  </List>
                )}

                <Box sx={{ mt: 3 }}>
                  <Button
                    type='submit'
                    variant='contained'
                    sx={{
                      bgcolor: '#6f5e53',
                      height: 40,
                      ':hover': { bgcolor: '#55463E' },
                    }}
                  >
                    送出
                  </Button>
                  <Button
                    onClick={cancelCreateGroup}
                    sx={{
                      ml: 2,
                      color: '#3c1518',
                      ':hover': { color: '#c3a995', bgcolor: '#FFFBF1' },
                    }}
                  >
                    取消
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
