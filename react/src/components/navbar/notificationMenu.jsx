import { Box, Menu, MenuItem, Typography } from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

export default function NotificationMenu({
  anchorElNotify,
  handleCloseNotifyMenu,
  notifications,
  handleNotificationClick,
}) {
  return (
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
            onClick={(e) => handleNotificationClick(e, notification.link)}
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
  );
}
