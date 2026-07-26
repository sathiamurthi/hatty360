import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import AiChatbot from './components/AiChatbot';
import LandingPage from './pages/LandingPage';
import Onboarding from './pages/Onboarding';
import Directory from './pages/Directory';
import VachanaLibrary from './pages/VachanaLibrary';
import HelpBoard from './pages/HelpBoard';
import Fundraising from './pages/Fundraising';
import WomensGroup from './pages/WomensGroup';
import IssueReporting from './pages/IssueReporting';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import Groups from './pages/Groups';
import SuperAdminLogin from './pages/SuperAdminLogin';
import axios from 'axios';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState(window.location.pathname === '/superadmin' ? 'admin' : 'home');
  const [language, setLanguage] = useState('en');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sync Axios base URL for local development proxy or absolute Render/Vercel URL
  useEffect(() => {
    const envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl) {
      axios.defaults.baseURL = envApiUrl;
    } else if (window.location.hostname !== 'localhost') {
      axios.defaults.baseURL = window.location.origin;
    }
  }, []);

  const handleLogout = () => {
    setUser(null);
    setTab('home');
  };

  const handleSearch = (queryText: string, locationText: string) => {
    // Navigate to directory with pre-filled search params or alert
    setTab('directory');
  };

  const handleHeroAction = (action: string) => {
    if (action === 'register' || action === 'login') {
      setShowAuthModal(true);
    } else if (action === 'donate') {
      setTab('fundraising');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans select-none pb-16">
      
      {/* Navigation Topbar */}
      <Navbar
        user={user}
        onLogout={handleLogout}
        currentTab={tab}
        setTab={setTab}
        language={language}
        setLanguage={setLanguage}
        onOpenAuthModal={() => setShowAuthModal(true)}
      />

      {/* Main App Screens */}
      {user ? (
        <div className="flex-grow lg:pl-64">
          {/* Hero Banner: Only displayed on Home screen */}
          {tab === 'home' && (
            <HeroSection
              onSearch={handleSearch}
              onActionClick={handleHeroAction}
              language={language}
            />
          )}

          {/* Tab Pages */}
          <div className="animate-fadeIn">
            {tab === 'home' && <LandingPage user={user} language={language} setTab={setTab} />}
            {tab === 'directory' && <Directory user={user} language={language} />}
            {tab === 'vachana' && <VachanaLibrary language={language} />}
            {tab === 'fundraising' && <Fundraising user={user} language={language} />}
            {tab === 'help' && <HelpBoard user={user} language={language} />}
            {tab === 'groups' && <Groups user={user} language={language} />}
            {tab === 'shg' && <WomensGroup user={user} language={language} />}
            {tab === 'issues' && <IssueReporting user={user} language={language} />}
            {tab === 'admin' && <AdminDashboard user={user} language={language} />}
            {tab === 'profile' && <Profile user={user} onProfileUpdate={(updatedUser) => setUser(updatedUser)} language={language} />}
          </div>
        </div>
      ) : (
        /* Onboarding Gate or SuperAdmin login */
        <div className="flex-grow flex items-center justify-center py-10 w-full animate-fadeIn">
          {window.location.pathname === '/superadmin' ? (
            <SuperAdminLogin
              onAuthSuccess={(userData) => {
                setUser(userData);
                setLanguage(userData.selected_language || 'en');
                setTab('admin');
              }}
            />
          ) : (
            <Onboarding
              onAuthSuccess={(userData) => {
                setUser(userData);
                setLanguage(userData.selected_language || 'en');
                setShowAuthModal(false);
              }}
              language={language}
              setLanguage={setLanguage}
            />
          )}
        </div>
      )}

      {/* FLOATING MULTI-LINGUAL AI BOT */}
      <AiChatbot language={language} user={user} />

      {/* BACK TO LOGIN LIGHTWEIGHT DIALOG */}
      {showAuthModal && !user && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 space-y-4 border border-slate-100 animate-scaleUp text-center">
            <h3 className="font-extrabold text-lg text-slate-950 font-display">Authentication Portal</h3>
            <p className="text-xs text-slate-500 font-medium">Please enter your name and phone number in the main onboarding form to register or log in.</p>
            <button
              onClick={() => setShowAuthModal(false)}
              className="w-full py-3 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
            >
              Okay, I understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
