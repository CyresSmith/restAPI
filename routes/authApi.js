const express = require('express');
const router = express.Router();

const ctrl = require('../controller');
const { userValidation } = require('../schemas');
const { authentication, upload } = require('../middlewares');
const { validateBody } = require('../helpers');

const { userRegisterShema, emailShema, userLoginShema, subscriptionShema } =
  userValidation;

router.post('/register', validateBody(userRegisterShema), ctrl.register);

router.get('/verify/:verifycationToken', ctrl.verify);

router.post('/verify', validateBody(emailShema), ctrl.reVerify);

router.post('/login', validateBody(userLoginShema), ctrl.login);

router.get('/current', authentication, ctrl.current);

router.patch(
  '/',
  authentication,
  validateBody(subscriptionShema),
  ctrl.subscription
);

router.post('/logout', authentication, ctrl.logout);

router.patch(
  '/avatars',
  authentication,
  upload.single('avatar'),
  ctrl.updateAvatar
);

module.exports = router;
