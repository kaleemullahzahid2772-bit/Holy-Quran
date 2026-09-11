import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Check,
  X,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';

interface BackgroundItem {
  id: string;
  category: string;
  title: string;
  thumbnailUrl: string;
  url: string;
  type: 'image' | 'video';
  tags: string[];
}

interface BackgroundLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedBackgroundUrl?: string;
  onSelectBackground: (bg: { name: string; url: string; type: 'image' | 'video' }) => void;
}

export const BackgroundLibraryModal: React.FC<BackgroundLibraryModalProps> = ({
  isOpen,
  onClose,
  selectedBackgroundUrl,
  onSelectBackground
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [backgrounds, setBackgrounds] = useState<BackgroundItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const fetchBgs = async () => {
      setLoading(true);
      try {
        const res = await api.getBackgrounds(activeCategory);
        setCategories(res.categories || []);
        setBackgrounds(res.backgrounds || []);
      } catch (err) {
        console.error('Failed to load backgrounds:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBgs();
  }, [isOpen, activeCategory]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">
                Islamic Institution Background Library
              </h2>
              <p className="text-[11px] text-slate-400">
                High-definition spiritual, academic, and architectural backdrops & B-roll
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

        {/* Category Filter Chips */}
        <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition ${
                activeCategory === cat
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Background Items Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs">
              Loading backgrounds catalog...
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {backgrounds.map((bg) => {
                const isSelected = selectedBackgroundUrl === bg.url;
                return (
                  <div
                    key={bg.id}
                    onClick={() => {
                      onSelectBackground({ name: bg.title, url: bg.url, type: bg.type });
                      onClose();
                    }}
                    className={`group relative rounded-xl overflow-hidden border cursor-pointer transition flex flex-col bg-slate-950 ${
                      isSelected
                        ? 'border-emerald-500 ring-2 ring-emerald-500/30'
                        : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="h-36 overflow-hidden relative">
                      <img
                        src={bg.thumbnailUrl}
                        alt={bg.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                      <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                        {bg.category}
                      </span>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-emerald-600 text-white rounded-full p-1 shadow">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h4 className="text-xs font-semibold text-slate-200 group-hover:text-emerald-300 transition truncate">
                        {bg.title}
                      </h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {bg.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[9px] text-slate-500">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
