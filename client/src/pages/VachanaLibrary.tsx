import React, { useState, useEffect } from 'react';
import { BookOpen, Search, Filter, Quote } from 'lucide-react';
import axios from 'axios';

interface VachanaLibraryProps {
  language: string;
}

export default function VachanaLibrary({ language }: VachanaLibraryProps) {
  const [vachanas, setVachanas] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedAuthor, setSelectedAuthor] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchVachanas();
  }, [selectedAuthor]);

  const fetchVachanas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/vachanas', {
        params: { search }
      });
      let data = res.data.vachanas;
      if (selectedAuthor) {
        data = data.filter((v: any) => v.author === selectedAuthor);
      }
      setVachanas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVachanas();
  };

  const t = {
    en: {
      title: "Vachana Library",
      sub: "Explore the eternal teachings of Shiva Sharanas: Basavanna, Akka Mahadevi, and Allama Prabhu.",
      searchPlaceholder: "Search Vachanas by keyword or author...",
      allAuthors: "All Sharanas",
      kannada: "Kannada Original",
      translit: "Transliteration",
      translation: "English Translation",
      meaning: "Philosophical Meaning",
      noVachanas: "No vachanas found matching your search.",
      searchBtn: "Search"
    },
    kn: {
      title: "ವಚನ ಸಾಹಿತ್ಯ ಗ್ರಂಥಾಲಯ",
      sub: "ಶಿವಶರಣರಾದ ಬಸವಣ್ಣ, ಅಕ್ಕಮಹಾದೇವಿ ಮತ್ತು ಅಲ್ಲಮಪ್ರಭು ಅವರ ಶಾಶ್ವತ ಬೋಧನೆಗಳನ್ನು ಅನ್ವೇಷಿಸಿ.",
      searchPlaceholder: "ಕೀವರ್ಡ್ ಅಥವಾ ಶರಣರ ಹೆಸರಿನಿಂದ ಹುಡುಕಿ...",
      allAuthors: "ಎಲ್ಲಾ ಶರಣರು",
      kannada: "ಕನ್ನಡ ಮೂಲ ವಚನ",
      translit: "ಲಿಪ್ಯಂತರ (Transliteration)",
      translation: "ಇಂಗ್ಲಿಷ್ ಅನುವಾದ",
      meaning: "ಭಾವಾರ್ಥ ಮತ್ತು ಹಿನ್ನೆಲೆ",
      noVachanas: "ಯಾವುದೇ ವಚನಗಳು ಕಂಡುಬಂದಿಲ್ಲ.",
      searchBtn: "ಹುಡುಕು"
    },
    ta: {
      title: "வச்சன நூலகம்",
      sub: "சிவ சரணர்களான பசவண்ணர், அக்கா மாதேவி மற்றும் அல்லம பிரபுவின் ஆன்மீக போதனைகளை ஆராயுங்கள்.",
      searchPlaceholder: "சரண் பெயர் அல்லது வார்த்தை மூலம் தேடுக...",
      allAuthors: "அனைத்து சரணர்கள்",
      kannada: "கன்னட மூலம்",
      translit: "ஒலிபெயர்ப்பு (Transliteration)",
      translation: "ஆங்கில மொழிபெயர்ப்பு",
      meaning: "தத்துவ விளக்கம்",
      noVachanas: "வச்சனங்கள் எதுவும் காணப்படவில்லை.",
      searchBtn: "தேடுக"
    },
    bd: {
      title: "Vachana Library",
      sub: "Explore the eternal teachings of Shiva Sharanas: Basavanna, Akka Mahadevi, and Allama Prabhu.",
      searchPlaceholder: "Search Vachanas by keyword or author...",
      allAuthors: "All Sharanas",
      kannada: "Kannada Original",
      translit: "Transliteration",
      translation: "English Translation",
      meaning: "Philosophical Meaning",
      noVachanas: "No vachanas found matching your search.",
      searchBtn: "Search"
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    title: "Vachana Library",
    sub: "Explore the eternal teachings of Shiva Sharanas: Basavanna, Akka Mahadevi, and Allama Prabhu.",
    searchPlaceholder: "Search Vachanas by keyword or author...",
    allAuthors: "All Sharanas",
    kannada: "Kannada Original",
    translit: "Transliteration",
    translation: "English Translation",
    meaning: "Philosophical Meaning",
    noVachanas: "No vachanas found matching your search.",
    searchBtn: "Search"
  };

  const authorsList = ["Basavanna", "Akka Mahadevi"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">{t.title}</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">{t.sub}</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => setSelectedAuthor('')}
          className={`px-4 py-2 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex-shrink-0 cursor-pointer ${
            selectedAuthor === ''
              ? 'bg-brand-green text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.allAuthors}
        </button>
        {authorsList.map((author) => (
          <button
            key={author}
            onClick={() => setSelectedAuthor(author)}
            className={`px-4 py-2 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex-shrink-0 cursor-pointer ${
              selectedAuthor === author
                ? 'bg-brand-green text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {author}
          </button>
        ))}
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm flex gap-2 mb-8 max-w-2xl">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="flex-grow px-4 py-3 bg-transparent text-sm focus:outline-none text-slate-700 placeholder-slate-400 font-medium"
        />
        <button
          type="submit"
          className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-6 rounded-xl transition-all font-display text-sm tracking-wide shadow-md cursor-pointer"
        >
          {t.searchBtn}
        </button>
      </form>

      {/* Vachanas Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-brand-green animate-spin"></span>
        </div>
      ) : vachanas.length === 0 ? (
        <p className="text-sm text-slate-400 font-medium text-center py-12 bg-white rounded-3xl border border-slate-100">
          {t.noVachanas}
        </p>
      ) : (
        <div className="space-y-8">
          {vachanas.map((v) => (
            <div key={v.id} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-sm relative overflow-hidden group">
              {/* Decorative Corner Icon */}
              <div className="absolute -right-6 -bottom-6 h-24 w-24 text-slate-50 group-hover:text-emerald-50 transition-colors duration-300 pointer-events-none">
                <Quote className="h-full w-full rotate-180" />
              </div>
              
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <div className="h-10 w-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">
                  📖
                </div>
                <div>
                  <h4 className="font-extrabold text-lg text-slate-900 tracking-tight leading-none">{v.author}</h4>
                  <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full mt-1.5 inline-block uppercase tracking-wider">
                    Vachana Shanti
                  </span>
                </div>
              </div>

              {/* Side-by-Side Contents (Three columns: Kannada, Transliteration, Translation) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4 border-t border-slate-50 relative z-10">
                {/* 1. Kannada */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-black text-brand-green uppercase tracking-widest">{t.kannada}</h5>
                  <p className="text-base text-slate-800 font-bold leading-relaxed font-sans">{v.text_kannada}</p>
                </div>

                {/* 2. Transliteration */}
                <div className="space-y-2 lg:border-l lg:border-r lg:border-slate-100 lg:px-6">
                  <h5 className="text-[10px] font-black text-brand-blue uppercase tracking-widest">{t.translit}</h5>
                  <p className="text-sm text-slate-600 font-medium italic leading-relaxed">{v.transliteration}</p>
                </div>

                {/* 3. Translation */}
                <div className="space-y-2">
                  <h5 className="text-[10px] font-black text-yellow-600 uppercase tracking-widest">{t.translation}</h5>
                  <p className="text-sm text-slate-700 font-semibold leading-relaxed">{v.text_english}</p>
                </div>
              </div>

              {/* Philosophical Explanation */}
              <div className="mt-6 pt-4 border-t border-slate-50 relative z-10 bg-slate-50 rounded-2xl p-4">
                <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t.meaning}</h5>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{v.explanation}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
