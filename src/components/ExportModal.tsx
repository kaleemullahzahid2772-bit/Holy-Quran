import React, { useState } from 'react';
import {
  Download,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Film,
  Crown,
  Sparkles
} from 'lucide-react';
import { ProjectTimeline, AspectRatio, UserProfile } from '../types/editor';
import { exportVideo } from '../services/videoCompositor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  timeline: ProjectTimeline;
  aspectRatio: AspectRatio;
  currentUser: UserProfile;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  timeline,
  aspectRatio,
  currentUser
}) => {
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [isExporting, setIsExporting] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadExt, setDownloadExt] = useState<'mp4' | 'webm'>('mp4');

  if (!isOpen) return null;

  const isFreeTier = currentUser.role === 'free';
  const canUse1080p = !isFreeTier || currentUser.credits >= 15;

  const handleStartExport = async () => {
    try {
      setIsExporting(true);
      setProgressPercent(0);
      setStatusText('Initializing universal H.264 MP4 encoder...');
      setDownloadUrl(null);

      const result = await exportVideo(
        timeline,
        {
          aspectRatio,
          resolution: isFreeTier ? '720p' : resolution,
          fps: 30
        },
        (progress, status) => {
          setProgressPercent(progress);
          setStatusText(status);
        }
      );

      const url = URL.createObjectURL(result.blob);
      setDownloadUrl(url);
      setDownloadExt(result.extension);
      setStatusText('Rendering Complete! Fully playable universal MP4 ready.');
    } catch (err: any) {
      console.error('Export failed:', err);
      setStatusText(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <Download className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Export Final Video</h2>
              <p className="text-[11px] text-slate-400">
                Produce professional high-bitrate video with full transitions & audio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Project Summary */}
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-200">{timeline.title}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Aspect Ratio: {aspectRatio} • Duration: {timeline.totalDuration.toFixed(1)}s • {timeline.tracks.visual.length} Scenes
              </div>
            </div>
            <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-1 rounded">
              MP4 Container
            </span>
          </div>

          {/* Resolution Options */}
          <div>
            <label className="block text-slate-300 font-semibold mb-2">Export Resolution</label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setResolution('720p')}
                className={`p-3 rounded-xl border cursor-pointer transition flex flex-col justify-between ${
                  resolution === '720p'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span>720p HD</span>
                  <span className="text-[10px] text-emerald-400">Fast</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Ideal for rapid mobile sharing & social previews.
                </span>
              </div>

              <div
                onClick={() => {
                  if (canUse1080p) setResolution('1080p');
                }}
                className={`p-3 rounded-xl border transition flex flex-col justify-between ${
                  !canUse1080p
                    ? 'border-slate-800 bg-slate-950/40 opacity-50 cursor-not-allowed'
                    : resolution === '1080p'
                    ? 'border-emerald-500 bg-emerald-950/20 ring-1 ring-emerald-500 cursor-pointer'
                    : 'border-slate-800 bg-slate-950 hover:border-slate-700 cursor-pointer'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-slate-200">
                  <span className="flex items-center gap-1">
                    1080p Full HD {!canUse1080p && <Crown className="w-3 h-3 text-amber-400" />}
                  </span>
                  <span className="text-[10px] text-amber-400">Pro</span>
                </div>
                <span className="text-[10px] text-slate-400 mt-1">
                  Pristine master quality for institutional broadcast.
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar & Status */}
          {isExporting && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-300 font-medium flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                  {statusText}
                </span>
                <span className="text-emerald-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-150"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Download & Live Video Preview */}
          {downloadUrl && (
            <div className="space-y-3 pt-1">
              <div className="rounded-xl overflow-hidden border border-emerald-500/40 bg-black">
                <video
                  controls
                  autoPlay
                  playsInline
                  src={downloadUrl}
                  className="w-full max-h-52 object-contain bg-black"
                />
              </div>

              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Universal MP4 Video Ready!</span>
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    H.264 Baseline • Playable in Windows Media Player, Movies & TV, iOS & Android
                  </div>
                </div>
                <a
                  href={downloadUrl}
                  download={`${timeline.title.replace(/\s+/g, '_')}_master.${downloadExt}`}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow-lg transition flex items-center gap-1.5 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .{downloadExt.toUpperCase()}</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[10px] text-slate-400">
            Export Cost: 15 Credits • Server Verified
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Close
            </button>
            {!downloadUrl && (
              <button
                onClick={handleStartExport}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-lg shadow transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExporting ? 'Exporting...' : 'Render & Export'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
