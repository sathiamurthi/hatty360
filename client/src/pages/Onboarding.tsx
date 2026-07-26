import React, { useState, useEffect } from 'react';
import { Landmark, ArrowRight, ShieldCheck, RefreshCw, Smartphone, CheckCircle, HelpCircle } from 'lucide-react';
import axios from 'axios';

interface OnboardingProps {
  onAuthSuccess: (user: any) => void;
  language: string;
  setLanguage: (lang: string) => void;
}

export default function Onboarding({ onAuthSuccess, language, setLanguage }: OnboardingProps) {
  const [step, setStep] = useState<'login' | 'profile' | 'pending'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [hattyId, setHattyId] = useState('');
  const [gender, setGender] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [profession, setProfession] = useState('');
  const [location, setLocation] = useState('');
  const [hattys, setHattys] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    // Fetch hattys list
    axios.get('/api/auth/hattys')
      .then(res => setHattys(res.data.hattys))
      .catch(err => console.error(err));
  }, []);

  const handleLoginRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) return setError('Phone number is required');
    setError('');
    setLoading(true);

    try {
      // 1. Try to login
      const loginRes = await axios.post('/api/auth/login', { phone, password });
      
      if (loginRes.data.status === 'approved') {
        onAuthSuccess(loginRes.data.user);
      } else if (loginRes.data.status === 'pending') {
        setCurrentUser(loginRes.data.user);
        setStep('pending');
      } else {
        setError(loginRes.data.message || 'Unknown status');
      }
    } catch (err: any) {
      if (err.response && err.response.status === 404) {
        // User not found -> Trigger registration
        if (!name) {
          setError('User not registered. Please enter your Full Name to sign up!');
          setLoading(false);
          return;
        }
        
        try {
          const regRes = await axios.post('/api/auth/register', { name, phone });
          setCurrentUser(regRes.data.user);
          // Go to profile setup
          setStep('profile');
        } catch (regErr: any) {
          setError(regErr.response?.data?.error || 'Registration failed');
        }
      } else {
        setError(err.response?.data?.error || 'Authentication error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hattyId) return setError('Please select a Hatty');
    if (!gender) return setError('Please select your Gender');
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/profile', {
        phone: currentUser.phone,
        hatty_id: parseInt(hattyId),
        gender,
        father_name: fatherName,
        mother_name: motherName,
        profession,
        location,
        selected_language: language
      });
      setCurrentUser(res.data.user);
      setStep('pending');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Profile update failed');
    } finally {
      setLoading(false);
    }
  };

  const checkApprovalStatus = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { phone: currentUser.phone });
      if (res.data.status === 'approved') {
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Simulation Bypasses (Makes testing/demonstrating 10x easier)
  const simulateImmediateApproval = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Direct call to approve user endpoint
      await axios.post('/api/auth/approve', { userId: currentUser.id, status: 'approved' });
      await checkApprovalStatus();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPreseededAccount = async (testPhone: string) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', { phone: testPhone });
      if (res.data.status === 'approved') {
        onAuthSuccess(res.data.user);
      }
    } catch (err) {
      console.error(err);
      setError('Pre-seeded account loading failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Top styling strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-green to-brand-blue"></div>

        {/* LOGO Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-brand-green flex items-center justify-center shadow-lg">
            <span className="text-white text-2xl font-bold font-display">🕉️</span>
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 font-display">
            {step === 'login' && 'Welcome to Hatty360'}
            {step === 'profile' && 'Complete Your Profile'}
            {step === 'pending' && 'Approval Pending'}
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            {step === 'login' && 'Register or login directly with your phone number'}
            {step === 'profile' && 'Mandatory for Hatty approval routing'}
            {step === 'pending' && 'Submitted to your Hatty Thalaivar for review'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-4 leading-relaxed animate-shake">
            {error}
          </div>
        )}

        {/* STEP 1: Login & Register (Single Flow) */}
        {step === 'login' && (
          <form className="mt-8 space-y-6" onSubmit={handleLoginRegister}>
            <div className="space-y-4 rounded-md">
              <div>
                <label htmlFor="phone-number" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Smartphone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    id="phone-number"
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone or admin email"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password field for SuperAdmin */}
              {phone === 'superadmin@demandgeniusai.com' && (
                <div>
                  <label htmlFor="admin-password" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    SuperAdmin Password
                  </label>
                  <input
                    id="admin-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter Admin Password"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  />
                </div>
              )}

              {/* Enter name if registering */}
              {phone !== 'superadmin@demandgeniusai.com' && (
                <div>
                  <label htmlFor="full-name" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Full Name <span className="text-slate-400 font-normal">(Required for New Registrations)</span>
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter full name"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  />
                </div>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-brand-green hover:bg-brand-green-dark focus:outline-none shadow-md transition-all hover:scale-[1.02] cursor-pointer font-display tracking-wider"
              >
                {loading ? 'Authenticating...' : 'Proceed to Network'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            {/* Preseeded Testing Box */}
            <div className="border-t border-slate-100 pt-6 mt-6">
              <span className="block text-center text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                🔧 Evaluation Accounts (Click to log in instantly)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => loadPreseededAccount('9999999999')}
                  className="text-[10px] text-left p-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                >
                  👑 Shiva (Admin)<br />
                  <span className="text-slate-400 font-normal">9999999999</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreseededAccount('8888888888')}
                  className="text-[10px] text-left p-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                >
                  👳‍♂️ Basavaraj (Thalaivar)<br />
                  <span className="text-slate-400 font-normal">8888888888</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreseededAccount('7777777777')}
                  className="text-[10px] text-left p-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                >
                  📝 Lingappa (Secretary)<br />
                  <span className="text-slate-400 font-normal">7777777777</span>
                </button>
                <button
                  type="button"
                  onClick={() => loadPreseededAccount('5555555555')}
                  className="text-[10px] text-left p-2 border border-slate-200 rounded-xl hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
                >
                  👩‍💻 Parvati (Member)<br />
                  <span className="text-slate-400 font-normal">5555555555</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* STEP 2: Profile setup */}
        {step === 'profile' && (
          <form className="mt-6 space-y-4" onSubmit={handleProfileSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Hatty (Mandatory for Thalaivar Approval)
              </label>
              <select
                required
                value={hattyId}
                onChange={(e) => setHattyId(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium bg-white"
              >
                <option value="">Select Hatty...</option>
                {hattys.map((h: any) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Gender (Needed for Women's SHG)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Male', 'Female', 'Other'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGender(g)}
                    className={`py-2 px-3 border rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      gender === g
                        ? 'border-brand-green bg-brand-green/5 text-brand-green'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Father's Name
                </label>
                <input
                  type="text"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  placeholder="Father's Name"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Mother's Name
                </label>
                <input
                  type="text"
                  value={motherName}
                  onChange={(e) => setMotherName(e.target.value)}
                  placeholder="Mother's Name"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Profession / Occupation
              </label>
              <input
                type="text"
                value={profession}
                onChange={(e) => setProfession(e.target.value)}
                placeholder="e.g. Farmer, IT Engineer, Student"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Location / City
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Ooty, Coonoor, Melur"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-brand-green hover:bg-brand-green-dark shadow-md transition-all hover:scale-[1.02] cursor-pointer mt-6 font-display tracking-wider"
            >
              {loading ? 'Submitting Details...' : 'Submit Profile for Approval'}
            </button>
          </form>
        )}

        {/* STEP 3: Pending screen */}
        {step === 'pending' && currentUser && (
          <div className="mt-6 text-center space-y-6">
            <div className="mx-auto h-20 w-20 rounded-full bg-yellow-50 border border-yellow-100 flex items-center justify-center text-yellow-600 animate-pulse">
              <ShieldCheck className="h-10 w-10" />
            </div>

            <div className="bg-yellow-50 border border-yellow-100 text-yellow-800 rounded-2xl p-4 text-xs font-medium leading-relaxed">
              👋 Hi <strong>{currentUser.name}</strong>, your profile is submitted! The <strong>{hattys.find(h => h.id === currentUser.hatty_id)?.name || 'Hatty'} Thalaivar</strong> needs to approve your registration before you can log in.
            </div>

            <div className="flex flex-col gap-3">
              {/* Check approval status */}
              <button
                type="button"
                onClick={checkApprovalStatus}
                disabled={loading}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-slate-200 text-sm font-bold rounded-2xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Check Status
              </button>

              {/* Simulation bypass - Click to instantly approve */}
              <button
                type="button"
                onClick={simulateImmediateApproval}
                className="w-full flex items-center justify-center py-3.5 px-4 border border-dashed border-emerald-300 text-sm font-bold rounded-2xl text-emerald-700 bg-emerald-50 hover:bg-emerald-100/50 transition-all cursor-pointer"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Simulate Immediate Approval (Test Bypass)
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400">
              Note: When deploying to Neon/Vercel, approval routing sends SMS alerts to Thalaivars.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
