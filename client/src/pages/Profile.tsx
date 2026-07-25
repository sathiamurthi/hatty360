import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Landmark, Shield, Sparkles, Save, Heart, Briefcase, MapPin } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ProfileProps {
  user: any;
  onProfileUpdate: (updatedUser: any) => void;
  language: string;
}

export default function Profile({ user, onProfileUpdate, language }: ProfileProps) {
  const [name, setName] = useState(user?.name || '');
  const [hattyId, setHattyId] = useState(user?.hatty_id ? String(user.hatty_id) : '');
  const [gender, setGender] = useState(user?.gender || '');
  const [fatherName, setFatherName] = useState(user?.father_name || '');
  const [motherName, setMotherName] = useState(user?.mother_name || '');
  const [profession, setProfession] = useState(user?.profession || '');
  const [location, setLocation] = useState(user?.location || '');
  const [selectedLanguage, setSelectedLanguage] = useState(user?.selected_language || language || 'en');
  
  const [hattys, setHattys] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    // Load hattys list for dropdown
    axios.get('/api/auth/hattys')
      .then(res => setHattys(res.data.hattys))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await axios.post('/api/auth/profile', {
        phone: user.phone,
        name: name,
        hatty_id: hattyId ? parseInt(hattyId) : null,
        gender: gender,
        father_name: fatherName,
        mother_name: motherName,
        profession: profession,
        location: location,
        selected_language: selectedLanguage
      });

      confetti({ particleCount: 80, spread: 60 });
      setMessage('Profile updated successfully!');
      onProfileUpdate(res.data.user);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 font-sans">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="h-16 w-16 rounded-3xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-2xl border border-brand-green/20">
            {name.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">
              Profile Setup & Settings
            </h2>
            <p className="text-xs text-slate-400 font-semibold tracking-wide uppercase mt-0.5">
              Role: <span className="text-brand-green">{user.role}</span> • Phone: {user.phone}
            </p>
          </div>
        </div>

        {/* Success/Error Alerts */}
        {message && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-800 text-xs font-bold flex items-center gap-2">
            ✨ {message}
          </div>
        )}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
            ⚠️ {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your Full Name"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-semibold"
                />
              </div>
            </div>

            {/* Hatty (Village/Settlement) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Your Hatty (Village)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Landmark className="h-4 w-4" />
                </span>
                <select
                  required
                  value={hattyId}
                  onChange={(e) => setHattyId(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-semibold bg-white"
                >
                  <option value="">Select Hatty</option>
                  {hattys.map(h => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>

          {/* Gender selection */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gender</label>
            <div className="flex gap-3">
              {['Male', 'Female'].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`flex-1 py-3 border rounded-xl text-sm font-bold tracking-wide uppercase transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    gender === g
                      ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {g === 'Male' ? '👨' : '👩'} {g}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Father's Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Father's Name</label>
              <input
                type="text"
                value={fatherName}
                onChange={(e) => setFatherName(e.target.value)}
                placeholder="Father's Full Name"
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-semibold"
              />
            </div>

            {/* Mother's Name */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Mother's Name</label>
              <input
                type="text"
                value={motherName}
                onChange={(e) => setMotherName(e.target.value)}
                placeholder="Mother's Full Name"
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-semibold"
              />
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Profession */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Profession</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Briefcase className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  placeholder="e.g. Farmer, IT Engineer, Student"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-semibold"
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Current Location (City/Town)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <MapPin className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Ooty, Coimbatore, Bangalore"
                  className="block w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-semibold"
                />
              </div>
            </div>

          </div>

          {/* App Language Preference */}
          <div>
            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Preferred Application Language</label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-semibold bg-white"
            >
              <option value="en">English</option>
              <option value="kn">ಕನ್ನಡ (Kannada)</option>
              <option value="ta">தமிழ் (Tamil)</option>
              <option value="bd">Badaga</option>
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-1.5 py-4 px-6 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer border border-brand-green-light/25 font-display tracking-wider"
          >
            <Save className="h-4 w-4" />
            {loading ? 'Saving Changes...' : 'Save Profile Settings'}
          </button>

        </form>

      </div>
    </div>
  );
}
