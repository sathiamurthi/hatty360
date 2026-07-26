import React, { useState, useEffect } from 'react';
import { Music, Play, Download, Search, Plus, Radio, Compass, Disc, MessageSquare, AlertCircle, FileAudio } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface SongsLibraryProps {
  user: any;
  language: string;
}

export default function SongsLibrary({ user, language }: SongsLibraryProps) {
  const [songs, setSongs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [category, setCategory] = useState('Bhajan');
  const [fileUrl, setFileUrl] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Inline audio player state
  const [playingSongId, setPlayingSongId] = useState<number | null>(null);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/songs');
      setSongs(res.data.songs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert Dropbox/Google Drive links to direct stream/download URLs
  const getDirectAudioUrl = (url: string): string => {
    if (!url) return '';
    
    // Dropbox conversion
    if (url.includes('dropbox.com')) {
      let clean = url.replace('www.dropbox.com', 'dl.dropboxusercontent.com');
      // Remove dl=0 query param and enforce raw=1
      clean = clean.split('?')[0] + '?raw=1';
      return clean;
    }
    
    // Google Drive conversion
    if (url.includes('drive.google.com')) {
      const match = url.match(/\/file\/d\/([^/]+)/);
      if (match && match[1]) {
        return `https://docs.google.com/uc?export=download&id=${match[1]}`;
      }
    }
    
    return url;
  };

  const handlePublishSong = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !fileUrl) return alert('Title, Artist, and Audio Link are required.');
    
    setFormLoading(true);
    try {
      await axios.post('/api/songs', {
        title,
        artist,
        category,
        file_url: fileUrl,
        description,
        created_by: user?.id
      });
      
      confetti({ particleCount: 80, spread: 60 });
      setTitle('');
      setArtist('');
      setCategory('Bhajan');
      setFileUrl('');
      setDescription('');
      setShowPublishModal(false);
      fetchSongs();
      alert('Song successfully published to library!');
    } catch (err) {
      console.error(err);
      alert('Failed to publish song.');
    } finally {
      setFormLoading(false);
    }
  };

  // Filter songs list
  const filteredSongs = songs.filter(s => {
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.artist.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoriesList = ['All', 'Bhajan', 'Devotional', 'Folk', 'Motivation', 'Other'];

  return (
    <div className="space-y-6">
      
      {/* Title Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-900 shadow-xl flex flex-col md:flex-row justify-between md:items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-white/5 -mr-10 -mt-10 blur-xl"></div>
        <div className="space-y-2 relative z-10">
          <span className="text-[10px] font-black uppercase bg-emerald-700/60 text-emerald-300 border border-emerald-500/20 px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5 w-max">
            <Radio className="h-3 w-3 animate-pulse text-red-400" /> Audio Library
          </span>
          <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight leading-none">Community Songs & Bhajans</h2>
          <p className="text-xs sm:text-sm text-emerald-100 font-light leading-relaxed max-w-2xl">
            Listen to devotional songs, traditional folk music, and motivational tracks published by community members. Use your free Google Drive or Dropbox links to stream MP3 files directly!
          </p>
        </div>

        <button
          onClick={() => setShowPublishModal(true)}
          className="bg-white hover:bg-slate-100 text-emerald-950 font-bold py-3 px-6 rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer font-display text-sm tracking-wide self-start shrink-0 relative z-10"
        >
          <Plus className="h-4 w-4 text-emerald-900" />
          Publish Song
        </button>
      </div>

      {/* Search & Category Filter Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by song name or artist..."
            className="block w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-slate-800 text-xs font-semibold focus:outline-none focus:border-slate-300 shadow-sm"
          />
        </div>

        {/* Categories row */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedCategory === cat 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Songs Display Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <span className="h-8 w-8 rounded-full border-4 border-slate-200 border-t-emerald-700 animate-spin"></span>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-3">
          <FileAudio className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-400 font-bold">No songs match your criteria.</p>
          <p className="text-xs text-slate-400">Be the first to publish a track!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSongs.map((song) => {
            const isPlaying = playingSongId === song.id;
            const directUrl = getDirectAudioUrl(song.file_url);

            return (
              <div 
                key={song.id} 
                className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <Music className="h-3 w-3" />
                      {song.category}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Published by {song.publisher_name || 'Member'}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 font-display leading-snug">{song.title}</h4>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{song.artist}</p>
                    {song.description && (
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-2 line-clamp-2">{song.description}</p>
                    )}
                  </div>
                </div>

                {/* Inline HTML Audio Player */}
                <div className="space-y-3 pt-3 border-t border-slate-50">
                  <div className="bg-slate-50 rounded-2xl p-2.5 flex flex-col items-center">
                    <audio 
                      controls 
                      src={directUrl}
                      className="w-full h-8"
                      onPlay={() => setPlayingSongId(song.id)}
                      onPause={() => setPlayingSongId(null)}
                    />
                  </div>

                  <div className="flex gap-2">
                    <a
                      href={directUrl}
                      download={`${song.title} - ${song.artist}.mp3`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Download className="h-3.5 w-3.5" />
                      Download MP3
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Publish Song Modal Overlay */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 flex items-center justify-center p-4">
          <form onSubmit={handlePublishSong} className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-4 border border-slate-100 animate-scaleUp">
            
            <div className="flex justify-between items-center border-b border-slate-50 pb-3">
              <h3 className="text-lg font-black text-slate-950 font-display">Publish New Song / MP3</h3>
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 border border-slate-100 rounded-lg px-2.5 py-1"
              >
                Close
              </button>
            </div>

            {/* Instruction Warning Banner */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 flex gap-2.5 text-amber-900 text-xs">
              <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-700 mt-0.5" />
              <div className="space-y-1 leading-normal font-medium">
                <p className="font-extrabold text-amber-950">How to use Google Drive / Dropbox Links:</p>
                <ul className="list-disc pl-4 space-y-0.5">
                  <li>Upload your MP3 file to Google Drive or Dropbox.</li>
                  <li>Set the sharing option to <strong>"Anyone with the link can view/download"</strong>.</li>
                  <li>Copy and paste that shared link here. We will convert it automatically to enable direct inline streaming and downloads!</li>
                </ul>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Song Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Shiva Stotra"
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Artist / Singer *</label>
                <input
                  type="text"
                  required
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  placeholder="e.g. Basaveshwara Bhajana Sangha"
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none bg-white"
                >
                  <option value="Bhajan">Bhajan</option>
                  <option value="Devotional">Devotional</option>
                  <option value="Folk">Folk</option>
                  <option value="Motivation">Motivation</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Dropbox / Google Drive Link *</label>
              <input
                type="url"
                required
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://drive.google.com/file/d/... or https://www.dropbox.com/..."
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1">Description / Meaning (Optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the song or specify standard lyrics..."
                className="block w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none resize-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowPublishModal(false)}
                className="px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2.5 bg-brand-green hover:bg-brand-green-dark text-white rounded-xl text-xs font-bold cursor-pointer disabled:bg-slate-200"
              >
                {formLoading ? 'Publishing...' : 'Publish Song'}
              </button>
            </div>

          </form>
        </div>
      )}

    </div>
  );
}
