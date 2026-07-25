import React, { useState, useEffect } from 'react';
import { HelpCircle, Briefcase, Plus, HeartPulse, DollarSign, ExternalLink, Send, Search, MapPin, EyeOff } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface HelpBoardProps {
  user: any;
  language: string;
}

export default function HelpBoard({ user, language }: HelpBoardProps) {
  const [posts, setPosts] = useState<any[]>([]);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [loading, setLoading] = useState(false);

  // New post state
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('general');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [contactNumber, setContactNumber] = useState('');

  // AI External job search state
  const [jobRole, setJobRole] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
  }, [categoryFilter]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/help-board', {
        params: { category: categoryFilter || undefined }
      });
      setPosts(res.data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content || !category) return;
    setLoading(true);
    try {
      await axios.post('/api/help-board', {
        user_id: user.id,
        title,
        content,
        category,
        is_anonymous: isAnonymous,
        contact_number: contactNumber || user.phone
      });
      setTitle('');
      setContent('');
      setIsAnonymous(false);
      setContactNumber('');
      setShowForm(false);
      confetti({ particleCount: 50, spread: 60 });
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAiJobSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobRole) return;
    setAiLoading(true);
    setAiResults(null);
    try {
      const res = await axios.get('/api/jobs/external', {
        params: { role: jobRole, location: jobLocation }
      });
      setAiResults(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'medical': return <HeartPulse className="h-4 w-4 text-red-500" />;
      case 'financial': return <DollarSign className="h-4 w-4 text-emerald-500" />;
      case 'job_opening': return <Briefcase className="h-4 w-4 text-blue-500" />;
      case 'job_seeking': return <Search className="h-4 w-4 text-purple-500" />;
      default: return <HelpCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  const t = {
    en: {
      title: "Help Board & Job Openings",
      sub: "Peer-to-peer listings for jobs, referrals, medical/financial assistance.",
      aiTitle: "AI External Job Finder",
      aiSub: "Query AI to fetch live jobs from Naukri, Indeed, and LinkedIn.",
      aiPlaceholder: "e.g. React Developer",
      locPlaceholder: "e.g. Bengaluru",
      aiSearchBtn: "Scan Jobs",
      createPost: "Post a Request",
      anonCheck: "Post anonymously to public feed"
    },
    kn: {
      title: "ಸಹಾಯ ಬೋರ್ಡ್ ಮತ್ತು ಉದ್ಯೋಗಗಳು",
      sub: "ಉದ್ಯೋಗಗಳು, ವೈದ್ಯಕೀಯ ಮತ್ತು ಆರ್ಥಿಕ ಸಹಾಯಕ್ಕಾಗಿ ಸದಸ್ಯರ ನೆರವು ವೇದಿಕೆ.",
      aiTitle: "ಎಐ ಉದ್ಯೋಗ ಶೋಧಕ",
      aiSub: "ನೌಕ್ರಿ, ಇಂದೀಡ್ ಮತ್ತು ಲಿಂಕ್ಡ್‌ಇನ್‌ನಿಂದ ನೇರ ಉದ್ಯೋಗಗಳನ್ನು ಪಡೆಯಲು ಎಐ ಬಳಸಿ.",
      aiPlaceholder: "ಉದಾ: ರಿಯಾಕ್ಟ್ ಡೆವಲಪರ್",
      locPlaceholder: "ಉದಾ: ಬೆಂಗಳೂರು",
      aiSearchBtn: "ಉದ್ಯೋಗ ಹುಡುಕಿ",
      createPost: "ಸಹಾಯ ವಿನಂತಿಸಿ",
      anonCheck: "ಹೆಸರು ಬಹಿರಂಗಪಡಿಸದೆ ಪೋಸ್ಟ್ ಮಾಡಿ"
    },
    ta: {
      title: "உதவி பலகை & வேலைவாய்ப்பு",
      sub: "வேலைகள், மருத்துவ மற்றும் நிதி உதவிக்கான சக உறுப்பினர்களின் தளம்.",
      aiTitle: "ஏஐ வேலைவாய்ப்பு தேடல்",
      aiSub: "நவ்கிரி, இண்டீட் மற்றும் லிங்க்ட்இன் தளங்களில் இருந்து வேலைகளைத் தேட ஏஐ-ஐப் பயன்படுத்தவும்.",
      aiPlaceholder: "எ.கா. மென்பொருள் பொறியாளர்",
      locPlaceholder: "எ.கா. சென்னை",
      aiSearchBtn: "தேடுக",
      createPost: "உதவிக் கோரிக்கை பதிக",
      anonCheck: "பெயரிலலாமல் பதியவும்"
    },
    bd: {
      title: "Help Board & Job Openings",
      sub: "Peer-to-peer listings for jobs, referrals, medical/financial assistance.",
      aiTitle: "AI External Job Finder",
      aiSub: "Query AI to fetch live jobs from Naukri, Indeed, and LinkedIn.",
      aiPlaceholder: "e.g. React Developer",
      locPlaceholder: "e.g. Bengaluru",
      aiSearchBtn: "Scan Jobs",
      createPost: "Post a Request",
      anonCheck: "Post anonymously to public feed"
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    title: "Help Board & Job Openings",
    sub: "Peer-to-peer listings for jobs, referrals, medical/financial assistance.",
    aiTitle: "AI External Job Finder",
    aiSub: "Query AI to fetch live jobs from Naukri, Indeed, and LinkedIn.",
    aiPlaceholder: "e.g. React Developer",
    locPlaceholder: "e.g. Bengaluru",
    aiSearchBtn: "Scan Jobs",
    createPost: "Post a Request",
    anonCheck: "Post anonymously to public feed"
  };

  const categories = [
    { code: 'general', name: 'General Help' },
    { code: 'medical', name: 'Medical Emergency' },
    { code: 'financial', name: 'Financial Aid' },
    { code: 'job_opening', name: 'Job Opening (Referral)' },
    { code: 'job_seeking', name: 'Seeking Work' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">{t.title}</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">{t.sub}</p>
        </div>
        {user && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-display text-sm tracking-wide self-start"
          >
            <Plus className="h-4 w-4" />
            {t.createPost}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Help Board Posts */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Post Request Form */}
          {showForm && (
            <form onSubmit={handlePostSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4 animate-slideDown">
              <h3 className="text-lg font-black text-slate-900 font-display">New Request Details</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.code} value={c.code}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Contact Number</label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="Defaults to your phone number"
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Seeking urgent tuition support"
                  required
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                <textarea
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Describe your request or job opening..."
                  required
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="anonymous-toggle"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-brand-green border-slate-300 rounded focus:ring-brand-green"
                />
                <label htmlFor="anonymous-toggle" className="text-xs font-semibold text-slate-600 flex items-center gap-1">
                  <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                  {t.anonCheck}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Publish Post
                </button>
              </div>
            </form>
          )}

          {/* Categories Quick Filter */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button
              onClick={() => setCategoryFilter('')}
              className={`px-4 py-2 text-[10px] font-bold rounded-xl tracking-wide uppercase transition-colors flex-shrink-0 cursor-pointer ${
                categoryFilter === ''
                  ? 'bg-brand-green text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Posts
            </button>
            {categories.map((c) => (
              <button
                key={c.code}
                onClick={() => setCategoryFilter(c.code)}
                className={`px-4 py-2 text-[10px] font-bold rounded-xl tracking-wide uppercase transition-colors flex-shrink-0 cursor-pointer ${
                  categoryFilter === c.code
                    ? 'bg-brand-green text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Posts Feed */}
          {loading && !showForm ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-brand-green animate-spin"></span>
            </div>
          ) : posts.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-12 bg-white rounded-3xl border border-slate-100">
              No active posts in this category.
            </p>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider bg-slate-50 px-3 py-1 rounded-xl border border-slate-100">
                      {getCategoryIcon(post.category)}
                      {categories.find(c => c.code === post.category)?.name}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(post.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-bold text-slate-900 mb-2 font-display">{post.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{post.content}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1">
                      Posted by: <strong className="text-slate-800">{post.is_anonymous ? 'Anonymous Member' : post.user_name}</strong>
                      {post.hatty_name && <span className="text-slate-400">({post.hatty_name})</span>}
                    </span>
                    {post.contact_number && (
                      <span className="text-brand-blue flex items-center gap-1 bg-brand-blue/5 px-2.5 py-1 rounded-lg">
                        📞 {post.contact_number}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: AI External Job Search */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
                🤖
                {t.aiTitle}
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1 leading-normal">
                {t.aiSub}
              </p>
            </div>

            <form onSubmit={handleAiJobSearch} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Job Role / Title</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Briefcase className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    required
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    placeholder={t.aiPlaceholder}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="text"
                    value={jobLocation}
                    onChange={(e) => setJobLocation(e.target.value)}
                    placeholder={t.locPlaceholder}
                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={aiLoading}
                className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer border border-brand-green/30"
              >
                <Search className="h-3.5 w-3.5" />
                {aiLoading ? 'AI Scanning...' : t.aiSearchBtn}
              </button>
            </form>

            {/* AI Results */}
            {aiLoading && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <span className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-slate-800 animate-spin"></span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Searching Job Portals...</span>
              </div>
            )}

            {aiResults && (
              <div className="space-y-4 pt-4 border-t border-slate-50 animate-fadeIn">
                <div className="bg-brand-green/5 border border-brand-green/10 rounded-xl p-3 text-[10px] text-brand-green font-semibold leading-relaxed">
                  📢 {aiResults.summary}
                </div>

                <div className="space-y-3">
                  {aiResults.listings.map((job: any) => (
                    <div key={job.id} className="border border-slate-100 rounded-2xl p-4 space-y-2 hover:border-slate-200 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{job.company}</span>
                        <span className="text-[8px] font-black text-brand-blue bg-brand-blue/5 border border-brand-blue/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {job.source}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 font-display leading-tight">{job.title}</h4>
                      <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 -mt-1"><MapPin className="h-3 w-3" /> {job.location}</p>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{job.summary}</p>
                      
                      <a
                        href={job.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black text-brand-green hover:underline uppercase tracking-wider pt-1"
                      >
                        Apply on {job.source}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
