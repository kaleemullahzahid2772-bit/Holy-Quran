import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// Built-in Islamic background & B-Roll library
const BACKGROUND_LIBRARY = [
  {
    id: 'bg_madrasah_1',
    category: 'Madrasah',
    title: 'Traditional Madrasah Study Hall',
    thumbnailUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['education', 'madrasah', 'books', 'carpet']
  },
  {
    id: 'bg_quran_classroom_1',
    category: 'Quran Classroom',
    title: 'Illuminated Quranic Classroom with Desks',
    thumbnailUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['classroom', 'study', 'students', 'desks']
  },
  {
    id: 'bg_mosque_grand_1',
    category: 'Mosque',
    title: 'Grand Mosque Arches & Marble Columns',
    thumbnailUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['mosque', 'spiritual', 'architecture', 'reverence']
  },
  {
    id: 'bg_quran_open_1',
    category: 'Quran',
    title: 'Open Quran with Golden Rihal Wood Stand',
    thumbnailUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['quran', 'rihal', 'tilawat', 'calligraphy']
  },
  {
    id: 'bg_islamic_books_1',
    category: 'Islamic Books',
    title: 'Classical Islamic Hadith & Fiqh Library',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1507842229451-7f01be8610ce?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['library', 'books', 'scholarship', 'study']
  },
  {
    id: 'bg_podcast_studio_1',
    category: 'Islamic Podcast Studio',
    title: 'Modern Dawah & Educational Podcast Studio',
    thumbnailUrl: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['podcast', 'microphone', 'studio', 'modern']
  },
  {
    id: 'bg_cinematic_gold_1',
    category: 'Cinematic',
    title: 'Golden Sunset over Minarets',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['cinematic', 'sunset', 'minarets', 'golden']
  },
  {
    id: 'bg_abstract_arabesque_1',
    category: 'Abstract',
    title: 'Deep Emerald & Gold Islamic Geometric Arabesque',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['geometric', 'arabesque', 'emerald', 'luxury']
  },
  {
    id: 'bg_simple_dark_1',
    category: 'Simple Backgrounds',
    title: 'Minimalist Charcoal Vignette Studio Backdrop',
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1920&auto=format&fit=crop&q=80',
    type: 'image',
    tags: ['simple', 'clean', 'portrait', 'minimal']
  }
];

// GET /api/institution/profile
router.get('/profile', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_premium';
  const profile = store.getInstitutionProfile(userId);
  res.json({ profile });
});

// POST /api/institution/profile
router.post('/profile', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_premium';
  const saved = store.saveInstitutionProfile(userId, req.body);
  res.json({ success: true, profile: saved });
});

// GET /api/institution/backgrounds
router.get('/backgrounds', (req, res) => {
  const { category } = req.query;
  let items = BACKGROUND_LIBRARY;
  if (category && category !== 'All') {
    items = items.filter(b => b.category.toLowerCase() === category.toLowerCase());
  }
  res.json({
    categories: [
      'All',
      'Madrasah',
      'Quran Classroom',
      'Mosque',
      'Quran',
      'Islamic Books',
      'Islamic Podcast Studio',
      'Cinematic',
      'Abstract',
      'Simple Backgrounds'
    ],
    backgrounds: items
  });
});

export default router;
