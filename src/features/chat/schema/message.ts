import Joi, { ObjectSchema } from 'joi';

const errorMessageTemplate = {
  'string.base': 'Field "{{#label}}" must be a valid string',
  'string.empty': 'Field "{{#label}}" cannot be empty',
  'any.required': 'Field "{{#label}}" is required'
};
const addMessageSchema: ObjectSchema = Joi.object().keys({
  conversationId: Joi.string().optional().allow(null, '').messages(errorMessageTemplate),
  receiverId: Joi.string().required().messages(errorMessageTemplate),
  receiverUsername: Joi.string().required().messages(errorMessageTemplate),
  receiverAvatarColor: Joi.string().required().messages(errorMessageTemplate),
  receiverProfilePicture: Joi.string().required().messages(errorMessageTemplate),
  body: Joi.string().optional().allow(null, '').messages(errorMessageTemplate),
  gifUrl: Joi.string().optional().allow(null, '').messages(errorMessageTemplate),
  selectedImage: Joi.string().optional().allow(null, '').messages(errorMessageTemplate),
  isRead: Joi.boolean().optional()
});

const markMessageSchema: ObjectSchema = Joi.object().keys({
  sender: Joi.string().required().messages(errorMessageTemplate),
  receiver: Joi.string().required().messages(errorMessageTemplate)
});
// const addMessageSchema: ObjectSchema = Joi.object().keys({
//   conversationId: Joi.string().optional().allow(null, '').messages({
//     'string.base': 'Conversation ID must be a string',
//     'string.empty': 'Conversation ID cannot be empty',
//     'any.only': 'Conversation ID must be null, empty string, or a valid string'
//   }),
//   receiverId: Joi.string().required().messages({
//     'string.base': 'Receiver ID must be a string',
//     'string.empty': 'Receiver ID cannot be empty',
//     'any.required': 'Receiver ID is required'
//   }),
//   receiverUsername: Joi.string().required().messages({
//     'string.base': 'Receiver username must be a string',
//     'string.empty': 'Receiver username cannot be empty',
//     'any.required': 'Receiver username is required'
//   }),
//   receiverAvatarColor: Joi.string().required().messages({
//     'string.base': 'Receiver avatar color must be a string',
//     'string.empty': 'Receiver avatar color cannot be empty',
//     'any.required': 'Receiver avatar color is required'
//   }),
//   receiverProfilePicture: Joi.string().required().messages({
//     'string.base': 'Receiver profile picture must be a string',
//     'string.empty': 'Receiver profile picture cannot be empty',
//     'any.required': 'Receiver profile picture is required'
//   }),
//   body: Joi.string().optional().allow(null, '').messages({
//     'string.base': 'Body must be a string',
//     'string.empty': 'Body cannot be empty',
//     'any.only': 'Body must be null, empty string, or a valid string'
//   }),
//   gifUrl: Joi.string().optional().allow(null, '').messages({
//     'string.base': 'Gif URL must be a string',
//     'string.empty': 'Gif URL cannot be empty',
//     'any.only': 'Gif URL must be null, empty string, or a valid string'
//   }),
//   selectedImage: Joi.string().optional().allow(null, '').messages({
//     'string.base': 'Selected image must be a string',
//     'string.empty': 'Selected image cannot be empty',
//     'any.only': 'Selected image must be null, empty string, or a valid string'
//   }),
//   isRead: Joi.boolean().optional()
// });

// const markMessageSchema: ObjectSchema = Joi.object().keys({
//   senderId: Joi.string().required().messages({
//     'string.base': 'Sender ID must be a string',
//     'string.empty': 'Sender ID cannot be empty',
//     'any.required': 'Sender ID is required'
//   }),
//   receiverId: Joi.string().required().messages({
//     'string.base': 'Receiver ID must be a string',
//     'string.empty': 'Receiver ID cannot be empty',
//     'any.required': 'Receiver ID is required'
//   })
// });

export { markMessageSchema, addMessageSchema };
