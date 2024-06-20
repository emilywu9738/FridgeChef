import Joi from 'joi';

export const userSchema = Joi.object({
  provider: Joi.string().required(),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
