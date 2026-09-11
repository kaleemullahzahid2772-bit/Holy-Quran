import React, { useState, useRef } from 'react';
import {
  Scissors,
  Trash2,
  Copy,
  Gauge,
  Shuffle,
  Eye,
  Volume2,
  Plus,
  Type,
  Music,
  Film,
  Sparkles,
  Layers,
  Wand2
} from 'lucide-react';
import { ProjectTimeline, VisualClip, OverlayClip, TextClip, AudioTrackClip } from '../types/editor';

interface TimelineEditorProps {
  timeline: ProjectTimeline;
  currentTime: number;
  onSeek: (time: number) => void;
  onUpdateTimeline: (updatedTimeline: ProjectTimeline) => void;
  selectedClipId: string | null;
  onSelectClip: (id: string | null) => void;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  timeline,
  currentTime,
  onSeek,
  onUpdateTimeline,
  selectedClipId,
  onSelectClip
}) => {
  const [zoomLevel, setZoomLevel] = useState(25); // pixels per second
  const containerRef = useRef<HTMLDivElement>(null);

  const totalDuration = timeline?.totalDuration || 10;
  const visualClips = timeline?.tracks?.visual || [];
  const overlayClips = timeline?.tracks?.overlay || [];
  const textClips = timeline?.tracks?.text || [];
  const audioClips = timeline?.tracks?.audio || [];

  // Selected clip helper
  const selectedVisualClip = visualClips.find((c) => c.id === selectedClipId);

  // Timeline Scrub Click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left + containerRef.current.scrollLeft;
    const newTime = Math.max(0, Math.min(totalDuration, clickX / zoomLevel));
    onSeek(parseFloat(newTime.toFixed(2)));
  };

  // Split Clip at Playhead
  const handleSplitClip = () => {
    if (!selectedVisualClip) return;
    if (currentTime <= selectedVisualClip.startTime || currentTime >= selectedVisualClip.startTime + selectedVisualClip.duration) {
      alert('Playhead must be inside the selected clip to split it.');
      return;
    }

    const firstHalfDuration = parseFloat((currentTime - selectedVisualClip.startTime).toFixed(2));
    const secondHalfDuration = parseFloat((selectedVisualClip.duration - firstHalfDuration).toFixed(2));

    const updatedClips = [...visualClips];
    const idx = updatedClips.findIndex((c) => c.id === selectedVisualClip.id);

    const firstClip: VisualClip = {
      ...selectedVisualClip,
      duration: firstHalfDuration,
      sourceDuration: firstHalfDuration
    };

    const secondClip: VisualClip = {
      ...selectedVisualClip,
      id: 'clip_split_' + Date.now(),
      startTime: parseFloat(currentTime.toFixed(2)),
      duration: secondHalfDuration,
      sourceStart: (selectedVisualClip.sourceStart || 0) + firstHalfDuration,
      sourceDuration: secondHalfDuration,
      title: `${selectedVisualClip.title} (Part 2)`
    };

    updatedClips.splice(idx, 1, firstClip, secondClip);

    onUpdateTimeline({
      ...timeline,
      tracks: {
        ...timeline.tracks,
        visual: updatedClips
      }
    });
  };

  // Delete Clip
  const handleDeleteClip = (clipId?: string) => {
    const idToDelete = clipId || selectedClipId;
    if (!idToDelete) return;

    const filtered = visualClips.filter((c) => c.id !== idToDelete);

    // Recalculate start times and duration
    let t = 0;
    filtered.forEach((c) => {
      c.startTime = parseFloat(t.toFixed(2));
      t += c.duration;
    });

    onUpdateTimeline({
      ...timeline,
      totalDuration: parseFloat(t.toFixed(2)),
      tracks: {
        ...timeline.tracks,
        visual: filtered
      }
    });

    if (selectedClipId === idToDelete) onSelectClip(null);
  };

  // Duplicate Clip
  const handleDuplicateClip = () => {
    if (!selectedVisualClip) return;

    const duplicated: VisualClip = {
      ...selectedVisualClip,
      id: 'clip_dup_' + Date.now(),
      title: `${selectedVisualClip.title} (Copy)`,
      startTime: parseFloat((selectedVisualClip.startTime + selectedVisualClip.duration).toFixed(2))
    };

    const idx = visualClips.findIndex((c) => c.id === selectedVisualClip.id);
    const updatedClips = [...visualClips];
    updatedClips.splice(idx + 1, 0, duplicated);

    // Re-align start times
    let t = 0;
    updatedClips.forEach((c) => {
      c.startTime = parseFloat(t.toFixed(2));
      t += c.duration;
    });

    onUpdateTimeline({
      ...timeline,
      totalDuration: parseFloat(t.toFixed(2)),
      tracks: {
        ...timeline.tracks,
        visual: updatedClips
      }
    });
  };

  // Change Transition
  const handleChangeTransition = (clipId: string, newTrans: any) => {
    const updated = visualClips.map((c) => (c.id === clipId ? { ...c, transition: newTrans } : c));
    onUpdateTimeline({
      ...timeline,
      tracks: {
        ...timeline.tracks,
        visual: updated
      }
    });
  };

  // Change Animation / Ken Burns
  const handleChangeAnimation = (clipId: string, newAnim: any) => {
    const updated = visualClips.map((c) => (c.id === clipId ? { ...c, animation: newAnim } : c));
    onUpdateTimeline({
      ...timeline,
      tracks: {
        ...timeline.tracks,
        visual: updated
      }
    });
  };

  // Move clip left/right in sequence
  const handleMoveClip = (idx: number, direction: 'left' | 'right') => {
    const newIdx = direction === 'left' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= visualClips.length) return;

    const updated = [...visualClips];
    const temp = updated[idx];
    updated[idx] = updated[newIdx];
    updated[newIdx] = temp;

    // Recalculate start times
    let t = 0;
    updated.forEach((c) => {
      c.startTime = parseFloat(t.toFixed(2));
      t += c.duration;
    });

    onUpdateTimeline({
      ...timeline,
      tracks: {
        ...timeline.tracks,
        visual: updated
      }
    });
  };

  // Generate time markers (every 2s or 5s)
  const markerStep = zoomLevel > 30 ? 1 : 2;
  const markers = [];
  for (let s = 0; s <= totalDuration + 2; s += markerStep) {
    markers.push(s);
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 border-t border-slate-800 select-none">
      {/* Timeline Controls Toolbar */}
      <div className="h-10 border-b border-slate-800 px-3 bg-slate-950/60 flex items-center justify-between">
        {/* Left Tools */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleSplitClip}
            disabled={!selectedVisualClip}
            title="Split Clip at Playhead"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
          >
            <Scissors className="w-3.5 h-3.5 text-amber-400" />
            <span>Split</span>
          </button>

          <button
            onClick={handleDuplicateClip}
            disabled={!selectedVisualClip}
            title="Duplicate Selected Clip"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
          >
            <Copy className="w-3.5 h-3.5 text-teal-400" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={() => handleDeleteClip()}
            disabled={!selectedVisualClip}
            title="Delete Selected Clip"
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 hover:text-red-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-400" />
            <span>Delete</span>
          </button>

          {/* Quick Transition Selector for selected clip */}
          {selectedVisualClip && (
            <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold">Transition:</span>
              {(['dissolve', 'fade_black', 'zoom_in', 'cut'] as const).map((tr) => (
                <button
                  key={tr}
                  onClick={() => handleChangeTransition(selectedVisualClip.id, tr)}
                  className={`px-2 py-0.5 rounded text-[10px] capitalize transition ${
                    selectedVisualClip.transition === tr
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tr.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}

          {/* Quick Animation Selector */}
          {selectedVisualClip && (
            <div className="flex items-center gap-1.5 ml-3 pl-3 border-l border-slate-800">
              <span className="text-[10px] text-slate-400 font-semibold">Motion:</span>
              {(['ken_burns_zoom_in', 'ken_burns_pan_right', 'subtle_punch_in', 'none'] as const).map((an) => (
                <button
                  key={an}
                  onClick={() => handleChangeAnimation(selectedVisualClip.id, an)}
                  className={`px-2 py-0.5 rounded text-[10px] capitalize transition ${
                    selectedVisualClip.animation === an
                      ? 'bg-amber-600 text-white font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {an.replace('ken_burns_', '').replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Tools: Zoom Slider */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400">Zoom</span>
          <input
            type="range"
            min="15"
            max="60"
            value={zoomLevel}
            onChange={(e) => setZoomLevel(parseInt(e.target.value))}
            className="w-20 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Multi-Track Canvas Scroller */}
      <div
        ref={containerRef}
        onClick={handleTimelineClick}
        className="flex-1 overflow-x-auto overflow-y-auto p-3 relative"
        style={{ minHeight: '180px' }}
      >
        <div
          className="relative min-w-full"
          style={{ width: `${Math.max(800, (totalDuration + 2) * zoomLevel)}px` }}
        >
          {/* Time Ruler */}
          <div className="h-6 border-b border-slate-800/80 flex items-end relative pointer-events-none mb-1">
            {markers.map((sec) => (
              <div
                key={sec}
                className="absolute text-[9px] font-mono text-slate-500 border-l border-slate-800 pl-1"
                style={{ left: `${sec * zoomLevel}px` }}
              >
                {sec}s
              </div>
            ))}
          </div>

          {/* Red Playhead Line */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none transition-all duration-75"
            style={{ left: `${currentTime * zoomLevel}px` }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-b transform -translate-x-[5px] shadow" />
          </div>

          {/* Track 1: Overlays & Branding */}
          <div className="h-8 bg-slate-950/40 rounded-lg mb-1.5 p-1 relative border border-slate-800/50 flex items-center">
            <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider px-1.5 shrink-0">
              Brand / Logo
            </span>
            {overlayClips.map((ov) => (
              <div
                key={ov.id}
                className="absolute h-6 bg-amber-600/30 border border-amber-500/50 rounded px-2 flex items-center gap-1 text-[10px] text-amber-200 truncate"
                style={{
                  left: `${ov.startTime * zoomLevel}px`,
                  width: `${ov.duration * zoomLevel}px`
                }}
              >
                <Layers className="w-2.5 h-2.5 text-amber-400" />
                <span className="truncate">{ov.type}: Institutional Brand</span>
              </div>
            ))}
          </div>

          {/* Track 2: Visual Clips (Primary Story Track) */}
          <div className="h-16 bg-slate-950/70 rounded-xl mb-1.5 p-1 relative border border-slate-800 flex items-center">
            <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider px-1.5 shrink-0">
              Visuals
            </span>
            {visualClips.map((clip, idx) => {
              const isSelected = clip.id === selectedClipId;
              return (
                <div
                  key={clip.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectClip(clip.id);
                  }}
                  className={`absolute h-14 rounded-lg overflow-hidden border cursor-pointer group transition flex flex-col justify-between p-1.5 ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-950/60 ring-2 ring-emerald-500/40 z-20'
                      : 'border-slate-700 bg-slate-850 hover:border-slate-500 bg-slate-900 z-10'
                  }`}
                  style={{
                    left: `${clip.startTime * zoomLevel}px`,
                    width: `${Math.max(45, clip.duration * zoomLevel)}px`
                  }}
                >
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="font-semibold text-slate-100 truncate">
                      {idx + 1}. {clip.title}
                    </span>
                    <span className="text-emerald-400 font-mono text-[9px]">
                      {clip.duration.toFixed(1)}s
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[8px] text-slate-400">
                    <span className="capitalize">{clip.transition || 'cut'}</span>
                    {clip.animation && clip.animation !== 'none' && (
                      <span className="text-amber-400 flex items-center gap-0.5">
                        <Sparkles className="w-2 h-2" /> Motion
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Track 3: Captions / Text Track */}
          <div className="h-8 bg-slate-950/40 rounded-lg mb-1.5 p-1 relative border border-slate-800/50 flex items-center">
            <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider px-1.5 shrink-0">
              Captions
            </span>
            {textClips.map((tc) => (
              <div
                key={tc.id}
                className="absolute h-6 bg-teal-600/30 border border-teal-500/50 rounded px-2 flex items-center gap-1 text-[10px] text-teal-200 truncate"
                style={{
                  left: `${tc.startTime * zoomLevel}px`,
                  width: `${tc.duration * zoomLevel}px`
                }}
              >
                <Type className="w-2.5 h-2.5 text-teal-400" />
                <span className="truncate">{tc.text}</span>
              </div>
            ))}
          </div>

          {/* Track 4: Audio Track */}
          <div className="h-8 bg-slate-950/40 rounded-lg p-1 relative border border-slate-800/50 flex items-center">
            <span className="text-[9px] font-bold text-amber-300 uppercase tracking-wider px-1.5 shrink-0">
              Audio / Music
            </span>
            {audioClips.map((ac) => (
              <div
                key={ac.id}
                className="absolute h-6 bg-amber-500/20 border border-amber-500/40 rounded px-2 flex items-center gap-1 text-[10px] text-amber-200 truncate"
                style={{
                  left: `${ac.startTime * zoomLevel}px`,
                  width: `${ac.duration * zoomLevel}px`
                }}
              >
                <Music className="w-2.5 h-2.5 text-amber-400" />
                <span className="truncate">{ac.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
