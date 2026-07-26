import React, { useState } from 'react';
import { Search, MapPin } from 'lucide-react';

interface HeroSectionProps {
  onSearch: (query: string, filter: string) => void;
  onActionClick: (action: string) => void;
  language: string;
}

export default function HeroSection({ onSearch, onActionClick, language }: HeroSectionProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLocation, setSearchLocation] = useState('');

  const t = {
    en: {
      headline: "Community Platform — Connect, Share & Grow Together",
      subhead: "The digital engine behind communication, governance, fundraising, and family collaboration.",
      trusted: "Trusted by 10,000+ community members across the Nilgiris.",
      searchPlaceholder: "Search members, professions, or Vachanas...",
      locPlaceholder: "Select Location or Hatty...",
      searchBtn: "Search Network",
      card1Title: "Find Jobs / Register",
      card1Text: "Create your profile, select your Hatty, and get discovered by community members.",
      card1Btn: "Create Free Account",
      card2Title: "Find Talent / Support",
      card2Text: "Contribute to the ongoing temple construction campaigns across all 8 Hattys.",
      card2Btn: "Post a Donation",
    },
    kn: {
      headline: "೮ ಹಟ್ಟಿಗಳನ್ನು ಸಂಪರ್ಕಿಸುವ ಪ್ರಮುಖ ಲಿಂಗಾಯತ ಸಮುದಾಯ ನೆಟ್‌ವರ್ಕ್.",
      subhead: "ಸಂಪರ್ಕ, ಆಡಳಿತ, ದೇಣಿಗೆ ಸಂಗ್ರಹ ಮತ್ತು ಕುಟುಂಬದ ಒಗ್ಗಟ್ಟಿನ ಹಿಂದಿನ ಡಿಜಿಟಲ್ ಶಕ್ತಿ.",
      trusted: "ನೀಲಗಿರಿಯಾದ್ಯಂತ ೧೦,೦೦೦+ ಸಮುದಾಯದ ಸದಸ್ಯರಿಂದ ವಿಶ್ವಾಸಾರ್ಹವಾಗಿದೆ.",
      searchPlaceholder: "ಸದಸ್ಯರು, ವೃತ್ತಿಗಳು ಅಥವಾ ವಚನಗಳನ್ನು ಹುಡುಕಿ...",
      locPlaceholder: "ಸ್ಥಳ ಅಥವಾ ಹಟ್ಟಿಯನ್ನು ಆರಿಸಿ...",
      searchBtn: "ಹುಡುಕು",
      card1Title: "ನೋಂದಣಿ ಮತ್ತು ಸಂಪರ್ಕ",
      card1Text: "ನಿಮ್ಮ ಪ್ರೊಫೈಲ್ ರಚಿಸಿ, ಹಟ್ಟಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ ಮತ್ತು ಸಮುದಾಯದ ಜೊತೆ ಸಂಪರ್ಕ ಸಾಧಿಸಿ.",
      card1Btn: "ಖಾತೆ ತೆರೆಯಿರಿ",
      card2Title: "ದೇವಾಲಯದ ನಿಧಿ ಪ್ರಗತಿ",
      card2Text: "ಎಲ್ಲಾ ೮ ಹಟ್ಟಿಗಳ ದೇವಸ್ಥಾನಗಳ ನಿರ್ಮಾಣ ಅಭಿಯಾನಗಳಿಗೆ ನಿಮ್ಮ ದೇಣಿಗೆ ನೀಡಿ.",
      card2Btn: "ದೇಣಿಗೆ ನೀಡಿ",
    },
    ta: {
      headline: "8 ஹட்டிகளை இணைக்கும் முன்னணி லிங்காயத்து சமூக வலைப்பின்னல்.",
      subhead: "தொடர்பு, நிர்வாகம், நிதி திரட்டுதல் மற்றும் குடும்ப ஒற்றுமைக்கான டிஜிட்டல் தளம்.",
      trusted: "நீலகிரி முழுவதும் 10,000+ சமூக உறுப்பினர்களால் நம்பப்படுகிறது.",
      searchPlaceholder: "உறுப்பினர்கள், தொழில்கள் அல்லது வச்சனங்களைத் தேடுக...",
      locPlaceholder: "இடம் அல்லது ஹட்டியைத் தேர்வு செய்க...",
      searchBtn: "தேடுக",
      card1Title: "பதிவு & இணைப்பு",
      card1Text: "உங்கள் சுயவிவரத்தை உருவாக்கி, உங்கள் ஹட்டியைத் தேர்ந்தெடுத்து, சமூகத்துடன் இணையுங்கள்.",
      card1Btn: "கணக்கை உருவாக்கு",
      card2Title: "கோவில் நிதி பங்களிப்பு",
      card2Text: "8 ஹட்டிகளின் கோவில் கட்டுமான பணிகளுக்காக நிதி பங்களிக்கலாம்.",
      card2Btn: "நிதி வழங்கு",
    },
    bd: {
      headline: "Community Platform — Connect, Share & Grow Together",
      subhead: "The digital engine behind communication, governance, fundraising, and family collaboration.",
      trusted: "Trusted by 10,000+ community members across the Nilgiris.",
      searchPlaceholder: "Search members, professions, or Vachanas...",
      locPlaceholder: "Select Location or Hatty...",
      searchBtn: "Search Network",
      card1Title: "Find Jobs / Register",
      card1Text: "Create your profile, select your Hatty, and get discovered by community members.",
      card1Btn: "Create Free Account",
      card2Title: "Find Talent / Support",
      card2Text: "Contribute to the ongoing temple construction campaigns across all 8 Hattys.",
      card2Btn: "Post a Donation",
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    headline: "Community Platform — Connect, Share & Grow Together",
    subhead: "The digital engine behind communication, governance, fundraising, and family collaboration.",
    trusted: "Trusted by 10,000+ community members across the Nilgiris.",
    searchPlaceholder: "Search members, professions, or Vachanas...",
    locPlaceholder: "Select Location or Hatty...",
    searchBtn: "Search Network",
    card1Title: "Find Jobs / Register",
    card1Text: "Create your profile, select your Hatty, and get discovered by community members.",
    card1Btn: "Create Free Account",
    card2Title: "Find Talent / Support",
    card2Text: "Contribute to the ongoing temple construction campaigns across all 8 Hattys.",
    card2Btn: "Post a Donation",
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery, searchLocation);
  };

  return (
    <div className="relative bg-gradient-hero overflow-hidden dots-grid py-12 md:py-20 lg:py-24 text-white font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center justify-center text-center max-w-4xl mx-auto">
          
          {/* Heading and Search Container */}
          <div className="w-full flex flex-col items-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight font-display mb-4 text-white leading-tight leading-[1.05]">
              {t.headline}
            </h1>
            
            <p className="text-lg md:text-xl text-emerald-100 max-w-2xl mb-8 leading-relaxed font-light">
              {t.subhead}
            </p>

            {/* Search Bar - Exactly matching reference styling */}
            <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl md:rounded-full p-2 shadow-2xl flex flex-col md:flex-row items-stretch gap-2 w-full max-w-2xl text-slate-800 text-left">
              {/* Search query input */}
              <div className="flex-1 flex items-center px-3 border-b md:border-b-0 md:border-r border-slate-100">
                <Search className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full py-3 bg-transparent text-sm focus:outline-none border-none text-slate-700 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Location Input */}
              <div className="flex-1 flex items-center px-3">
                <MapPin className="h-5 w-5 text-slate-400 mr-2 flex-shrink-0" />
                <input
                  type="text"
                  value={searchLocation}
                  onChange={(e) => setSearchLocation(e.target.value)}
                  placeholder={t.locPlaceholder}
                  className="w-full py-3 bg-transparent text-sm focus:outline-none border-none text-slate-700 placeholder-slate-400 font-medium"
                />
              </div>

              {/* Search Button */}
              <button
                type="submit"
                className="bg-brand-dark hover:bg-slate-900 text-white font-bold py-3.5 px-7 rounded-xl md:rounded-full transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer border border-brand-green/30"
              >
                <Search className="h-4 w-4" />
                <span className="text-sm font-display tracking-wide">{t.searchBtn}</span>
              </button>
            </form>

            {/* Trusted Stamp */}
            <p className="text-xs text-emerald-200 mt-6 font-semibold tracking-wide flex items-center gap-2 justify-center">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-green-light animate-pulse"></span>
              {t.trusted}
            </p>
          </div>

        </div>
      </div>
      
      {/* Wave bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-6 bg-slate-50 rounded-t-3xl z-10"></div>
    </div>
  );
}
