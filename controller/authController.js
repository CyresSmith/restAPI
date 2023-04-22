const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
require('dotenv').config();

const { User } = require('../schemas');
const { httpError, ctrlWrapper, resizeImage } = require('../helpers');
const { SECRET } = process.env;
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

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarUrl,
  });

  res.status(201).json({
    name: newUser.name,
    email: newUser.email,
    subscription: newUser.subscription,
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
  login: ctrlWrapper(loginUser),
  current: ctrlWrapper(getCurrentUser),
  subscription: ctrlWrapper(subscriptionUpdate),
  logout: ctrlWrapper(logout),
  updateAvatar: ctrlWrapper(updateAvatar),
};
