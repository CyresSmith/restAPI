const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const { nanoid } = require('nanoid');
const path = require('path');

require('dotenv').config();

const { User } = require('../schemas');
const {
  httpError,
  ctrlWrapper,
  resizeImage,
  sendEmail,
} = require('../helpers');
const HttpError = require('../helpers/httpError');
const { SECRET, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

/**
 * ============================ Регистрация пользователя
 */
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    throw httpError(409, `Email in use`);
  }

  const hashPassword = await bcrypt.hash(password, 10);
  const avatarUrl = gravatar.url(email);

  const verifycationToken = nanoid();

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarUrl,
    verifycationToken,
  });

  const verifycationEmail = {
    to: `${email}`,
    subject: 'Verifycation email',
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${verifycationToken}" >Click here to verify your email</a>`,
  };

  await sendEmail(verifycationEmail);

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
    subscription: newUser.subscription,
  });
};

/**
 * ============================ Верификация пользователя
 */
const verify = async (req, res) => {
  const { verifycationToken } = req.params;

  const user = await User.findOne({ verifycationToken });

  if (!user) {
    throw HttpError(404, 'User not found');
  }

  await User.findByIdAndUpdate(user._id, {
    verify: true,
    verifycationToken: null,
  });

  res.status(200).json({
    message: `Verification successful`,
  });
};

/**
 * ============================ Повторная отсылка письма верификации пользователя
 */
const reVerify = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw HttpError(404, 'Email not found');
  }

  if (user.verify) {
    throw HttpError(400, 'Verification has already been passed');
  }

  const verifycationEmail = {
    email,
    subject: 'Verifycation email',
    html: `<a target="_blank" href="${BASE_URL}/api/users/verify/${user.verifycationCode}" >Click here to verify your email</a>`,
  };

  await sendEmail(verifycationEmail);

  res.status(200).json({
    message: `Verification email sent`,
  });
};

/**
 * ============================ Login пользователя
 */
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw httpError(401, `Email or password is wrong`);
  }

  if (!user.verify) {
    throw httpError(401, `Email not veryfi`);
  }

  const checkPassword = await bcrypt.compare(password, user.password);

  if (!checkPassword) {
    throw httpError(401, `Email or password is wrong`);
  }

  const payload = {
    id: user._id,
    name: user.name,
    email: user.email,
    subscription: user.subscription,
    avatarUrl: user.avatarUrl,
  };

  const token = jwt.sign(payload, SECRET, { expiresIn: '23h' });

  await User.findByIdAndUpdate(user._id, { token });

  res.status(200).json({
    token,
    user: payload,
  });
};

/**
 * ============================ Текущий пользователь
 */
const getCurrentUser = async (req, res) => {
  const { name, email, subscription } = req.user;

  res.status(200).json({ name, email, subscription });
};

/**
 * ============================ Обновление подписки пользователя
 */
const subscriptionUpdate = async (req, res) => {
  const { id } = req.user;
  const { subscription } = req.body;

  await User.findByIdAndUpdate(id, { subscription });

  res.status(200).json({
    message: `Subscription successfully updated to "${subscription}"`,
  });
};

/**
 * ============================ Logout пользователя
 */
const logout = async (req, res) => {
  const { id } = req.user;

  await User.findByIdAndUpdate(id, { token: null });

  res.status(200).json({ message: `Successfully logout` });
};

/**
 * ============================ Обновление аватарки пользователя
 */
const updateAvatar = async (req, res) => {
  const { id } = req.user;
  const { path: tempUpload, filename } = req.file;

  const avatarName = `${id}_${filename}`;
  const resultUpload = path.join(avatarsDir, avatarName);

  await resizeImage(tempUpload, 250, 250);

  await fs.rename(tempUpload, resultUpload);
  const avatarUrl = path.join('avatars', avatarName);

  await User.findByIdAndUpdate(id, { avatarUrl });

  res.status(200).json({
    avatarUrl,
    message: `Avatar successfully changed`,
  });
};

module.exports = {
  register: ctrlWrapper(registerUser),
  verify: ctrlWrapper(verify),
  reVerify: ctrlWrapper(reVerify),
  login: ctrlWrapper(loginUser),
  current: ctrlWrapper(getCurrentUser),
  subscription: ctrlWrapper(subscriptionUpdate),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
