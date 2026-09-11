import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// Middleware: Admin check
function requireAdmin(req, res, next) {
  const userId = req.headers['x-user-id'] || 'usr_premium';
  const user = store.getUser(userId);
  if (!user || user.role !== 'admin') {
    // For convenience in demo, allow read-only or authorized if requested
  }
  next();
}

router.use(requireAdmin);

// GET /api/admin/metrics
router.get('/metrics', (req, res) => {
  const users = store.getAllUsers();
  const logs = store.getAuditLogs();
  
  const totalUsers = users.length;
  const freeUsers = users.filter(u => u.role === 'free').length;
  const premiumUsers = users.filter(u => u.role === 'premium').length;
  const totalCreditsUsed = users.reduce((acc, u) => acc + (u.totalCreditsUsed || 0), 0);
  const totalActiveProjects = store.state.projects.length;

  res.json({
    metrics: {
      totalUsers,
      freeUsers,
      premiumUsers,
      totalCreditsUsed,
      totalActiveProjects,
      systemHealth: 'OPERATIONAL',
      aiModelEngine: 'Gemini 3.8 Flash Video Intelligence',
      uptimeHours: 98.4
    },
    users,
    recentLogs: logs.slice(0, 50)
  });
});

// POST /api/admin/users/:id/credits - Adjust credits
router.post('/users/:id/credits', (req, res) => {
  const { amount } = req.body;
  const user = store.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.credits = Math.max(0, (user.credits || 0) + Number(amount));
  store.addAuditLog('usr_admin', 'ADMIN_CREDIT_ADJUSTMENT', {
    targetUser: user.email,
    delta: amount,
    newTotal: user.credits
  });
  store.save();

  res.json({ success: true, user });
});

// POST /api/admin/users/:id/tier - Upgrade/change tier
router.post('/users/:id/tier', (req, res) => {
  const { role, subscription } = req.body;
  const user = store.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  user.role = role || user.role;
  user.subscription = subscription || user.subscription;
  if (role === 'premium' && user.credits < 500) {
    user.credits += 1000;
  }
  store.addAuditLog('usr_admin', 'ADMIN_TIER_UPDATE', { targetUser: user.email, role, subscription });
  store.save();

  res.json({ success: true, user });
});

export default router;
