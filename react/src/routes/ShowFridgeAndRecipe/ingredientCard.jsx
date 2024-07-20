import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  List,
  ListItem,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';

export default function IngredientCard({
  category,
  setOpenSuccessSnackbar,
  setSuccessMessage,
  setReload,
  setOpenErrorSnackbar,
  setErrorMessage,
  apiClient,
  fridgeId,
  reload,
}) {
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [itemsToDelete, setItemsToDelete] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const threeDaysLater = new Date();
  threeDaysLater.setHours(0, 0, 0, 0);
  threeDaysLater.setDate(threeDaysLater.getDate() + 3);

  const sortedItems = [...category.items].sort(
    (a, b) => new Date(a.expirationDate) - new Date(b.expirationDate),
  );

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteMode = (e) => {
    e.stopPropagation();
    setIsDeleteMode(true);
    setAnchorEl(null);
  };

  const handleDeleteItems = (itemId) => {
    setItemsToDelete((prevItems) =>
      prevItems.includes(itemId)
        ? prevItems.filter((id) => id !== itemId)
        : [...prevItems, itemId],
    );
  };

  const confirmDelete = (fridgeId, reload) => {
    console.log(fridgeId);
    apiClient
      .delete(`/fridge/${fridgeId}/deleteItems`, {
        data: { ids: itemsToDelete },
        withCredentials: true,
      })
      .then((response) => {
        setOpenSuccessSnackbar(true);
        setSuccessMessage(response.data);
        setReload(!reload);
        setItemsToDelete([]);
        setIsDeleteMode(false);
      })
      .catch(() => {
        setOpenErrorSnackbar(true);
        setErrorMessage('食材刪除失敗！');
      });
  };

  const cancelDelete = () => {
    setIsDeleteMode(false);
    setItemsToDelete([]);
  };

  return (
    <Card
      sx={{
        borderRadius: '10px',
        my: 2,
        mr: 4,
        bgcolor: '#FEFCF8',
        minHeight: { xs: 0, sm: 300 },
        minWidth: 250,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography
            sx={{ fontSize: 18, mb: 0, fontWeight: 500 }}
            color='text.primary'
            gutterBottom
          >
            {category.category}類
          </Typography>
          <IconButton onClick={handleMenuClick}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={(e) => handleDeleteMode(e)}>刪除</MenuItem>
          </Menu>
        </Box>
        <Box sx={{ maxHeight: 220, overflowY: 'auto' }}>
          <List dense>
            {sortedItems
              .filter((item) => !itemsToDelete.includes(item._id))
              .map((item) => {
                const expirationDate = new Date(item.expirationDate);
                expirationDate.setHours(0, 0, 0, 0);
                let bgcolor = '#FCF8EE';
                let color = 'inherit';
                let fontWeight = 400;
                if (expirationDate < today) {
                  bgcolor = '#C42615';
                  color = 'white';
                  fontWeight = 600;
                } else if (expirationDate <= threeDaysLater) {
                  bgcolor = '#fff18a';
                }

                return (
                  <ListItem
                    key={item._id}
                    sx={{
                      justifyContent: 'space-between',
                      padding: '8px',
                      margin: '8px 0',
                      border: '1px solid #ccc',
                      borderRadius: 2,
                      boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                      backgroundColor: bgcolor,
                      height: 40,
                    }}
                  >
                    <Typography
                      variant='body2'
                      component='span'
                      sx={{
                        flexGrow: 1,
                        marginLeft: 1,
                        color: color,
                        fontWeight: fontWeight,
                      }}
                    >
                      {item.name}
                    </Typography>
                    <Typography
                      variant='body2'
                      component='span'
                      sx={{ color: color, fontWeight: fontWeight }}
                    >
                      到期日: {expirationDate.toLocaleDateString()}
                    </Typography>

                    {isDeleteMode && (
                      <IconButton
                        sx={{
                          marginLeft: 1,
                          padding: 0,
                          '& .MuiSvgIcon-root': {
                            fontSize: '20px',
                          },
                        }}
                        onClick={() => handleDeleteItems(item._id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </ListItem>
                );
              })}
          </List>
        </Box>
        {isDeleteMode && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button
              variant='contained'
              onClick={() => confirmDelete(fridgeId, reload)}
              disabled={itemsToDelete.length === 0}
              sx={{
                backgroundColor: '#f59b51',
                ':hover': {
                  backgroundColor: '#C6600C',
                },
              }}
            >
              確認刪除
            </Button>
            <Button
              variant='outlined'
              onClick={cancelDelete}
              sx={{
                color: 'grey',
                border: '1px solid grey',
                ':hover': { color: 'black', border: '1px solid black' },
              }}
            >
              取消
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
