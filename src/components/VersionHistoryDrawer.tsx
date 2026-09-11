import React from 'react';
import { History, X, RotateCcw, Clock, CheckCircle2 } from 'lucide-react';
import { ProjectVersion, ProjectTimeline } from '../types/editor';

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  versions: ProjectVersion[];
  currentTimeline: ProjectTimeline;
  onRestoreVersion: (version: ProjectVersion) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  versions,
  currentTimeline,
  onRestoreVersion
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Project Version History ({versions.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Versions Timeline List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {versions.map((ver, idx) => {
            const isLatest = idx === versions.length - 1;
            const clipCount = ver.timeline?.tracks?.visual?.length || 0;
            const duration = ver.timeline?.totalDuration || 0;

            return (
              <div
                key={ver.versionId}
                className="bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition group flex flex-col gap-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-100">{ver.label}</span>
                    {isLatest && (
                      <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-semibold">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(ver.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 flex items-center gap-3">
                  <span>Duration: {duration.toFixed(1)}s</span>
                  <span>•</span>
                  <span>{clipCount} Visual Scenes</span>
                  <span>•</span>
                  <span className="capitalize">{ver.timeline?.aspectRatio || '9:16'}</span>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end">
                  <button
                    onClick={() => {
                      onRestoreVersion(ver);
                      onClose();
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-600 px-3 py-1 rounded-lg transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Restore This Version</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
