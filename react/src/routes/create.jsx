import * as React from 'react';
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
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LibraryAddIcon from '@mui/icons-material/LibraryAdd';

export default function Create() {
  const [category, setCategory] = React.useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log({
      name: data.get('name'),
      expired: data.get('expired'),
      category: category,
    });
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        minHeight: '100vh',
        bgcolor: '#f5f5f5',
      }}
    >
      <Container component='main' maxWidth='xs'>
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
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
            onSubmit={handleSubmit}
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
              color='success'
              autoFocus
            />

            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel id='category-label' color='success' required>
                類別
              </InputLabel>
              <Select
                color='success'
                required
                labelId='category-label'
                id='category'
                label='Age'
                value={category}
                onChange={handleCategoryChange}
              >
                <MenuItem value={'蔬菜'}>蔬菜</MenuItem>
                <MenuItem value={'肉品'}>肉品</MenuItem>
                <MenuItem value={'海鮮'}>海鮮</MenuItem>
              </Select>
            </FormControl>
            <TextField
              margin='normal'
              required
              fullWidth
              name='expired'
              label='過期時間'
              type='date'
              id='expired'
              color='success'
              InputLabelProps={{
                shrink: true,
              }}
            />
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 3, bgcolor: '#D4A373' }}
            >
              新增
            </Button>
            <Button
              type='submit'
              fullWidth
              variant='contained'
              sx={{ mt: 2, mb: 2, bgcolor: '#bc6c25' }}
            >
              送出
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
