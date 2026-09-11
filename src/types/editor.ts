export type AspectRatio = '9:16' | '16:9' | '1:1';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'free' | 'premium' | 'admin';
  credits: number;
  totalCreditsUsed: number;
  subscription: string;
  projectsCount: number;
  createdAt: string;
}

export interface InstitutionProfile {
  institutionName: string;
  tagline: string;
  logoUrl: string;
  buildingUrl: string;
  classroomUrl: string;
  mosqueUrl: string;
  teacherUrls: string[];
  studentUrls: string[];
  brandColors: {
    primary: string;
    accent: string;
    text: string;
  };
  contactInfo: {
    phone: string;
    website: string;
    location: string;
  };
}

export interface MediaItem {
  id: string;
  title: string;
  url: string;
  thumbnailUrl?: string;
  type: 'video' | 'image' | 'audio';
  duration: number; // in seconds
  width?: number;
  height?: number;
  sourceStart?: number;
  sourceDuration?: number;
  salientScore?: number; // 0-100 quality indicator
  category?: 'student' | 'campus' | 'document' | 'b_roll' | 'speech' | 'general';
}

export interface SceneMarker {
  index: number;
  startTime: number;
  endTime: number;
  duration: number;
  shotType: string;
  dominantMotion: string;
  colorTone: string;
  thumbnailUrl?: string;
}

export interface ReferenceStyleProfile {
  id: string;
  sourceFilename: string;
  analyzedAt: string;
  status: 'analyzed_successfully' | 'processing' | 'failed';
  videoSpecs: {
    durationSeconds: number;
    resolution: string;
    detectedAspectRatio: AspectRatio;
    fps: number;
  };
  editingStyle: string;
  purposeAndMood: string;
  pacing: {
    category: 'fast_punchy' | 'medium_balanced' | 'serene_slow';
    averageShotLengthSec: number;
    rhythm: string;
    shotCount: number;
  };
  transitions: {
    primary: string;
    secondary: string;
    frequency: string;
    recommendedTransitions: string[];
  };
  cameraMovement: {
    pattern: string;
    zoomRate: string;
    slowMotionUsage: string;
  };
  compositionAndColor: {
    colorGrade: string;
    lightingTone: string;
    aspectRatio: AspectRatio;
  };
  brandingAndGraphics: {
    introStructure: string;
    outroStructure: string;
    logoPlacement: string;
    typographyStyle: string;
  };
  audioAndVoiceRelation: {
    speechMusicBalance: string;
    cutAlignment: string;
  };
  scenesBreakdown: SceneMarker[];
  creativeDirectivesForUserClips: string[];
}

export interface VisualClip {
  id: string;
  type: 'video' | 'image';
  sourceUrl: string;
  thumbnailUrl?: string;
  title: string;
  startTime: number; // timeline start in seconds
  duration: number; // length on timeline
  sourceStart: number; // trim in point
  sourceDuration: number; // trim length
  transition: 'cut' | 'dissolve' | 'fade_black' | 'zoom_in' | 'slide_left';
  animation?: 'none' | 'ken_burns_zoom_in' | 'ken_burns_pan_right' | 'subtle_punch_in' | 'slow_pan_left';
  filter?: string;
  speed?: number;
  volume?: number;
  scale?: number;
}

export interface OverlayClip {
  id: string;
  type: 'logo' | 'watermark' | 'badge' | 'lower_third';
  sourceUrl: string;
  startTime: number;
  duration: number;
  position: 'top_left' | 'top_right' | 'bottom_left' | 'bottom_right' | 'center' | 'center_lower';
  size: 'small' | 'medium' | 'large';
  opacity: number;
}

export interface TextClip {
  id: string;
  text: string;
  subtext?: string;
  startTime: number;
  duration: number;
  position: 'top' | 'center' | 'bottom' | 'center_lower';
  style: {
    font: string;
    color: string;
    bgColor?: string;
    fontSize?: number;
  };
}

export interface AudioTrackClip {
  id: string;
  title: string;
  type: 'music' | 'voice' | 'sfx';
  sourceUrl: string;
  startTime: number;
  duration: number;
  volume: number;
  fadeIn?: number;
  fadeOut?: number;
}

export interface TimelineTracks {
  visual: VisualClip[];
  overlay: OverlayClip[];
  text: TextClip[];
  audio: AudioTrackClip[];
}

export interface ProjectTimeline {
  id: string;
  title: string;
  aspectRatio: AspectRatio;
  totalDuration: number;
  styleProfileApplied?: string;
  colorGrading?: string;
  aiReasoning?: string[];
  selectedBackground?: {
    name: string;
    url: string;
    type: 'image' | 'video';
  };
  tracks: TimelineTracks;
}

export interface ProjectVersion {
  versionId: string;
  label: string;
  timestamp: string;
  timeline: ProjectTimeline;
}

export interface ProjectData {
  id: string;
  userId: string;
  title: string;
  aspectRatio: AspectRatio;
  createdAt: string;
  updatedAt: string;
  timeline: ProjectTimeline;
  referenceStyle?: ReferenceStyleProfile;
  userClips: MediaItem[];
  versions: ProjectVersion[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  language?: 'en' | 'ur' | 'roman_ur';
  actionType?: string;
  timelineSnapshot?: ProjectTimeline;
}
