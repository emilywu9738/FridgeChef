import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  IconButton,
  Toolbar,
  Tooltip,
} from '@mui/material/';

import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import KitchenIcon from '@mui/icons-material/Kitchen';
import TutorialDialog from './tutorialDialog';
import UserMenu from './userMenu';
import NotificationMenu from './notificationMenu';
import ErrorSnackbar from '../errorSnackbar';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function NavBar() {
  const navigate = useNavigate();

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotify, setAnchorElNotify] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState('');
  const [groupId, setGroupId] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [openErrorSnackbar, setOpenErrorSnackbar] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleCloseErrorSnackbar = () => {
    setOpenErrorSnackbar(false);
  };

  const handleOpenDialog = (e) => {
    e.stopPropagation();
    setOpenDialog(true);
    setAnchorElUser(false);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseNotifyMenu = () => {
    setAnchorElNotify(null);
  };

  const navigateToProfile = () => {
    setAnchorElUser(null);
    navigate('/user/profile');
  };

  const navigateToMyFridge = () => {
    setAnchorElUser(null);
    navigate('/user/myFridge');
  };

  const navigateToLikedRecipes = () => {
    setAnchorElUser(null);
    navigate('/user/likedRecipe');
  };

  const navigateToSearchRecipes = () => {
    navigate('/searchRecipes');
  };

  const navigateToSettings = () => {
    navigate('/user/settings');
    setAnchorElUser(false);
  };

  const handleLogout = () => {
    apiClient('/user/logout', { withCredentials: true })
      .then(() => {
        navigate('/login');
      })
      .catch(() => {
        setErrorMessage('登出失敗，請稍候再試');
        setOpenErrorSnackbar(true);
      });
  };

  const fetchAndOpenNotificationsMenu = async (event) => {
    setAnchorElNotify(event.currentTarget);
    setUnreadCount(0);
    try {
      const response = await apiClient('/user/notifications', {
        withCredentials: true,
      });
      const { notifications } = response.data;
      setNotifications(notifications);
    } catch (err) {
      setErrorMessage('通知載入失敗，請稍候再試');
      setOpenErrorSnackbar(true);
      if (err.response && err.response.status === 401) {
        navigate('/login');
      }
    }
  };

  const handleNotificationClick = (e, link) => {
    e.stopPropagation();
    navigate(link);
  };

  useEffect(() => {
    apiClient('/user/info', { withCredentials: true }).then((response) => {
      const { userId, groupId, userName, userEmail } = response.data;
      setUserId(userId);
      setGroupId(groupId);
      setUserName(userName);
      setUserEmail(userEmail);
    });
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
    <>
      <ErrorSnackbar
        openErrorSnackbar={openErrorSnackbar}
        autoHideDuration={3000}
        handleCloseErrorSnackbar={handleCloseErrorSnackbar}
        errorMessage={errorMessage}
      />

      <TutorialDialog
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
      />

      <AppBar
        socket={socket}
        position='sticky'
        sx={{ bgcolor: '#a98467', height: 80, width: '100%' }}
      >
        <Box sx={{ mt: 1, mx: { xs: 1, md: 3 } }}>
          <Toolbar
            disableGutters
            sx={{ justifyContent: 'space-between', width: '100%' }}
          >
            <Box
              onClick={navigateToMyFridge}
              sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
            >
              <Box
                component='img'
                src='/navbarLogo.png'
                sx={{
                  maxWidth: { xs: 38, md: 45 },
                  height: 'auto',
                  pb: 1,
                }}
              />
              <Box
                component='img'
                src='/logoText.png'
                alt='Logo'
                sx={{
                  maxWidth: { xs: 120, md: 150 },
                  height: 'auto',
                  mx: { xs: '10px', md: '15px' },
                }}
              />
            </Box>

            <Box sx={{ ml: 'auto' }}>
              <Tooltip title='搜尋食譜'>
                <IconButton
                  onClick={navigateToSearchRecipes}
                  sx={{
                    p: 0,
                  }}
                >
                  <Avatar sx={{ bgcolor: '#6c584c', ml: 'auto' }}>
                    <Avatar sx={{ bgcolor: '#faedcd', width: 32, height: 32 }}>
                      <img
                        src='/searchIcon.png'
                        style={{ width: 20, height: 'auto', color: '#6c584c' }}
                      />
                    </Avatar>
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ ml: { xs: 1, md: 3 } }}>
              <Tooltip title='我的冰箱'>
                <IconButton
                  onClick={navigateToMyFridge}
                  sx={{
                    p: 0,
                  }}
                >
                  <Avatar sx={{ bgcolor: '#6c584c', ml: 'auto' }}>
                    <Avatar sx={{ bgcolor: '#faedcd', width: 32, height: 32 }}>
                      <KitchenIcon sx={{ fontSize: 25, color: '#6c584c' }} />
                    </Avatar>
                  </Avatar>
                </IconButton>
              </Tooltip>
            </Box>

            <Box sx={{ ml: { xs: 1, md: 3 } }}>
              <Tooltip title='我的通知'>
                <IconButton
                  onClick={fetchAndOpenNotificationsMenu}
                  sx={{
                    p: 0,
                    boxShadow: unreadCount ? '0 0 13px 4px #FFF9D8' : 'none',
                  }}
                >
                  {unreadCount > 0 ? (
                    <Badge badgeContent={unreadCount} color='warning'>
                      <Avatar sx={{ bgcolor: '#6c584c', ml: 'auto' }}>
                        <Avatar
                          sx={{ bgcolor: '#faedcd', width: 32, height: 32 }}
                        >
                          <NotificationsIcon
                            sx={{ fontSize: 25, color: '#6c584c' }}
                          />
                        </Avatar>
                      </Avatar>
                    </Badge>
                  ) : (
                    <Avatar sx={{ bgcolor: '#6c584c', ml: 'auto' }}>
                      <Avatar
                        sx={{ bgcolor: '#faedcd', width: 32, height: 32 }}
                      >
                        <NotificationsIcon
                          sx={{ fontSize: 25, color: '#6c584c' }}
                        />
                      </Avatar>
                    </Avatar>
                  )}
                </IconButton>
              </Tooltip>
              <NotificationMenu
                anchorElNotify={anchorElNotify}
                handleCloseNotifyMenu={handleCloseNotifyMenu}
                notifications={notifications}
                handleNotificationClick={handleNotificationClick}
              />
            </Box>

            <Box sx={{ flexGrow: 0, ml: { xs: 1, md: 3 } }}>
              <Tooltip title='個人檔案'>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar sx={{ bgcolor: '#6c584c', ml: 'auto' }}>
                    <Avatar sx={{ bgcolor: '#faedcd', width: 32, height: 32 }}>
                      <PersonIcon sx={{ fontSize: 30, color: '#6c584c' }} />
                    </Avatar>
                  </Avatar>
                </IconButton>
              </Tooltip>
              <UserMenu
                anchorElUser={anchorElUser}
                userName={userName}
                userEmail={userEmail}
                handleCloseUserMenu={handleCloseUserMenu}
                handleProfile={navigateToProfile}
                handleLikedRecipes={navigateToLikedRecipes}
                handleOpenTutorial={handleOpenDialog}
                handleSettings={navigateToSettings}
                handleLogout={handleLogout}
              />
            </Box>
          </Toolbar>
        </Box>
      </AppBar>
    </>
  );
}
