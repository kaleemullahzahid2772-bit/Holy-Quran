import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Default initial state
const defaultState = {
  users: [
    {
      id: 'usr_free',
      name: 'Usman Qadri (Free Tier)',
      email: 'usman@madrasah.edu',
      role: 'free',
      credits: 100,
      totalCreditsUsed: 0,
      subscription: 'free',
      projectsCount: 1,
      createdAt: '2026-09-01T08:00:00.000Z'
    },
    {
      id: 'usr_premium',
      name: 'Dar-ul-Uloom Media Center',
      email: 'media@darululoom.org',
      role: 'premium',
      credits: 1250,
      totalCreditsUsed: 350,
      subscription: 'premium_pro',
      projectsCount: 8,
      createdAt: '2026-08-15T10:00:00.000Z'
    },
    {
      id: 'usr_admin',
      name: 'System Administrator',
      email: 'admin@ai-editor.internal',
      role: 'admin',
      credits: 99999,
      totalCreditsUsed: 520,
      subscription: 'enterprise',
      projectsCount: 15,
      createdAt: '2026-07-01T00:00:00.000Z'
    }
  ],
  institutionProfiles: {
    usr_premium: {
      institutionName: 'Jamia Dar-ul-Uloom Media Wing',
      tagline: 'Excellence in Classical & Modern Islamic Education',
      logoUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=200&auto=format&fit=crop&q=80',
      buildingUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&auto=format&fit=crop&q=80',
      classroomUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      mosqueUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
      teacherUrls: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
      ],
      studentUrls: [
        'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80'
      ],
      brandColors: {
        primary: '#0D5C3A',
        accent: '#D4AF37',
        text: '#FFFFFF'
      },
      contactInfo: {
        phone: '+92 300 1234567',
        website: 'www.darululoom.edu.pk',
        location: 'Karachi, Pakistan'
      }
    },
    usr_free: {
      institutionName: 'Al-Huda Academy',
      tagline: 'Nurturing Minds with Divine Wisdom',
      logoUrl: '',
      buildingUrl: '',
      classroomUrl: '',
      mosqueUrl: '',
      teacherUrls: [],
      studentUrls: [],
      brandColors: {
        primary: '#1E3A8A',
        accent: '#EAB308',
        text: '#FFFFFF'
      },
      contactInfo: {
        phone: '+92 321 7654321',
        website: 'www.alhuda.edu',
        location: 'Lahore, Pakistan'
      }
    }
  },
  projects: [],
  auditLogs: [
    {
      id: 'log_init',
      timestamp: new Date().toISOString(),
      action: 'SYSTEM_BOOT',
      details: 'AI Video Editing Server and Data Store initialized.'
    }
  ]
};

class Store {
  constructor() {
    this.state = this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Error loading db.json, using defaults:', e);
    }
    this.save(defaultState);
    return JSON.parse(JSON.stringify(defaultState));
  }

  save(data = this.state) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving db.json:', e);
    }
  }

  // Users
  getUser(userId) {
    return this.state.users.find(u => u.id === userId);
  }

  updateUser(userId, updates) {
    const idx = this.state.users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      this.state.users[idx] = { ...this.state.users[idx], ...updates };
      this.save();
      return this.state.users[idx];
    }
    return null;
  }

  getAllUsers() {
    return this.state.users;
  }

  deductCredits(userId, amount, reason) {
    const user = this.getUser(userId);
    if (!user) throw new Error('User not found');
    if (user.role !== 'admin' && user.credits < amount) {
      throw new Error(`Insufficient credits. Required: ${amount}, Available: ${user.credits}`);
    }
    if (user.role !== 'admin') {
      user.credits -= amount;
      user.totalCreditsUsed = (user.totalCreditsUsed || 0) + amount;
    }
    this.addAuditLog(userId, 'CREDIT_DEDUCTION', { amount, reason, remaining: user.credits });
    this.save();
    return user.credits;
  }

  // Institution Profile
  getInstitutionProfile(userId) {
    return this.state.institutionProfiles[userId] || {
      institutionName: '',
      tagline: '',
      logoUrl: '',
      buildingUrl: '',
      classroomUrl: '',
      mosqueUrl: '',
      teacherUrls: [],
      studentUrls: [],
      brandColors: { primary: '#0D5C3A', accent: '#D4AF37', text: '#FFFFFF' },
      contactInfo: { phone: '', website: '', location: '' }
    };
  }

  saveInstitutionProfile(userId, profile) {
    this.state.institutionProfiles[userId] = {
      ...this.getInstitutionProfile(userId),
      ...profile
    };
    this.save();
    return this.state.institutionProfiles[userId];
  }

  // Projects
  getProjects(userId) {
    return this.state.projects.filter(p => p.userId === userId);
  }

  getProject(projectId) {
    return this.state.projects.find(p => p.id === projectId);
  }

  saveProject(project) {
    const idx = this.state.projects.findIndex(p => p.id === project.id);
    if (idx !== -1) {
      this.state.projects[idx] = { ...project, updatedAt: new Date().toISOString() };
    } else {
      this.state.projects.unshift({
        ...project,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      const user = this.getUser(project.userId);
      if (user) {
        user.projectsCount = (user.projectsCount || 0) + 1;
      }
    }
    this.save();
    return project;
  }

  deleteProject(projectId, userId) {
    const prevLen = this.state.projects.length;
    this.state.projects = this.state.projects.filter(p => !(p.id === projectId && p.userId === userId));
    const deleted = this.state.projects.length < prevLen;
    if (deleted) this.save();
    return deleted;
  }

  addAuditLog(userId, action, details) {
    this.state.auditLogs.unshift({
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      userId,
      timestamp: new Date().toISOString(),
      action,
      details
    });
    // Keep max 200 logs
    if (this.state.auditLogs.length > 200) {
      this.state.auditLogs = this.state.auditLogs.slice(0, 200);
    }
    this.save();
  }

  getAuditLogs() {
    return this.state.auditLogs;
  }
}

export const store = new Store();
