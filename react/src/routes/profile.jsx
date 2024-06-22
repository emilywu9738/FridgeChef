import axios from 'axios';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  Menu,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import GroupsIcon from '@mui/icons-material/Groups';
import LogoutIcon from '@mui/icons-material/Logout';
import EditIcon from '@mui/icons-material/Edit';

export default function Profile() {
  const navigate = useNavigate();
  const [reload, setReload] = useState(false);
  const [userData, setUserData] = useState({});
  const [userFridge, setUserFridge] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [omit, setOmit] = useState('');
  const [preferCategory, setPreferCategory] = useState('');
  const [originalPreferCategory, setOriginalPreferCategory] = useState('');
  const [previewList, setPreviewList] = useState([]);
  const [originalPreviewList, setOriginalPreviewList] = useState([]);

  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCategoryChange = (event) => {
    setPreferCategory(event.target.value);
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
    setPreviewList([...previewList, omit]);
    setOmit('');
  };

  const handleSubmit = () => {
    axios
      .post(
        'http://localhost:8080/user/profile',
        {
          preferCategory,
          previewList,
        },
        { withCredentials: true },
      )
      .then((response) => {
        alert(response.data);
        setReload(!reload);
        setEditMode(false);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        } else if (err.response && err.response.status === 403) {
          navigate('/forbidden');
        }
      });
  };

  const handleDelete = (index) => {
    const newList = previewList.filter((_, i) => i !== index);
    setPreviewList(newList);
  };

  const handleLogout = () => {
    axios('http://localhost:8080/user/logout', { withCredentials: true })
      .then((response) => {
        setReload(!reload);
      })
      .catch((err) => console.error(err));
  };

  const handleCreateGroup = () => {
    navigate('/user/createGroup');
  };

  function FridgeCard({ fridge }) {
    const fridgeMembers = fridge.members.map((m) => m.name).join(' ');
    const handleFridgeClick = () => {
      navigate(`/fridge/recipe?id=${fridge._id}`);
    };

    return (
      <Grid item xs={12} md={6}>
        <Card
          elevation={3}
          sx={{
            flexGrow: 1,
            position: 'relative',
            m: 2,
            borderRadius: 5,
          }}
        >
          <CardHeader
            title={
              <Typography
                variant='h5'
                sx={{
                  fontSize: '1rem',
                  color: 'white',
                  fontWeight: 550,
                }}
              >
                {fridge.name}
              </Typography>
            }
            onClick={handleFridgeClick}
            sx={{
              bgcolor: '#6c584c',
              cursor: 'pointer',
              ':hover': {
                backgroundColor: '#9c6644',
              },
            }}
          />

          <CardContent>
            <Typography
              sx={{ fontSize: 14 }}
              color='text.secondary'
              component='div'
              gutterBottom
            >
              成員
              <br />
              {fridgeMembers}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  useEffect(() => {
    axios
      .get('http://localhost:8080/user/profile', {
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
      {Object.keys(userData).length > 0 && (
        <Box
          sx={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: '#faedcd',
          }}
        >
          <Card sx={{ width: 500, textAlign: 'center', borderRadius: 5 }}>
            <CardHeader
              title={
                <Typography
                  variant='h5'
                  sx={{ fontSize: '2.5rem', color: '#5c4742' }}
                >
                  {userData.name}
                </Typography>
              }
              subheader={
                <Typography
                  variant='subtitle1'
                  sx={{ color: '#FFFBF1', fontStyle: 'italic' }}
                >
                  {userData.email}
                </Typography>
              }
              action={
                <>
                  <IconButton aria-label='settings' onClick={handleClick}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                    <MenuItem onClick={handleEditPreferences}>
                      <EditIcon />
                      <Typography sx={{ ml: 1 }}>編輯喜好</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleCreateGroup}>
                      <GroupsIcon />
                      <Typography sx={{ ml: 1 }}> 新增群組</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <LogoutIcon />
                      <Typography sx={{ ml: 1 }}> 登出</Typography>
                    </MenuItem>
                  </Menu>
                </>
              }
              sx={{ bgcolor: '#ddb892' }}
            />

            <CardContent sx={{ bgcolor: '#FFFBF1' }}>
              {editMode ? (
                <>
                  <FormControl fullWidth sx={{ minWidth: 240, my: 2 }}>
                    <InputLabel id='recipeCategory-label' color='success'>
                      飲食習慣
                    </InputLabel>
                    <Select
                      labelId='recipeCategory-label'
                      id='recipeCategory'
                      value={preferCategory}
                      label='飲食習慣'
                      onChange={handleCategoryChange}
                      color='success'
                    >
                      <MenuItem value={'無'}>無</MenuItem>
                      <MenuItem value={'奶蛋素'}>奶蛋素</MenuItem>
                      <MenuItem value={'全素'}>全素</MenuItem>
                    </Select>
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
                      id='omit'
                      label='新增排除食材'
                      name='omit'
                      value={omit}
                      onChange={(e) => setOmit(e.target.value)}
                      autoFocus
                      color='success'
                      sx={{ flexGrow: 1, mr: 1 }}
                    />
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
                  </Box>
                  <List sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
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
                      ':hover': { color: '#c3a995', bgcolor: '#FFFBF1' },
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
                    飲食習慣: {userData.preference}
                  </Typography>
                  <Typography sx={{ color: '#B47552', fontWeight: 500 }}>
                    排除食材
                  </Typography>
                  <Typography
                    sx={{
                      mb: 1.5,
                      color: '#6c584c',
                    }}
                  >
                    {userData.omit.join('、')}
                  </Typography>
                  <Typography
                    sx={{ mb: 1.5, color: '#B47552', fontWeight: 500 }}
                  >
                    已收藏食譜
                    <br />
                    {Array.isArray(userData.liked_recipes)
                      ? userData.liked_recipes.length
                      : 0}
                  </Typography>

                  <Typography sx={{ color: '#B47552', fontWeight: 500 }}>
                    群組
                  </Typography>
                  <Grid container justifyContent='center'>
                    {userFridge.map((fridge) => (
                      <FridgeCard key={fridge._id} fridge={fridge} />
                    ))}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
