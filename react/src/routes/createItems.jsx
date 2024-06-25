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
} from '@mui/material';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';
import DeleteIcon from '@mui/icons-material/Delete';

const OPTIONS = ['蔬菜', '肉品', '海鮮', '調味料', '蛋豆', '主食'];

export default function CreateItems() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [expired, setExpired] = useState('');
  const [category, setCategory] = useState('');
  const [previewList, setPreviewList] = useState([]);

  const handleAddPreview = (event) => {
    event.preventDefault();
    setPreviewList([...previewList, { name, expired, category }]);
    setName('');
    setExpired('');
    setCategory('');
  };

  const handleSubmit = () => {
    const fridgeId = searchParams.get('fridgeId');
    axios
      .post(
        `http://localhost:8080/fridge/create?fridgeId=${fridgeId}`,
        previewList,
        { withCredentials: true },
      )
      .then((response) => {
        alert(response.data);
      })
      .catch((err) => {
        console.error('Error:', err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
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

  return (
    <Container
      component='main'
      maxWidth='md'
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
      <Box sx={{ flex: 1, ml: 4 }}>
        <Typography component='h1' variant='h5'>
          新增預覽
        </Typography>
        <List>
          {previewList.map((item, index) => (
            <ListItem
              key={index}
              sx={{ bgcolor: '#fdf7e8', marginBottom: 1, borderRadius: 1 }}
            >
              <ListItemText
                primary={`${item.name} (${item.category}類)`}
                secondary={`過期時間: ${item.expired}`}
              />
              <IconButton
                edge='end'
                aria-label='delete'
                onClick={() => handleDelete(index)}
              >
                <DeleteIcon />
              </IconButton>
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
