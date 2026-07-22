const express = require('express');
const prisma = require('../config/prisma');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const { loginSchema, registerSchema } = require('../validators/authValidators');
const authController = require('../controllers/authController');

const router = express.Router();

// Allows exactly one open registration: bootstrapping the first SUPER_ADMIN
// when the admins table is empty. After that, only an authenticated
// SUPER_ADMIN can create further admins.
const guardRegister = asyncHandler(async (req, res, next) => {
  const count = await prisma.admin.count();
  if (count === 0) return next();

  return authenticate(req, res, (err) => {
    if (err) return next(err);
    return requireRole('SUPER_ADMIN')(req, res, next);
  });
});

router.post('/register', guardRegister, validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authenticate, authController.me);

module.exports = router;
