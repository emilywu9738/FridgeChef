import { Card, CardContent, Checkbox, Typography } from '@mui/material';

export default function MemberCard({ member, isChecked, onCheckChange }) {
  return (
    <Card
      sx={{
        borderRadius: '10px',
        minWidth: 250,
        position: 'relative',
        my: 2,
        mr: 4,
        bgcolor: '#FEFCF8',
      }}
    >
      <Checkbox
        checked={isChecked}
        onChange={(event) => onCheckChange(member._id, event.target.checked)}
        sx={{ position: 'absolute', top: 8, right: 8 }}
      />
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
          成員
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
          {member.omit.length > 0 ? member.omit.join('、') : '無'}
        </Typography>
      </CardContent>
    </Card>
  );
}
