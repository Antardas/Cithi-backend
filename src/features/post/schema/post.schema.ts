import Joi, { ObjectSchema } from 'joi';

const commonProperties = {
  post: Joi.string().optional().allow(null, ''),
  bgColor: Joi.string().optional().allow(null, ''),
  privacy: Joi.string().optional().allow(null, ''),
  feelings: Joi.string().optional().allow(null, ''),
  gifUrl: Joi.string().optional().allow(null, ''),
  profilePicture: Joi.string().optional().allow(null, ''),
  imgVersion: Joi.string().optional().allow(null, ''),
  imgId: Joi.string().optional().allow(null, ''),
  image: Joi.string().optional().allow(null, ''),
  videoId: Joi.string().optional().allow(null, ''),
  videoVersion: Joi.string().optional().allow(null, ''),
  video: Joi.string().optional().allow(null, ''),
};

const postSchema: ObjectSchema = Joi.object().keys(commonProperties);

const postWithImageSchema: ObjectSchema = Joi.object().keys({
  ...commonProperties,
  image: Joi.string().required().messages({
    'any.required': 'image is a required field',
    'any.empty': 'image property is not allowed to be empty'
  })
});
const postWithVideoSchema: ObjectSchema = Joi.object().keys({
  ...commonProperties,
  image: Joi.string().optional().messages({
    'any.required': 'video is a required field',
    'any.empty': 'video property is not allowed to be empty'
  }),
  video: Joi.string().required().messages({
    'any.required': 'image is a required field',
    'any.empty': 'image property is not allowed to be empty'
  })
});

export { postSchema, postWithImageSchema,postWithVideoSchema };
