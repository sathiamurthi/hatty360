import React, { useState } from 'react';
import { BookOpen, User, LogOut, Shield, Globe, Menu, X, Landmark } from 'lucide-react';

interface NavbarProps {
  user: any;
  onLogout: () => void;
  currentTab: string;
  setTab: (tab: string) => void;
  language: string;
  setLanguage: (lang: string) => void;
  onOpenAuthModal: () => void;
}

export default function Navbar({
  user,
  onLogout,
  currentTab,
  setTab,
  language,
  setLanguage,
  onOpenAuthModal
}: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [langDropdown, setLangDropdown] = useState(false);

  const navigation = [
    { name: { en: 'Home', kn: 'ಮುಖಪುಟ', ta: 'முகப்பு', bd: 'Home' }, id: 'home' },
    { name: { en: 'Directory', kn: 'ಡೈರೆಕ್ಟರಿ', ta: 'வழிகாட்டி', bd: 'Directory' }, id: 'directory' },
    { name: { en: 'Vachana Library', kn: 'ವಚನ ಗ್ರಂಥಾಲಯ', ta: 'வச்சன நூலகம்', bd: 'Vachana' }, id: 'vachana' },
    { name: { en: 'Fundraising', kn: 'ದೇಣಿಗೆ ಸಂಗ್ರಹ', ta: 'நிதி திரட்டல்', bd: 'Fundraising' }, id: 'fundraising' },
    { name: { en: 'Help Board', kn: 'ಸಹಾಯ ಬೋರ್ಡ್', ta: 'உதவி பலகை', bd: 'Help Board' }, id: 'help' },
    { name: { en: 'Groups', kn: 'ಗುಂಪುಗಳು', ta: 'குழுக்கள்', bd: 'Groups' }, id: 'groups' },
    { name: { en: 'Talents Showcase', kn: 'ಪ್ರತಿಭಾ ಪ್ರದರ್ಶನ', ta: 'திறமைகள்', bd: 'Talents' }, id: 'talents' },
    { name: { en: 'Women\'s SHG', kn: 'ಮಹಿಳಾ ಸಂಘ', ta: 'மகளிர் குழு', bd: 'Women\'s SHG' }, id: 'shg' },
    { name: { en: 'Issues', kn: 'ಸಮಸ್ಯೆಗಳು', ta: 'புகார்கள்', bd: 'Issues' }, id: 'issues' },
  ];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
    { code: 'ta', name: 'தமிழ் (Tamil)' },
    { code: 'bd', name: 'Badaga' }
  ];

  const t = (key: any) => {
    return key[language as 'en'|'kn'|'ta'|'bd'] || key['en'];
  };

  const getLangName = (code: string) => {
    const lang = languages.find(l => l.code === code);
    return lang ? lang.name : 'English';
  };

  const isAuthorizedForAdmin = user && (
    user.role === 'Admin' || 
    user.role === 'Thalaivar' || 
    user.role === 'Secretary' || 
    user.role === 'Finance Secretary' ||
    user.role === 'SuperAdmin'
  );

  return (
    <>
      {/* ========================================================================= */}
      {/* DESKTOP SIDEBAR (leftnavbar) */}
      {/* ========================================================================= */}
      <nav className="hidden lg:flex lg:flex-col lg:justify-between lg:fixed lg:inset-y-0 lg:left-0 lg:w-64 lg:bg-white lg:border-r lg:border-slate-100 lg:z-40 font-sans shadow-sm">
        
        {/* Top Section: Logo & Branding */}
        <div className="p-6 border-b border-slate-50">
          <div className="flex flex-col items-center text-center cursor-pointer" onClick={() => setTab('home')}>
            <div className="h-12 w-12 rounded-2xl bg-brand-green flex items-center justify-center shadow-md mb-3 transition-transform hover:scale-105">
              <span className="text-white text-2xl font-bold font-display">🕉️</span>
            </div>
            <span className="text-slate-900 font-black text-2xl tracking-tight font-display">Hatty360</span>
            <span className="text-[9px] text-brand-green font-bold tracking-wider uppercase mt-1 leading-normal">
              Community Platform — Connect, Share & Grow Together
            </span>
          </div>
        </div>

        {/* Middle Section: Navigation Links */}
        <div className="flex-grow py-6 overflow-y-auto px-4 space-y-1.5">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${
                currentTab === item.id
                  ? 'text-brand-green bg-brand-green/5 shadow-sm border-l-4 border-brand-green'
                  : 'text-slate-600 hover:text-brand-green hover:bg-slate-50'
              }`}
            >
              {t(item.name)}
            </button>
          ))}
        </div>

        {/* Bottom Section: Language & Authentication */}
        <div className="p-4 border-t border-slate-50 space-y-4 bg-slate-50/50">
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setLangDropdown(!langDropdown)}
              className="w-full flex items-center justify-between px-4 py-2.5 border border-slate-200 text-sm font-medium rounded-xl text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
            >
              <span className="flex items-center">
                <Globe className="h-4 w-4 mr-2 text-slate-400" />
                {getLangName(language)}
              </span>
              <span className="text-xs text-slate-400 font-bold font-sans">▲</span>
            </button>

            {langDropdown && (
              <div className="absolute left-0 bottom-full mb-2 w-full rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 divide-y divide-slate-100 max-h-48 overflow-y-auto">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 block ${
                      language === lang.code ? 'text-brand-green font-bold bg-brand-green/5' : 'text-slate-700'
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Section / Login buttons */}
          {user ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white border border-slate-100 rounded-xl p-3 shadow-sm">
                
                {/* Profile Link Badge */}
                <button
                  onClick={() => setTab('profile')}
                  className="flex items-center gap-2.5 text-left focus:outline-none hover:opacity-80 transition-opacity flex-1 min-w-0"
                  title="View / Edit Profile"
                >
                  <div className="h-9 w-9 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-black text-sm border border-brand-green/20 shrink-0">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-xs font-bold text-slate-900 leading-tight truncate">{user.name}</span>
                    <span className="text-[10px] text-slate-500 font-bold truncate">
                      {user.role}
                    </span>
                  </div>
                </button>

                {/* Dashboard Shortcut */}
                {isAuthorizedForAdmin && (
                  <button
                    onClick={() => setTab('admin')}
                    className={`p-1.5 rounded-lg transition-colors shrink-0 ${
                      currentTab === 'admin' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                    title="Dashboard / Admin Panel"
                  >
                    <Shield className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-xl hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-colors text-sm font-semibold shadow-sm"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <button
                onClick={onOpenAuthModal}
                className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-colors uppercase tracking-wider text-center"
              >
                Find Talent / Login
              </button>
              <button
                onClick={onOpenAuthModal}
                className="w-full bg-brand-green hover:bg-brand-green-dark text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-sm transition-colors uppercase tracking-wider text-center"
              >
                Find Jobs / Register
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* ========================================================================= */}
      {/* MOBILE TOP BAR & NAVIGATION */}
      {/* ========================================================================= */}
      <nav className="lg:hidden bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm font-sans flex items-center justify-between px-4 h-16 w-full">
        {/* Logo */}
        <div className="flex items-center cursor-pointer" onClick={() => setTab('home')}>
          <div className="h-9 w-9 rounded-xl bg-brand-green flex items-center justify-center shadow-md mr-2.5">
            <span className="text-white text-lg font-bold font-display">🕉️</span>
          </div>
          <div>
            <span className="text-slate-900 font-extrabold text-lg tracking-tight font-display block">Hatty360</span>
            <span className="text-[7px] text-brand-green font-bold tracking-wider uppercase block -mt-1">
              Community Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mobile Profile Trigger (only icon) */}
          {user && (
            <button
              onClick={() => setTab('profile')}
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs border transition-all ${
                currentTab === 'profile' ? 'bg-brand-green text-white border-brand-green' : 'bg-brand-green/10 text-brand-green border-brand-green/20'
              }`}
            >
              {user.name.charAt(0).toUpperCase()}
            </button>
          )}

          {/* Hamburger Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-brand-green hover:bg-slate-100 focus:outline-none"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu Drawer Overlay */}
        {isOpen && (
          <div className="absolute top-16 left-0 w-full bg-white border-b border-slate-200 shadow-xl z-50 flex flex-col p-4 space-y-4 max-h-[calc(100vh-4rem)] overflow-y-auto">
            
            {/* Links */}
            <div className="flex flex-col gap-1.5">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setTab(item.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-base font-semibold transition-colors ${
                    currentTab === item.id
                      ? 'text-brand-green bg-brand-green/5 font-bold'
                      : 'text-slate-700 hover:text-brand-green hover:bg-slate-50'
                  }`}
                >
                  {t(item.name)}
                </button>
              ))}

              {isAuthorizedForAdmin && (
                <button
                  onClick={() => {
                    setTab('admin');
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl text-base font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                >
                  🛡️ Dashboard / Admin Panel
                </button>
              )}
            </div>

            {/* Language Selector inside Mobile Menu */}
            <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider px-4">Language</span>
              <div className="grid grid-cols-2 gap-2 px-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 rounded-xl text-xs text-center font-bold border transition-colors ${
                      language === lang.code
                        ? 'bg-brand-green/5 border-brand-green text-brand-green'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {lang.name.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Session Info / Auth inside Mobile Menu */}
            <div className="border-t border-slate-100 pt-3 flex flex-col gap-2">
              {user ? (
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-100 text-red-600 rounded-xl hover:bg-red-50 transition-colors text-sm font-semibold"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  Logout
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    onClick={() => {
                      onOpenAuthModal();
                      setIsOpen(false);
                    }}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-3 rounded-xl text-xs font-black shadow-sm text-center uppercase tracking-wider"
                  >
                    Find Talent / Login
                  </button>
                  <button
                    onClick={() => {
                      onOpenAuthModal();
                      setIsOpen(false);
                    }}
                    className="bg-brand-green hover:bg-brand-green-dark text-white px-4 py-3 rounded-xl text-xs font-black shadow-sm text-center uppercase tracking-wider"
                  >
                    Find Jobs / Register
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
