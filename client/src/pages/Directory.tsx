import React, { useState, useEffect } from 'react';
import { Search, MapPin, Briefcase, Phone, HelpCircle, Eye, ShieldCheck, Filter } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface DirectoryProps {
  user: any;
  language: string;
}

export default function Directory({ user, language }: DirectoryProps) {
  const [members, setMembers] = useState<any[]>([]);
  const [hattys, setHattys] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [hattyFilter, setHattyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [professionFilter, setProfessionFilter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch hattys
    axios.get('/api/auth/hattys')
      .then(res => setHattys(res.data.hattys))
      .catch(err => console.error(err));

    fetchMembers();
  }, [hattyFilter, locationFilter, professionFilter]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/members', {
        params: {
          search,
          hatty_id: hattyFilter || undefined,
          location: locationFilter || undefined,
          profession: professionFilter || undefined,
          requesterId: user?.id || undefined
        }
      });
      setMembers(res.data.members);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMembers();
  };

  const requestPhone = async (memberId: number) => {
    if (!user) {
      alert('You must be logged in to request contact details.');
      return;
    }

    try {
      await axios.post('/api/contact-requests', {
        requester_id: user.id,
        requested_id: memberId
      });
      fetchMembers();
      confetti({ particleCount: 30, spread: 40 });
    } catch (err) {
      console.error(err);
      alert('Could not submit contact access request.');
    }
  };

  const t = {
    en: {
      title: "Community Directory",
      sub: "Find and connect with Lingayat community members across all 8 Hattys.",
      searchPlaceholder: "Search by name, location...",
      profPlaceholder: "Profession...",
      locPlaceholder: "Location...",
      selectHatty: "All Hattys",
      reqPhone: "Request Phone",
      phoneAudit: "Requests are audited for privacy",
      noMembers: "No members found matching your search.",
      filterTitle: "Filters",
      searchBtn: "Search"
    },
    kn: {
      title: "ಸಮುದಾಯ ಡೈರೆಕ್ಟರಿ",
      sub: "ಎಲ್ಲಾ ೮ ಹಟ್ಟಿಗಳ ಲಿಂಗಾಯತ ಸಮುದಾಯದ ಸದಸ್ಯರನ್ನು ಹುಡುಕಿ ಮತ್ತು ಸಂಪರ್ಕಿಸಿ.",
      searchPlaceholder: "ಹೆಸರು, ಸ್ಥಳದ ಮೂಲಕ ಹುಡುಕಿ...",
      profPlaceholder: "ವೃತ್ತಿ...",
      locPlaceholder: "ಸ್ಥಳ...",
      selectHatty: "ಎಲ್ಲಾ ಹಟ್ಟಿಗಳು",
      reqPhone: "ಮೊಬೈಲ್ ನಂಬರ್ ವಿನಂತಿಸಿ",
      phoneAudit: "ಗೌಪ್ಯತೆಗಾಗಿ ವಿನಂತಿಗಳನ್ನು ಆಡಿಟ್ ಮಾಡಲಾಗುತ್ತದೆ",
      noMembers: "ಯಾವುದೇ ಸದಸ್ಯರು ಕಂಡುಬಂದಿಲ್ಲ.",
      filterTitle: "ಶೋಧಕಗಳು",
      searchBtn: "ಹುಡುಕಿ"
    },
    ta: {
      title: "சமூக வழிகாட்டி",
      sub: "8 ஹட்டிகளிலும் உள்ள லிங்காயத்து சமூக உறுப்பினர்களைக் கண்டறிந்து இணையுங்கள்.",
      searchPlaceholder: "பெயர், இடத்தின் மூலம் தேடுக...",
      profPlaceholder: "தொழில்...",
      locPlaceholder: "இடம்...",
      selectHatty: "அனைத்து ஹட்டிகள்",
      reqPhone: "எண்ணைக் கோருக",
      phoneAudit: "பாதுகாப்புக்காக கோரிக்கைகள் கண்காணிக்கப்படுகின்றன",
      noMembers: "உறுப்பினர்கள் யாரும் இல்லை.",
      filterTitle: "வடிகட்டிகள்",
      searchBtn: "தேடுக"
    },
    bd: {
      title: "Community Directory",
      sub: "Find and connect with Lingayat community members across all 8 Hattys.",
      searchPlaceholder: "Search by name, location...",
      profPlaceholder: "Profession...",
      locPlaceholder: "Location...",
      selectHatty: "All Hattys",
      reqPhone: "Request Phone",
      phoneAudit: "Requests are audited for privacy",
      noMembers: "No members found matching your search.",
      filterTitle: "Filters",
      searchBtn: "Search"
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    title: "Community Directory",
    sub: "Find and connect with Lingayat community members across all 8 Hattys.",
    searchPlaceholder: "Search by name, location...",
    profPlaceholder: "Profession...",
    locPlaceholder: "Location...",
    selectHatty: "All Hattys",
    reqPhone: "Request Phone",
    phoneAudit: "Requests are audited for privacy",
    noMembers: "No members found matching your search.",
    filterTitle: "Filters",
    searchBtn: "Search"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">{t.title}</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">{t.sub}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Filters Sidebar (Desktop) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2 pb-3 border-b border-slate-50">
              <Filter className="h-4 w-4 text-brand-green" />
              {t.filterTitle}
            </h3>

            {/* Hatty Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Hatty</label>
              <select
                value={hattyFilter}
                onChange={(e) => setHattyFilter(e.target.value)}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-xs font-semibold bg-white"
              >
                <option value="">{t.selectHatty}</option>
                {hattys.map((h: any) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>

            {/* Location Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Location</label>
              <input
                type="text"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                placeholder={t.locPlaceholder}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-xs font-medium"
              />
            </div>

            {/* Profession Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Profession</label>
              <input
                type="text"
                value={professionFilter}
                onChange={(e) => setProfessionFilter(e.target.value)}
                placeholder={t.profPlaceholder}
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-xs font-medium"
              />
            </div>
          </div>
        </div>

        {/* Directory Listings */}
        <div className="lg:col-span-9 space-y-6">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl p-2 border border-slate-100 shadow-sm flex gap-2">
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

          {/* Members Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-brand-green animate-spin"></span>
            </div>
          ) : members.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-12 bg-white rounded-3xl border border-slate-100">
              {t.noMembers}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member) => (
                <div key={member.id} className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm relative group overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
                  {/* Decorative Blob */}
                  <div className="absolute -right-8 -top-8 h-20 w-20 bg-emerald-50 rounded-full opacity-60"></div>
                  
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 tracking-tight leading-tight">{member.name}</h4>
                        <span className="text-[9px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full mt-0.5 inline-block">
                          {member.role}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-500 font-medium border-t border-slate-50 pt-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold uppercase text-[9px] w-14">Hatty:</span>
                        <span className="text-slate-700">{member.hatty_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold uppercase text-[9px] w-14">Location:</span>
                        <span className="text-slate-700 flex items-center gap-1"><MapPin className="h-3 w-3 text-slate-400" /> {member.location || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-400 font-bold uppercase text-[9px] w-14">Profession:</span>
                        <span className="text-slate-700 flex items-center gap-1"><Briefcase className="h-3 w-3 text-slate-400" /> {member.profession || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Phone reveal block */}
                  <div className="mt-4 pt-3 border-t border-slate-50 flex flex-col gap-2 relative z-10">
                    {member.phone ? (
                      <div className="flex flex-col gap-1 text-slate-800 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-semibold">
                        <div className="flex items-center gap-2 text-brand-green font-bold">
                          <Phone className="h-3.5 w-3.5" />
                          <span>{member.phone}</span>
                        </div>
                        {member.email && (
                          <div className="text-[10px] text-slate-500 font-medium truncate mt-1">
                            ✉️ {member.email}
                          </div>
                        )}
                      </div>
                    ) : member.contact_request_status === 'pending' ? (
                      <div className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-bold font-sans">
                        ⏳ Pending Approval
                      </div>
                    ) : (
                      <button
                        onClick={() => requestPhone(member.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 bg-brand-blue/5 hover:bg-brand-blue/10 border border-brand-blue/15 text-brand-blue font-bold rounded-xl text-xs transition-all cursor-pointer hover:scale-[1.01]"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        {t.reqPhone}
                      </button>
                    )}
                    <span className="text-[8px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-slate-300" />
                      {t.phoneAudit}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
