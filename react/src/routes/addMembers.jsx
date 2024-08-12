import axios from 'axios';
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import SuccessSnackbar from '../components/successSnackbar';
import ErrorSnackbar from '../components/errorSnackbar';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function AddMembers() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [userForInvite, setUserForInvite] = useState({});
  const [isComposing, setIsComposing] = useState(false);
  const [searchError, setSearchError] = useState(false);
  const [openSuccessSnackbar, setOpenSuccessSnackbar] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleCloseSuccessSnackbar = () => {
    setOpenSuccessSnackbar(false);
  };

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  const handleInviteMembers = () => {
    const id = searchParams.get('id');
    apiClient(`/fridge/inviteMember?id=${id}&email=${search}`, {
      withCredentials: true,
    })
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage(response.data.message);
        setTimeout(() => navigate(`/fridge/recipe?id=${id}`), 2000);
      })
      .catch((err) => {
        if (err.response && err.response.status === 409) {
          setSearchError(err.response.data);
          return;
        }
        if (err.response && err.response.status === 404) {
          setSearchError(err.response.data);
          return;
        }
        setErrorMessage('成員新增失敗，請稍候再試');
        setOpenErrorSnackbar(true);
      });
  };

  const handleMemberSearchSubmit = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(search)) {
      setSearchError('無效的電子郵件格式');
      return;
    }

    const id = searchParams.get('id');
    apiClient(`/fridge/searchUserForInvite?id=${id}&email=${search}`)
      .then((response) => {
        setUserForInvite(response.data);
        navigate(`/fridge/addMembers?id=${id}&email=${search}`);
      })
      .catch((err) => {
        setUserForInvite('');
        if (err.response) {
          if (err.response.status === 409 || err.response.status === 404) {
            setSearchError(err.response.data.error);
          } else {
            setErrorMessage('搜尋失敗，請稍候再試');
            setOpenErrorSnackbar(true);
          }
        }
      });
  };

  return (
    <Container
      component='main'
      maxWidth='sm'
      sx={{
        justifyContent: 'center',
        alignItems: 'center',
        py: 4,
      }}
    >
      <SuccessSnackbar
        openSuccessSnackbar={openSuccessSnackbar}
        autoHideDuration={6000}
        handleCloseSuccessSnackbar={handleCloseSuccessSnackbar}
        successMessage={successMessage}
      />
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={6000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#FFF9EE',
          minHeight: '10vh',
          borderRadius: '15px',
          px: 2,
          pb: 2,
        }}
      >
        <TextField
          color='success'
          placeholder='以電子郵件搜尋加入群組'
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setSearchError(false);
          }}
          error={searchError}
          helperText={searchError}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          onKeyDown={(e) => {
            if (!isComposing && e.key === 'Enter') {
              handleMemberSearchSubmit();
            }
          }}
          sx={{
            mt: 3,
            bgcolor: '#fdf7e8',
            width: '100%',
            borderRadius: '16px 0 0 16px',
            '& .MuiOutlinedInput-root': {
              borderRadius: '16px 0 0 16px',
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant='contained'
          color='primary'
          onClick={handleMemberSearchSubmit}
          sx={{
            mt: 3,
            height: 55.5,
            borderRadius: '0 16px 16px 0',
            marginLeft: '-1px',
            bgcolor: '#41764C',
            ':hover': { bgcolor: '#305738' },
            mb: searchError ? 3 : '2px',
          }}
        >
          搜尋
        </Button>
      </Box>
      {Object.keys(userForInvite).length > 0 && (
        <Card
          sx={{
            minHeight: '20vh',
            borderRadius: 5,
            my: 3,
          }}
        >
          <CardHeader
            title={
              <Typography
                variant='body2'
                sx={{
                  fontWeight: 400,
                  color: '#453931',
                }}
              >
                使用者搜尋結果如下：
              </Typography>
            }
            sx={{ bgcolor: '#FFFBF1', py: 3 }}
          />

          <CardContent>
            <Card
              sx={{
                borderRadius: '10px',
                position: 'relative',
                maxWidth: '300px',
                my: 2,
                mx: 'auto',
                bgcolor: '#FFFBF0',
              }}
            >
              <CardContent>
                <Typography variant='h5' component='div' sx={{ mb: 2 }}>
                  {userForInvite.name}
                </Typography>
                <Typography
                  sx={{ fontSize: 13, fontStyle: 'italic' }}
                  color='text.secondary'
                >
                  {userForInvite.email}
                </Typography>
              </CardContent>
            </Card>
            <Button
              variant='contained'
              size='md'
              sx={{
                display: 'block',
                mx: 'auto',
                mb: 2,
                backgroundColor: '#f59b51',
                ':hover': {
                  backgroundColor: '#C6600C',
                },
              }}
              onClick={handleInviteMembers}
            >
              確定新增
            </Button>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
