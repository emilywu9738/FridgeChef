import * as React from 'react';
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

export default function Create() {
  const [name, setName] = React.useState('');
  const [expired, setExpired] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [previewList, setPreviewList] = React.useState([]);

  const handleAddPreview = (event) => {
    event.preventDefault();
    setPreviewList([...previewList, { name, expired, category }]);
    setName('');
    setExpired('');
    setCategory('');
  };

  const handleSubmit = () => {
    axios
      .post('http://localhost:8080/fridge/create', previewList)
      .then((response) => {
        alert(response.data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
    // 清空預覽列表
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
        <Avatar sx={{ m: 1, bgcolor: '#CCD5AE' }}>
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
            >
              <MenuItem value='蔬菜'>蔬菜</MenuItem>
              <MenuItem value='肉品'>肉品</MenuItem>
              <MenuItem value='海鮮'>海鮮</MenuItem>
            </Select>
          </FormControl>
          <Button
            type='submit'
            fullWidth
            variant='contained'
            sx={{ mt: 3, mb: 2, bgcolor: '#D4A373' }}
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
              sx={{ bgcolor: '#f0f0f0', marginBottom: 1, borderRadius: 1 }}
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
            sx={{ mt: 3, mb: 2, bgcolor: '#bc6c25' }}
          >
            送出更新
          </Button>
        )}
      </Box>
    </Container>
  );
}
