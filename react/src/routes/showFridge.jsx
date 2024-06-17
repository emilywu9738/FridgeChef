import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  List,
  ListItem,
  Select,
  Typography,
  FormControl,
  InputLabel,
  MenuItem,
} from '@mui/material';

export default function ShowFridge() {
  const [searchParams] = useSearchParams();
  const [fridgeData, setFridgeData] = useState({
    name: '',
    members: [],
    ingredients: [],
  });

  const [checkedMembers, setCheckedMembers] = useState({});
  const [recommendCategory, setRecommendCategory] = useState('');

  const handleMemberCheckChange = (memberId, isChecked) => {
    setCheckedMembers((prev) => ({
      ...prev,
      [memberId]: isChecked,
    }));
  };

  const handleCategoryChange = (event) => {
    setRecommendCategory(event.target.value);
  };

  const handleRecommendRecipes = () => {
    const fridgeId = searchParams.get('id');
    axios
      .post(`http://localhost:8080/fridge/recipe?id=${fridgeId}`, {
        recipeCategory: recommendCategory,
        fridgeData: fridgeData,
        checkedMembers: checkedMembers,
      })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) =>
        console.error('Failed to fetch recommendation data:', error),
      );
  };

  function MemberCard({ member, isChecked, onCheckChange }) {
    return (
      <Card sx={{ minWidth: 275, position: 'relative', m: 1 }}>
        <Checkbox
          checked={isChecked}
          onChange={(event) => onCheckChange(member._id, event.target.checked)}
          sx={{ position: 'absolute', top: 8, right: 8 }}
        />
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            Member
          </Typography>
          <Typography variant='h5' component='div' sx={{ mb: 1 }}>
            {member.name}
          </Typography>
          <Typography sx={{ mb: 1.5, color: '#606c38' }}>
            飲食習慣: {member.preference}
          </Typography>
          <Typography variant='body2' sx={{ color: '#bc6c25' }}>
            排除食材：
            <br />
            {member.omit.join('、')}
          </Typography>
        </CardContent>
      </Card>
    );
  }

  function IngredientCard({ category }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const threeDaysLater = new Date();
    threeDaysLater.setHours(0, 0, 0, 0);
    threeDaysLater.setDate(threeDaysLater.getDate() + 3);

    // 初始化每個食材的選中狀態為未選中
    const [checkedStates, setCheckedStates] = useState(
      new Array(category.items.length).fill(false),
    );

    // 處理 Checkbox 的點擊事件
    const handleCheckboxChange = (index) => {
      const newCheckedStates = [...checkedStates];
      newCheckedStates[index] = !newCheckedStates[index];
      setCheckedStates(newCheckedStates);
    };

    return (
      <Card sx={{ minWidth: 275, m: 2, overflow: 'visible' }}>
        <CardContent>
          <Typography
            sx={{ fontSize: 18, mb: 1, fontWeight: 500 }}
            color='text.primary'
            gutterBottom
          >
            {category.category}類
          </Typography>
          <List dense>
            {category.items.map((item, index) => {
              const expirationDate = new Date(item.expirationDate);
              expirationDate.setHours(0, 0, 0, 0);
              let color = 'inherit';
              if (expirationDate < today) {
                color = '#ae2012';
              } else if (expirationDate <= threeDaysLater) {
                color = '#ee9b00';
              }

              return (
                <ListItem
                  key={item._id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '8px',
                    margin: '5px 0',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    boxShadow: '0 1px 1px rgba(0,0,0,0.1)',
                    backgroundColor: 'background.paper',
                  }}
                >
                  <Checkbox
                    checked={checkedStates[index]}
                    onChange={() => handleCheckboxChange(index)}
                    sx={{ padding: 0 }}
                  />
                  <Typography
                    variant='body2'
                    component='span'
                    sx={{ flexGrow: 1, marginLeft: 1, color: color }}
                  >
                    {item.name}
                  </Typography>
                  <Typography
                    variant='body2'
                    component='span'
                    sx={{ color: color }}
                  >
                    到期日: {expirationDate.toLocaleDateString()}
                  </Typography>
                </ListItem>
              );
            })}
          </List>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    const fridgeId = searchParams.get('id');
    if (fridgeId) {
      axios(`http://localhost:8080/fridge?id=${fridgeId}`)
        .then((response) => {
          setFridgeData(response.data);
          // 初始化所有成員的勾選狀態為未選
          const initialChecks = response.data.members.reduce(
            (acc, member) => ({
              ...acc,
              [member._id]: false,
            }),
            {},
          );
          setCheckedMembers(initialChecks);
        })
        .catch((error) => console.error('Failed to fetch fridge data:', error));
    }
  }, [searchParams]);

  return (
    <Box component='div' sx={{ m: 2 }}>
      <Typography variant='h2'>{fridgeData.name}</Typography>
      <Typography sx={{ my: 2, ml: 1 }}>
        今日：
        {new Date().toLocaleDateString('zh-Hant-TW', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <FormControl
          fullWidth
          sx={{ minWidth: 240, maxWidth: 275, my: 2, mx: 1 }}
        >
          <InputLabel id='recipeCategory-label' color='success'>
            食譜類別
          </InputLabel>
          <Select
            labelId='recipeCategory-label'
            id='recipeCategory'
            value={recommendCategory}
            label='食譜類別'
            onChange={handleCategoryChange}
            color='success'
          >
            <MenuItem value={'All'}>All</MenuItem>
            <MenuItem value={'蛋奶素'}>蛋奶素</MenuItem>
            <MenuItem value={'全素'}>全素</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant='contained'
          size='large'
          sx={{
            ml: 1,
            backgroundColor: '#f59b51',
            ':hover': {
              backgroundColor: '#e76f51',
            },
            height: 50,
          }}
          onClick={handleRecommendRecipes}
        >
          推薦食譜
        </Button>
      </Box>

      <Typography variant='h5' component='div' sx={{ mb: 1 }}>
        成員名單
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 5 }}>
        <h3></h3>
        {fridgeData.members.map((member) => (
          <MemberCard
            key={member._id}
            member={member}
            isChecked={checkedMembers[member._id]}
            onCheckChange={handleMemberCheckChange}
          />
        ))}
      </Box>
      <Typography variant='h5' component='div' sx={{ mb: 1 }}>
        食材清單
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {fridgeData.ingredients.map((category) => (
          <IngredientCard key={category._id} category={category} />
        ))}
      </Box>
    </Box>
  );
}
