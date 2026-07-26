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
import TalentShowcase from './pages/TalentShowcase';
import SongsLibrary from './pages/SongsLibrary';
import SuperAdminLogin from './pages/SuperAdminLogin';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { Star, Send } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [tab, setTab] = useState(window.location.pathname === '/superadmin' ? 'admin' : 'home');
  const [language, setLanguage] = useState('en');
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Global feedback states
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'idea'>('feedback');
  const [rating, setRating] = useState(5);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const tFeedback = {
    en: {
      feedbackSubmit: "Submit Feedback",
      feedbackSuccess: "Thank you for your feedback!"
    },
    kn: {
      feedbackSubmit: "ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ",
      feedbackSuccess: "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!"
    },
    ta: {
      feedbackSubmit: "கருத்தைச் சமர்ப்பி",
      feedbackSuccess: "உங்கள் கருத்துக்கு நன்றி!"
    },
    bd: {
      feedbackSubmit: "Submit Feedback",
      feedbackSuccess: "Thank you for your feedback!"
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    feedbackSubmit: "Submit Feedback",
    feedbackSuccess: "Thank you for your feedback!"
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackLoading(true);
    try {
      await axios.post('/api/feedback', {
        user_id: user?.id || null,
        rating: feedbackType === 'idea' ? null : rating,
        comment: feedbackComment,
        context_action: 'onboarding_rating',
        type: feedbackType
      });
      setFeedbackSubmitted(true);
      setFeedbackComment('');
      confetti({ particleCount: 40, colors: ['#006853', '#0f62ac'] });
    } catch (err) {
      console.error(err);
    } finally {
      setFeedbackLoading(false);
    }
  };

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
            {tab === 'home' && (
              <LandingPage 
                user={user} 
                language={language} 
                setTab={setTab} 
                onOpenFeedback={() => {
                  setFeedbackSubmitted(false);
                  setFeedbackComment('');
                  setShowFeedbackModal(true);
                }} 
              />
            )}
            {tab === 'directory' && <Directory user={user} language={language} />}
            {tab === 'vachana' && <VachanaLibrary user={user} language={language} />}
            {tab === 'fundraising' && <Fundraising user={user} language={language} />}
            {tab === 'help' && <HelpBoard user={user} language={language} />}
            {tab === 'groups' && <Groups user={user} language={language} />}
            {tab === 'talents' && <TalentShowcase user={user} language={language} />}
            {tab === 'songs' && <SongsLibrary user={user} language={language} />}
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
      {/* ONBOARDING / WELCOME SCREEN FEEDBACK FLOATING TRIGGER */}
      {!user && (
        <div className="fixed top-4 right-4 z-50">
          <button
            type="button"
            onClick={() => {
              setFeedbackSubmitted(false);
              setFeedbackComment('');
              setShowFeedbackModal(true);
            }}
            className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-2.5 px-4.5 rounded-2xl text-xs shadow-lg hover:shadow-xl flex items-center gap-1.5 cursor-pointer font-display tracking-wide border border-white/10 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <span>💡</span> Share Feedback / Idea
          </button>
        </div>
      )}

      {/* GLOBAL FEEDBACK & IDEA SUBMISSION FORM MODAL */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 text-white rounded-3xl w-full max-w-md shadow-2xl border border-white/10 overflow-hidden animate-scaleIn flex flex-col p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b border-white/10 pb-3">
              <h3 className="text-base font-extrabold tracking-tight font-display flex items-center gap-2">
                {feedbackType === 'idea' ? (
                  <>
                    <span className="text-blue-400 font-bold">💡</span>
                    <span>Share a Community Idea</span>
                  </>
                ) : (
                  <>
                    <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                    <span>How was your experience?</span>
                  </>
                )}
              </h3>
              <button
                type="button"
                onClick={() => setShowFeedbackModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-200 border border-white/10 rounded-lg px-2.5 py-1"
              >
                Close
              </button>
            </div>

            {/* Type Toggle Tab Row */}
            <div className="flex bg-slate-900 p-1 rounded-xl gap-1 text-[10px] uppercase tracking-wide relative z-10">
              <button
                type="button"
                onClick={() => setFeedbackType('feedback')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  feedbackType === 'feedback' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                ⭐ Feedback
              </button>
              <button
                type="button"
                onClick={() => setFeedbackType('idea')}
                className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
                  feedbackType === 'idea' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-300'
                }`}
              >
                💡 Share Idea
              </button>
            </div>

            {feedbackSubmitted ? (
              <div className="space-y-4 py-4 text-center">
                <div className="bg-brand-green/20 border border-brand-green-light/30 text-brand-green-light rounded-2xl p-4 text-xs font-semibold animate-pulse">
                  {feedbackType === 'idea' ? 'Thank you for sharing your idea!' : tFeedback.feedbackSuccess}
                </div>
                <button
                  type="button"
                  onClick={() => setShowFeedbackModal(false)}
                  className="px-4 py-2 bg-white text-slate-900 font-bold rounded-xl text-xs"
                >
                  Done
                </button>
              </div>
            ) : (
              <form 
                onSubmit={submitFeedback} 
                className="space-y-3 relative z-10"
              >
                {feedbackType === 'feedback' && (
                  <>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                      Rate the App/Platform:
                    </p>
                    {/* Stars selector */}
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="transition-transform hover:scale-110"
                        >
                          <Star className={`h-6 w-6 cursor-pointer ${star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-600'}`} />
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  {feedbackType === 'idea' ? 'Description of your idea:' : 'Comments:'}
                </p>

                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder={feedbackType === 'idea' ? 'Tell us how we can connect, share, or grow together...' : 'Share your thoughts...'}
                  required
                  className="w-full bg-slate-900/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-green-light resize-none"
                ></textarea>

                <button
                  type="submit"
                  disabled={feedbackLoading}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-2.5 px-4 rounded-xl w-full text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-transparent shadow-md"
                >
                  <Send className="h-3.5 w-3.5" />
                  {feedbackType === 'idea' ? 'Submit Idea' : tFeedback.feedbackSubmit}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
