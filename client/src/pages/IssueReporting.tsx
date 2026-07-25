import React, { useState, useEffect } from 'react';
import { AlertCircle, HelpCircle, ShieldAlert, ArrowUpRight, CheckCircle, FileText, Printer, ChevronRight, Languages } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface IssueReportingProps {
  user: any;
  language: string;
}

export default function IssueReporting({ user, language }: IssueReportingProps) {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // New Issue State
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('within_hatty'); // 'within_hatty', 'community_wide'
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Formal Letter State
  const [selectedIssueForLetter, setSelectedIssueForLetter] = useState<any | null>(null);
  const [letterLanguage, setLetterLanguage] = useState('en');
  const [authorityName, setAuthorityName] = useState('');
  const [authorityDesignation, setAuthorityDesignation] = useState('');
  const [authorityAddress, setAuthorityAddress] = useState('');
  const [composedLetter, setComposedLetter] = useState<any | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchIssues();
  }, [user]);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/issues', {
        params: {
          user_id: user?.id,
          role: user?.role,
          hatty_id: user?.hatty_id
        }
      });
      setIssues(res.data.issues);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !issueType) return;
    setLoading(true);

    try {
      await axios.post('/api/issues', {
        reporter_id: user.id,
        title,
        description,
        type: issueType,
        is_anonymous: isAnonymous,
        hatty_id: user.hatty_id
      });
      setTitle('');
      setDescription('');
      setIsAnonymous(false);
      setShowForm(false);
      confetti({ particleCount: 50, spread: 60 });
      fetchIssues();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const escalateIssue = async (issueId: number) => {
    try {
      await axios.post(`/api/issues/${issueId}/escalate`);
      confetti({ particleCount: 30, colors: ['#f59e0b'] });
      fetchIssues();
    } catch (err) {
      console.error(err);
    }
  };

  const resolveIssue = async (issueId: number) => {
    try {
      await axios.post(`/api/issues/${issueId}/resolve`);
      confetti({ particleCount: 30, colors: ['#10b981'] });
      fetchIssues();
    } catch (err) {
      console.error(err);
    }
  };

  const generateLetter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssueForLetter) return;
    setAiLoading(true);
    setComposedLetter(null);

    try {
      const res = await axios.post(`/api/issues/${selectedIssueForLetter.id}/letter`, {
        language: letterLanguage,
        authorityName,
        authorityDesignation,
        authorityAddress
      });
      setComposedLetter(res.data.letter);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const printLetter = () => {
    window.print();
  };

  const t = {
    en: {
      title: "Grievance Redressal & Issues",
      sub: "Log local/community-wide issues, track resolution, and escalate grievances.",
      createIssueBtn: "Report Local Issue",
      issueListTitle: "Registered Issues & Status",
      escalateBtn: "Escalate to BDO/Admin",
      letterBtn: "Draft Authority Petition",
      resolveBtn: "Mark Resolved",
      anonInfo: "Reporter identity hidden from community list",
      noIssues: "No issues reported under your jurisdiction."
    },
    kn: {
      title: "ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಪರಿಹಾರಗಳು",
      sub: "ಸ್ಥಳೀಯ ಅಥವಾ ಸಮುದಾಯದ ಸಮಸ್ಯೆಗಳನ್ನು ವರದಿ ಮಾಡಿ ಮತ್ತು ಪ್ರಗತಿಯನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
      createIssueBtn: "ಸಮಸ್ಯೆ ವರದಿ ಮಾಡಿ",
      issueListTitle: "ನೋಂದಾಯಿತ ಸಮಸ್ಯೆಗಳು ಮತ್ತು ಸ್ಥಿತಿ",
      escalateBtn: "ಅಧಿಕಾರಿಗಳಿಗೆ ವರ್ಗಾಯಿಸಿ",
      letterBtn: "ಅರ್ಜಿ ಕರಡು ರಚಿಸಿ (AI)",
      resolveBtn: "ಪರಿಹರಿಸಲಾಗಿದೆ ಎಂದು ಗುರುತಿಸಿ",
      anonInfo: "ವರದಿಗಾರರ ಹೆಸರು ಬಹಿರಂಗವಾಗಿರುವುದಿಲ್ಲ",
      noIssues: "ವರದಿಯಾದ ಯಾವುದೇ ಸಮಸ್ಯೆಗಳಿಲ್ಲ."
    },
    ta: {
      title: "புகார்கள் & தீர்வுகள்",
      sub: "கிராம அல்லது சமூக அளவிலான புகார்களைப் பதிவு செய்து தீர்வுகளைக் கண்காணிக்கவும்.",
      createIssueBtn: "புகார் அளிக்கவும்",
      issueListTitle: "பதிவு செய்யப்பட்ட புகார்கள்",
      escalateBtn: "அதிகாரிகளுக்கு அனுப்பு",
      letterBtn: "மனு கರடு செய் (AI)",
      resolveBtn: "தீர்க்கப்பட்டது என குறி",
      anonInfo: "புகார்தாரர் விவரங்கள் மறைக்கப்பட்டுள்ளன",
      noIssues: "புகார்கள் ஏதும் பதிவாகவில்லை."
    },
    bd: {
      title: "Grievance Redressal & Issues",
      sub: "Log local/community-wide issues, track resolution, and escalate grievances.",
      createIssueBtn: "Report Local Issue",
      issueListTitle: "Registered Issues & Status",
      escalateBtn: "Escalate to BDO/Admin",
      letterBtn: "Draft Authority Petition",
      resolveBtn: "Mark Resolved",
      anonInfo: "Reporter identity hidden from community list",
      noIssues: "No issues reported under your jurisdiction."
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    title: "Grievance Redressal & Issues",
    sub: "Log local/community-wide issues, track resolution, and escalate grievances.",
    createIssueBtn: "Report Local Issue",
    issueListTitle: "Registered Issues & Status",
    escalateBtn: "Escalate to BDO/Admin",
    letterBtn: "Draft Authority Petition",
    resolveBtn: "Mark Resolved",
    anonInfo: "Reporter identity hidden from community list",
    noIssues: "No issues reported under your jurisdiction."
  };

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
            <AlertCircle className="h-4 w-4" />
            {t.createIssueBtn}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Issues List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Propose Issue Form */}
          {showForm && (
            <form onSubmit={handleIssueSubmit} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4 animate-slideDown">
              <h3 className="text-lg font-black text-slate-900 font-display">Grievance Submission Form</h3>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Scope of Grievance</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIssueType('within_hatty')}
                    className={`py-3 px-4 border rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      issueType === 'within_hatty'
                        ? 'border-brand-green bg-brand-green/5 text-brand-green'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🏡 Within-Hatty (Thalaivar Scope)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIssueType('community_wide')}
                    className={`py-3 px-4 border rounded-xl text-xs font-bold tracking-wide transition-colors ${
                      issueType === 'community_wide'
                        ? 'border-brand-green bg-brand-green/5 text-brand-green'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    🌐 Community-Wide (Admin Scope)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Issue Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Drinking water channel blockage"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Detailed Description</label>
                <textarea
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain what happened, local impact, and what needs to be fixed..."
                  required
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                ></textarea>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="anon-issue"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 text-brand-green border-slate-300 rounded focus:ring-brand-green"
                />
                <label htmlFor="anon-issue" className="text-xs font-semibold text-slate-600">
                  Submit anonymously (protect identity)
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
                  Submit Grievance
                </button>
              </div>
            </form>
          )}

          <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-display border-b border-slate-100 pb-3 flex items-center gap-1.5">
            <ShieldAlert className="h-4 w-4 text-brand-blue" />
            {t.issueListTitle}
          </h3>

          {issues.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-12 bg-white rounded-3xl border border-slate-100">
              {t.noIssues}
            </p>
          ) : (
            <div className="space-y-4">
              {issues.map((issue) => (
                <div key={issue.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex gap-2">
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                        issue.type === 'community_wide' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-slate-50 text-slate-600 border border-slate-100'
                      }`}>
                        {issue.type === 'community_wide' ? 'Community Wide' : `${issue.hatty_name || 'Local'} Scope`}
                      </span>
                      {issue.escalated_to_admin && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-100">
                          Escalated to Admin
                        </span>
                      )}
                    </div>

                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${
                      issue.status === 'resolved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      issue.status === 'investigating' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {issue.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-extrabold text-slate-900 mb-1 font-display">{issue.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">{issue.description}</p>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 flex-wrap gap-3">
                    <span className="text-[10px] text-slate-400 font-bold">
                      Reported by: <strong className="text-slate-600">{issue.is_anonymous ? 'Anonymous Member' : issue.reporter_name}</strong>
                    </span>

                    {/* Actions panel */}
                    <div className="flex gap-1.5 flex-wrap">
                      {/* Thalaivar can escalate local issues */}
                      {!issue.escalated_to_admin && issue.status !== 'resolved' && (user?.role === 'Thalaivar' || user?.role === 'Secretary') && (
                        <button
                          onClick={() => escalateIssue(issue.id)}
                          className="px-2.5 py-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-lg text-[9px] font-black uppercase tracking-wide flex items-center gap-0.5 transition-colors hover:bg-yellow-100 cursor-pointer"
                        >
                          {t.escalateBtn}
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      )}

                      {/* Admin can generate AI letter for escalated issues */}
                      {issue.escalated_to_admin && user?.role === 'Admin' && (
                        <button
                          onClick={() => {
                            setSelectedIssueForLetter(issue);
                            setComposedLetter(null);
                            setAuthorityName('');
                            setAuthorityDesignation('');
                            setAuthorityAddress('');
                          }}
                          className="px-2.5 py-1.5 bg-brand-blue/5 border border-brand-blue/15 text-brand-blue rounded-lg text-[9px] font-black uppercase tracking-wide flex items-center gap-0.5 transition-colors hover:bg-brand-blue/10 cursor-pointer"
                        >
                          {t.letterBtn}
                          <FileText className="h-3 w-3" />
                        </button>
                      )}

                      {/* Thalaivar/Admin can resolve */}
                      {issue.status !== 'resolved' && (user?.role === 'Admin' || user?.role === 'Thalaivar') && (
                        <button
                          onClick={() => resolveIssue(issue.id)}
                          className="px-2.5 py-1.5 bg-brand-green/10 border border-brand-green/15 text-brand-green rounded-lg text-[9px] font-black uppercase tracking-wide flex items-center gap-0.5 transition-colors hover:bg-brand-green/15 cursor-pointer"
                        >
                          {t.resolveBtn}
                          <CheckCircle className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: AI Letter Composer */}
        <div className="lg:col-span-4 space-y-6">
          {selectedIssueForLetter ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5 animate-slideDown">
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <h3 className="text-base font-black text-slate-900 font-display flex items-center gap-1.5">
                  📝
                  Authority Petition (AI)
                </h3>
                <button
                  onClick={() => setSelectedIssueForLetter(null)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600"
                >
                  Clear
                </button>
              </div>

              <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-[10px] text-brand-blue font-semibold leading-relaxed">
                📃 Issue: <strong>{selectedIssueForLetter.title}</strong><br />
                Drafting a formal representation to Panchayat or local authorities.
              </div>

              <form onSubmit={generateLetter} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Target Language</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setLetterLanguage('en')}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1 ${
                        letterLanguage === 'en'
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Languages className="h-3.5 w-3.5" /> English
                    </button>
                    <button
                      type="button"
                      onClick={() => setLetterLanguage('ta')}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1 ${
                        letterLanguage === 'ta'
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Languages className="h-3.5 w-3.5" /> தமிழ் (Tamil)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Authority Name</label>
                  <input
                    type="text"
                    value={authorityName}
                    onChange={(e) => setAuthorityName(e.target.value)}
                    placeholder="e.g. Block Development Officer"
                    required
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Authority Designation</label>
                  <input
                    type="text"
                    value={authorityDesignation}
                    onChange={(e) => setAuthorityDesignation(e.target.value)}
                    placeholder="e.g. Panchayat Administration Office"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Authority Office Address</label>
                  <textarea
                    rows={2}
                    value={authorityAddress}
                    onChange={(e) => setAuthorityAddress(e.target.value)}
                    placeholder="e.g. BDO Coonoor, Nilgiris District"
                    className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-xs font-medium"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer border border-brand-green/30"
                >
                  <Languages className="h-3.5 w-3.5 animate-pulse" />
                  {aiLoading ? 'AI Composing Letter...' : 'Draft Formal Petition'}
                </button>
              </form>

              {/* Composed Letter Output */}
              {composedLetter && (
                <div className="bg-white border-2 border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl print:border-none print:shadow-none animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-2 print:hidden">
                    <span className="text-[9px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">AI Compiled Draft</span>
                    <button
                      onClick={printLetter}
                      className="text-[10px] font-black text-slate-700 hover:text-slate-950 uppercase flex items-center gap-1"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print
                    </button>
                  </div>

                  {/* Letterhead mock */}
                  <div className="text-[10px] font-serif leading-relaxed text-slate-800 whitespace-pre-wrap">
                    <div className="text-right font-semibold">Date: {composedLetter.date}</div>
                    
                    <div className="font-bold uppercase mt-2">FROM:</div>
                    <div className="pl-2">{composedLetter.from}</div>
                    
                    <div className="font-bold uppercase mt-3">TO:</div>
                    <div className="pl-2">{composedLetter.to}</div>
                    
                    <div className="font-black mt-4 text-center text-xs uppercase border-t border-b border-slate-200 py-1.5">
                      {composedLetter.subject}
                    </div>
                    
                    <div className="mt-4 text-justify font-medium leading-relaxed">
                      {composedLetter.body}
                    </div>
                    
                    <div className="mt-6 text-right font-semibold">
                      {composedLetter.closing}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 text-center space-y-3">
              <span className="text-4xl">🏛️</span>
              <h4 className="font-bold text-slate-800">Formal Authority Submissions</h4>
              <p className="text-xs text-slate-400 leading-relaxed font-medium">
                Admin can select any escalated community grievance to automatically draft formal petition letters for local Panchayat/BDO offices.
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
