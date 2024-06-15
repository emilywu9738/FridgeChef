import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useSearchParams } from 'react-router-dom';

import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Checkbox,
  Typography,
} from '@mui/material';

export default function ShowFridge() {
  const [searchParams] = useSearchParams();
  const [fridgeData, setFridgeData] = useState({ name: '', members: [] });

  function MemberCard({ member }) {
    const [isChecked, setIsChecked] = useState(false); // 狀態管理 for each member's checkbox

    const handleCheckboxChange = (event) => {
      setIsChecked(event.target.checked);
    };
    return (
      <Card sx={{ minWidth: 275, position: 'relative' }}>
        <Checkbox
          checked={isChecked}
          onChange={handleCheckboxChange}
          sx={{ position: 'absolute', top: 8, right: 8 }} // Position the checkbox at the top-left corner of the card
        />
        <CardContent>
          <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
            Member
          </Typography>
          <Typography variant='h5' component='div'>
            {member.name}
          </Typography>
          <Typography sx={{ mb: 1.5 }} color='text.secondary'>
            偏好: {member.preference}
          </Typography>
          <Typography variant='body2'>
            排除食材：
            <br />
            {member.omit.join(', ')}
          </Typography>
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
          console.log(response.data);
        })
        .catch((error) => console.error('Failed to fetch fridge data:', error));
    }
  }, [searchParams]);

  return (
    <>
      <h1>{fridgeData.name}</h1>

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {fridgeData.members.map((member) => (
          <MemberCard key={member._id} member={member} />
        ))}
      </Box>
    </>
  );
}
