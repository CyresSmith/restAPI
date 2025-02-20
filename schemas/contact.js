const { Schema, model } = require('mongoose');
const { handleMongooseError } = require('../helpers');
const emailRegexp = require('./emailRegexp');

const Joi = require('joi');
const CustomJoi = Joi.extend(require('joi-phone-number'));

const contact = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required to create a contact'],
    },
    email: {
      required: [true, 'Email is required'],
      type: String,
      match: emailRegexp,
      unique: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone is required to create a contact'],
      unique: true,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'user',
      required: true,
    },
  },
  { versionKey: false, timestamps: true }
);

contact.post('save', handleMongooseError);

/**
 * Схема валидации добавления контакта.
 */
const contactAddShema = CustomJoi.object({
  name: Joi.string().min(3).max(30).required().messages({
    'any.required': `"Name" is required`,
    'string.empty': `"Name" cannot be empty`,
    'string.base': `"Name" must be string`,
  }),

  email: Joi.string().pattern(emailRegexp).required().messages({
    'any.required': `"Email" is required`,
    'string.empty': `"Email" cannot be empty`,
    'string.base': `"Email" must be string`,
    'string.pattern.base': `"Email" doesn't look like an email`,
  }),

  phone: CustomJoi.string()
    .phoneNumber({ format: 'international' })
    .required()
    .messages({
      'any.required': `"Phone" is required`,
      'string.empty': `"Phone" cannot be empty`,
      'string.base': `"Phone" must be string`,
    }),

  favorite: Joi.bool().default(false),
});

/**
 * Схема валидации обновления контакта.
 */
const contactUpdateShema = CustomJoi.object({
  name: Joi.string().min(3).max(30).messages({
    'string.empty': `"Name" cannot be empty`,
    'string.base': `"Name" must be string`,
  }),

  email: Joi.string().pattern(emailRegexp).messages({
    'string.empty': `"Email" cannot be empty`,
    'string.base': `"Email" must be string`,
    'string.pattern.base': `"Email" doesn't look like an email`,
  }),

  phone: CustomJoi.string().phoneNumber({ format: 'international' }).messages({
    'string.empty': `"Phone" cannot be empty`,
    'string.base': `"Phone" must be string`,
  }),

  favorite: Joi.bool(),
}).min(1);

/**
 * Схема валидации обновления статуса контакта.
 */
const statusUpdateShema = CustomJoi.object({
  favorite: Joi.boolean().required().messages({
    'any.required': 'Missing field favorite',
  }),
});

const contactsValidation = {
  contactAddShema,
  contactUpdateShema,
  statusUpdateShema,
};

const Contact = model('contact', contact);

module.exports = { Contact, contactsValidation };
