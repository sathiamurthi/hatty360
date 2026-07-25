import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Tag, Star, Send, MapPin, Check, Plus, MessageSquare } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface LandingPageProps {
  user: any;
  language: string;
  setTab: (tab: string) => void;
}

export default function LandingPage({ user, language, setTab }: LandingPageProps) {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [rsvps, setRsvps] = useState<{[key: number]: string}>({});
  
  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Localization
  const t = {
    en: {
      welcome: `Hello, ${user ? user.name : 'Guest'}!`,
      welcomeSub: `Welcome back to the Hatty360 network. Here is what is happening today in ${user?.hatty_name || 'your'} Hatty.`,
      annTitle: "Announcements & Feed",
      evTitle: "Upcoming Events",
      sponsored: "Sponsored Offers",
      feedbackPrompt: "Help us improve! Rate your experience with Hatty360:",
      feedbackSubmit: "Submit Feedback",
      feedbackSuccess: "Thank you for your feedback!",
      rsvpGoing: "Going",
      rsvpMaybe: "Maybe",
      rsvpNo: "Not Going",
      rsvpStatus: "Your RSVP:",
      noAnn: "No announcements yet.",
      noEvents: "No upcoming events scheduled.",
      noAds: "No sponsored listings available."
    },
    kn: {
      welcome: `ನಮಸ್ಕಾರ, ${user ? user.name : 'ಅತಿಥಿ'}!`,
      welcomeSub: `ಹಟ್ಟಿ೩೬೦ ನೆಟ್‌ವರ್ಕ್‌ಗೆ ಸುಸ್ವಾಗತ. ನಿಮ್ಮ ಹಟ್ಟಿಯಲ್ಲಿ ಇಂದು ನಡೆಯುತ್ತಿರುವ ನವೀಕರಣಗಳು ಇಲ್ಲಿದೆ.`,
      annTitle: "ಘೋಷಣೆಗಳು ಮತ್ತು ಫೀಡ್",
      evTitle: "ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳು",
      sponsored: "ಪ್ರಾಯೋಜಿತ ಕೊಡುಗೆಗಳು",
      feedbackPrompt: "ನಮ್ಮನ್ನು ಸುಧಾರಿಸಲು ಸಹಾಯ ಮಾಡಿ! ನಿಮ್ಮ ಅನುಭವವನ್ನು ರೇಟ್ ಮಾಡಿ:",
      feedbackSubmit: "ಪ್ರತಿಕ್ರಿಯೆ ಸಲ್ಲಿಸಿ",
      feedbackSuccess: "ನಿಮ್ಮ ಪ್ರತಿಕ್ರಿಯೆಗೆ ಧನ್ಯವಾದಗಳು!",
      rsvpGoing: "ಹೋಗುತ್ತಿರುವೆ",
      rsvpMaybe: "ಬಹುಶಃ",
      rsvpNo: "ಇಲ್ಲ",
      rsvpStatus: "ನಿಮ್ಮ RSVP:",
      noAnn: "ಯಾವುದೇ ಘೋಷಣೆಗಳಿಲ್ಲ.",
      noEvents: "ಯಾವುದೇ ಮುಂಬರುವ ಕಾರ್ಯಕ್ರಮಗಳಿಲ್ಲ.",
      noAds: "ಯಾವುದೇ ಜಾಹೀರಾತುಗಳಿಲ್ಲ."
    },
    ta: {
      welcome: `வணக்கம், ${user ? user.name : 'விருந்தினர்'}!`,
      welcomeSub: `ஹட்டி360 வலைப்பின்னலுக்கு உங்களை வரவேற்கிறோம். இன்று உங்கள் ஹட்டியில் நடக்கும் நிகழ்வுகள் இதோ.`,
      annTitle: "அறிவிப்புகள் பலகை",
      evTitle: "வரவிருக்கும் நிகழ்வுகள்",
      sponsored: "விளம்பர சலுகைகள்",
      feedbackPrompt: "எங்களை மேம்படுத்த உதவவும்! உங்கள் அனுபவத்தை மதிப்பிடுங்கள்:",
      feedbackSubmit: "கருத்தைச் சமர்ப்பி",
      feedbackSuccess: "உங்கள் கருத்துக்கு நன்றி!",
      rsvpGoing: "செல்வேன்",
      rsvpMaybe: "இருக்கலாம்",
      rsvpNo: "இல்லை",
      rsvpStatus: "உங்கள் பதில்:",
      noAnn: "அறிவிப்புகள் ஏதுமில்லை.",
      noEvents: "வரவிருக்கும் நிகழ்வுகள் ஏதுமில்லை.",
      noAds: "விளம்பரங்கள் ஏதுமில்லை."
    },
    bd: {
      welcome: `Hello, ${user ? user.name : 'Guest'}!`,
      welcomeSub: `Welcome back to the Hatty360 network. Here is what is happening today in ${user?.hatty_name || 'your'} Hatty.`,
      annTitle: "Announcements & Feed",
      evTitle: "Upcoming Events",
      sponsored: "Sponsored Offers",
      feedbackPrompt: "Help us improve! Rate your experience with Hatty360:",
      feedbackSubmit: "Submit Feedback",
      feedbackSuccess: "Thank you for your feedback!",
      rsvpGoing: "Going",
      rsvpMaybe: "Maybe",
      rsvpNo: "Not Going",
      rsvpStatus: "Your RSVP:",
      noAnn: "No announcements yet.",
      noEvents: "No upcoming events scheduled.",
      noAds: "No sponsored listings available."
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    welcome: `Hello, ${user ? user.name : 'Guest'}!`,
    welcomeSub: `Welcome back to the Hatty360 network. Here is what is happening today in ${user?.hatty_name || 'your'} Hatty.`,
    annTitle: "Announcements & Feed",
    evTitle: "Upcoming Events",
    sponsored: "Sponsored Offers",
    feedbackPrompt: "Help us improve! Rate your experience with Hatty360:",
    feedbackSubmit: "Submit Feedback",
    feedbackSuccess: "Thank you for your feedback!",
    rsvpGoing: "Going",
    rsvpMaybe: "Maybe",
    rsvpNo: "Not Going",
    rsvpStatus: "Your RSVP:",
    noAnn: "No announcements yet.",
    noEvents: "No upcoming events scheduled.",
    noAds: "No sponsored listings available."
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      const hattyId = user?.hatty_id;
      const annRes = await axios.get('/api/announcements', { params: { hatty_id: hattyId } });
      setAnnouncements(annRes.data.announcements);

      const evRes = await axios.get('/api/events', { params: { hatty_id: hattyId } });
      setEvents(evRes.data.events);

      const adsRes = await axios.get('/api/ads');
      setAds(adsRes.data.ads);
      
      // Load user RSVPs
      if (user && evRes.data.events.length > 0) {
        const rsvpMap: any = {};
        for (const ev of evRes.data.events) {
          const res = await axios.get(`/api/events/${ev.id}/rsvps`);
          const userRsvp = res.data.rsvps.find((r: any) => r.user_id === user.id);
          if (userRsvp) {
            rsvpMap[ev.id] = userRsvp.status;
          }
        }
        setRsvps(rsvpMap);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRsvp = async (eventId: number, status: string) => {
    if (!user) return alert('Please log in to RSVP.');
    try {
      await axios.post(`/api/events/${eventId}/rsvp`, {
        user_id: user.id,
        status: status,
        guests_count: 1
      });
      setRsvps(prev => ({ ...prev, [eventId]: status }));
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const submitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/feedback', {
        user_id: user?.id,
        rating,
        comment: feedbackComment,
        context_action: 'home_rating'
      });
      setFeedbackSubmitted(true);
      setFeedbackComment('');
      confetti({ particleCount: 40, colors: ['#006853', '#0f62ac'] });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand-green/10 via-brand-blue/5 to-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden">
        <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-brand-green/5"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">{t.welcome}</h2>
          <p className="text-sm text-slate-600 font-medium mt-1">{t.welcomeSub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Announcements Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xl font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-brand-green" />
              {t.annTitle}
            </h3>
            {user?.role !== 'Member' && (
              <button
                onClick={() => setTab('admin')}
                className="inline-flex items-center gap-1 text-xs font-bold text-brand-green hover:text-brand-green-dark bg-brand-green/10 hover:bg-brand-green/15 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                Post Announcement
              </button>
            )}
          </div>

          {announcements.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium py-4 text-center">{t.noAnn}</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((ann) => (
                <div key={ann.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm relative group transition-all hover:shadow-md">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      ann.type === 'community' 
                        ? 'bg-brand-blue/10 text-brand-blue' 
                        : 'bg-brand-green/10 text-brand-green'
                    }`}>
                      {ann.type === 'community' ? 'Community-wide' : `${ann.hatty_name || 'Hatty'} Announcement`}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {new Date(ann.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <h4 className="text-lg font-bold text-slate-900 mb-2 font-display">{ann.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{ann.content}</p>
                  
                  <div className="border-t border-slate-50 pt-3 mt-4 flex items-center justify-between text-xs text-slate-400">
                    <span>By <strong>{ann.created_by}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Events & Sponsored Ads & Feedback */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Events Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2 border-b border-slate-50 pb-3">
              <Calendar className="h-5 w-5 text-brand-blue" />
              {t.evTitle}
            </h3>

            {events.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium py-2">{t.noEvents}</p>
            ) : (
              <div className="space-y-4">
                {events.map((ev) => (
                  <div key={ev.id} className="border-b border-slate-50 last:border-0 pb-4 last:pb-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">{ev.title}</h4>
                        <span className="text-[10px] text-slate-400 font-bold tracking-wide flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3" /> {ev.location}
                        </span>
                      </div>
                      <div className="bg-brand-blue/5 text-brand-blue text-center rounded-xl p-1.5 min-w-[48px] flex-shrink-0">
                        <span className="block text-xs font-black">{new Date(ev.event_date).getDate()}</span>
                        <span className="block text-[8px] font-bold uppercase tracking-wider">
                          {new Date(ev.event_date).toLocaleDateString('en-IN', { month: 'short' })}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">{ev.description}</p>
                    
                    {/* RSVP section */}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] text-slate-400 font-bold">{t.rsvpStatus}</span>
                      <div className="flex gap-1.5">
                        {['going', 'maybe', 'not_going'].map((st) => (
                          <button
                            key={st}
                            onClick={() => handleRsvp(ev.id, st)}
                            className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-wide uppercase transition-colors ${
                              rsvps[ev.id] === st
                                ? 'bg-brand-green text-white shadow-sm'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            {st === 'going' && t.rsvpGoing}
                            {st === 'maybe' && t.rsvpMaybe}
                            {st === 'not_going' && t.rsvpNo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sponsored Ad Banner */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2 border-b border-slate-50 pb-3">
              <Tag className="h-5 w-5 text-yellow-600" />
              {t.sponsored}
            </h3>

            {ads.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium py-2">{t.noAds}</p>
            ) : (
              <div className="space-y-4">
                {ads.map((ad) => (
                  <div key={ad.id} className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 space-y-2 relative overflow-hidden group">
                    <span className="absolute top-2 right-2 text-[8px] font-black uppercase bg-yellow-200 text-yellow-800 rounded px-1 tracking-widest shadow-sm">
                      Sponsored
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">{ad.business_name}</h4>
                    <h5 className="text-sm font-black text-brand-green font-display">{ad.title}</h5>
                    <p className="text-xs text-slate-600 font-medium leading-normal">{ad.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feedback Form Widget */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-white/5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-white/5"></div>
            
            <h3 className="text-base font-extrabold tracking-tight font-display flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              How was your experience?
            </h3>

            {feedbackSubmitted ? (
              <div className="bg-brand-green/10 border border-brand-green-light/20 text-brand-green-light rounded-2xl p-4 text-xs font-semibold text-center animate-pulse">
                {t.feedbackSuccess}
              </div>
            ) : (
              <form onSubmit={submitFeedback} className="space-y-3 relative z-10">
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  {t.feedbackPrompt}
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

                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share your thoughts..."
                  required
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl p-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-brand-green-light"
                ></textarea>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-2 px-4 rounded-xl w-full text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Send className="h-3.5 w-3.5" />
                  {t.feedbackSubmit}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
