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
  image: Joi.string().optional().allow(null, '')
};

const postSchema: ObjectSchema = Joi.object().keys(commonProperties);

const postWithImageSchema: ObjectSchema = Joi.object().keys({
  ...commonProperties,
  image: Joi.string().required().messages({
    'any.required': 'image is a required field',
    'any.empty': 'image property is not allowed to be empty'
  })
});

export { postSchema, postWithImageSchema };
