import { Router } from 'express';
import {
  checkEmail,
  loginWithEmail,
  registerWithEmail,
  startGoogleOAuth,
  handleGoogleCallback,
  handleGoogleLogin,
  getCurrentUser,
  getAuthConfig,
} from '../controllers/authController';

const router = Router();

// Pinterest-style: Check if email exists
router.post('/check-email', checkEmail);

// Email + Password login
router.post('/login', loginWithEmail);

// Email + Password registration
router.post('/register', registerWithEmail);

// Google OAuth redirect start
router.get('/google/start', startGoogleOAuth);

// Google OAuth redirect callback
router.get('/google/callback', handleGoogleCallback);

// Google OAuth credential / One-Tap / popup exchange
router.post('/google', handleGoogleLogin);

// Current user profile from JWT
router.get('/me', getCurrentUser);

// Auth configuration
router.get('/config', getAuthConfig);

export default router;
