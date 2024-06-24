import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  AppBar,
  Avatar,
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

const pages = [];

export default function NavBar() {
  const navigate = useNavigate();

  const [anchorElNav, setAnchorElNav] = useState(null);
  const [anchorElUser, setAnchorElUser] = useState(null);
  const [anchorElNotify, setAnchorElNotify] = useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenNotifyMenu = (event) => {
    setAnchorElNotify(event.currentTarget);
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
    axios('http://localhost:8080/user/logout', { withCredentials: true })
      .then((response) => {
        navigate('/login');
      })
      .catch((err) => console.error(err));
  };

  return (
    <AppBar position='static' sx={{ bgcolor: '#a98467', height: 80 }}>
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
              <IconButton onClick={handleOpenNotifyMenu} sx={{ p: 0 }}>
                <Avatar sx={{ bgcolor: '#6c584c' }}>
                  <CircleNotificationsIcon sx={{ fontSize: 38 }} />
                </Avatar>
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
              <MenuItem>
                <AssignmentIndIcon />
                <Typography textAlign='center' sx={{ ml: 1 }}>
                  通知1
                </Typography>
              </MenuItem>
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
