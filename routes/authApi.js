const express = require('express');
const router = express.Router();

const ctrl = require('../controller');
const { userValidation } = require('../schemas');
const { authentication } = require('../middlewares');
const { validateBody } = require('../helpers');

const { userRegisterShema, userLoginShema, subscriptionShema } = userValidation;

router.post('/register', validateBody(userRegisterShema), ctrl.register);
router.post('/login', validateBody(userLoginShema), ctrl.login);
router.get('/current', authentication, ctrl.current);
router.patch(
  '/',
  authentication,
  validateBody(subscriptionShema),
  ctrl.subscription
);
router.post('/logout', authentication, ctrl.logout);

module.exports = router;
