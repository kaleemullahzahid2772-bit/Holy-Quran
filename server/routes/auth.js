import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// GET /api/auth/current - Get current authenticated user details and credits
router.get('/current', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_premium';
  const user = store.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ user });
});

// POST /api/auth/switch-user - Switch active persona (for testing free, premium, admin)
router.post('/switch-user', (req, res) => {
  const { userId } = req.body;
  const user = store.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ success: true, user });
});

// POST /api/auth/login - Simple demo authentication
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = store.getAllUsers();
  const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());
  if (user) {
    return res.json({ success: true, user, token: 'jwt_' + user.id });
  }
  // If user doesn't exist, create a new free user
  const newUser = {
    id: 'usr_' + Date.now(),
    name: email.split('@')[0],
    email,
    role: 'free',
    credits: 100,
    totalCreditsUsed: 0,
    subscription: 'free',
    projectsCount: 0,
    createdAt: new Date().toISOString()
  };
  store.state.users.push(newUser);
  store.save();
  res.json({ success: true, user: newUser, token: 'jwt_' + newUser.id });
});

export default router;
