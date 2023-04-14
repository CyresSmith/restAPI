const { Schema, model } = require('mongoose');
const { handleMongooseError } = require('../helpers');
const emailRegexp = require('./emailRegexp');

const Joi = require('joi');

const user = new Schema(
  {
    name: {
      required: [true, 'Name is required'],
      type: String,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    email: {
      required: [true, 'Email is required'],
      type: String,
      match: emailRegexp,
      unique: true,
    },
    subscription: {
      type: String,
      enum: ['starter', 'pro', 'business'],
      default: 'starter',
    },
    token: {
      type: String,
      default: null,
    },
  },
  { versionKey: false, timestamps: true }
);

/**
 * Схема валидации регистрации пользователя.
 */
const userRegisterShema = Joi.object({
  name: Joi.string().min(3).messages({
    'any.required': `"Name" is required`,
    'string.empty': `"Name" cannot be empty`,
    'string.base': `"Name" must be string`,
  }),

  password: Joi.string().min(6).messages({
    'any.required': `"Password" is required`,
    'string.empty': `"Password" cannot be empty`,
    'string.base': `"Password" must be string`,
  }),

  email: Joi.string().pattern(emailRegexp).required().messages({
    'any.required': `"Email" is required`,
    'string.empty': `"Email" cannot be empty`,
    'string.base': `"Email" must be string`,
    'string.pattern.base': `"Email" doesn't look like an email`,
  }),
});

/**
 * Схема валидации логина пользователя.
 */
const userLoginShema = Joi.object({
  password: Joi.string().min(6).messages({
    'any.required': `"Password" is required`,
    'string.empty': `"Password" cannot be empty`,
    'string.base': `"Password" must be string`,
  }),

  email: Joi.string().pattern(emailRegexp).required().messages({
    'any.required': `"Email" is required`,
    'string.empty': `"Email" cannot be empty`,
    'string.base': `"Email" must be string`,
    'string.pattern.base': `"Email" doesn't look like an email`,
  }),
});

/**
 * Схема валидации обновления подписки пользователя.
 */
const subscriptionShema = Joi.object().keys({
  subscription: Joi.string().valid('starter', 'pro', 'business'),
});

user.post('save', handleMongooseError);

const userValidation = {
  userRegisterShema,
  userLoginShema,
  subscriptionShema,
};

const User = model('user', user);

module.exports = { User, userValidation };
