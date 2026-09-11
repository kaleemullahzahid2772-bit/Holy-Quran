import React from 'react';
import {
  Sparkles,
  Smartphone,
  Tv,
  Square,
  Undo2,
  Redo2,
  History,
  Building2,
  Image as ImageIcon,
  Download,
  ShieldAlert,
  Coins,
  Crown,
  UserCheck
} from 'lucide-react';
import { AspectRatio, UserProfile } from '../types/editor';

interface HeaderProps {
  projectTitle: string;
  onUpdateTitle: (title: string) => void;
  aspectRatio: AspectRatio;
  onChangeAspectRatio: (ratio: AspectRatio) => void;
  currentUser: UserProfile;
  onSwitchPersona: (userId: string) => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenVersions: () => void;
  onOpenInstitution: () => void;
  onOpenBackgrounds: () => void;
  onOpenAdmin: () => void;
  onOpenExport: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  projectTitle,
  onUpdateTitle,
  aspectRatio,
  onChangeAspectRatio,
  currentUser,
  onSwitchPersona,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenVersions,
  onOpenInstitution,
  onOpenBackgrounds,
  onOpenAdmin,
  onOpenExport
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/95 backdrop-blur px-4 flex items-center justify-between select-none z-30 shrink-0">
      {/* Brand & Project Info */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-amber-500 p-0.5 shadow-lg shadow-emerald-950/40">
          <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-100 text-sm tracking-wide">NurEdit AI</span>
            <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              STUDIO
            </span>
          </div>
          <input
            type="text"
            value={projectTitle}
            onChange={(e) => onUpdateTitle(e.target.value)}
            className="text-xs text-slate-400 bg-transparent hover:bg-slate-800/60 focus:bg-slate-800 px-1.5 py-0.5 -ml-1 rounded outline-none border border-transparent focus:border-slate-700 transition"
          />
        </div>
      </div>

      {/* Center Controls: Aspect Ratio & Undo/Redo */}
      <div className="flex items-center gap-4">
        {/* Aspect Ratio Switcher */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => onChangeAspectRatio('9:16')}
            title="9:16 Reels / TikTok / Shorts"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              aspectRatio === '9:16'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>9:16</span>
          </button>
          <button
            onClick={() => onChangeAspectRatio('16:9')}
            title="16:9 YouTube / Landscape"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              aspectRatio === '16:9'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Tv className="w-3.5 h-3.5" />
            <span>16:9</span>
          </button>
          <button
            onClick={() => onChangeAspectRatio('1:1')}
            title="1:1 Social Square"
            className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-medium transition ${
              aspectRatio === '1:1'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Square className="w-3.5 h-3.5" />
            <span>1:1</span>
          </button>
        </div>

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent rounded-lg transition"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenVersions}
            title="Version History & Restore"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
          >
            <History className="w-4 h-4 text-emerald-400" />
            <span>Versions</span>
          </button>
        </div>
      </div>

      {/* Right Controls: Assets, Persona, Credits, Export */}
      <div className="flex items-center gap-2.5">
        {/* My Institution */}
        <button
          onClick={onOpenInstitution}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-lg transition"
        >
          <Building2 className="w-3.5 h-3.5 text-amber-400" />
          <span>My Institution</span>
        </button>

        {/* Background Library */}
        <button
          onClick={onOpenBackgrounds}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-200 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 rounded-lg transition"
        >
          <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
          <span>Islamic BG Library</span>
        </button>

        {/* Credits Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-xs font-medium">
          <Coins className="w-3.5 h-3.5 text-amber-400" />
          <span>{currentUser.credits} Credits</span>
        </div>

        {/* Persona Switcher Dropdown */}
        <div className="relative group">
          <button className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 rounded-lg text-xs text-slate-300 transition">
            {currentUser.role === 'premium' ? (
              <Crown className="w-3.5 h-3.5 text-amber-400" />
            ) : currentUser.role === 'admin' ? (
              <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span className="capitalize font-medium">{currentUser.role}</span>
          </button>
          
          <div className="absolute right-0 top-full mt-1 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 hidden group-hover:block z-50">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider px-2 py-1 font-bold">
              Switch Test Account
            </div>
            <button
              onClick={() => onSwitchPersona('usr_free')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col transition ${
                currentUser.id === 'usr_free' ? 'bg-emerald-600/20 text-emerald-300' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="font-semibold">Free User (Usman Qadri)</span>
              <span className="text-[10px] text-slate-400">100 Credits Quota (Strict)</span>
            </button>
            <button
              onClick={() => onSwitchPersona('usr_premium')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col transition ${
                currentUser.id === 'usr_premium' ? 'bg-emerald-600/20 text-emerald-300' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="font-semibold flex items-center gap-1">
                <Crown className="w-3 h-3 text-amber-400" /> Dar-ul-Uloom Media Center
              </span>
              <span className="text-[10px] text-slate-400">Premium Pro Tier (1250 Credits)</span>
            </button>
            <button
              onClick={() => onSwitchPersona('usr_admin')}
              className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex flex-col transition ${
                currentUser.id === 'usr_admin' ? 'bg-purple-600/20 text-purple-300' : 'hover:bg-slate-800 text-slate-300'
              }`}
            >
              <span className="font-semibold flex items-center gap-1">
                <ShieldAlert className="w-3 h-3 text-purple-400" /> System Administrator
              </span>
              <span className="text-[10px] text-slate-400">Unlimited Quota & Metrics</span>
            </button>
          </div>
        </div>

        {/* Admin Dashboard button */}
        {currentUser.role === 'admin' && (
          <button
            onClick={onOpenAdmin}
            className="p-2 text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-lg transition"
            title="Open Admin Dashboard"
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
        )}

        {/* Export Video Button */}
        <button
          onClick={onOpenExport}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-950/50 rounded-lg transition active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export Video</span>
        </button>
      </div>
    </header>
  );
};
