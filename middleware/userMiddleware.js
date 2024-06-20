import { userSchema } from '../schema/schema.js';
import ExpressError from '../utils/ExpressError.js';

export const validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    res.status(400).send(error.details[0].message);
    return;
  }
  next();
};

export const validateJWT = (req, res, next) => {
  const accessToken = req.cookies.JWT;
  if (!accessToken) {
    throw new ExpressError('Access Denied', 401);
  }
  next();
};
