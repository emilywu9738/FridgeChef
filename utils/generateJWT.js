import jwt from 'jsonwebtoken';
import 'dotenv/config';

const EXPIRE_TIME = 3600;

export default (id) => {
  const accessToken = jwt.sign(
    {
      id,
    },
    process.env.MY_SECRET_KEY,
    {
      expiresIn: EXPIRE_TIME,
    },
  );
  return accessToken;
};
