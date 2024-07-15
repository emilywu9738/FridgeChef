import axios from 'axios';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import EditIcon from '@mui/icons-material/Edit';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function Profile() {
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [userData, setUserData] = useState({});
  const [userFridge, setUserFridge] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);

  const [originalPreferCategory, setOriginalPreferCategory] = useState('');
  const [previewList, setPreviewList] = useState([]);
  const [originalPreviewList, setOriginalPreviewList] = useState([]);

  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [preferCategory, setPreferCategory] = useState('');
  const [preferCategoryError, setPreferCategoryError] = useState(false);
  const [omit, setOmit] = useState('');
  const [omitError, setOmitError] = useState(false);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryChange = (event) => {
    setPreferCategory(event.target.value);
    setPreferCategoryError(false);
  };

  const handleEditPreferences = () => {
    setOriginalPreviewList([...previewList]);
    setOriginalPreferCategory(preferCategory);
    setEditMode(true);
    handleClose();
  };

  const cancelEditPreferences = () => {
    setPreviewList(originalPreviewList);
    setPreferCategory(originalPreferCategory);
    setEditMode(false);
  };

  const handleAddPreview = (event) => {
    event.preventDefault();
    if (!omit.trim()) return setOmitError('食材名稱不能空白！');
    const trimmedOmit = omit.trim();
    if (previewList.includes(trimmedOmit))
      return setOmitError('排除列表已經有這個食材嘍！');

    setPreviewList([...previewList, trimmedOmit]);
    setOmit('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!preferCategory) {
      setPreferCategoryError('請選擇您的飲食習慣！');
      setErrorMessage('更新失敗');
      setOpenErrorSnackbar(true);
      return;
    }

    apiClient
      .post(
        '/user/profile',
        {
          preferCategory,
          previewList,
        },
        { withCredentials: true },
      )
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage(response.data);
        setReload(!reload);
        setEditMode(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入，將為您轉移至登入頁面');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else if (err.response && err.response.status === 403) {
          navigate('/forbidden');
        } else {
          setErrorMessage('更新失敗');
          setOpenErrorSnackbar(true);
        }
      });
  };

  const handleDelete = (index) => {
    const newList = previewList.filter((_, i) => i !== index);
    setPreviewList(newList);
  };

  const handleCreateGroup = () => {
    navigate('/user/createGroup');
  };

  const handleLikedRecipe = () => {
    navigate('/user/likedRecipe');
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
        setUserFridge(response.data.userFridge);
        setPreferCategory(response.data.userData.preference);
        setPreviewList(response.data.userData.omit);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        } else if (err.response && err.response.status === 403) {
          navigate('/forbidden');
        }
      });
  }, [navigate, reload]);

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
                  action={
                    <>
                      <IconButton aria-label='settings' onClick={handleClick}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                      >
                        <MenuItem onClick={handleEditPreferences}>
                          <EditIcon />
                          <Typography sx={{ ml: 1 }}>編輯喜好</Typography>
                        </MenuItem>
                        <MenuItem onClick={handleCreateGroup}>
                          <GroupsIcon />
                          <Typography sx={{ ml: 1 }}> 新增冰箱</Typography>
                        </MenuItem>
                      </Menu>
                    </>
                  }
                  sx={{ bgcolor: '#ddb892', pr: 2 }}
                />

                <CardContent sx={{ bgcolor: '#FFFBF1', p: 4 }}>
                  {editMode ? (
                    <>
                      <FormControl fullWidth sx={{ minWidth: 240, my: 2 }}>
                        <InputLabel
                          id='recipeCategory-label'
                          color={preferCategoryError ? 'error' : 'success'}
                        >
                          飲食習慣
                        </InputLabel>
                        <Select
                          labelId='recipeCategory-label'
                          id='recipeCategory'
                          value={preferCategory}
                          label='飲食習慣'
                          onChange={handleCategoryChange}
                          color='success'
                          error={preferCategoryError}
                          helperText={preferCategoryError}
                        >
                          <MenuItem value={'無'}>無</MenuItem>
                          <MenuItem value={'奶蛋素'}>奶蛋素</MenuItem>
                          <MenuItem value={'全素'}>全素</MenuItem>
                        </Select>
                        {preferCategoryError && (
                          <FormHelperText sx={{ color: '#c62828' }}>
                            {preferCategoryError}
                          </FormHelperText>
                        )}
                      </FormControl>
                      <Box
                        component='form'
                        onSubmit={handleAddPreview}
                        noValidate
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          mb: 1,
                        }}
                      >
                        <TextField
                          autoFocus
                          id='omit'
                          label='新增排除食材'
                          name='omit'
                          value={omit}
                          onChange={(e) => {
                            setOmit(e.target.value);
                            setOmitError(false);
                          }}
                          inputProps={{ maxLength: 12 }}
                          color='success'
                          sx={{ flexGrow: 1, mr: 1 }}
                          error={omitError}
                          helperText={omitError}
                        />
                        {omitError ? (
                          <Button
                            type='submit'
                            variant='contained'
                            sx={{
                              bgcolor: '#e2711d',
                              height: 50,
                              ':hover': { bgcolor: '#B7560B' },
                              mb: 3,
                            }}
                          >
                            新增
                          </Button>
                        ) : (
                          <Button
                            type='submit'
                            variant='contained'
                            sx={{
                              bgcolor: '#e2711d',
                              height: 50,
                              ':hover': { bgcolor: '#B7560B' },
                            }}
                          >
                            新增
                          </Button>
                        )}
                      </Box>
                      <List
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          mb: 2,
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
                              {item}
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
                      <Button
                        type='submit'
                        variant='contained'
                        onClick={handleSubmit}
                        sx={{
                          bgcolor: '#6f5e53',
                          height: 50,
                          ':hover': { bgcolor: '#55463E' },
                        }}
                      >
                        上傳更新
                      </Button>
                      <Button
                        onClick={cancelEditPreferences}
                        sx={{
                          ml: 2,
                          color: '#3c1518',
                          ':hover': {
                            color: '#c3a995',
                            bgcolor: '#FFFBF1',
                          },
                        }}
                      >
                        取消
                      </Button>
                    </>
                  ) : (
                    <>
                      <Typography
                        sx={{
                          mb: 2,
                          mt: 1.2,
                          fontSize: '1.2rem',
                          color: '#6b705c',
                          fontWeight: 500,
                        }}
                      >
                        飲食習慣 ⇨{' '}
                        {userData.preference ? userData.preference : '請選擇'}
                      </Typography>
                      <Typography
                        sx={{ color: '#B47552', fontWeight: 500, mb: 1 }}
                      >
                        排除食材
                      </Typography>
                      <Typography
                        sx={{
                          mb: 1.5,
                          color: '#6c584c',
                        }}
                      >
                        {userData.omit.length > 0
                          ? userData.omit.join('、')
                          : '無'}
                      </Typography>
                      <Typography sx={{ color: '#B47552', fontWeight: 500 }}>
                        已收藏食譜
                      </Typography>
                      <Box sx={{ mb: 1.5 }}>
                        <Typography
                          onClick={handleLikedRecipe}
                          sx={{
                            display: 'inline-block',
                            color: '#B47552',
                            fontWeight: 500,
                            textDecoration: 'underLine',
                            ':hover': {
                              cursor: 'pointer',
                              color: '#754A32',
                            },
                          }}
                        >
                          {userData.liked_recipes.length > 0
                            ? userData.liked_recipes.length
                            : 0}
                        </Typography>
                      </Box>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      )}
    </>
  );
}
