import { Box, Menu, MenuItem, Typography } from '@mui/material';

import BackHandIcon from '@mui/icons-material/BackHand';
import SettingsIcon from '@mui/icons-material/Settings';
import BookmarkRoundedIcon from '@mui/icons-material/BookmarkRounded';
import LogoutIcon from '@mui/icons-material/Logout';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

export default function UserMenu({
  anchorElUser,
  handleCloseUserMenu,
  handleProfile,
  userName,
  userEmail,
  handleLikedRecipes,
  handleOpenTutorial,
  handleSettings,
  handleLogout,
}) {
  return (
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
      <MenuItem onClick={(e) => handleOpenTutorial(e)}>
        <BackHandIcon />
        <Typography sx={{ ml: 1 }}> 新手教學</Typography>
      </MenuItem>
      <MenuItem onClick={handleSettings}>
        <SettingsIcon />
        <Typography sx={{ ml: 1 }}> 個人設定</Typography>
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <LogoutIcon />
        <Typography textAlign='center' sx={{ ml: 1 }}>
          登出
        </Typography>
      </MenuItem>
    </Menu>
  );
}
