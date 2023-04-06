const express = require('express');
const router = express.Router();

const ctrl = require('../controller');
const { validation } = require('../schemas');
const { validateBody } = require('../helpers');

const { contactAddShema, contactUpdateShema, statusUpdateShema } = validation;

router.get('/', ctrl.getAll);

router.get('/:id', ctrl.getById);

router.post('/', validateBody(contactAddShema), ctrl.create);

router.put('/:id', validateBody(contactUpdateShema), ctrl.update);

router.patch(
  '/:id/favorite',
  validateBody(statusUpdateShema),
  ctrl.updateStatus
);

router.delete('/:id', ctrl.remove);

module.exports = router;
