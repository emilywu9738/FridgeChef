import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Fragment, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import {
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material/';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import NotificationsIcon from '@mui/icons-material/Notifications';
import PersonIcon from '@mui/icons-material/Person';
import BackHandIcon from '@mui/icons-material/BackHand';
import KitchenIcon from '@mui/icons-material/Kitchen';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

export default function NavBar() {
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotify, setAnchorElNotify] = useState(null);
  const [notifications, setNotifications] = useState(['目前還沒有通知']);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState('');
  const [groupId, setGroupId] = useState([]);
  const [socket, setSocket] = useState(null);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [openDialog, setOpenDialog] = useState(false);

  const handleClickOpen = (e) => {
    e.stopPropagation();
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

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
  const handleMyFridge = () => {
    setAnchorElUser(null);
    navigate('/user/myfridge');
  };

  const handleLogout = () => {
    setAnchorElNav(null);
    apiClient('/user/logout', { withCredentials: true })
      .then(() => {
        navigate('/login');
      })
      .catch((err) => console.error(err));
  };

  const handleLikedRecipes = () => {
    setAnchorElUser(null);
    navigate('/user/likedRecipe');
  };
  const handleSearchRecipes = () => {
    navigate('/searchRecipes');
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

  const handleNotificationClick = (e, link) => {
    e.stopPropagation();
    navigate(link);
  };

  useEffect(() => {
    apiClient('/user/info', { withCredentials: true })
      .then((response) => {
        const { userId, groupId, userName, userEmail } = response.data;
        setUserId(userId);
        setGroupId(groupId);
        setUserName(userName);
        setUserEmail(userEmail);
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
    <>
      <Fragment>
        <Dialog
          open={openDialog}
          onClose={handleCloseDialog}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>新手教學</DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              歡迎來到 Fridge Chef！
              <br />
              初次使用請先點擊【 個人檔案 】
              <br />
              <br />
              請在個人檔案目錄點擊【 編輯喜好 】➤
              編輯你的飲食習慣並新增您想要在食譜推薦時排除的食材。
              <br />
              接著點擊【 新增冰箱 】➤
              輸入您的冰箱名稱及描述，再選出和您一起共用冰箱的成員（成員需先註冊）。新成員將從
              Email 或網站通知點擊連結，接受您的邀請。
              <br />
              <br />【 新增冰箱
              】成功後，請將您擁有的食材加入食材清單，完成後選擇您要生成的食譜種類，按下【
              推薦食譜 】按鈕，最適合您的食譜將顯示於【 食譜推薦清單 】。
              <br />
              <br />
              Note ► 若將成員卡片方格打勾，推薦食譜時會將該成員的【 排除食材
              】加以排除。
              <br />
              <br />
              其他功能就留給您去探索了。
              <br />
              Fridge Chef 團隊再次歡迎您的加入！
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} sx={{ fontSize: 17, mr: 1 }}>
              OK!
            </Button>
          </DialogActions>
        </Dialog>
      </Fragment>
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
              onClick={handleMyFridge}
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
                  onClick={handleSearchRecipes}
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
                  onClick={handleMyFridge}
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
                  onClick={handleNotifications}
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
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <MenuItem
                      key={notification.id}
                      onClick={(e) =>
                        handleNotificationClick(e, notification.link)
                      }
                    >
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
                  ))
                ) : (
                  <MenuItem>
                    <Typography
                      sx={{
                        flexGrow: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontSize: 14,
                      }}
                    >
                      目前還沒有通知～
                    </Typography>
                  </MenuItem>
                )}
              </Menu>
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
                      Email: {userEmail}
                    </Typography>
                  </Box>
                </MenuItem>

                <MenuItem onClick={handleProfile}>
                  <AssignmentIndIcon />
                  <Typography textAlign='center' sx={{ ml: 1 }}>
                    個人檔案
                  </Typography>
                </MenuItem>
                <MenuItem onClick={handleLikedRecipes}>
                  <BookmarkRoundedIcon />
                  <Typography textAlign='center' sx={{ ml: 1 }}>
                    我的收藏
                  </Typography>
                </MenuItem>
                <MenuItem onClick={(e) => handleClickOpen(e)}>
                  <BackHandIcon />
                  <Typography sx={{ ml: 1 }}> 新手教學</Typography>
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
        </Box>
      </AppBar>
    </>
  );
}
