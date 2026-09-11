import React, { useState, useRef } from 'react';
import {
  FileVideo,
  Sparkles,
  CheckCircle2,
  Clock,
  Palette,
  Shuffle,
  Eye,
  Layers,
  ArrowRight,
  AlertCircle,
  Loader2,
  Volume2
} from 'lucide-react';
import { ReferenceStyleProfile } from '../types/editor';
import { analyzeVideoFile } from '../services/videoAnalyzer';
import { api } from '../services/api';

interface ReferenceVideoInspectorProps {
  referenceProfile: ReferenceStyleProfile | null;
  onReferenceAnalyzed: (profile: ReferenceStyleProfile) => void;
  onClearReference: () => void;
  onDeductCredits: (amount: number) => void;
}

export const ReferenceVideoInspector: React.FC<ReferenceVideoInspectorProps> = ({
  referenceProfile,
  onReferenceAnalyzed,
  onClearReference,
  onDeductCredits
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsAnalyzing(true);
      setErrorMsg('');
      setStatusMessage('Decoding video stream and extracting keyframes...');

      // Step 1: Real client-side frame decoding & scene detection
      const clientAnalysis = await analyzeVideoFile(file);

      setStatusMessage('Analyzing visual pacing, rhythm, and color grades...');
      const fileMeta = {
        filename: file.name,
        size: file.size,
        duration: clientAnalysis.duration,
        width: clientAnalysis.width,
        height: clientAnalysis.height,
        fps: clientAnalysis.fps
      };

      setStatusMessage('Synthesizing Reference Style Profile with AI...');
      // Step 2: Send to backend reference analyzer
      const res = await api.analyzeReferenceVideo(fileMeta, clientAnalysis);

      if (res.success && res.styleProfile) {
        onReferenceAnalyzed(res.styleProfile);
        onDeductCredits(res.remainingCredits);
      }
    } catch (err: any) {
      console.error('Reference analysis failed:', err);
      setErrorMsg(err.message || 'Failed to process reference video.');
    } finally {
      setIsAnalyzing(false);
      setStatusMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLoadDemoReference = async (preset: 'social_reel' | 'documentary') => {
    try {
      setIsAnalyzing(true);
      setErrorMsg('');
      setStatusMessage('Loading Islamic Reference Video & decoding scenes...');

      const isReel = preset === 'social_reel';
      const fileMeta = {
        filename: isReel ? 'Islamic_Promo_Reel_9x16.mp4' : 'Madrasah_Documentary_16x9.mp4',
        size: 15400000,
        duration: isReel ? 28 : 45,
        width: isReel ? 1080 : 1920,
        height: isReel ? 1920 : 1080,
        fps: 30
      };

      const mockClientAnalysis = {
        duration: fileMeta.duration,
        width: fileMeta.width,
        height: fileMeta.height,
        fps: 30,
        scenes: isReel
          ? [
              { index: 1, startTime: 0, endTime: 2.2, duration: 2.2, shotType: 'establishing_campus_hero', dominantMotion: 'ken_burns_zoom_in', colorTone: '#0F3E26' },
              { index: 2, startTime: 2.2, endTime: 4.4, duration: 2.2, shotType: 'student_tilawat_quran', dominantMotion: 'subtle_pan_right', colorTone: '#1A3323' },
              { index: 3, startTime: 4.4, endTime: 6.8, duration: 2.4, shotType: 'calligraphy_close_up', dominantMotion: 'slow_zoom_in', colorTone: '#D4AF37' },
              { index: 4, startTime: 6.8, endTime: 9.0, duration: 2.2, shotType: 'classroom_discussion', dominantMotion: 'steady_focus', colorTone: '#13281E' },
              { index: 5, startTime: 9.0, endTime: 11.2, duration: 2.2, shotType: 'institution_seal_outro', dominantMotion: 'fade_to_black', colorTone: '#000000' }
            ]
          : [
              { index: 1, startTime: 0, endTime: 4.0, duration: 4.0, shotType: 'establishing_aerial_mosque', dominantMotion: 'slow_cinematic_glide', colorTone: '#162C3D' },
              { index: 2, startTime: 4.0, endTime: 8.5, duration: 4.5, shotType: 'library_scholars_hadith', dominantMotion: 'slow_pan_left', colorTone: '#34261B' },
              { index: 3, startTime: 8.5, endTime: 13.0, duration: 4.5, shotType: 'student_group_study', dominantMotion: 'gentle_push_in', colorTone: '#193A24' },
              { index: 4, startTime: 13.0, endTime: 17.5, duration: 4.5, shotType: 'institution_credentials_outro', dominantMotion: 'fade_to_black', colorTone: '#0A0A0A' }
            ],
        dominantColorPalette: ['#0D5C3A', '#D4AF37', '#1E293B', '#F8FAFC']
      };

      const res = await api.analyzeReferenceVideo(fileMeta, mockClientAnalysis);
      if (res.success && res.styleProfile) {
        onReferenceAnalyzed(res.styleProfile);
        onDeductCredits(res.remainingCredits);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to analyze demo reference video.');
    } finally {
      setIsAnalyzing(false);
      setStatusMessage('');
    }
  };

  return (
    <div className="bg-slate-900 border-b border-slate-800 p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <FileVideo className="w-4 h-4 text-amber-400" />
          <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            Reference Video Intelligence
          </h3>
          <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-medium">
            Style Transfer Engine
          </span>
        </div>
        {referenceProfile && (
          <button
            onClick={onClearReference}
            className="text-[11px] text-slate-400 hover:text-red-400 transition"
          >
            Clear Reference
          </button>
        )}
      </div>

      {/* Analysis Error Warning */}
      {errorMsg && (
        <div className="mb-2 p-2 bg-red-950/40 border border-red-500/40 rounded-lg text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Upload or Active Profile */}
      {!referenceProfile ? (
        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {isAnalyzing ? (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-6 h-6 text-emerald-400 animate-spin mb-2" />
              <span className="text-xs font-semibold text-slate-200">{statusMessage}</span>
              <span className="text-[10px] text-slate-500 mt-1">
                Zero &quot;I can&apos;t see the video&quot; promise: decoding frames and scene rhythm
              </span>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 w-full border border-dashed border-slate-700 hover:border-amber-500/70 bg-slate-900/60 hover:bg-amber-950/20 rounded-lg p-3 cursor-pointer text-center transition group"
              >
                <FileVideo className="w-5 h-5 text-slate-400 group-hover:text-amber-400 mx-auto mb-1 transition" />
                <div className="text-xs font-semibold text-slate-300 group-hover:text-amber-300 transition">
                  Upload Any Reference Video (MP4/WebM)
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  AI extracts pacing, transitions, camera motion, and visual structure (10 Credits)
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex sm:flex-col gap-1.5 shrink-0 w-full sm:w-auto">
                <button
                  onClick={() => handleLoadDemoReference('social_reel')}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 px-3 py-1.5 rounded-lg transition"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Demo Reel (9:16)</span>
                </button>
                <button
                  onClick={() => handleLoadDemoReference('documentary')}
                  className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold text-teal-400 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 px-3 py-1.5 rounded-lg transition"
                >
                  <Layers className="w-3 h-3" />
                  <span>Demo Doc (16:9)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Active Reference Profile Display */
        <div className="bg-slate-950/80 border border-emerald-500/30 rounded-xl p-3">
          {/* Status Badge */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="text-xs font-bold text-slate-200">
                  {referenceProfile.sourceFilename}
                </span>
                <span className="text-[10px] text-slate-400 ml-2">
                  ({referenceProfile.videoSpecs.durationSeconds}s, {referenceProfile.videoSpecs.detectedAspectRatio}, {referenceProfile.pacing.shotCount} shots detected)
                </span>
              </div>
            </div>
            <span className="text-[10px] font-semibold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
              Style Profile Active
            </span>
          </div>

          {/* DNA Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-1">
                <Clock className="w-3 h-3 text-amber-400" /> PACING & RHYTHM
              </div>
              <div className="font-bold text-slate-200 capitalize">
                {referenceProfile.pacing.category.replace('_', ' ')}
              </div>
              <div className="text-[10px] text-slate-400">
                ~{referenceProfile.pacing.averageShotLengthSec}s per shot
              </div>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-1">
                <Shuffle className="w-3 h-3 text-teal-400" /> TRANSITIONS
              </div>
              <div className="font-bold text-slate-200 capitalize">
                {referenceProfile.transitions.primary}
              </div>
              <div className="text-[10px] text-slate-400">
                {referenceProfile.transitions.frequency}
              </div>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-1">
                <Palette className="w-3 h-3 text-emerald-400" /> COLOR & MOOD
              </div>
              <div className="font-bold text-slate-200 truncate">
                {referenceProfile.compositionAndColor.colorGrade}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {referenceProfile.purposeAndMood}
              </div>
            </div>

            <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-1">
                <Volume2 className="w-3 h-3 text-amber-400" /> AUDIO SYNC
              </div>
              <div className="font-bold text-slate-200 truncate">
                Speech-Driven Cuts
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {referenceProfile.audioAndVoiceRelation.speechMusicBalance}
              </div>
            </div>
          </div>

          {/* Extracted Scenes Visual Ribbon */}
          {referenceProfile.scenesBreakdown && referenceProfile.scenesBreakdown.length > 0 && (
            <div className="mt-2.5 pt-2 border-t border-slate-800/80">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Extracted Scene Blueprint ({referenceProfile.scenesBreakdown.length} shots)</span>
                <span className="text-slate-500 font-normal">Reference principles will be applied to user footage</span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {referenceProfile.scenesBreakdown.map((s) => (
                  <div
                    key={s.index}
                    className="shrink-0 w-24 bg-slate-900 rounded p-1.5 border border-slate-800 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Shot {s.index}</span>
                      <span className="font-semibold text-emerald-400">{s.duration}s</span>
                    </div>
                    <div className="text-[9px] text-slate-300 font-medium truncate mt-1 capitalize">
                      {s.shotType.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[8px] text-slate-500 truncate capitalize">
                      {s.dominantMotion.replace(/_/g, ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
