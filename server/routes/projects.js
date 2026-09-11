import express from 'express';
import { store } from '../db/store.js';

const router = express.Router();

// GET /api/projects - List projects for current user
router.get('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_premium';
  const projects = store.getProjects(userId);
  res.json({ projects });
});

// GET /api/projects/:id - Get project details
router.get('/:id', (req, res) => {
  const project = store.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json({ project });
});

// POST /api/projects - Create or update project
router.post('/', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_premium';
  const projectData = req.body;
  
  if (!projectData.id) {
    projectData.id = 'proj_' + Date.now();
  }
  projectData.userId = userId;

  // Initialize version history if absent
  if (!projectData.versions) {
    projectData.versions = [
      {
        versionId: 'v1',
        label: 'Initial Project',
        timestamp: new Date().toISOString(),
        timeline: projectData.timeline || null
      }
    ];
  }

  const saved = store.saveProject(projectData);
  res.json({ success: true, project: saved });
});

// POST /api/projects/:id/version - Create a new project version snapshot
router.post('/:id/version', (req, res) => {
  const project = store.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found' });
  }

  const { label, timeline } = req.body;
  if (!project.versions) project.versions = [];

  const newVersion = {
    versionId: 'v' + (project.versions.length + 1),
    label: label || `Version ${project.versions.length + 1}`,
    timestamp: new Date().toISOString(),
    timeline
  };

  project.versions.push(newVersion);
  store.saveProject(project);

  res.json({ success: true, version: newVersion, versions: project.versions });
});

// DELETE /api/projects/:id
router.delete('/:id', (req, res) => {
  const userId = req.headers['x-user-id'] || 'usr_premium';
  const deleted = store.deleteProject(req.params.id, userId);
  res.json({ success: deleted });
});

export default router;
