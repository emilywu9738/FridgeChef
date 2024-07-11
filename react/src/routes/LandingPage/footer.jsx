import { Box, Container, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component='footer'
      sx={{
        py: 3,
        mx: 'auto',
        mt: 'auto',
        bgcolor: '#a98467',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Typography variant='body2' sx={{ color: 'white' }}>
          {'© '}
          {new Date().getFullYear()}
          {' 冰箱大廚 - FridgeChef Inc. 版權所有。'}
        </Typography>
      </Box>
    </Box>
  );
};

export default Footer;
