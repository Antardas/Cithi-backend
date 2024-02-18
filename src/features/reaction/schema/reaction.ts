import Joi, { ObjectSchema } from 'joi';

const addReactionSchema: ObjectSchema = Joi.object().keys({
  userTo: Joi.string().required().messages({
    'any.required': 'userTo is required property'
  }),
  postId: Joi.string().required().messages({
    'any.required': 'postId is required property'
  }),
  type: Joi.string().required().messages({
    'any.required': 'type is required property'
  }),
  profilePicture: Joi.string().optional().allow(null, ''),
  previousReaction: Joi.string().optional().allow(null, ''),
  postReactions: Joi.object().optional().allow(null, '')
});

const removeReactionSchema: ObjectSchema = Joi.object().keys({
  postReactions: Joi.string().optional().allow(null, '')
});

export { removeReactionSchema, addReactionSchema };
