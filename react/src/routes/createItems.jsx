import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import {
  Avatar,
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Card,
  CardMedia,
  Snackbar,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  CardContent,
  CardHeader,
} from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const OPTIONS = ['蔬菜', '肉品', '海鮮', '調味料', '蛋豆', '主食'];

export default function CreateItems() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [expired, setExpired] = useState('');
  const [category, setCategory] = useState('');
  const [previewList, setPreviewList] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [editIndex, setEditIndex] = useState(-1); // -1 表示沒有項目正在編輯
  const [isEditing, setIsEditing] = useState(false);
  const [backupItem, setBackupItem] = useState(null);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [alignment, setAlignment] = useState('picture');
  const [pictureCreate, setPictureCreate] = useState(true);

  const handleAddPreview = (event) => {
    event.preventDefault();
    setPreviewList([...previewList, { name, expired, category }]);
    setName('');
    setExpired('');
    setCategory('');
  };

  const handleSubmit = () => {
    const fridgeId = searchParams.get('fridgeId');
    apiClient
      .post(`/fridge/create?fridgeId=${fridgeId}`, previewList, {
        withCredentials: true,
      })
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage(response.data);
        setTimeout(() => {
          navigate(`/fridge/recipe?id=${fridgeId}`);
        }, 2000);
      })
      .catch((err) => {
        console.error('Error:', err);
        if (err.response && err.response.status === 401) {
          setErrorMessage('請先登入，將為您轉移至登入頁面');
          setOpenErrorSnackbar(true);
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        } else {
          setErrorMessage('食材新增失敗！');
          setOpenErrorSnackbar(true);
        }
      });

    setPreviewList([]);
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  const handleDelete = (index) => {
    const newList = previewList.filter((_, i) => i !== index);
    setPreviewList(newList);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result); // 創建 FormData 來傳送文件
        const formData = new FormData();
        formData.append('image', file);
        // 發送圖片到後端
        apiClient
          .post('/fridge/createByPhoto', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then((response) => {
            const previewListArray = response.data.map((item) => {
              return { name: item, expired: '', category: '' };
            });
            setPreviewList(previewListArray);
          })
          .catch((error) => console.error('Upload error:', error));
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleEdit = (index) => {
    setBackupItem({ ...previewList[index] });
    setEditIndex(index);
    setIsEditing(true);
  };

  const handleInputChange = (e, index, field) => {
    const newPreviewList = [...previewList];
    newPreviewList[index][field] = e.target.value;
    setPreviewList(newPreviewList);
  };

  const handleUpdate = (e, index) => {
    e.preventDefault();
    setIsEditing(false); // 退出編輯模式
  };

  const handleCancel = () => {
    const updatedList = [...previewList];
    updatedList[editIndex] = backupItem;
    setPreviewList(updatedList);
    setIsEditing(false);
    setBackupItem(null);
  };

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  const handleAlignment = (event, newAlignment) => {
    setAlignment(newAlignment);
  };

  return (
    <Container
      component='main'
      maxWidth='md'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '93vh',
        pt: 4,
      }}
    >
      <Snackbar
        open={openSuccessSnackbar}
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

      <Card
        elevation={5}
        sx={{
          width: '40%',
          mr: 2,
          borderRadius: '20px',
          px: 2,
          py: 1,
          bgcolor: '#FFFDFA',
          mb: 4,
        }}
      >
        <CardContent>
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Avatar sx={{ bgcolor: '#41764C' }}>
              <LibraryAddIcon sx={{ color: '#FFFDFA' }} />
            </Avatar>

            <Typography component='h1' variant='h5' sx={{ my: 2 }}>
              {alignment === 'picture' ? '圖片新增食材' : '手動新增食材'}
            </Typography>
            <ToggleButtonGroup
              value={alignment}
              exclusive
              onChange={handleAlignment}
              aria-label='text alignment'
              sx={{
                bgcolor: 'white',
                width: '100%',
                height: 40,
                justifyContent: 'center',
                my: 1,
              }}
            >
              <ToggleButton
                value='picture'
                aria-label='centered'
                sx={{ width: '50%' }}
              >
                <AddPhotoAlternateIcon />
              </ToggleButton>
              <ToggleButton
                value='write'
                aria-label='left aligned'
                sx={{ width: '50%' }}
              >
                <DriveFileRenameOutlineIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            {alignment === 'picture' ? (
              <>
                <Box sx={{ my: 2, width: '100%' }}>
                  <input
                    accept='image/*'
                    style={{ display: 'none' }}
                    id='raised-button-file'
                    multiple
                    type='file'
                    onChange={handleFileChange}
                  />
                  <label htmlFor='raised-button-file'>
                    <Button
                      variant='contained'
                      component='span'
                      sx={{
                        bgcolor: '#41764C',
                        ':hover': { bgcolor: '#305738' },
                        width: '100%',
                        mb: 2,
                      }}
                    >
                      上傳照片
                    </Button>
                  </label>

                  {imagePreview && (
                    <Card sx={{ mt: 2 }}>
                      <CardHeader
                        title={
                          <Typography variant='body2' color='text.secondary'>
                            照片預覽
                          </Typography>
                        }
                        sx={{ bgcolor: '#EEEEEE' }}
                      />
                      <CardMedia
                        component='img'
                        width='100%'
                        image={imagePreview}
                        alt='Uploaded Image'
                      />
                    </Card>
                  )}
                </Box>
              </>
            ) : (
              <>
                <Box
                  component='form'
                  onSubmit={handleAddPreview}
                  noValidate
                  sx={{ mt: 1 }}
                >
                  <TextField
                    margin='normal'
                    required
                    fullWidth
                    id='name'
                    label='食材名稱'
                    name='name'
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    color='success'
                    sx={{ bgcolor: '#FBFBFB' }}
                  />
                  <TextField
                    margin='normal'
                    required
                    fullWidth
                    name='expired'
                    label='過期時間'
                    type='date'
                    id='expired'
                    value={expired}
                    onChange={(e) => setExpired(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    color='success'
                    sx={{ bgcolor: '#FBFBFB' }}
                  />
                  <FormControl fullWidth margin='normal'>
                    <InputLabel id='category-label' color='success' required>
                      類別
                    </InputLabel>
                    <Select
                      labelId='category-label'
                      id='category'
                      value={category}
                      onChange={handleCategoryChange}
                      label='類別'
                      color='success'
                      sx={{ bgcolor: '#FBFBFB' }}
                    >
                      {OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <Button
                    type='submit'
                    fullWidth
                    variant='contained'
                    sx={{
                      mt: 3,
                      mb: 2,
                      bgcolor: '#41764C',
                      ':hover': { bgcolor: '#305738' },
                    }}
                  >
                    加到預覽列表
                  </Button>
                </Box>
              </>
            )}
          </Box>
        </CardContent>
      </Card>

      <Card
        elevation={5}
        sx={{
          width: '40%',
          ml: 2,
          borderRadius: '20px',
          pl: 1,
          py: 1,
          bgcolor: '#FFFDFA',
        }}
      >
        <CardContent>
          <Box sx={{ flex: 1 }}>
            <Typography component='h1' variant='h5' sx={{ my: 1 }}>
              預覽列表
            </Typography>
            <List sx={{ maxHeight: '70vh', overflowY: 'auto', pr: 1 }}>
              {previewList.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{ bgcolor: '#FAF2D8', my: 2, borderRadius: 3 }}
                >
                  {isEditing && editIndex === index ? (
                    // 編輯模式界面
                    <Box
                      component='form'
                      onSubmit={(e) => handleUpdate(e, index)}
                      sx={{ pt: 2 }}
                    >
                      <TextField
                        value={item.name}
                        onChange={(e) => handleInputChange(e, index, 'name')}
                        size='small'
                        sx={{ width: '100%', mb: 2, bgcolor: '#FCF7E8' }}
                      />
                      <TextField
                        type='date'
                        value={item.expired}
                        onChange={(e) => handleInputChange(e, index, 'expired')}
                        size='small'
                        sx={{ width: '100%', mb: 2, bgcolor: '#FCF7E8' }}
                      />
                      <Select
                        value={item.category}
                        onChange={(e) =>
                          handleInputChange(e, index, 'category')
                        }
                        size='small'
                        sx={{ width: '100%', mb: 1, bgcolor: '#FCF7E8' }}
                      >
                        {OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {option}
                          </MenuItem>
                        ))}
                      </Select>
                      <Button
                        type='submit'
                        sx={{
                          mr: 1,
                          color: '#784518',
                          ':hover': { bgcolor: '#F6E8B9' },
                        }}
                      >
                        儲存
                      </Button>
                      <Button
                        onClick={handleCancel}
                        sx={{
                          color: '#784518',
                          ':hover': { bgcolor: '#F6E8B9' },
                        }}
                      >
                        取消
                      </Button>
                    </Box>
                  ) : (
                    // 常規顯示
                    <>
                      <ListItemText
                        primary={`${item.name} (${item.category}類)`}
                        secondary={`過期時間: ${item.expired}`}
                      />
                      <IconButton
                        edge='end'
                        aria-label='edit'
                        onClick={() => handleEdit(index)}
                        sx={{ ':hover': { bgcolor: '#F6E8B9' } }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge='end'
                        aria-label='delete'
                        onClick={() => handleDelete(index)}
                        sx={{ ':hover': { bgcolor: '#F6E8B9' } }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </>
                  )}
                </ListItem>
              ))}
            </List>
            {previewList.length > 0 && (
              <Button
                onClick={handleSubmit}
                fullWidth
                variant='contained'
                sx={{
                  mt: 1,
                  mb: 2,
                  bgcolor: '#bc6c25',
                  ':hover': { bgcolor: '#9B5212' },
                }}
              >
                送出更新
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
}
