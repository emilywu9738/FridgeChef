import { userSchema } from '../schema/schema.js';
import ExpressError from '../utils/ExpressError.js';
import 'dotenv/config';
import multer from 'multer';
import jwt from 'jsonwebtoken';

export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    throw new ExpressError(error.details[0].message, 400);
  }
  next();
};

export const validateJWT = (req, res, next) => {
  const accessToken = req.cookies.JWT;
  if (!accessToken) {
    throw new ExpressError('Access Denied', 401);
  }

  jwt.verify(accessToken, process.env.MY_SECRET_KEY, (err, user) => {
    if (err) throw new ExpressError('Authentication failed!', 403);
    req.user = user;
    next();
  });
};

const storage = multer.memoryStorage();
export const upload = multer({ storage });
