import { Card, CardContent, Typography } from '@mui/material';

export default function InvitingMemberCard({ invitation }) {
  return (
    <Card
      sx={{
        borderRadius: '10px',
        minWidth: 275,
        position: 'relative',
        my: 2,
        mr: 4,
        bgcolor: '#FFFBF0',
      }}
    >
      <CardContent>
        <Typography sx={{ fontSize: 14 }} color='text.secondary' gutterBottom>
          邀請中
        </Typography>
        <Typography variant='h5' component='div' sx={{ mb: 1 }}>
          {invitation.userName}
        </Typography>
        <Typography
          sx={{ fontSize: 13, fontStyle: 'italic' }}
          color='text.secondary'
        >
          {invitation.email}
        </Typography>
      </CardContent>
    </Card>
  );
}
