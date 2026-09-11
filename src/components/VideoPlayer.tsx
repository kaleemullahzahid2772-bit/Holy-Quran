import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';
import { ProjectTimeline, AspectRatio } from '../types/editor';
import { renderTimelineFrame, getCanvasDimensions } from '../services/videoCompositor';

interface VideoPlayerProps {
  timeline: ProjectTimeline;
  currentTime: number;
  onSeek: (time: number) => void;
  onTriggerAutoEdit: () => void;
  isAutoEditing: boolean;
  aspectRatio: AspectRatio;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  timeline,
  currentTime,
  onSeek,
  onTriggerAutoEdit,
  isAutoEditing,
  aspectRatio
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(performance.now());

  const totalDuration = timeline?.totalDuration || 10;

  // Render active frame whenever currentTime or timeline changes
  const drawCurrentFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    renderTimelineFrame(ctx, timeline, currentTime, canvas.width, canvas.height);
  }, [timeline, currentTime]);

  useEffect(() => {
    drawCurrentFrame();
  }, [drawCurrentFrame]);

  // Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      return;
    }

    lastTickTimeRef.current = performance.now();

    const loop = (now: number) => {
      const deltaSec = (now - lastTickTimeRef.current) / 1000;
      lastTickTimeRef.current = now;

      let nextTime = currentTime + deltaSec;
      if (nextTime >= totalDuration) {
        nextTime = 0;
        setIsPlaying(false);
      }
      onSeek(nextTime);

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
    };
  }, [isPlaying, currentTime, totalDuration, onSeek]);

  const togglePlay = () => {
    if (currentTime >= totalDuration - 0.1) {
      onSeek(0);
    }
    setIsPlaying(!isPlaying);
  };

  const stepFrame = (deltaFrames: number) => {
    setIsPlaying(false);
    const newTime = Math.max(0, Math.min(totalDuration, currentTime + deltaFrames * (1 / 30)));
    onSeek(parseFloat(newTime.toFixed(2)));
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 10);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms}`;
  };

  // Dimensions based on aspect ratio
  const { width: renderWidth, height: renderHeight } = getCanvasDimensions(aspectRatio, 720);

  // Compute CSS aspect ratio classes
  const aspectClass =
    aspectRatio === '9:16'
      ? 'aspect-[9/16] max-h-[460px]'
      : aspectRatio === '1:1'
      ? 'aspect-square max-h-[460px]'
      : 'aspect-[16/9] max-h-[460px]';

  return (
    <div className="flex flex-col h-full bg-slate-950 items-center justify-between p-3 relative">
      {/* Top Bar: Prominent AI AUTO EDIT Button & Indicators */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
            Canvas Preview ({aspectRatio})
          </span>
          {timeline?.colorGrading && (
            <span className="text-[11px] text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded truncate max-w-xs">
              Look: {timeline.colorGrading}
            </span>
          )}
        </div>

        {/* PROMINENT AI EDIT BUTTON (Section 5 Requirement) */}
        <button
          onClick={onTriggerAutoEdit}
          disabled={isAutoEditing}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 hover:from-amber-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/60 transition active:scale-95 disabled:opacity-50"
        >
          {isAutoEditing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              <span>AI Is Editing Video...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>AI AUTO EDIT</span>
            </>
          )}
        </button>
      </div>

      {/* Canvas Viewport Frame */}
      <div className="flex-1 flex items-center justify-center w-full min-h-0 relative">
        <div
          className={`${aspectClass} w-auto h-full max-w-full rounded-xl overflow-hidden shadow-2xl border border-slate-800 relative bg-black flex items-center justify-center`}
        >
          <canvas
            ref={canvasRef}
            width={renderWidth}
            height={renderHeight}
            className="w-full h-full object-contain cursor-pointer"
            onClick={togglePlay}
          />

          {/* Center Play Overlay when paused */}
          {!isPlaying && !isAutoEditing && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-black/20 hover:bg-black/10 flex items-center justify-center cursor-pointer transition group"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-600/90 group-hover:bg-emerald-500 text-white flex items-center justify-center shadow-xl shadow-black/50 transition transform group-hover:scale-110">
                <Play className="w-6 h-6 fill-white translate-x-0.5" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Transport Controls */}
      <div className="w-full max-w-2xl bg-slate-900/90 border border-slate-800 rounded-xl p-2.5 mt-2 flex items-center justify-between gap-3 backdrop-blur">
        {/* Play / Step Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onSeek(0)}
            title="Jump to Start"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => stepFrame(-1)}
            title="Step 1 Frame Back"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={togglePlay}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow transition"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
          </button>
          <button
            onClick={() => stepFrame(1)}
            title="Step 1 Frame Forward"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Timecode */}
        <div className="text-xs font-mono font-medium text-slate-300 shrink-0">
          <span className="text-emerald-400">{formatTimecode(currentTime)}</span>
          <span className="text-slate-600"> / </span>
          <span>{formatTimecode(totalDuration)}</span>
        </div>

        {/* Scrubber Slider */}
        <div className="flex-1 flex items-center">
          <input
            type="range"
            min="0"
            max={totalDuration || 10}
            step="0.05"
            value={currentTime}
            onChange={(e) => {
              setIsPlaying(false);
              onSeek(parseFloat(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>

        {/* Audio Mute & Volume */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
