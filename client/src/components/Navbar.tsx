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

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => setTab('home')}>
              <div className="h-10 w-10 rounded-xl bg-brand-green flex items-center justify-center shadow-md mr-3">
                <span className="text-white text-xl font-bold font-display">🕉️</span>
              </div>
              <div>
                <span className="text-slate-900 font-extrabold text-xl tracking-tight font-display block">Hatty360</span>
                <span className="text-[10px] text-brand-green font-semibold tracking-wider uppercase block -mt-1">Lingayat Community</span>
              </div>
            </div>
            
            {/* Desktop Navigation Links */}
            <div className="hidden lg:ml-8 lg:flex lg:space-x-4">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    currentTab === item.id
                      ? 'text-brand-green bg-brand-green/5'
                      : 'text-slate-600 hover:text-brand-green hover:bg-slate-50'
                  }`}
                >
                  {t(item.name)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="inline-flex items-center px-3 py-2 border border-slate-200 text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 shadow-sm"
              >
                <Globe className="h-4 w-4 mr-2 text-slate-500" />
                <span className="hidden sm:inline">{getLangName(language)}</span>
                <span className="sm:hidden">{language.toUpperCase()}</span>
              </button>

              {langDropdown && (
                <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50 py-1 divide-y divide-slate-100">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 block ${
                        language === lang.code ? 'text-brand-green font-semibold bg-brand-green/5' : 'text-slate-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Profile / Log In / Out */}
            {user ? (
              <div className="flex items-center space-x-3">
                {/* Admin/Thalaivar Dashboard Link */}
                {(user.role === 'Admin' || user.role === 'Thalaivar' || user.role === 'Secretary') && (
                  <button
                    onClick={() => setTab('admin')}
                    className={`p-2 rounded-lg transition-colors relative group ${
                      currentTab === 'admin' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    title="Admin / Thalaivar Panel"
                  >
                    <Shield className="h-4 w-4" />
                    <span className="absolute right-0 top-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                  </button>
                )}

                {/* Profile Card Summary */}
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {user.role} • {user.hatty_name || 'No Hatty'}
                  </span>
                </div>

                <div className="h-8 w-8 rounded-full bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm border border-brand-green/20">
                  {user.name.charAt(0)}
                </div>

                <button
                  onClick={onLogout}
                  className="p-2 border border-slate-200 text-slate-600 rounded-lg hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAuthModal}
                  className="bg-brand-blue hover:bg-brand-blue-dark text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Find Talent / Member Login
                </button>
                <button
                  onClick={onOpenAuthModal}
                  className="bg-brand-green hover:bg-brand-green-dark text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-sm transition-colors"
                >
                  Find Jobs / Register
                </button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-brand-green hover:bg-slate-100 focus:outline-none"
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-2 pt-2 pb-3 space-y-1">
          {navigation.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setIsOpen(false);
              }}
              className={`w-full text-left block px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                currentTab === item.id
                  ? 'text-brand-green bg-brand-green/5'
                  : 'text-slate-700 hover:text-brand-green hover:bg-slate-50'
              }`}
            >
              {t(item.name)}
            </button>
          ))}
          {user && (user.role === 'Admin' || user.role === 'Thalaivar' || user.role === 'Secretary') && (
            <button
              onClick={() => {
                setTab('admin');
                setIsOpen(false);
              }}
              className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-red-600 bg-red-50/50 hover:bg-red-50 transition-colors"
            >
              🛡️ Admin / Thalaivar Panel
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
