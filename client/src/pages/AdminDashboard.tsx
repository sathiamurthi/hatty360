import React, { useState, useEffect } from 'react';
import { ShieldCheck, UserCheck, Megaphone, Star, CheckCircle, XCircle, Sparkles, Send, CalendarPlus, HelpCircle } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface AdminDashboardProps {
  user: any;
  language: string;
}

export default function AdminDashboard({ user, language }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'ads' | 'feedback' | 'draft' | 'campaigns' | 'roles' | 'villages'>('users');
  
  // Data lists
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingAds, setPendingAds] = useState<any[]>([]);
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Village config states
  const [newVillageName, setNewVillageName] = useState('');
  const [newVillageLocation, setNewVillageLocation] = useState('');
  const [newVillageDesc, setNewVillageDesc] = useState('');

  // Member role config states
  const [allMembers, setAllMembers] = useState<any[]>([]);
  const [selectedUserRoles, setSelectedUserRoles] = useState<{[key: number]: string}>({});
  const [customRoles, setCustomRoles] = useState<{[key: number]: string}>({});

  // Direct registration states
  const [directName, setDirectName] = useState('');
  const [directPhone, setDirectPhone] = useState('');
  const [directEmail, setDirectEmail] = useState('');
  const [directHattyId, setDirectHattyId] = useState('');
  const [directRole, setDirectRole] = useState('Member');
  const [directCustomRole, setDirectCustomRole] = useState('');

  // Fundraising campaign form state
  const [campaignTitle, setCampaignTitle] = useState('');
  const [campaignDesc, setCampaignDesc] = useState('');
  const [campaignTarget, setCampaignTarget] = useState('');
  const [campaignType, setCampaignType] = useState('temple'); // 'temple', 'festival', 'felicitation'
  const [campaignHattyId, setCampaignHattyId] = useState(user?.hatty_id ? String(user.hatty_id) : '');
  const [hattys, setHattys] = useState<any[]>([]);

  // Load hattys list for dropdown selection
  useEffect(() => {
    axios.get('/api/auth/hattys')
      .then(res => setHattys(res.data.hattys))
      .catch(err => console.error(err));
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaignTitle || !campaignDesc || !campaignTarget) {
      alert('All fields are required');
      return;
    }
    setLoading(true);
    try {
      await axios.post('/api/campaigns', {
        title: campaignTitle,
        description: campaignDesc,
        target_amount: parseFloat(campaignTarget),
        type: campaignType,
        hatty_id: campaignHattyId ? parseInt(campaignHattyId) : null
      });
      confetti({ particleCount: 100, spread: 60 });
      alert('Fundraising campaign successfully established!');
      setCampaignTitle('');
      setCampaignDesc('');
      setCampaignTarget('');
    } catch (err) {
      console.error(err);
      alert('Failed to establish fundraising campaign.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVillage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVillageName) return alert('Village name is required');
    setLoading(true);
    try {
      await axios.post('/api/auth/hattys', {
        name: newVillageName,
        description: newVillageDesc,
        location: newVillageLocation,
        role: 'SuperAdmin'
      });
      confetti({ particleCount: 60, spread: 60 });
      setNewVillageName('');
      setNewVillageDesc('');
      setNewVillageLocation('');
      // Re-fetch
      const res = await axios.get('/api/auth/hattys');
      setHattys(res.data.hattys || []);
      alert('Village successfully configured!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create village');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVillage = async (villageId: number) => {
    if (!confirm('Are you sure you want to delete this village/hatty?')) return;
    setLoading(true);
    try {
      await axios.delete(`/api/auth/hattys/${villageId}`, { data: { role: 'SuperAdmin' } });
      // Re-fetch
      const res = await axios.get('/api/auth/hattys');
      setHattys(res.data.hattys || []);
      alert('Village deleted successfully!');
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete village');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateMemberRole = async (memberId: number) => {
    const roleToAssign = selectedUserRoles[memberId] === 'Custom' 
      ? customRoles[memberId] 
      : selectedUserRoles[memberId];

    if (!roleToAssign) {
      alert('Please select or specify a role.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/role', {
        userId: memberId,
        role: roleToAssign
      });
      confetti({ particleCount: 50, colors: ['#10b981'] });
      alert('Member role updated successfully!');
      // Re-fetch
      const res = await axios.get('/api/members');
      setAllMembers(res.data.members || []);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update member role');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUserDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directName || !directPhone) {
      alert('Name and Phone are required.');
      return;
    }
    
    const roleToAssign = directRole === 'Custom' ? directCustomRole : directRole;
    if (!roleToAssign) {
      alert('Please specify a role.');
      return;
    }

    setLoading(true);
    try {
      await axios.post('/api/auth/add-user', {
        name: directName,
        phone: directPhone,
        email: directEmail,
        role: roleToAssign,
        hattyId: directHattyId || null,
        creatorRole: user.role
      });
      confetti({ particleCount: 80, spread: 60 });
      alert('Administrative user successfully registered & approved!');
      
      // Reset
      setDirectName('');
      setDirectPhone('');
      setDirectEmail('');
      setDirectHattyId('');
      setDirectRole('Member');
      setDirectCustomRole('');

      // Re-fetch
      const res = await axios.get('/api/members');
      setAllMembers(res.data.members || []);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to add user.');
    } finally {
      setLoading(false);
    }
  };

  // AI draft assist state
  const [bulletPoints, setBulletPoints] = useState('');
  const [draftType, setDraftType] = useState('announcement'); // 'announcement', 'event'
  const [aiDraftTitle, setAiDraftTitle] = useState('');
  const [aiDraftContent, setAiDraftContent] = useState('');
  const [aiDraftNote, setAiDraftNote] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // For publishing the draft
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [eventLocation, setEventLocation] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, [activeTab]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const hattyFilter = user?.role === 'Admin' ? '' : user?.hatty_id;
      
      if (activeTab === 'users') {
        const res = await axios.get('/api/auth/pending', { params: { hattyId: hattyFilter } });
        setPendingUsers(res.data.pendingUsers);
      } else if (activeTab === 'ads') {
        const res = await axios.get('/api/ads/pending', { params: { role: user?.role } });
        setPendingAds(res.data.pendingAds);
      } else if (activeTab === 'feedback') {
        const res = await axios.get('/api/feedback');
        setFeedbacks(res.data.feedback);
      } else if (activeTab === 'roles') {
        const res = await axios.get('/api/members');
        setAllMembers(res.data.members || []);
      } else if (activeTab === 'villages') {
        const res = await axios.get('/api/auth/hattys');
        setHattys(res.data.hattys || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserApproval = async (userId: number, status: 'approved' | 'suspended') => {
    try {
      await axios.post('/api/auth/approve', { userId, status });
      confetti({ particleCount: 50, spread: 60, colors: status === 'approved' ? ['#10b981'] : ['#ef4444'] });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAdApproval = async (adId: number, status: 'approved' | 'rejected') => {
    try {
      await axios.post(`/api/ads/${adId}/approve`, { status, role: user?.role });
      confetti({ particleCount: 50, spread: 60 });
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGetAiDraft = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulletPoints) return;
    setAiLoading(true);
    try {
      const res = await axios.post('/api/ai/draft-assist', {
        bulletPoints,
        type: draftType
      });
      setAiDraftTitle(res.data.title);
      setAiDraftContent(res.data.draft);
      setAiDraftNote(res.data.note);
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!aiDraftContent) return;
    setLoading(true);
    try {
      if (draftType === 'event') {
        await axios.post('/api/events', {
          title: aiDraftTitle || 'Community Event',
          description: aiDraftContent,
          event_date: eventDate || new Date().toISOString().split('T')[0],
          event_time: eventTime || '10:00 AM',
          location: eventLocation || 'Community Hall',
          hatty_id: user.role === 'Admin' ? null : user.hatty_id,
          type: user.role === 'Admin' ? 'community' : 'hatty',
          created_by: user.name
        });
      } else {
        await axios.post('/api/announcements', {
          title: aiDraftTitle || 'Official Announcement',
          content: aiDraftContent,
          type: user.role === 'Admin' ? 'community' : 'hatty',
          hatty_id: user.role === 'Admin' ? null : user.hatty_id,
          created_by: user.name
        });
      }
      setBulletPoints('');
      setAiDraftTitle('');
      setAiDraftContent('');
      setAiDraftNote('');
      setEventDate('');
      setEventTime('');
      setEventLocation('');
      confetti({ particleCount: 80, spread: 60 });
      alert('Announcement successfully published to community feed!');
    } catch (err) {
      console.error(err);
      alert('Failed to publish announcement.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
          🛡️
          Admin & Thalaivar Control Center
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">
          Role: <strong>{user?.role}</strong> ({user?.hatty_name || 'Community-wide'})
        </p>
      </div>

      {/* Dashboard Sub Navigation Tabs */}
      <div className="flex gap-2 pb-4 overflow-x-auto no-scrollbar border-b border-slate-100 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <UserCheck className="h-4 w-4" />
          Member Approvals ({pendingUsers.length})
        </button>

        {(user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
          <>
            {user?.role === 'SuperAdmin' && (
              <>
                <button
                  onClick={() => setActiveTab('ads')}
                  className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'ads' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Megaphone className="h-4 w-4" />
                  Ad Approvals ({pendingAds.length})
                </button>
                <button
                  onClick={() => setActiveTab('roles')}
                  className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'roles' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  👥 Member Roles
                </button>
                <button
                  onClick={() => setActiveTab('villages')}
                  className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'villages' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  🏘️ Village Config
                </button>
              </>
            )}
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'feedback' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Star className="h-4 w-4" />
              Feedback Hub ({feedbacks.length})
            </button>
          </>
        )}

        <button
          onClick={() => setActiveTab('draft')}
          className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'draft' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Sparkles className="h-4 w-4" />
          AI Announcement Draft
        </button>

        <button
          onClick={() => setActiveTab('campaigns')}
          className={`px-5 py-3 text-xs font-bold rounded-xl tracking-wide uppercase transition-colors flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'campaigns' ? 'bg-slate-900 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CalendarPlus className="h-4 w-4" />
          Fundraising Setup
        </button>
      </div>

      {/* DASHBOARD CONTENT PANELS */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* PANEL 5: Fundraising Campaign Setup */}
        {activeTab === 'campaigns' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 font-display border-b border-slate-50 pb-3">
              Establish New Fundraising Campaign
            </h3>

            <form onSubmit={handleCreateCampaign} className="space-y-4 max-w-2xl">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Campaign Title</label>
                <input
                  type="text"
                  required
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  placeholder="e.g. Balacola Mariamman Temple Restoration Fund"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description & Purpose</label>
                <textarea
                  required
                  rows={4}
                  value={campaignDesc}
                  onChange={(e) => setCampaignDesc(e.target.value)}
                  placeholder="Describe what the funds will be used for..."
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium leading-relaxed"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Target Amount (₹)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={campaignTarget}
                    onChange={(e) => setCampaignTarget(e.target.value)}
                    placeholder="e.g. 500000"
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Campaign Type</label>
                  <select
                    value={campaignType}
                    onChange={(e) => setCampaignType(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium bg-white"
                  >
                    <option value="temple">Temple Construction</option>
                    <option value="festival">Festival Celebration</option>
                    <option value="felicitation">Student Felicitation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Associated Hatty</label>
                  <select
                    disabled={user?.role !== 'Admin'}
                    value={campaignHattyId}
                    onChange={(e) => setCampaignHattyId(e.target.value)}
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium bg-white disabled:bg-slate-50 disabled:text-slate-400"
                  >
                    <option value="">Community-Wide (None)</option>
                    {hattys.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-1.5 py-4 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer border uppercase tracking-wider font-display"
              >
                <CalendarPlus className="h-4 w-4" />
                {loading ? 'Creating Campaign...' : 'Establish Campaign'}
              </button>
            </form>
          </div>
        )}

        {/* PANEL 1: Member Approvals */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-display border-b border-slate-50 pb-3">
              Pending Member Registrations ({pendingUsers.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-6">
                <span className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-brand-green animate-spin"></span>
              </div>
            ) : pendingUsers.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">No pending registrations for your Hatty.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-semibold text-slate-500 min-w-[600px]">
                  <thead>
                    <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                      <th className="py-2.5">Name</th>
                      <th className="py-2.5">Phone</th>
                      <th className="py-2.5">Hatty</th>
                      <th className="py-2.5">Parents</th>
                      <th className="py-2.5">Profession / City</th>
                      <th className="py-2.5 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {pendingUsers.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50/50">
                        <td className="py-4 text-slate-900 font-black">{p.name}</td>
                        <td className="py-4 font-mono text-slate-600">{p.phone}</td>
                        <td className="py-4 text-slate-800">{p.hatty_name}</td>
                        <td className="py-4 font-medium text-[10px] leading-tight text-slate-400">
                          Father: <span className="text-slate-600 font-semibold">{p.father_name || 'N/A'}</span><br />
                          Mother: <span className="text-slate-600 font-semibold">{p.mother_name || 'N/A'}</span>
                        </td>
                        <td className="py-4 font-medium text-[10px] leading-tight text-slate-400">
                          Job: <span className="text-slate-600 font-semibold">{p.profession || 'N/A'}</span><br />
                          City: <span className="text-slate-600 font-semibold">{p.location || 'N/A'}</span>
                        </td>
                        <td className="py-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleUserApproval(p.id, 'approved')}
                              className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg border border-emerald-100 cursor-pointer"
                              title="Approve Member"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleUserApproval(p.id, 'suspended')}
                              className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg border border-red-100 cursor-pointer"
                              title="Reject / Suspend"
                            >
                              <XCircle className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* PANEL 2: Ad Approvals */}
        {activeTab === 'ads' && user?.role === 'SuperAdmin' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-display border-b border-slate-50 pb-3">
              Pending Sponsored Campaign Ads ({pendingAds.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-6">
                <span className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-brand-green animate-spin"></span>
              </div>
            ) : pendingAds.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">No pending advertiser campaigns.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingAds.map((ad) => (
                  <div key={ad.id} className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{ad.business_name} ({ad.category})</span>
                        <span className="text-[9px] font-black text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100 uppercase tracking-wide">Pending Review</span>
                      </div>
                      <h4 className="text-base font-extrabold text-slate-900 font-display leading-tight">{ad.title}</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{ad.description}</p>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] font-semibold text-slate-400 pt-2 border-t border-slate-100">
                        <div>Price: <span className="text-slate-800 font-bold">₹{parseFloat(ad.price || 0).toLocaleString()}</span></div>
                        <div>Duration: <span className="text-slate-800 font-bold">{ad.duration_weeks} Weeks</span></div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <button
                        onClick={() => handleAdApproval(ad.id, 'approved')}
                        className="flex-1 py-2 px-3 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <CheckCircle className="h-3.5 w-3.5" /> Approve Campaign
                      </button>
                      <button
                        onClick={() => handleAdApproval(ad.id, 'rejected')}
                        className="py-2 px-3 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANEL 3: Feedback Hub */}
        {activeTab === 'feedback' && user?.role === 'Admin' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-display border-b border-slate-50 pb-3">
              Consolidated Member Feedbacks ({feedbacks.length})
            </h3>

            {loading ? (
              <div className="flex justify-center py-6">
                <span className="h-6 w-6 rounded-full border-2 border-slate-200 border-t-brand-green animate-spin"></span>
              </div>
            ) : feedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-4 text-center">No feedback entries recorded.</p>
            ) : (
              <div className="space-y-3">
                {feedbacks.map((f) => (
                  <div key={f.id} className="border border-slate-100 rounded-2xl p-4 flex items-start gap-4 hover:border-slate-200 transition-colors bg-slate-50/20">
                    <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {f.user_name ? f.user_name.charAt(0) : '?'}
                    </div>
                    <div className="space-y-1.5 flex-grow">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <h4 className="font-extrabold text-xs text-slate-900 leading-none">
                          {f.user_name || 'Anonymous Member'} <span className="text-[9px] text-slate-400 font-bold">({f.hatty_name || 'N/A'})</span>
                        </h4>
                        
                        {/* Rating stars display */}
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((star) => (
                            <Star key={star} className={`h-3 w-3 ${star <= f.rating ? 'text-yellow-500 fill-yellow-500' : 'text-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-normal">{f.comment}</p>
                      <span className="text-[8px] text-slate-400 block font-semibold uppercase tracking-wider">Trigger: {f.context_action}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PANEL 4: AI Draft Assist */}
        {activeTab === 'draft' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Input Form Column */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 h-fit">
              <div>
                <h3 className="text-lg font-black text-slate-900 font-display">AI Draft Compose</h3>
                <p className="text-xs text-slate-400 font-medium leading-normal mt-0.5">
                  Expand quick bullets into fully structured community updates.
                </p>
              </div>

              <form onSubmit={handleGetAiDraft} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Notice Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDraftType('announcement')}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 ${
                        draftType === 'announcement'
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Megaphone className="h-4 w-4" /> Announcement
                    </button>
                    <button
                      type="button"
                      onClick={() => setDraftType('event')}
                      className={`py-2.5 px-3 border rounded-xl text-xs font-bold tracking-wide transition-colors flex items-center justify-center gap-1.5 ${
                        draftType === 'event'
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <CalendarPlus className="h-4 w-4" /> Event Invite
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Bullet Points (Content context)</label>
                  <textarea
                    rows={6}
                    value={bulletPoints}
                    onChange={(e) => setBulletPoints(e.target.value)}
                    placeholder="Enter short notes e.g.:&#13;- Temple cleansed next Sunday&#13;- volunteers meet at 7am&#13;- carry spades and cleaning tools"
                    required
                    className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={aiLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-4 px-4 bg-slate-900 hover:bg-black text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer border border-brand-green/30"
                >
                  <Sparkles className="h-4 w-4 text-emerald-400" />
                  {aiLoading ? 'AI Composing Notice...' : 'Generate notice draft'}
                </button>
              </form>
            </div>

            {/* AI Review and Publish Column */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-display border-b border-slate-50 pb-3 flex items-center gap-1.5">
                📝 Draft Notice Review
              </h3>

              {aiDraftContent ? (
                <div className="space-y-4 animate-fadeIn">
                  {/* Draft Note indicator */}
                  <div className="bg-brand-green/5 border border-brand-green/10 rounded-xl p-3 text-[10px] text-brand-green font-semibold">
                    💡 {aiDraftNote}
                  </div>

                  {/* Title editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notice Header Title</label>
                    <input
                      type="text"
                      value={aiDraftTitle}
                      onChange={(e) => setAiDraftTitle(e.target.value)}
                      className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-slate-900 font-extrabold focus:outline-none input-glow text-sm font-display"
                    />
                  </div>

                  {/* Body Content Editor */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Notice Body Content</label>
                    <textarea
                      rows={10}
                      value={aiDraftContent}
                      onChange={(e) => setAiDraftContent(e.target.value)}
                      className="block w-full px-3.5 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none input-glow text-xs leading-relaxed"
                    ></textarea>
                  </div>

                  {/* Event coordinates if event notice */}
                  {draftType === 'event' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-b border-slate-50 py-4 bg-slate-50/50 p-4 rounded-2xl">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Event Date</label>
                        <input
                          type="date"
                          value={eventDate}
                          onChange={(e) => setEventDate(e.target.value)}
                          required
                          className="block w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Event Time</label>
                        <input
                          type="text"
                          value={eventTime}
                          onChange={(e) => setEventTime(e.target.value)}
                          placeholder="e.g. 09:00 AM"
                          required
                          className="block w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Location</label>
                        <input
                          type="text"
                          value={eventLocation}
                          onChange={(e) => setEventLocation(e.target.value)}
                          placeholder="e.g. Balacola Temple"
                          required
                          className="block w-full px-2 py-2 border border-slate-200 rounded-lg text-slate-800 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handlePublishDraft}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-4 px-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer border border-brand-green-light/25 font-display tracking-wider"
                  >
                    <Send className="h-4 w-4" />
                    {loading ? 'Publishing...' : 'Publish Official Notice to Feed'}
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-6 text-center text-xs text-slate-400 font-medium leading-relaxed py-12">
                  No draft composed yet. Type bullet points on the left and click generate to draft a notice.
                </div>
              )}
            </div>

          </div>
        )}

        {/* PANEL: Village / Hatty Config (SuperAdmin only) */}
        {activeTab === 'villages' && user?.role === 'SuperAdmin' && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display">
                🏘️ Village / Hatty Configuration
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Establish new regional chapters (Hattys) in the community.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Creation Form */}
              <div className="lg:col-span-1 bg-slate-50/50 p-6 rounded-2xl border border-slate-100/80 space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
                  Configure New Village
                </h4>
                <form onSubmit={handleCreateVillage} className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Village Name</label>
                    <input
                      type="text"
                      value={newVillageName}
                      onChange={(e) => setNewVillageName(e.target.value)}
                      placeholder="e.g. Balacola"
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location / District</label>
                    <input
                      type="text"
                      value={newVillageLocation}
                      onChange={(e) => setNewVillageLocation(e.target.value)}
                      placeholder="e.g. Nilgiris, Tamil Nadu"
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={newVillageDesc}
                      onChange={(e) => setNewVillageDesc(e.target.value)}
                      placeholder="e.g. Ancient settlement near Ooty..."
                      className="block w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 px-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {loading ? 'Creating...' : 'Create Village'}
                  </button>
                </form>
              </div>

              {/* Village List */}
              <div className="lg:col-span-2 space-y-4">
                <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
                  Established Villages ({hattys.length})
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {hattys.map((hatty: any) => (
                    <div key={hatty.id} className="p-4 bg-white border border-slate-100 rounded-2xl shadow-sm flex justify-between items-start gap-4">
                      <div>
                        <h5 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                          📍 {hatty.name}
                        </h5>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">
                          {hatty.location || 'Nilgiris District'}
                        </p>
                        {hatty.description && (
                          <p className="text-[10px] text-slate-500 font-medium mt-1 leading-relaxed line-clamp-2">
                            {hatty.description}
                          </p>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteVillage(hatty.id)}
                        className="p-1.5 text-xs text-red-500 rounded-lg hover:bg-red-50 transition-colors cursor-pointer border border-slate-100 bg-slate-50"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PANEL: Member Roles (SuperAdmin/Admin) */}
        {activeTab === 'roles' && (user?.role === 'Admin' || user?.role === 'SuperAdmin') && (
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 font-display">
                👥 Member Role Management
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Assign and modify administrative roles, Thalaivar status, or custom roles for community members.
              </p>
            </div>

            {/* Direct Register/Add User Form */}
            <div className="bg-slate-50/50 p-6 rounded-2xl border border-slate-100 space-y-4">
              <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide border-b border-slate-100 pb-2">
                ➕ Add Administrative User (Admin, Thalaivar, Secretary, Custom)
              </h4>
              <form onSubmit={handleAddUserDirect} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={directName}
                    onChange={(e) => setDirectName(e.target.value)}
                    placeholder="e.g. Ramesh Gowder"
                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={directPhone}
                    onChange={(e) => setDirectPhone(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Email (Optional)</label>
                  <input
                    type="email"
                    value={directEmail}
                    onChange={(e) => setDirectEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Village / Hatty</label>
                  <select
                    value={directHattyId}
                    onChange={(e) => setDirectHattyId(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                  >
                    <option value="">Global / Community-wide</option>
                    {hattys.map((h: any) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Role</label>
                  <select
                    value={directRole}
                    onChange={(e) => setDirectRole(e.target.value)}
                    className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                  >
                    <option value="Member">Member</option>
                    <option value="Thalaivar">Thalaivar</option>
                    <option value="Secretary">Secretary</option>
                    <option value="Finance Secretary">Finance Secretary</option>
                    <option value="Admin">Admin</option>
                    <option value="SuperAdmin">SuperAdmin</option>
                    <option value="Custom">Custom Role...</option>
                  </select>
                </div>
                <div>
                  {directRole === 'Custom' ? (
                    <>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Custom Role Title</label>
                      <input
                        type="text"
                        required
                        value={directCustomRole}
                        onChange={(e) => setDirectCustomRole(e.target.value)}
                        placeholder="e.g. Welfare Officer"
                        className="block w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300"
                      />
                    </>
                  ) : (
                    <div className="h-full flex items-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border border-transparent shadow-sm"
                      >
                        {loading ? 'Adding...' : 'Add Approved User'}
                      </button>
                    </div>
                  )}
                </div>
                {directRole === 'Custom' && (
                  <div className="md:col-span-3 flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors cursor-pointer border border-transparent shadow-sm"
                    >
                      {loading ? 'Adding...' : 'Add Approved User'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-100 text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase tracking-wider text-left">
                    <th className="pb-3 font-semibold">Member</th>
                    <th className="pb-3 font-semibold">Village / Hatty</th>
                    <th className="pb-3 font-semibold">Current Role</th>
                    <th className="pb-3 font-semibold">Assign Role</th>
                    <th className="pb-3 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {allMembers.map((member: any) => {
                    const currentSelectedRole = selectedUserRoles[member.id] || member.role || 'Member';
                    const showCustomInput = currentSelectedRole === 'Custom';

                    return (
                      <tr key={member.id} className="hover:bg-slate-50/40">
                        <td className="py-3.5 pr-4">
                          <div className="font-bold text-slate-800">{member.name}</div>
                          <div className="text-[10px] text-slate-400 font-medium">{member.phone}</div>
                        </td>
                        <td className="py-3.5 pr-4 font-semibold text-slate-600">
                          {member.hatty_name || 'Global'}
                        </td>
                        <td className="py-3.5 pr-4">
                          <span className="px-2 py-1 bg-brand-green/10 text-brand-green border border-brand-green/20 rounded-lg text-[9px] font-black uppercase tracking-wider font-sans">
                            {member.role || 'Member'}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 space-y-2">
                          <select
                            value={currentSelectedRole}
                            onChange={(e) => {
                              setSelectedUserRoles(prev => ({ ...prev, [member.id]: e.target.value }));
                            }}
                            className="px-2 py-1.5 border border-slate-200 rounded-lg text-slate-700 bg-white font-semibold focus:outline-none"
                          >
                            <option value="Member">Member</option>
                            <option value="Thalaivar">Thalaivar</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Finance Secretary">Finance Secretary</option>
                            <option value="Admin">Admin</option>
                            <option value="SuperAdmin">SuperAdmin</option>
                            <option value="Custom">Custom Role...</option>
                          </select>

                          {showCustomInput && (
                            <input
                              type="text"
                              value={customRoles[member.id] || ''}
                              onChange={(e) => {
                                setCustomRoles(prev => ({ ...prev, [member.id]: e.target.value }));
                              }}
                              placeholder="e.g. Welfare Officer"
                              className="block w-full px-2 py-1.5 border border-slate-200 rounded-lg text-slate-800 text-[11px] font-medium focus:outline-none mt-1"
                            />
                          )}
                        </td>
                        <td className="py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleUpdateMemberRole(member.id)}
                            disabled={loading}
                            className="px-3.5 py-1.5 bg-slate-900 text-white font-bold rounded-xl text-[10px] hover:bg-slate-850 transition-colors shadow-sm cursor-pointer"
                          >
                            Apply Role
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
