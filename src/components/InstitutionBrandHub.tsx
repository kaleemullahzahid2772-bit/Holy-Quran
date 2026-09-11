import React, { useState } from 'react';
import {
  Building2,
  Upload,
  Save,
  X,
  Palette,
  Phone,
  Globe,
  MapPin,
  Check,
  Sparkles
} from 'lucide-react';
import { InstitutionProfile } from '../types/editor';
import { api } from '../services/api';

interface InstitutionBrandHubProps {
  isOpen: boolean;
  onClose: () => void;
  profile: InstitutionProfile;
  onSaveProfile: (profile: InstitutionProfile) => void;
}

export const InstitutionBrandHub: React.FC<InstitutionBrandHubProps> = ({
  isOpen,
  onClose,
  profile,
  onSaveProfile
}) => {
  const [formData, setFormData] = useState<InstitutionProfile>(profile);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await api.saveInstitutionProfile(formData);
      if (res.success) {
        onSaveProfile(res.profile);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSampleAssets = () => {
    setFormData({
      institutionName: 'Jamia Dar-ul-Uloom Media Wing',
      tagline: 'Excellence in Classical & Modern Islamic Education',
      logoUrl: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=200&auto=format&fit=crop&q=80',
      buildingUrl: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=800&auto=format&fit=crop&q=80',
      classroomUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&auto=format&fit=crop&q=80',
      mosqueUrl: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=800&auto=format&fit=crop&q=80',
      teacherUrls: ['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'],
      studentUrls: ['https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=400&auto=format&fit=crop&q=80'],
      brandColors: {
        primary: '#0D5C3A',
        accent: '#D4AF37',
        text: '#FFFFFF'
      },
      contactInfo: {
        phone: '+92 300 1234567',
        website: 'www.darululoom.edu.pk',
        location: 'Karachi, Pakistan'
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">MY INSTITUTION / MY BRAND</h2>
              <p className="text-[11px] text-slate-400">
                Persistent brand assets used naturally by the AI editor across all projects
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSampleAssets}
              className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3" />
              <span>Fill Sample Profile</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Institution Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Institution Name</label>
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                placeholder="e.g. Jamia Dar-ul-Uloom"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-200 outline-none transition"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Tagline / Mission</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="e.g. Excellence in Quranic Education"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-3 py-2 text-slate-200 outline-none transition"
              />
            </div>
          </div>

          {/* Visual Asset URLs */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Key Visual Assets (URLs or Uploads)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Institution Logo URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.logoUrl}
                    onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none transition"
                  />
                  {formData.logoUrl && (
                    <img
                      src={formData.logoUrl}
                      alt="Logo preview"
                      className="w-8 h-8 rounded border border-slate-700 object-contain bg-slate-950"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Campus Building / Hero Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.buildingUrl}
                    onChange={(e) => setFormData({ ...formData, buildingUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none transition"
                  />
                  {formData.buildingUrl && (
                    <img
                      src={formData.buildingUrl}
                      alt="Building preview"
                      className="w-8 h-8 rounded border border-slate-700 object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Classroom / Study Hall Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.classroomUrl}
                    onChange={(e) => setFormData({ ...formData, classroomUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none transition"
                  />
                  {formData.classroomUrl && (
                    <img
                      src={formData.classroomUrl}
                      alt="Classroom preview"
                      className="w-8 h-8 rounded border border-slate-700 object-cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Mosque / Prayer Hall Photo</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.mosqueUrl}
                    onChange={(e) => setFormData({ ...formData, mosqueUrl: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-lg px-2.5 py-1.5 text-slate-200 outline-none transition"
                  />
                  {formData.mosqueUrl && (
                    <img
                      src={formData.mosqueUrl}
                      alt="Mosque preview"
                      className="w-8 h-8 rounded border border-slate-700 object-cover"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="pt-2 border-t border-slate-800">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px] mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-emerald-400" />
              <span>Brand Color Identity</span>
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.brandColors.primary}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brandColors: { ...formData.brandColors, primary: e.target.value }
                    })
                  }
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300 font-medium">Primary ({formData.brandColors.primary})</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={formData.brandColors.accent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      brandColors: { ...formData.brandColors, accent: e.target.value }
                    })
                  }
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <span className="text-slate-300 font-medium">Accent Gold ({formData.brandColors.accent})</span>
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <h3 className="font-bold text-slate-300 uppercase tracking-wider text-[10px]">
              Contact Details (For Outro Cards)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={formData.contactInfo.phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, phone: e.target.value }
                    })
                  }
                  placeholder="+92 300 ..."
                  className="w-full bg-transparent outline-none text-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={formData.contactInfo.website}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, website: e.target.value }
                    })
                  }
                  placeholder="www.academy.edu"
                  className="w-full bg-transparent outline-none text-slate-200 text-xs"
                />
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  value={formData.contactInfo.location}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactInfo: { ...formData.contactInfo, location: e.target.value }
                    })
                  }
                  placeholder="City, Country"
                  className="w-full bg-transparent outline-none text-slate-200 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            {saveSuccess ? (
              <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                <Check className="w-3.5 h-3.5" /> Institution Profile Saved!
              </span>
            ) : (
              'Saved profile is automatically referenced during AI Auto Edit.'
            )}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow transition disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
