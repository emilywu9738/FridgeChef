import axios from 'axios';
import { debounce, wrap } from 'lodash';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  IconButton,
  List,
  ListItem,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from 'react-router-dom';

export default function CreateGroup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [input, setInput] = useState('');
  const [results, setResults] = useState([]);
  const [userData, setUserData] = useState({});

  const [previewList, setPreviewList] = useState([]);

  const debouncedSearch = debounce((searchTerm) => {
    axios
      .get(`http://localhost:8080/user/search?name=${searchTerm}`)
      .then((response) => {
        setResults(response.data);
      })
      .catch((err) => {
        console.error('Error fetching search results:', err);
      });
  }, 300);

  const handleItemClick = (result) => {
    if (!previewList.some((item) => item._id === result._id)) {
      setPreviewList((prevList) => [...prevList, result]);
    }
  };

  const handleSubmit = () => {
    axios
      .post(
        'http://localhost:8080/user/createGroup',
        { name, description, host: userData, inviting: previewList },
        {
          withCredentials: true,
        },
      )
      .then((response) => {
        alert(response.data);
        navigate('/user/profile');
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      });
  };

  const handleDelete = (index) => {
    const newList = previewList.filter((_, i) => i !== index);
    setPreviewList(newList);
  };

  const cancelCreateGroup = () => {
    navigate('/user/profile');
  };

  useEffect(() => {
    axios
      .get('http://localhost:8080/user/profile', {
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

  useEffect(() => {
    if (input.trim().length > 0) {
      debouncedSearch(input);
    } else {
      setResults([]);
    }
  }, [input]);

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
                  sx={{ fontSize: '2rem', color: '#5c4742', my: 1 }}
                >
                  新增群組
                </Typography>
              }
              subheader={
                <Typography
                  variant='subtitle1'
                  sx={{ color: '#FFFBF1', fontStyle: 'italic' }}
                >
                  請輸入您的群組名稱及群組描述
                </Typography>
              }
              sx={{ bgcolor: '#ddb892' }}
            />

            <CardContent sx={{ bgcolor: '#FFFBF1' }}>
              <>
                <TextField
                  id='name'
                  label='群組名稱'
                  name='name'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  fullWidth
                  color='success'
                  sx={{ flexGrow: 1, my: 2 }}
                  required
                />
                <TextField
                  id='description'
                  label='群組描述'
                  name='description'
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  autoFocus
                  fullWidth
                  color='success'
                  sx={{ flexGrow: 1, my: 1 }}
                />

                <TextField
                  fullWidth
                  label='新增成員'
                  variant='outlined'
                  value={input}
                  color='success'
                  onChange={(e) => setInput(e.target.value)}
                  sx={{ mt: 2 }}
                />
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

                {results.length > 0 && (
                  <List
                    sx={{
                      border: '1px solid #ccc',
                      borderRadius: '10px',
                      px: 1,
                      mb: 2,
                      mt: 1,
                      bgcolor: 'white',
                    }}
                  >
                    {results.map((result) => (
                      <ListItem
                        key={result._id}
                        onClick={() => handleItemClick(result)}
                        sx={{
                          border: '1px solid #ccc',
                          borderRadius: '10px',
                          boxShadow: '0 2px 2px rgba(0,0,0,0.1)',
                          width: '100%',
                          my: 1,
                          cursor: 'pointer',
                        }}
                      >
                        <Typography
                          variant='body1'
                          component='span'
                          sx={{ flexGrow: 1 }}
                        >
                          {result.name}
                        </Typography>
                        <Typography
                          variant='body2'
                          component='span'
                          sx={{ color: 'gray' }}
                        >
                          Email: {result.email}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
                <Box sx={{ mt: 2 }}>
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
              </>
            </CardContent>
          </Card>
        </Box>
      )}
    </>
  );
}
