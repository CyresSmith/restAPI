const express = require('express');
const router = express.Router();

const { isValidId, authentication } = require('../middlewares');
const { validateBody } = require('../helpers');
const ctrl = require('../controller');
const { contactsValidation } = require('../schemas');

const { contactAddShema, contactUpdateShema, statusUpdateShema } =
  contactsValidation;

router.get('/', authentication, ctrl.getAll);

router.get('/:id', authentication, isValidId, ctrl.getById);

router.post('/', authentication, validateBody(contactAddShema), ctrl.create);

router.put(
  '/:id',
  authentication,
  isValidId,
  validateBody(contactUpdateShema),
  ctrl.update
);

router.patch(
  '/:id/favorite',
  authentication,
  isValidId,
  validateBody(statusUpdateShema),
  ctrl.updateStatus
);

router.delete('/:id', authentication, isValidId, ctrl.remove);

module.exports = router;
