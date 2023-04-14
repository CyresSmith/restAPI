const {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
} = require('./contactsController');

const {
  register,
  login,
  current,
  subscription,
  logout,
} = require('./authController');

module.exports = {
  getAll,
  getById,
  create,
  update,
  updateStatus,
  remove,
  register,
  login,
  current,
  subscription,
  logout,
};
