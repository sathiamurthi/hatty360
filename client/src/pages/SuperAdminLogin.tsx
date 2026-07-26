import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock, ArrowRight, Home } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface SuperAdminLoginProps {
  onAuthSuccess: (user: any) => void;
}

export default function SuperAdminLogin({ onAuthSuccess }: SuperAdminLoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        phone: email, // Backend maps email to phone parameter for unified auth route
        password
      });

      if (res.data.status === 'approved') {
        confetti({ particleCount: 120, spread: 80 });
        onAuthSuccess(res.data.user);
      } else {
        setError('SuperAdmin account has not been approved.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || 'Incorrect SuperAdmin credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantLogin = async (emailAddr: string) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', {
        phone: emailAddr,
        password: 'Admin@123'
      });
      if (res.data.status === 'approved') {
        confetti({ particleCount: 120, spread: 80 });
        onAuthSuccess(res.data.user);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Instant login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 relative overflow-hidden">
        {/* Top styling strip */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-amber-500 to-yellow-600"></div>

        {/* LOGO Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-black text-slate-900 tracking-tight font-display">
            SuperAdmin Portal
          </h2>
          <p className="mt-2 text-sm text-slate-600 font-medium">
            Secure administrative control login
          </p>
        </div>

        {/* Instant Login banner inside portal */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-amber-800 flex items-center justify-center gap-1">
            ⚡ Evaluation Direct Access
          </span>
          <button
            type="button"
            onClick={() => handleInstantLogin('paariwalaconnect@gmail.com')}
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs py-2 rounded-xl transition-all shadow cursor-pointer border border-transparent"
          >
            Login directly as paariwalaconnect@gmail.com
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-4 leading-relaxed animate-shake">
            {error}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4 rounded-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="superadmin@demandgeniusai.com"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Secret Password
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-2xl text-white bg-slate-900 hover:bg-slate-800 focus:outline-none shadow-md transition-all cursor-pointer font-display tracking-wider"
          >
            {loading ? 'Authenticating Admin...' : 'Access Control Room'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </form>

        <div className="text-center pt-2">
          <a
            href="/"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            Return to Community Home
          </a>
        </div>
      </div>
    </div>
  );
}
