import Joi, { ObjectSchema } from 'joi';
// TODO: Add proper message
const signupSchema: ObjectSchema = Joi.object().keys({
  username: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Username must be of type string',
    'string.min': 'Invalid username min 4 character',
    'string.max': 'Invalid username max 8 character',
    'string.empty': 'Username is a required field'
  }),
  password: Joi.string().required().min(4).max(8).messages({
    'string.base': 'Password must be of type string',
    'string.min': 'Invalid password',
    'string.max': 'Invalid password',
    'string.empty': 'Password is a required field'
  }),
  email: Joi.string().required().email().messages({
    'string.base': 'Email must be of type string',
    'string.email': 'Email must be valid',
    'string.empty': 'Email is a required field'
  }),
  avatarColor: Joi.string().required().messages({
    'string.base': 'Avatar color must be of type string',
    'string.empty': 'Avatar color is required'
  }),
  avatarImage: Joi.string().required().messages({
    'string.base': 'Avatar image must be of type string',
    'string.empty': 'Avatar image is required'
  })
});

export { signupSchema };
