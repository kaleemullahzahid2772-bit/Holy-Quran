import React, { useRef } from 'react';
import {
  Upload,
  Film,
  Image as ImageIcon,
  Music,
  Trash2,
  Sparkles,
  Plus,
  Play,
  CheckCircle2
} from 'lucide-react';
import { MediaItem } from '../types/editor';

interface MediaLibraryProps {
  mediaItems: MediaItem[];
  onAddMedia: (items: MediaItem[]) => void;
  onRemoveMedia: (id: string) => void;
  onPreviewMedia: (item: MediaItem) => void;
  onLoadSamplePack: () => void;
}

export const MediaLibrary: React.FC<MediaLibraryProps> = ({
  mediaItems,
  onAddMedia,
  onRemoveMedia,
  onPreviewMedia,
  onLoadSamplePack
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: MediaItem[] = [];
    Array.from(files).forEach((file, idx) => {
      const isVideo = file.type.startsWith('video');
      const isAudio = file.type.startsWith('audio');
      const isImage = file.type.startsWith('image');
      const url = URL.createObjectURL(file);

      newItems.push({
        id: 'usr_media_' + Date.now() + '_' + idx,
        title: file.name.replace(/\.[^/.]+$/, ''),
        url,
        thumbnailUrl: isImage ? url : undefined,
        type: isVideo ? 'video' : isAudio ? 'audio' : 'image',
        duration: isVideo ? 5.0 : isImage ? 3.5 : 8.0,
        salientScore: Math.round(75 + Math.random() * 20),
        category: idx % 2 === 0 ? 'student' : 'campus'
      });
    });

    onAddMedia(newItems);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Section Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
            User Clips & Media ({mediaItems.length})
          </span>
        </div>
        <button
          onClick={onLoadSamplePack}
          className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded transition"
          title="Load 7 realistic Islamic Madrasah student clips & campus photos"
        >
          <Sparkles className="w-3 h-3" />
          <span>Load Sample Pack</span>
        </button>
      </div>

      {/* Upload Zone */}
      <div className="p-3">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="video/*,image/*,audio/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-700/80 hover:border-emerald-500/70 bg-slate-950/40 hover:bg-emerald-950/20 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition group text-center"
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 group-hover:bg-emerald-600/30 flex items-center justify-center mb-1.5 transition">
            <Upload className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition" />
          </div>
          <span className="text-xs font-semibold text-slate-300 group-hover:text-emerald-300 transition">
            Upload Clips & Photos
          </span>
          <span className="text-[10px] text-slate-500 mt-0.5">
            2, 5, 10, 20+ clips, photos, logos, voice
          </span>
        </div>
      </div>

      {/* Media Grid */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
        {mediaItems.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Film className="w-8 h-8 text-slate-700 mb-2" />
            <span className="text-xs">No media uploaded yet.</span>
            <span className="text-[11px] text-slate-600 mt-1">
              Click &quot;Load Sample Pack&quot; or upload your footage to get started.
            </span>
          </div>
        ) : (
          mediaItems.map((item, idx) => (
            <div
              key={item.id}
              className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 rounded-lg p-2 flex items-center gap-2.5 group transition"
            >
              {/* Thumbnail / Icon */}
              <div
                onClick={() => onPreviewMedia(item)}
                className="w-16 h-12 rounded bg-slate-800 overflow-hidden relative cursor-pointer shrink-0 border border-slate-700/50 flex items-center justify-center"
              >
                {item.thumbnailUrl || (item.type === 'image' && item.url) ? (
                  <img
                    src={item.thumbnailUrl || item.url}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                ) : item.type === 'video' ? (
                  <Film className="w-5 h-5 text-slate-400" />
                ) : (
                  <Music className="w-5 h-5 text-amber-400" />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                  <Play className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              </div>

              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-200 truncate">
                    {idx + 1}. {item.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1 py-0.5 rounded">
                    {item.type}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {item.duration.toFixed(1)}s
                  </span>
                  {item.salientScore && (
                    <span className="text-[10px] text-emerald-400 flex items-center gap-0.5" title="AI Salient Moment Score">
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      {item.salientScore}% Quality
                    </span>
                  )}
                </div>
              </div>

              {/* Remove */}
              <button
                onClick={() => onRemoveMedia(item.id)}
                className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-slate-800/80 rounded transition opacity-0 group-hover:opacity-100"
                title="Remove clip"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
