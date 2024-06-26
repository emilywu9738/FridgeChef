import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material/';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import CircleNotificationsIcon from '@mui/icons-material/CircleNotifications';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

const pages = [];

export default function NavBar() {
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotify, setAnchorElNotify] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState('');
  const [groupId, setGroupId] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState('');

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseNotifyMenu = () => {
    setAnchorElNotify(null);
  };

  const handleProfile = () => {
    setAnchorElUser(null);
    navigate('/user/profile');
  };

  const handleLogout = () => {
    setAnchorElNav(null);
    apiClient('/user/logout', { withCredentials: true })
      .then(() => {
        navigate('/login');
      })
      .catch((err) => console.error(err));
  };

  const handleNotifications = async (event) => {
    setAnchorElNotify(event.currentTarget);
    setUnreadCount(0);
    try {
      const response = await apiClient('/user/notifications', {
        withCredentials: true,
      });
      const { notifications } = response.data;
      setNotifications(notifications);
    } catch (err) {
      console.error(err);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    }
  };

  useEffect(() => {
    apiClient('/user/info', { withCredentials: true })
      .then((response) => {
        const { userId, groupId, userName } = response.data;
        setUserId(userId);
        setGroupId(groupId);
        setUserName(userName);
      })
      .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
    apiClient
      .get('/user/countNotifications', {
        withCredentials: true,
      })
      .then((response) => {
        const { count } = response.data;
        setUnreadCount(count);
      })
      .catch((err) => {
        console.error(err);
        if (err.response && err.response.status === 401) {
          navigate('/login');
        }
      });
  }, [navigate]);

  useEffect(() => {
    setSocket(io(import.meta.env.VITE_API_BASE_URL));
  }, []);

  useEffect(() => {
    if (socket && userId) {
      socket.emit('newUser', { userId, groupId });

      socket.on('notification', () => {
        setUnreadCount((prevCount) => prevCount + 1);
      });
    }
  }, [socket, userId, unreadCount, groupId]);

  return (
    <AppBar
      socket={socket}
      position='static'
      sx={{ bgcolor: '#a98467', height: 80 }}
    >
      <Container maxWidth='xl' sx={{ width: '100%', mt: 1 }}>
        <Toolbar
          disableGutters
          sx={{ justifyContent: 'space-between', width: '100%' }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <img
              src='/navbarLogo.png'
              style={{ maxWidth: 45, height: 'auto', paddingBottom: 4 }}
            />
            <img
              src='/logoText.png'
              alt='Logo'
              style={{
                maxWidth: 150,
                height: 'auto',
                marginLeft: 15,
                marginRight: 15,
              }}
            />
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
            {pages.length > 0 && (
              <>
                {' '}
                <IconButton
                  size='large'
                  aria-label='account of current user'
                  aria-controls='menu-appbar'
                  aria-haspopup='true'
                  onClick={handleOpenNavMenu}
                  color='inherit'
                >
                  <MenuIcon />
                </IconButton>
                <Menu
                  id='menu-appbar'
                  anchorEl={anchorElNav}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                  }}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{
                    display: { xs: 'block', md: 'none' },
                  }}
                >
                  {pages.map((page) => (
                    <MenuItem key={page} onClick={handleCloseNavMenu}>
                      <Typography textAlign='center'>{page}</Typography>
                    </MenuItem>
                  ))}
                </Menu>
              </>
            )}
          </Box>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
            {pages.map((page) => (
              <Button
                key={page}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: 'white', display: 'block' }}
              >
                {page}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title='Open Notifications'>
              <IconButton
                onClick={handleNotifications}
                sx={{
                  p: 0,
                  boxShadow: unreadCount ? '0 0 13px 4px #FFF9D8' : 'none',
                }}
              >
                {unreadCount > 0 ? (
                  <Badge badgeContent={unreadCount} color='warning'>
                    <Avatar sx={{ bgcolor: '#6c584c' }}>
                      <CircleNotificationsIcon sx={{ fontSize: 38 }} />
                    </Avatar>
                  </Badge>
                ) : (
                  <Avatar sx={{ bgcolor: '#6c584c' }}>
                    <CircleNotificationsIcon sx={{ fontSize: 38 }} />
                  </Avatar>
                )}
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id='menu-notify'
              anchorEl={anchorElNotify}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElNotify)}
              onClose={handleCloseNotifyMenu}
            >
              {notifications.map((notification) => (
                <MenuItem key={notification.id}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      flexWrap: 'wrap',
                      maxWidth: 200,
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mb: 1,
                      }}
                    >
                      <NotificationsNoneIcon sx={{ mr: 1, fontSize: 20 }} />
                      <Typography
                        sx={{
                          flexGrow: 1,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontSize: 14,
                        }}
                      >
                        {notification.topic}
                      </Typography>
                    </Box>
                    <Typography
                      sx={{
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: 13,
                      }}
                    >
                      {notification.content}
                    </Typography>
                    <Typography
                      sx={{
                        whiteSpace: 'normal',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: 11,
                        mt: 1,
                        fontStyle: 'italic',
                        color: 'gray',
                      }}
                    >
                      {notification.time}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <Box sx={{ flexGrow: 0, ml: 3 }}>
            <Tooltip title='Open settings'>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: '#6c584c' }}>
                  <AccountCircleIcon sx={{ fontSize: 38 }} />
                </Avatar>
              </IconButton>
            </Tooltip>
            <Menu
              sx={{ mt: '45px' }}
              id='menu-appbar'
              anchorEl={anchorElUser}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              <MenuItem onClick={handleProfile}>
                <Box display='flex' flexDirection='column'>
                  <Typography sx={{ ml: 1 }}>{userName}</Typography>
                  <Typography
                    sx={{
                      ml: 1,
                      fontStyle: 'italic',
                      fontSize: 12,
                      color: 'gray',
                    }}
                  >
                    id: {userId}
                  </Typography>
                </Box>
              </MenuItem>

              <MenuItem onClick={handleProfile}>
                <AssignmentIndIcon />
                <Typography textAlign='center' sx={{ ml: 1 }}>
                  個人檔案
                </Typography>
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <LogoutIcon />
                <Typography textAlign='center' sx={{ ml: 1 }}>
                  登出
                </Typography>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
