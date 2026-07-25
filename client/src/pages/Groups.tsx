import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Plus, MessageSquare, Shield, Globe, Lock, Send, ChevronRight, ArrowLeft, Pin, Trash, Archive, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface GroupsProps {
  user: any;
  language: string;
}

export default function Groups({ user, language }: GroupsProps) {
  // Navigation states: 'list' | 'group' | 'thread'
  const [view, setView] = useState<'list' | 'group' | 'thread'>('list');
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  
  // Lists
  const [groups, setGroups] = useState<any[]>([]);
  const [activeGroup, setActiveGroup] = useState<any>(null);
  const [threads, setThreads] = useState<any[]>([]);
  const [activeThread, setActiveThread] = useState<any>(null);
  const [replies, setReplies] = useState<any[]>([]);

  // Form states
  const [loading, setLoading] = useState(false);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupPrivacy, setNewGroupPrivacy] = useState('public');

  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadContent, setNewThreadContent] = useState('');

  const [newReply, setNewReply] = useState('');

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/groups');
      setGroups(res.data.groups);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupDetails = async (groupId: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/groups/${groupId}`);
      setActiveGroup(res.data.group);
      setThreads(res.data.threads);
      setView('group');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchThreadDetails = async (threadId: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/threads/${threadId}`);
      setActiveThread(res.data.thread);
      setReplies(res.data.replies);
      setView('thread');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName || !newGroupDesc) return;
    setLoading(true);
    try {
      await axios.post('/api/groups', {
        name: newGroupName,
        description: newGroupDesc,
        privacy: newGroupPrivacy,
        created_by: user.id
      });
      setNewGroupName('');
      setNewGroupDesc('');
      setNewGroupPrivacy('public');
      setShowCreateGroup(false);
      confetti({ particleCount: 80, spread: 60 });
      fetchGroups();
    } catch (err) {
      console.error(err);
      alert('Failed to establish community group.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newThreadTitle || !newThreadContent || !selectedGroupId) return;
    setLoading(true);
    try {
      await axios.post(`/api/groups/${selectedGroupId}/threads`, {
        title: newThreadTitle,
        content: newThreadContent,
        created_by: user.id
      });
      setNewThreadTitle('');
      setNewThreadContent('');
      setShowCreateThread(false);
      confetti({ particleCount: 50, spread: 60 });
      fetchGroupDetails(selectedGroupId);
    } catch (err) {
      console.error(err);
      alert('Failed to launch discussion thread.');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReply || !selectedThreadId) return;
    try {
      await axios.post(`/api/threads/${selectedThreadId}/replies`, {
        content: newReply,
        created_by: user.id
      });
      setNewReply('');
      fetchThreadDetails(selectedThreadId);
    } catch (err) {
      console.error(err);
      alert('Failed to post reply.');
    }
  };

  const handleUpdateStatus = async (threadId: number, status: string) => {
    try {
      await axios.post(`/api/threads/${threadId}/status`, { status });
      fetchThreadDetails(threadId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* ---------------- VIEW 1: Groups List ---------------- */}
      {view === 'list' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2">
                👥 Discussion Groups
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">
                Browse public groups, check private ones, and join global community discussions.
              </p>
            </div>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-display text-sm tracking-wide self-start"
            >
              <Plus className="h-4 w-4" />
              Create Group
            </button>
          </div>

          {/* Group Creation Dialog Modal */}
          {showCreateGroup && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
              <form onSubmit={handleCreateGroup} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 border border-slate-100 animate-scaleUp">
                <h3 className="text-lg font-black text-slate-950 font-display">Establish Discussion Group</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Group Name</label>
                  <input
                    type="text"
                    required
                    value={newGroupName}
                    onChange={(e) => setNewGroupName(e.target.value)}
                    placeholder="e.g. Ooty Farmers Union"
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description & Mission</label>
                  <textarea
                    required
                    rows={3}
                    value={newGroupDesc}
                    onChange={(e) => setNewGroupDesc(e.target.value)}
                    placeholder="e.g. Dedicated to organic cultivation and price negotiations."
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Privacy Level</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setNewGroupPrivacy('public')}
                      className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        newGroupPrivacy === 'public' ? 'bg-slate-900 border-slate-900 text-white shadow' : 'bg-white text-slate-600'
                      }`}
                    >
                      <Globe className="h-3.5 w-3.5" />
                      Public
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewGroupPrivacy('private')}
                      className={`flex-1 py-2 border rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        newGroupPrivacy === 'private' ? 'bg-slate-900 border-slate-900 text-white shadow' : 'bg-white text-slate-600'
                      }`}
                    >
                      <Lock className="h-3.5 w-3.5" />
                      Private
                    </button>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateGroup(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Create Group
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Groups Grid */}
          {loading ? (
            <div className="flex justify-center py-12">
              <span className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-brand-green animate-spin"></span>
            </div>
          ) : groups.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium text-center py-12 bg-white rounded-3xl border border-slate-100 shadow-sm">
              No groups have been created yet. Be the first to establish one!
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((g) => (
                <div 
                  key={g.id}
                  onClick={() => {
                    setSelectedGroupId(g.id);
                    fetchGroupDetails(g.id);
                  }}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                        g.privacy === 'public' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                      }`}>
                        {g.privacy === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                        {g.privacy}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">
                        Created by {g.creator_name || 'System'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-lg font-bold text-slate-900 font-display leading-tight">{g.name}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 line-clamp-2">{g.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-50 pt-4 mt-4 text-xs font-semibold text-slate-500">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      {g.thread_count} Threads
                    </span>
                    <span className="text-brand-green flex items-center gap-0.5 hover:underline">
                      Enter Group <ChevronRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ---------------- VIEW 2: Group Threads List ---------------- */}
      {view === 'group' && activeGroup && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Back button and Meta */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setView('list'); setSelectedGroupId(null); }}
              className="p-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Groups</span>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row justify-between sm:items-center gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                  activeGroup.privacy === 'public' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                }`}>
                  {activeGroup.privacy === 'public' ? <Globe className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                  {activeGroup.privacy}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight font-display">{activeGroup.name}</h2>
              <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-3xl">{activeGroup.description}</p>
            </div>
            
            <button
              onClick={() => setShowCreateThread(true)}
              className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-display text-sm tracking-wide self-start"
            >
              <Plus className="h-4 w-4" />
              New Thread
            </button>
          </div>

          {/* Create Thread modal */}
          {showCreateThread && (
            <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
              <form onSubmit={handleCreateThread} className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-100 animate-scaleUp">
                <h3 className="text-lg font-black text-slate-950 font-display">Start a Discussion Thread</h3>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Thread Title</label>
                  <input
                    type="text"
                    required
                    value={newThreadTitle}
                    onChange={(e) => setNewThreadTitle(e.target.value)}
                    placeholder="e.g. Organising logistics for next temple transport"
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Discussion Body / Information</label>
                  <textarea
                    required
                    rows={5}
                    value={newThreadContent}
                    onChange={(e) => setNewThreadContent(e.target.value)}
                    placeholder="State details, ask questions, or provide updates..."
                    className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none"
                  ></textarea>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateThread(false)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Launch Thread
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Threads list */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-display">Active Discussions</h3>
            {threads.length === 0 ? (
              <p className="text-sm text-slate-400 font-medium py-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
                No discussion threads have been opened in this group yet. Write a topic above to initiate!
              </p>
            ) : (
              <div className="space-y-3">
                {threads.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => {
                      setSelectedThreadId(t.id);
                      fetchThreadDetails(t.id);
                    }}
                    className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all cursor-pointer flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {t.status === 'pinned' && (
                          <span className="flex items-center gap-0.5 bg-amber-50 text-amber-700 text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-amber-100">
                            📌 Pinned
                          </span>
                        )}
                        <span className={`text-[8px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${
                          t.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 font-display leading-snug">{t.title}</h4>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
                        By {t.author_name || 'Member'} • {new Date(t.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center text-xs font-semibold text-slate-500">
                      <span className="flex items-center gap-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                        <MessageSquare className="h-3.5 w-3.5 text-slate-400" />
                        {t.reply_count} Replies
                      </span>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- VIEW 3: Thread & Discussion Replies ---------------- */}
      {view === 'thread' && activeThread && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Back button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => { setView('group'); setSelectedThreadId(null); }}
                className="p-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Back to Group</span>
            </div>

            {/* Admin status controllers */}
            {(user?.role === 'Admin' || user?.role === 'Thalaivar' || activeThread.created_by === user?.id) && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleUpdateStatus(activeThread.id, 'pinned')}
                  className={`p-2 border rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                    activeThread.status === 'pinned' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  title="Pin Thread"
                >
                  <Pin className="h-3.5 w-3.5" />
                  Pin
                </button>
                <button
                  onClick={() => handleUpdateStatus(activeThread.id, activeThread.status === 'archived' ? 'active' : 'archived')}
                  className={`p-2 border rounded-xl transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                    activeThread.status === 'archived' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                  }`}
                  title="Toggle Archive"
                >
                  <Archive className="h-3.5 w-3.5" />
                  {activeThread.status === 'archived' ? 'Active' : 'Archive'}
                </button>
              </div>
            )}
          </div>

          {/* Thread Header Post */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-brand-green bg-brand-green/5 border border-brand-green/10 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                {activeThread.group_name}
              </span>
              {activeThread.status === 'pinned' && (
                <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-100 px-2 py-0.5 rounded-lg font-black uppercase tracking-wider">
                  Pinned
                </span>
              )}
            </div>
            
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight font-display">{activeThread.title}</h2>
            
            <p className="text-slate-700 leading-relaxed text-sm whitespace-pre-wrap font-medium pb-4">{activeThread.content}</p>

            <div className="border-t border-slate-50 pt-4 flex items-center justify-between text-xs text-slate-400 font-semibold">
              <span>Opened by: <strong className="text-slate-700">{activeThread.author_name || 'Member'}</strong></span>
              <span>{new Date(activeThread.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
          </div>

          {/* Replies Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-black text-slate-900 font-display flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-slate-400" />
              Replies ({replies.length})
            </h3>

            {/* Replies Feed */}
            {replies.length === 0 ? (
              <p className="text-xs text-slate-400 font-medium py-6 text-center bg-white rounded-2xl border border-slate-50">
                No replies posted. Be the first to join the conversation below!
              </p>
            ) : (
              <div className="space-y-3 pl-0 sm:pl-6">
                {replies.map((reply) => (
                  <div key={reply.id} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-800">
                        {reply.author_name || 'Member'}
                        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider ml-1.5">
                          ({reply.author_role})
                        </span>
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(reply.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-wrap font-medium">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Reply Entry Box */}
            <form onSubmit={handleCreateReply} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm flex items-center gap-3">
              <input
                type="text"
                required
                value={newReply}
                disabled={activeThread.status === 'archived'}
                onChange={(e) => setNewReply(e.target.value)}
                placeholder={activeThread.status === 'archived' ? 'This thread has been archived.' : 'Write a response...'}
                className="block flex-grow px-4 py-3 border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none bg-slate-50 focus:bg-white"
              />
              <button
                type="submit"
                disabled={activeThread.status === 'archived'}
                className="p-3 bg-brand-green hover:bg-brand-green-dark text-white rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center disabled:bg-slate-200 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

        </div>
      )}

    </div>
  );
}
