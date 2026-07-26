import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Send, Globe, Phone, Mail, Award } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface TalentShowcaseProps {
  user: any;
  language: string;
}

export default function TalentShowcase({ user, language }: TalentShowcaseProps) {
  const [talents, setTalents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [talentName, setTalentName] = useState(user?.name || '');
  const [talentCategory, setTalentCategory] = useState('Singer');
  const [talentDesc, setTalentDesc] = useState('');
  const [talentContact, setTalentContact] = useState(user?.phone || '');
  const [talentLink, setTalentLink] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = [
    'Sports',
    'Singer',
    'Dancer',
    'Musician',
    'Artist',
    'Writer',
    'Technology',
    'Other'
  ];

  useEffect(() => {
    fetchTalents();
  }, [selectedCategory]);

  const fetchTalents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/talents', {
        params: { search, category: selectedCategory }
      });
      setTalents(res.data.talents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTalents();
  };

  const handleAddTalent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!talentName || !talentDesc || !talentCategory) {
      setFormError('Name, category, and description are required.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await axios.post('/api/talents', {
        user_id: user?.id,
        name: talentName,
        category: talentCategory,
        description: talentDesc,
        contact_info: talentContact,
        portfolio_link: talentLink
      });
      confetti({ particleCount: 100, spread: 80 });
      alert('Your talent has been successfully showcase-listed!');
      
      // Reset
      setTalentName(user?.name || '');
      setTalentCategory('Singer');
      setTalentDesc('');
      setTalentContact(user?.phone || '');
      setTalentLink('');
      setShowAddModal(false);
      fetchTalents();
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to list your talent.');
    } finally {
      setSubmitting(false);
    }
  };

  const t = {
    en: {
      title: "Talent Showcase",
      sub: "Explore and search skills inside our community, or add yours to showcase your expertise!",
      searchPlaceholder: "Search talents by name, category, keyword...",
      allCategories: "All Talents",
      addBtn: "Showcase Your Talent",
      noTalents: "No talent listings found. Be the first to showcase yours!",
      searchBtn: "Search"
    },
    kn: {
      title: "ಪ್ರತಿಭಾ ಪ್ರದರ್ಶನ",
      sub: "ನಮ್ಮ ಸಮುದಾಯದ ಪ್ರತಿಭೆಗಳನ್ನು ಹುಡುಕಿ, ಅಥವಾ ನಿಮ್ಮ ಪರಿಣತಿಯನ್ನು ಪ್ರದರ್ಶಿಸಲು ನಿಮ್ಮದನ್ನು ಸೇರಿಸಿ!",
      searchPlaceholder: "ಹೆಸರು, ವರ್ಗ ಅಥವಾ ಕೀವರ್ಡ್ ಮೂಲಕ ಹುಡುಕಿ...",
      allCategories: "ಎಲ್ಲಾ ಪ್ರತಿಭೆಗಳು",
      addBtn: "ನಿಮ್ಮ ಪ್ರತಿಭೆ ಪ್ರದರ್ಶಿಸಿ",
      noTalents: "ಯಾವುದೇ ಪ್ರತಿಭೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ಮೊದಲು ನಿಮ್ಮದನ್ನು ಸೇರಿಸಿ!",
      searchBtn: "ಹುಡುಕು"
    },
    ta: {
      title: "திறமை காட்சிப் பெட்டி",
      sub: "எங்கள் சமூகத்திற்குள் திறமைகளைத் தேடுங்கள், அல்லது உங்கள் நிபுணத்துவத்தைக் காட்ட உங்களுடையதைச் சேர்க்கவும்!",
      searchPlaceholder: "பெயர், வகை அல்லது முக்கிய வார்த்தை மூலம் தேடுக...",
      allCategories: "அனைத்து திறமைகள்",
      addBtn: "உங்கள் திறமையை காட்டுங்கள்",
      noTalents: "திறமைகள் எதுவும் காணப்படவில்லை. உங்களுடையதை முதலில் சேர்க்கவும்!",
      searchBtn: "தேடுக"
    },
    bd: {
      title: "Talent Showcase",
      sub: "Explore and search skills inside our community, or add yours to showcase your expertise!",
      searchPlaceholder: "Search talents by name, category, keyword...",
      allCategories: "All Talents",
      addBtn: "Showcase Your Talent",
      noTalents: "No talent listings found. Be the first to showcase yours!",
      searchBtn: "Search"
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    title: "Talent Showcase",
    sub: "Explore and search skills inside our community, or add yours to showcase your expertise!",
    searchPlaceholder: "Search talents by name, category, keyword...",
    allCategories: "All Talents",
    addBtn: "Showcase Your Talent",
    noTalents: "No talent listings found. Be the first to showcase yours!",
    searchBtn: "Search"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Title Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
            🌟 {t.title}
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-1">{t.sub}</p>
        </div>
        {user && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-5 py-3 text-xs font-bold text-white bg-brand-green hover:bg-brand-green-dark rounded-xl tracking-wide uppercase transition-all shadow-md cursor-pointer border border-transparent self-start md:self-auto hover:scale-[1.02]"
          >
            <Sparkles className="h-4 w-4" />
            {t.addBtn}
          </button>
        )}
      </div>

      {/* Categories Horizontal Tabs */}
      <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar mb-6">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex-shrink-0 cursor-pointer ${
            selectedCategory === ''
              ? 'bg-slate-900 text-white shadow-md'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {t.allCategories}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex-shrink-0 cursor-pointer ${
              selectedCategory === cat
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search form */}
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
          className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-6 rounded-xl transition-all font-display text-sm tracking-wide shadow-md cursor-pointer border border-transparent"
        >
          {t.searchBtn}
        </button>
      </form>

      {/* Talents Display Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-brand-green animate-spin"></span>
        </div>
      ) : talents.length === 0 ? (
        <p className="text-sm text-slate-400 font-medium text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
          {t.noTalents}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {talents.map((t) => (
            <div key={t.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 h-16 w-16 bg-slate-50 rounded-bl-[2.5rem] flex items-center justify-center font-bold text-xl group-hover:bg-emerald-50 transition-colors pointer-events-none">
                🏅
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 tracking-tight leading-tight">{t.name}</h4>
                    <span className="text-[9px] font-black uppercase tracking-wider text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-2 py-0.5 rounded-full mt-1.5 inline-block">
                      {t.category}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50/50 p-3 rounded-2xl border border-slate-100/40">
                  <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap">{t.description}</p>
                </div>
              </div>

              <div className="border-t border-slate-50 pt-4 mt-4 flex items-center justify-between flex-wrap gap-2 text-[10px] font-bold text-slate-400">
                {t.contact_info && (
                  <div className="flex items-center gap-1 text-slate-600">
                    <Phone className="h-3 w-3 text-slate-400" />
                    <span>{t.contact_info}</span>
                  </div>
                )}
                
                {t.portfolio_link && (
                  <a
                    href={t.portfolio_link.startsWith('http') ? t.portfolio_link : `https://${t.portfolio_link}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer border border-transparent"
                  >
                    <Globe className="h-3 w-3" />
                    Portfolio / Socials
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* SHOWCASE TALENT ENTRY FORM MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 space-y-4 border border-slate-100 animate-scaleUp">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-lg text-slate-950 font-display flex items-center gap-1.5">
                <Award className="h-5 w-5 text-brand-green" />
                Showcase Your Skill / Talent
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddTalent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Full Name / Stage Name
                </label>
                <input
                  type="text"
                  required
                  value={talentName}
                  onChange={(e) => setTalentName(e.target.value)}
                  placeholder="e.g. Basavaraj Madhav"
                  className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Talent Category
                  </label>
                  <select
                    value={talentCategory}
                    onChange={(e) => setTalentCategory(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Contact Info (Phone / Social)
                  </label>
                  <input
                    type="text"
                    value={talentContact}
                    onChange={(e) => setTalentContact(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Portfolio / Social Media Link (Optional)
                </label>
                <input
                  type="text"
                  value={talentLink}
                  onChange={(e) => setTalentLink(e.target.value)}
                  placeholder="e.g. youtube.com/basavaraj-music"
                  className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Tell Us About Your Talent / Skill Set
                </label>
                <textarea
                  required
                  rows={4}
                  value={talentDesc}
                  onChange={(e) => setTalentDesc(e.target.value)}
                  placeholder="Explain what you do, achievements, and what services/showcase you can offer to the community..."
                  className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300 resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border border-transparent shadow-sm"
                >
                  {submitting ? 'Showcasing...' : 'Publish Talent'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
