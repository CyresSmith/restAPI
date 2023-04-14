const { Contact } = require('../schemas');
const { httpError, ctrlWrapper } = require('../helpers');

/**
 * ============================ Получение всех контакта
 */
const getAllContacts = async (req, res) => {
  const { _id: owner } = req.user;

  const { page = 1, limit = 10, favorite = false } = req.query;

  const skip = (page - 1) * limit;

  const sortByFavorite = () => {
    if (!favorite) {
      return { owner };
    }
    return { owner, favorite };
  };

  const result = await Contact.find(sortByFavorite(), '-createdAt -updatedAt', {
    skip,
    limit,
  }).populate('owner', 'name email');

  if (!result) {
    throw httpError(404, 'Contacts not found');
  }

  res.status(200).json(result);
};

/**
 * ============================ Получение контакта по ID
 */
const getContactById = async (req, res) => {
  const { id } = req.params;

  const result = await Contact.findById(id);

  if (!result) {
    throw httpError(404, `Contact with id ${id} Not found`);
  }

  res.status(200).json(result);
};

/**
 * ============================ Добавление контакта
 */
const createContact = async (req, res) => {
  const { _id: owner } = req.user;
  const result = await Contact.create({ ...req.body, owner });
  res.status(201).json(result);
};

/**
 * ============================ Обновление контакта
 */
const updateContact = async (req, res) => {
  const { id } = req.params;

  const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });

  if (!result) {
    throw httpError(404, `Contact with id ${id} not found`);
  }

  return res.status(200).json(result);
};

/**
 * ============================ Обновление статуса контакта
 */
const updateStatus = async (req, res) => {
  const { id } = req.params;

  const result = await Contact.findByIdAndUpdate(id, req.body, { new: true });

  if (!result) {
    throw httpError(404, `Contact with id ${id} not found`);
  }

  return res.status(200).json(result);
};

/**
 * ============================ Удаление контакта
 */
const removeContact = async (req, res) => {
  const { id } = req.params;

  const removed = await Contact.findByIdAndRemove(id);

  if (!removed) {
    throw httpError(404, `Contact with id ${id} not found`);
  }

  res.status(200).json({ message: 'Contact successfully removed' });
};

module.exports = {
  getAll: ctrlWrapper(getAllContacts),
  getById: ctrlWrapper(getContactById),
  create: ctrlWrapper(createContact),
  update: ctrlWrapper(updateContact),
  updateStatus: ctrlWrapper(updateStatus),
  remove: ctrlWrapper(removeContact),
};
