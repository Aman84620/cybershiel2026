import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken, verifyToken } from '../middleware/auth.js';
import { getUsers, saveUser } from '../services/db.js';

const router = Router();

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@cybershield.com').toLowerCase();
const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').toLowerCase();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

/**
 * POST /api/auth/login
 * Sign In route for both Admin and Standard Users
 */
router.post('/login', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const inputIdentifier = (email || username || '').trim().toLowerCase();
    
    if (!inputIdentifier || !password) {
      return res.status(400).json({ message: 'Email address and password are required.' });
    }

    // 1. Check Admin login
    if (inputIdentifier === ADMIN_EMAIL || inputIdentifier === ADMIN_USERNAME) {
      if (password === ADMIN_PASSWORD) {
        const adminPayload = {
          id: 'admin_1',
          username: 'Administrator',
          email: ADMIN_EMAIL,
          role: 'admin',
        };
        const token = generateToken(adminPayload);

        return res.json({
          message: 'Admin authorization successful',
          token,
          user: adminPayload,
        });
      } else {
        return res.status(401).json({ message: 'Invalid administrator password.' });
      }
    }

    // 2. Check Standard Registered User login
    const allUsers = await getUsers();
    const foundUser = allUsers.find(
      u => u.email?.toLowerCase() === inputIdentifier || u.username?.toLowerCase() === inputIdentifier
    );

    if (!foundUser) {
      return res.status(404).json({ message: 'No account found with this email. Please Sign Up first.' });
    }

    const isValidPassword = await bcrypt.compare(password, foundUser.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Incorrect password. Please try again.' });
    }

    const userPayload = {
      id: foundUser.id,
      username: foundUser.username,
      email: foundUser.email,
      role: 'user',
    };
    const token = generateToken(userPayload);

    return res.json({
      message: 'Sign In successful',
      token,
      user: userPayload,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Authentication server error.' });
  }
});

/**
 * POST /api/auth/register
 * Sign Up route for Standard Users
 */
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanUsername = (username || email?.split('@')[0] || 'User').trim();

    if (!cleanEmail || !password) {
      return res.status(400).json({ message: 'Email address and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }

    // Check if email conflicts with Admin email
    if (cleanEmail === ADMIN_EMAIL || cleanUsername.toLowerCase() === ADMIN_USERNAME) {
      return res.status(400).json({ message: 'This email is reserved for system administration. Please Sign In.' });
    }

    // Check if user already exists in database
    const allUsers = await getUsers();
    const existingUser = allUsers.find(u => u.email?.toLowerCase() === cleanEmail);

    if (existingUser) {
      return res.status(400).json({ message: 'User account with this email already exists. Please Sign In.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      role: 'user',
      createdAt: new Date().toISOString(),
    };

    await saveUser(newUser);

    const userPayload = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      role: 'user',
    };
    const token = generateToken(userPayload);

    return res.status(201).json({
      message: 'Account created successfully',
      token,
      user: userPayload,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Account creation server error.' });
  }
});

/**
 * GET /api/auth/me
 * Validate current session and return decoded user profile
 */
router.get('/me', verifyToken, (req, res) => {
  res.json({
    user: req.user,
  });
});

export default router;
