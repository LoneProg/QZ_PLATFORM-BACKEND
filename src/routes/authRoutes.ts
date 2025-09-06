import express from 'express';
import {
  register,
  login,
  forgotPassword,
  changePassword,
} from '../controllers/authController';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/change-password/:token', changePassword);

export default router;