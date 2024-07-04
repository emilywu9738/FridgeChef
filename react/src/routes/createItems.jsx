import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';

import {
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
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
} from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
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
            // 處理返回的數據，可能是 OCR 的結果
            console.log('OCR result:', response.data);
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

  return (
    <Container
      component='main'
      maxWidth='lg'
      sx={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        padding: 4,
      }}
    >
      <CssBaseline />
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
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginRight: 4,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: '#386641' }}>
          <AddPhotoAlternateIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          圖片新增食材
        </Typography>
        <div style={{ padding: 20 }}>
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
              sx={{ bgcolor: '#386641', ':hover': { bgcolor: '#244B2D' } }}
            >
              上傳照片
            </Button>
          </label>

          {imagePreview && (
            <Card sx={{ maxWidth: 345, mt: 2 }}>
              <CardMedia
                component='img'
                maxWidth='300'
                image={imagePreview}
                alt='Uploaded Image'
              />
              <Typography variant='body2' color='text.secondary' sx={{ p: 2 }}>
                Image Preview
              </Typography>
            </Card>
          )}
        </div>
      </Box>

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mx: 5,
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: '#386641' }}>
          <LibraryAddIcon />
        </Avatar>
        <Typography component='h1' variant='h5'>
          新增食材
        </Typography>
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
            sx={{ bgcolor: '#fdf7e8' }}
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
            sx={{ bgcolor: '#fdf7e8' }}
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
              sx={{ bgcolor: '#fdf7e8' }}
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
              bgcolor: '#D4A373',
              ':hover': { bgcolor: '#BF8852' },
            }}
          >
            加到預覽列表
          </Button>
        </Box>
      </Box>
      <Box sx={{ flex: 1, ml: 2 }}>
        <Typography component='h1' variant='h5'>
          新增預覽
        </Typography>
        <List>
          {previewList.map((item, index) => (
            <ListItem
              key={index}
              sx={{ bgcolor: '#fdf7e8', marginBottom: 1, borderRadius: 1 }}
            >
              {isEditing && editIndex === index ? (
                // 編輯模式界面
                <Box component='form' onSubmit={(e) => handleUpdate(e, index)}>
                  <TextField
                    value={item.name}
                    onChange={(e) => handleInputChange(e, index, 'name')}
                    size='small'
                    sx={{ width: '100%', mb: 1 }}
                  />
                  <TextField
                    type='date'
                    value={item.expired}
                    onChange={(e) => handleInputChange(e, index, 'expired')}
                    size='small'
                    sx={{ width: '100%', mb: 1 }}
                  />
                  <Select
                    value={item.category}
                    onChange={(e) => handleInputChange(e, index, 'category')}
                    size='small'
                    sx={{ width: '100%', mb: 1 }}
                  >
                    {OPTIONS.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button type='submit' sx={{ mr: 1 }}>
                    儲存
                  </Button>
                  <Button onClick={handleCancel}>取消</Button>
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
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge='end'
                    aria-label='delete'
                    onClick={() => handleDelete(index)}
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
              mt: 3,
              mb: 2,
              bgcolor: '#bc6c25',
              ':hover': { bgcolor: '#9B5212' },
            }}
          >
            送出更新
          </Button>
        )}
      </Box>
    </Container>
  );
}
