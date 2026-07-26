import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Tag, Star, Send, MapPin, Check, Plus, MessageSquare, X } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

const Marquee = 'marquee' as any;

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
  const [offers, setOffers] = useState<any[]>([]);
  const [lifeEvents, setLifeEvents] = useState<any[]>([]);
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  
  // Feedback state
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'feedback' | 'idea'>('feedback');
  const [loading, setLoading] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Ad request modal state
  const [showAdModal, setShowAdModal] = useState(false);
  const [adBusinessName, setAdBusinessName] = useState('');
  const [adCategory, setAdCategory] = useState('Retail');
  const [adContactPhone, setAdContactPhone] = useState(user?.phone || '');
  const [adEmail, setAdEmail] = useState('');
  const [adTitle, setAdTitle] = useState('');
  const [adDescription, setAdDescription] = useState('');
  const [adType, setAdType] = useState('Banner');
  const [adDuration, setAdDuration] = useState('4');
  const [adSuccessMsg, setAdSuccessMsg] = useState('');
  const [adError, setAdError] = useState('');

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

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 4000);
      return () => clearInterval(interval);
    }
    return () => {};
  }, [ads]);

  const fetchData = async () => {
    try {
      const hattyId = user?.hatty_id;
      const annRes = await axios.get('/api/announcements', { params: { hatty_id: hattyId } });
      setAnnouncements(annRes.data.announcements);

      const evRes = await axios.get('/api/events', { params: { hatty_id: hattyId } });
      setEvents(evRes.data.events);

      const adsRes = await axios.get('/api/ads');
      setAds(adsRes.data.ads);

      const offersRes = await axios.get('/api/offers', { params: { activeOnly: 'true' } });
      setOffers(offersRes.data.offers || []);

      const leRes = await axios.get('/api/life-events', { params: { hatty_id: hattyId } });
      setLifeEvents(leRes.data.lifeEvents || []);
      
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
        rating: feedbackType === 'idea' ? null : rating,
        comment: feedbackComment,
        context_action: 'home_rating',
        type: feedbackType
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

  const handleAdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adBusinessName || !adContactPhone || !adTitle || !adDescription) {
      setAdError('Please fill in all required fields.');
      return;
    }
    setAdError('');
    setLoading(true);
    try {
      await axios.post('/api/ads', {
        business_name: adBusinessName,
        category: adCategory,
        contact_phone: adContactPhone,
        email: adEmail,
        title: adTitle,
        description: adDescription,
        ad_type: adType,
        duration_weeks: parseInt(adDuration),
        price: 250.00
      });
      
      confetti({ particleCount: 60, spread: 80 });
      setAdSuccessMsg('Your advertisement request has been submitted! An email notification has been dispatched to superadmin@demandgeniusai.com. Your ad will be published once approved by the SuperAdmin.');
      
      // Clear form fields
      setAdBusinessName('');
      setAdTitle('');
      setAdDescription('');
      setAdEmail('');
    } catch (err: any) {
      setAdError(err.response?.data?.error || 'Failed to submit ad request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Sponsor Offers Moving Ticker Banner */}
      {offers.length > 0 && (
        <div className="mb-6 bg-slate-950 text-white py-3 px-4 rounded-2xl shadow-md border border-slate-800 flex items-center gap-3 text-xs font-bold font-sans relative overflow-hidden">
          <div className="bg-amber-500 text-slate-950 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest shrink-0 z-10 shadow-sm">
            ⚡ Special Offers
          </div>
          <Marquee className="flex-grow text-slate-300" scrollamount="4">
            <span className="flex gap-16 items-center">
              {offers.map((o: any, idx: number) => (
                <span key={idx} className="inline-flex items-center gap-2 mr-8">
                  <span className="text-amber-400 font-extrabold">{o.business_name}</span>
                  <span className="text-slate-100 font-medium">— {o.offer_title}</span>
                  {o.coupon_code && (
                    <span className="bg-slate-800 border border-slate-700 text-amber-300 font-mono px-1.5 py-0.5 rounded text-[10px]">
                      CODE: {o.coupon_code}
                    </span>
                  )}
                </span>
              ))}
            </span>
          </Marquee>
        </div>
      )}

      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-brand-green/10 via-brand-blue/5 to-slate-50 border border-slate-100 rounded-3xl p-6 md:p-8 mb-8 shadow-sm relative overflow-hidden flex flex-col md:flex-row justify-between md:items-center gap-6">
        <div className="absolute -right-24 -bottom-24 h-48 w-48 rounded-full bg-brand-green/5"></div>
        <div className="relative z-10">
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">{t.welcome}</h2>
          <p className="text-sm text-slate-600 font-medium mt-1">{t.welcomeSub}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setFeedbackSubmitted(false);
            setFeedbackComment('');
            setShowFeedbackModal(true);
          }}
          className="bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display text-sm tracking-wide self-start shrink-0 relative z-10"
        >
          <span>💡</span> Share Feedback / Idea
        </button>
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
          {/* Sponsor Offers Coupons Section */}
          {offers.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 mt-8">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
                  🏷️ Exclusive Community Discounts & Offers
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-1">
                  Supporting local businesses. Present these coupons at the merchant shop to avail discounts.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.map((o: any) => (
                  <div key={o.id} className="border border-dashed border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 bg-slate-50/20 relative group">
                    <div className="absolute top-0 right-0 h-4 w-4 bg-white border-l border-b border-dashed border-slate-200 rounded-bl-lg"></div>
                    
                    <div className="space-y-1.5">
                      <span className="text-[8px] font-black uppercase tracking-wider text-slate-400">{o.business_name}</span>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{o.offer_title}</h4>
                      {o.offer_description && <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">{o.offer_description}</p>}
                    </div>

                    {o.coupon_code && (
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="font-mono text-xs font-black bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg select-all border border-slate-200">
                          {o.coupon_code}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(o.coupon_code);
                            alert(`Coupon code "${o.coupon_code}" copied to clipboard!`);
                          }}
                          className="text-[10px] font-bold text-brand-green hover:underline cursor-pointer border border-transparent bg-transparent"
                        >
                          Copy Code
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Events & Sponsored Ads & Feedback */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Life Events (Birthdays & Obituaries) Feed Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 animate-fadeIn">
            <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display flex items-center gap-2 border-b border-slate-50 pb-3">
              🎉 Life Occasions & Notices
            </h3>

            {lifeEvents.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-2 text-center">No special birthday or obituary announcements today.</p>
            ) : (
              <div className="space-y-4">
                {lifeEvents.map((le: any) => (
                  <div key={le.id} className={`p-4 rounded-2xl border flex gap-3 ${le.type === 'birthday' ? 'bg-amber-50/30 border-amber-100/60' : 'bg-red-50/10 border-red-100/30'}`}>
                    <div className="text-2xl shrink-0">
                      {le.type === 'birthday' ? '🎂' : '🕊️'}
                    </div>
                    <div className="space-y-1 flex-grow">
                      <div className="flex items-center justify-between">
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${le.type === 'birthday' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'}`}>
                          {le.type === 'birthday' ? 'Birthday' : 'Obituary'}
                        </span>
                        <span className="text-[9px] text-slate-400 font-semibold">
                          {new Date(le.date_of_event).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900 leading-tight">{le.person_name}</h4>
                      {le.description && <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{le.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

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
              <div className="relative overflow-hidden min-h-[160px] flex flex-col justify-between">
                {/* Active Ad Slide */}
                {ads.map((ad, idx) => {
                  const isActive = idx === currentAdIndex;
                  return (
                    <div
                      key={ad.id}
                      className={`bg-gradient-to-br from-amber-50/50 to-orange-50/20 border border-amber-100 rounded-3xl p-5 space-y-3 relative overflow-hidden transition-all duration-700 flex flex-col justify-between min-h-[150px] ${
                        isActive ? 'opacity-100 translate-x-0 relative block z-10 scale-100' : 'opacity-0 absolute top-0 left-0 w-full -translate-x-full pointer-events-none scale-95'
                      }`}
                    >
                      <span className="absolute top-3 right-3 text-[8px] font-black uppercase bg-amber-200 text-amber-800 rounded px-1.5 py-0.5 tracking-wider shadow-sm z-20">
                        Sponsored
                      </span>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">{ad.business_name}</span>
                        <h4 className="text-sm font-black text-slate-900 font-display leading-tight">{ad.title}</h4>
                        <p className="text-xs text-slate-600 font-medium leading-relaxed">{ad.description}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Dots indicator navigation */}
                {ads.length > 1 && (
                  <div className="flex justify-center gap-1.5 mt-4 z-20">
                    {ads.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setCurrentAdIndex(idx)}
                        className={`h-1.5 w-1.5 rounded-full transition-all cursor-pointer border-0 p-0 ${
                          idx === currentAdIndex ? 'bg-amber-500 w-3' : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            {user?.role !== 'SuperAdmin' && (
              <button
                type="button"
                onClick={() => {
                  setAdSuccessMsg('');
                  setAdError('');
                  setShowAdModal(true);
                }}
                className="w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 border border-dashed border-slate-200 text-slate-600 hover:text-brand-green hover:border-brand-green hover:bg-brand-green/5 rounded-2xl text-xs font-bold transition-all cursor-pointer"
              >
                📢 Request Sponsor Ad Listing
              </button>
            )}
          </div>

          {/* Feedback & Idea Link trigger card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 border border-white/5 shadow-xl space-y-4 relative overflow-hidden">
            <div className="absolute -right-16 -bottom-16 h-36 w-36 rounded-full bg-white/5"></div>
            <div className="space-y-1 relative z-10">
              <h3 className="text-sm font-extrabold tracking-tight font-display flex items-center gap-1.5">
                <span>💡</span> Share Feedback / Idea
              </h3>
              <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
                Have suggestions to improve the platform or ideas to connect our villages? We'd love to hear from you!
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFeedbackSubmitted(false);
                setFeedbackComment('');
                setShowFeedbackModal(true);
              }}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold rounded-xl text-xs transition-all cursor-pointer text-center block relative z-10"
            >
              Share feedback or idea
            </button>
          </div>

        </div>

      </div>

      {/* ADVERTISEMENT REQUEST FORM MODAL */}
      {showAdModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden animate-scaleIn flex flex-col max-h-[90vh]">
            <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 p-6 text-white flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black tracking-tight font-display flex items-center gap-2">
                  📢 Request Sponsor Ad Listing
                </h3>
                <p className="text-[10px] text-yellow-100 font-bold tracking-wide uppercase mt-0.5">
                  Published on Front Page after SuperAdmin Approval
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAdModal(false)}
                className="p-1 rounded-full bg-black/10 hover:bg-black/20 text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              {adSuccessMsg ? (
                <div className="text-center py-6 space-y-4">
                  <div className="h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-2xl">
                    ✓
                  </div>
                  <h4 className="text-base font-extrabold text-slate-900 font-display">Submitted Successfully!</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                    {adSuccessMsg}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowAdModal(false)}
                    className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-2 px-6 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAdSubmit} className="space-y-3">
                  {adError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-xl p-3">
                      {adError}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Business Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={adBusinessName}
                        onChange={(e) => setAdBusinessName(e.target.value)}
                        placeholder="e.g. Lingayat Caterers"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Category *
                      </label>
                      <select
                        value={adCategory}
                        onChange={(e) => setAdCategory(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                      >
                        <option value="Retail">Retail & Shop</option>
                        <option value="Catering">Food & Catering</option>
                        <option value="Books">Books & Library</option>
                        <option value="Transport">Transport & Cab</option>
                        <option value="Services">Services & Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Contact Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={adContactPhone}
                        onChange={(e) => setAdContactPhone(e.target.value)}
                        placeholder="10-digit number"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        value={adEmail}
                        onChange={(e) => setAdEmail(e.target.value)}
                        placeholder="e.g. name@domain.com"
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Ad Campaign Title *
                    </label>
                    <input
                      type="text"
                      required
                      value={adTitle}
                      onChange={(e) => setAdTitle(e.target.value)}
                      placeholder="e.g. 10% Discount on Catering Orders!"
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                      Ad Description / Promo Details *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={adDescription}
                      onChange={(e) => setAdDescription(e.target.value)}
                      placeholder="Explain your promotion, menu, address details, or special offers..."
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Ad Type *
                      </label>
                      <select
                        value={adType}
                        onChange={(e) => setAdType(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                      >
                        <option value="Coupon">Discount Coupon</option>
                        <option value="Banner">Promo Listing Banner</option>
                        <option value="Event">Sponsored Event</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                        Duration *
                      </label>
                      <select
                        value={adDuration}
                        onChange={(e) => setAdDuration(e.target.value)}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-brand-green bg-white text-slate-800"
                      >
                        <option value="4">4 Weeks ($250.00)</option>
                        <option value="8">8 Weeks ($450.00)</option>
                        <option value="12">12 Weeks ($600.00)</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-4 uppercase tracking-wider"
                  >
                    {loading ? 'Submitting...' : 'Submit Advertisement Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* FEEDBACK & IDEA SUBMISSION FORM MODAL */}
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
                  {feedbackType === 'idea' ? 'Thank you for sharing your idea!' : t.feedbackSuccess}
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
                onSubmit={async (e) => {
                  await submitFeedback(e);
                  confetti({ particleCount: 50, spread: 40 });
                }} 
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
                  disabled={loading}
                  className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-2.5 px-4 rounded-xl w-full text-xs transition-all flex items-center justify-center gap-1 cursor-pointer border border-transparent shadow-md"
                >
                  <Send className="h-3.5 w-3.5" />
                  {feedbackType === 'idea' ? 'Submit Idea' : t.feedbackSubmit}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
