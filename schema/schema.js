import Joi from 'joi';

export const userSchema = Joi.object({
  provider: Joi.string().required(),
  name: Joi.string().max(20).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
});
