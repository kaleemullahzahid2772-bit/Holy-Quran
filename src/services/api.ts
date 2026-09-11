import { UserProfile, InstitutionProfile, ProjectData, ProjectTimeline, ReferenceStyleProfile, MediaItem } from '../types/editor';

let currentUserId = localStorage.getItem('ai_editor_user_id') || 'usr_premium';

export function setUserId(userId: string) {
  currentUserId = userId;
  localStorage.setItem('ai_editor_user_id', userId);
}

export function getUserId() {
  return currentUserId;
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    'x-user-id': currentUserId
  };
}

export const api = {
  // Auth
  async getCurrentUser(): Promise<{ user: UserProfile }> {
    const res = await fetch('/api/auth/current', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch user');
    return res.json();
  },

  async switchUser(userId: string): Promise<{ user: UserProfile }> {
    setUserId(userId);
    const res = await fetch('/api/auth/switch-user', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ userId })
    });
    if (!res.ok) throw new Error('Failed to switch persona');
    return res.json();
  },

  // Institution
  async getInstitutionProfile(): Promise<{ profile: InstitutionProfile }> {
    const res = await fetch('/api/institution/profile', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch institution profile');
    return res.json();
  },

  async saveInstitutionProfile(profile: InstitutionProfile): Promise<{ success: boolean; profile: InstitutionProfile }> {
    const res = await fetch('/api/institution/profile', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(profile)
    });
    if (!res.ok) throw new Error('Failed to save institution profile');
    return res.json();
  },

  async getBackgrounds(category?: string) {
    const query = category ? `?category=${encodeURIComponent(category)}` : '';
    const res = await fetch(`/api/institution/backgrounds${query}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch backgrounds');
    return res.json();
  },

  // File Upload
  async uploadFile(file: File): Promise<{ success: boolean; file: { url: string; filename: string; size: number; mimetype: string } }> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'x-user-id': currentUserId
      },
      body: formData
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },

  // AI Operations
  async analyzeReferenceVideo(fileMeta: any, clientAnalysis: any): Promise<{ success: boolean; styleProfile: ReferenceStyleProfile; remainingCredits: number }> {
    const res = await fetch('/api/ai/analyze-reference', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ fileMeta, clientAnalysis })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Reference analysis failed');
    }
    return res.json();
  },

  async autoEdit({
    userClips,
    referenceStyle,
    institutionProfile,
    aspectRatio,
    targetDuration,
    userInstructions,
    selectedBackground,
    voiceAudio
  }: {
    userClips: MediaItem[];
    referenceStyle?: ReferenceStyleProfile | null;
    institutionProfile?: InstitutionProfile | null;
    aspectRatio: string;
    targetDuration?: number;
    userInstructions?: string;
    selectedBackground?: any;
    voiceAudio?: any;
  }): Promise<{ success: boolean; timeline: ProjectTimeline; remainingCredits: number }> {
    const res = await fetch('/api/ai/auto-edit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        userClips,
        referenceStyle,
        institutionProfile,
        aspectRatio,
        targetDuration,
        userInstructions,
        selectedBackground,
        voiceAudio
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Auto Edit failed');
    }
    return res.json();
  },

  async chatEdit({
    message,
    currentTimeline,
    institutionProfile,
    referenceStyle,
    selectedElementId,
    history
  }: {
    message: string;
    currentTimeline: ProjectTimeline;
    institutionProfile?: InstitutionProfile | null;
    referenceStyle?: ReferenceStyleProfile | null;
    selectedElementId?: string | null;
    history?: any[];
  }): Promise<{
    success: boolean;
    actionType: string;
    mutatedTimeline: ProjectTimeline;
    explanation: string;
    language: string;
    remainingCredits: number;
  }> {
    const res = await fetch('/api/ai/chat-edit', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        message,
        currentTimeline,
        institutionProfile,
        referenceStyle,
        selectedElementId,
        history
      })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'AI Chat Edit failed');
    }
    return res.json();
  },

  // Projects
  async getProjects(): Promise<{ projects: ProjectData[] }> {
    const res = await fetch('/api/projects', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch projects');
    return res.json();
  },

  async saveProject(project: Partial<ProjectData>): Promise<{ success: boolean; project: ProjectData }> {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(project)
    });
    if (!res.ok) throw new Error('Failed to save project');
    return res.json();
  },

  async saveProjectVersion(projectId: string, label: string, timeline: ProjectTimeline) {
    const res = await fetch(`/api/projects/${projectId}/version`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ label, timeline })
    });
    if (!res.ok) throw new Error('Failed to snapshot project version');
    return res.json();
  },

  // Admin
  async getAdminMetrics() {
    const res = await fetch('/api/admin/metrics', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch admin metrics');
    return res.json();
  },

  async adjustUserCredits(targetUserId: string, amount: number) {
    const res = await fetch(`/api/admin/users/${targetUserId}/credits`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ amount })
    });
    if (!res.ok) throw new Error('Failed to adjust credits');
    return res.json();
  },

  async updateUserTier(targetUserId: string, role: string, subscription: string) {
    const res = await fetch(`/api/admin/users/${targetUserId}/tier`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ role, subscription })
    });
    if (!res.ok) throw new Error('Failed to update tier');
    return res.json();
  }
};
