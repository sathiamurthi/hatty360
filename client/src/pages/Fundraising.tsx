import React, { useState, useEffect } from 'react';
import { Landmark, Award, IndianRupee, Heart, CheckCircle2, QrCode, FileText, ArrowRight, Printer } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface FundraisingProps {
  user: any;
  language: string;
}

export default function Fundraising({ user, language }: FundraisingProps) {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<any | null>(null);
  
  // Payment state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [donorName, setDonorName] = useState(user ? user.name : '');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Receipt state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receipt, setReceipt] = useState<any | null>(null);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await axios.get('/api/campaigns');
      setCampaigns(res.data.campaigns);
    } catch (err) {
      console.error(err);
    }
  };

  const startDonation = (campaign: any) => {
    setSelectedCampaign(campaign);
    setDonorName(user ? user.name : '');
    setAmount('');
    setShowPaymentModal(true);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0 || !donorName) return;
    setLoading(true);

    try {
      const res = await axios.post('/api/donations', {
        campaign_id: selectedCampaign.id,
        user_id: user?.id || null,
        amount: parseFloat(amount),
        donor_name: donorName,
        hatty_id: selectedCampaign.hatty_id
      });

      if (res.data.success) {
        setReceipt(res.data.donation);
        setShowPaymentModal(false);
        setShowReceiptModal(true);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
        fetchCampaigns();
      }
    } catch (err) {
      console.error(err);
      alert('Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const printReceipt = () => {
    window.print();
  };

  const t = {
    en: {
      title: "Hatty Fundraising & Temple Funds",
      sub: "Track and support ongoing temple construction and shared community campaigns.",
      target: "Target:",
      raised: "Raised:",
      donors: "Donations",
      contributeBtn: "Contribute via UPI",
      payTitle: "Simulated UPI Payment Gateway",
      paySub: "Scan the QR or click complete to simulate a secure UPI transfer",
      receiptTitle: "Official Donation Receipt",
      receiptSub: "Thank you for your generous contribution to the community.",
      printBtn: "Print Receipt"
    },
    kn: {
      title: "ಹಟ್ಟಿ ನಿಧಿ ಸಂಗ್ರಹ ಮತ್ತು ದೇವಸ್ಥಾನ ನಿಧಿಗಳು",
      sub: "ದೇವಸ್ಥಾನಗಳ ನಿರ್ಮಾಣ ಮತ್ತು ಸಮುದಾಯದ ಇತರ ಅಭಿಯಾನಗಳಿಗೆ ನಿಮ್ಮ ಬೆಂಬಲ ನೀಡಿ.",
      target: "ಗುರಿ:",
      raised: "ಸಂಗ್ರಹವಾದ ಮೊತ್ತ:",
      donors: "ದೇಣಿಗೆಗಳು",
      contributeBtn: "ಯುಪಿಐ ಮೂಲಕ ದೇಣಿಗೆ ನೀಡಿ",
      payTitle: "ಯುಪಿಐ ಪಾವತಿ ಗೇಟ್‌ವೇ",
      paySub: "ಪಾವತಿಯನ್ನು ಪೂರ್ಣಗೊಳಿಸಲು ಕ್ಯೂಆರ್ ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ ಅಥವಾ ಬಟನ್ ಕ್ಲಿಕ್ ಮಾಡಿ",
      receiptTitle: "ಅಧಿಕೃತ ದೇಣಿಗೆ ರಶೀದಿ",
      receiptSub: "ಸಮುದಾಯಕ್ಕೆ ನಿಮ್ಮ ಉದಾರ ಕೊಡುಗೆಗಾಗಿ ಧನ್ಯವಾದಗಳು.",
      printBtn: "ರಶೀದಿ ಪ್ರಿಂಟ್ ಮಾಡಿ"
    },
    ta: {
      title: "ஹட்டி நிதி திரட்டல் & கோவில் நிதிகள்",
      sub: "கோவில் கட்டுமானப் பணிகள் மற்றும் சமூக நலத்திட்டங்களை ஆதரியுங்கள்.",
      target: "இலக்கு:",
      raised: "பெறப்பட்டது:",
      donors: "பங்களிப்புகள்",
      contributeBtn: "யுபிஐ மூலம் நிதி வழங்கு",
      payTitle: "யுபிஐ கட்டண சிமுலேட்டர்",
      paySub: "கட்டணத்தை முடிக்க கியூஆர் குறியீட்டை ஸ்கேன் செய்யவும்",
      receiptTitle: "அதிகாரப்பூர்வ நன்கொடை ரசீது",
      receiptSub: "சமூகத்திற்கு உங்களின் தாராள பங்களிப்பிற்கு நன்றி.",
      printBtn: "ரசீது அச்சிடுக"
    },
    bd: {
      title: "Hatty Fundraising & Temple Funds",
      sub: "Track and support ongoing temple construction and shared community campaigns.",
      target: "Target:",
      raised: "Raised:",
      donors: "Donations",
      contributeBtn: "Contribute via UPI",
      payTitle: "Simulated UPI Payment Gateway",
      paySub: "Scan the QR or click complete to simulate a secure UPI transfer",
      receiptTitle: "Official Donation Receipt",
      receiptSub: "Thank you for your generous contribution to the community.",
      printBtn: "Print Receipt"
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    title: "Hatty Fundraising & Temple Funds",
    sub: "Track and support ongoing temple construction and shared community campaigns.",
    target: "Target:",
    raised: "Raised:",
    donors: "Donations",
    contributeBtn: "Contribute via UPI",
    payTitle: "Simulated UPI Payment Gateway",
    paySub: "Scan the QR or click complete to simulate a secure UPI transfer",
    receiptTitle: "Official Donation Receipt",
    receiptSub: "Thank you for your generous contribution to the community.",
    printBtn: "Print Receipt"
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Title */}
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">{t.title}</h2>
        <p className="text-sm text-slate-500 font-medium mt-1">{t.sub}</p>
      </div>

      <div className="space-y-8">
        {/* Special Top Banner: Student Felicitation (Community Wide) */}
        {campaigns.filter(c => c.type === 'felicitation').map((camp) => {
          const pct = Math.min(100, (parseFloat(camp.raised_amount) / parseFloat(camp.target_amount)) * 100);
          return (
            <div key={camp.id} className="bg-gradient-to-br from-brand-blue to-brand-blue-dark rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden border border-white/5 group">
              <div className="absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-brand-blue-light/10 group-hover:scale-105 transition-transform duration-300"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
                <div className="md:col-span-8 space-y-3">
                  <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-white/15 px-3 py-1 rounded-lg">
                    <Award className="h-4 w-4 text-yellow-300" />
                    Annual Community Initiative
                  </span>
                  <h3 className="text-2xl font-black font-display tracking-tight leading-tight">{camp.title}</h3>
                  <p className="text-sm text-blue-100 font-light max-w-2xl">{camp.description}</p>
                  
                  {/* Progress details */}
                  <div className="grid grid-cols-3 gap-4 pt-3 text-xs font-semibold">
                    <div>
                      <span className="text-blue-200 block">{t.target}</span>
                      <span className="text-base font-black">₹{parseFloat(camp.target_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-blue-200 block">{t.raised}</span>
                      <span className="text-base font-black text-emerald-300">₹{parseFloat(camp.raised_amount).toLocaleString('en-IN')}</span>
                    </div>
                    <div>
                      <span className="text-blue-200 block">Progress:</span>
                      <span className="text-base font-black text-yellow-300">{pct.toFixed(1)}%</span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-brand-blue-dark/50 rounded-full h-3.5 border border-white/5 overflow-hidden mt-4">
                    <div className="bg-gradient-to-r from-emerald-400 to-emerald-300 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                  </div>
                </div>
                
                <div className="md:col-span-4 flex justify-start md:justify-end">
                  <button
                    onClick={() => startDonation(camp)}
                    className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-4 px-8 rounded-2xl shadow-lg transition-all hover:scale-[1.02] cursor-pointer font-display text-sm tracking-wide border border-brand-green-light/20 flex items-center gap-1.5"
                  >
                    <IndianRupee className="h-4 w-4" />
                    {t.contributeBtn}
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* 8 Hattys Temple Campaigns Grid */}
        <div className="space-y-4">
          <h3 className="text-xl font-black text-slate-900 tracking-tight font-display flex items-center gap-2 border-b border-slate-100 pb-3">
            <Landmark className="h-5 w-5 text-brand-green" />
            8 Hattys Temple Construction Campaigns
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.filter(c => c.type === 'temple').map((camp) => {
              const pct = Math.min(100, (parseFloat(camp.raised_amount) / parseFloat(camp.target_amount)) * 100);
              return (
                <div key={camp.id} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
                  {/* Hatty Tag */}
                  <div className="absolute -right-8 -top-8 h-20 w-20 bg-emerald-50 rounded-full group-hover:scale-105 transition-transform"></div>
                  
                  <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-brand-green/10 text-brand-green flex items-center justify-center font-bold text-xs">
                        🏛️
                      </div>
                      <span className="text-[10px] font-black uppercase text-brand-green tracking-wider">{camp.hatty_name} Hatty</span>
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 tracking-tight leading-snug font-display line-clamp-1">{camp.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-normal font-medium">{camp.description}</p>
                    </div>

                    {/* Progress details */}
                    <div className="grid grid-cols-2 gap-2 text-xs font-semibold border-t border-b border-slate-50 py-3">
                      <div>
                        <span className="text-slate-400 block">{t.target}</span>
                        <span className="text-sm font-black text-slate-800">₹{parseFloat(camp.target_amount).toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block">{t.raised}</span>
                        <span className="text-sm font-black text-brand-green">₹{parseFloat(camp.raised_amount).toLocaleString('en-IN')} ({pct.toFixed(0)}%)</span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div className="bg-brand-green h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>

                  <button
                    onClick={() => startDonation(camp)}
                    className="w-full mt-6 flex items-center justify-center gap-1.5 py-3 px-4 bg-brand-dark hover:bg-slate-900 text-white font-bold rounded-2xl text-xs transition-colors shadow-sm cursor-pointer border border-brand-green-light/25 font-display tracking-wider"
                  >
                    <IndianRupee className="h-3.5 w-3.5" />
                    {t.contributeBtn}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* PAYMENT MODAL (UPI SIMULATION) */}
      {showPaymentModal && selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp">
            {/* Header */}
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <h3 className="font-extrabold text-lg font-display tracking-tight">{t.payTitle}</h3>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{selectedCampaign.title}</p>
              </div>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white text-xs font-bold font-sans">
                Cancel
              </button>
            </div>

            <form onSubmit={handlePaymentSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Donor Name</label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Enter full name"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Donation Amount (INR)</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-sm font-black">₹</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-black"
                  />
                </div>
              </div>

              {/* QR Simulation Box */}
              {amount && parseFloat(amount) > 0 && (
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col items-center justify-center gap-3 animate-fadeIn">
                  <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
                    <QrCode className="h-28 w-28 text-slate-800" />
                    <div className="absolute inset-0 bg-white/80 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <span className="text-[10px] font-black text-brand-green bg-emerald-50 border border-emerald-100 rounded-lg p-1.5 uppercase">Test Gateway</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium text-center max-w-xs">
                    {t.paySub}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full flex items-center justify-center gap-1.5 py-4 px-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer border border-brand-green-light/25 font-display tracking-wider"
              >
                {loading ? 'Processing Transaction...' : 'Simulate Complete UPI Payment'}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT MODAL */}
      {showReceiptModal && receipt && selectedCampaign && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp print:shadow-none print:border-none print:w-full print:max-w-none">
            
            {/* Watermark header in print mode */}
            <div className="bg-gradient-to-r from-brand-green to-brand-green-dark p-6 text-white text-center relative overflow-hidden">
              <div className="absolute right-4 bottom-4 h-16 w-16 text-white/5 font-display text-7xl">🕉️</div>
              <Landmark className="h-8 w-8 mx-auto mb-2 text-emerald-300" />
              <h3 className="font-extrabold text-lg tracking-tight font-display">{t.receiptTitle}</h3>
              <p className="text-xs text-emerald-200 mt-1">{t.receiptSub}</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Logo block */}
              <div className="text-center pb-4 border-b border-slate-100">
                <span className="text-slate-900 font-extrabold text-xl tracking-tight font-display">Hatty360 Community Fund</span>
                <span className="text-[9px] text-brand-green font-bold tracking-wider uppercase block">Receipt Generated via In-App UPI Portal</span>
              </div>

              {/* Receipt details */}
              <div className="space-y-3.5 text-xs font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Receipt No:</span>
                  <span className="text-slate-950 font-black">{receipt.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Donor Name:</span>
                  <span className="text-slate-950">{receipt.donor_name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Hatty Affiliate:</span>
                  <span className="text-slate-950">{selectedCampaign.hatty_name || 'Community-wide'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Purpose / Campaign:</span>
                  <span className="text-slate-950 max-w-[200px] text-right">{selectedCampaign.title}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span className="text-slate-950">{new Date(receipt.created_at).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded-md text-[10px] uppercase font-black">COMPLETED</span>
                </div>
                
                <div className="flex justify-between border-t border-slate-100 pt-4 text-sm font-black">
                  <span className="text-slate-900">Total Contribution:</span>
                  <span className="text-brand-green text-lg">₹{parseFloat(receipt.amount).toLocaleString('en-IN')}.00</span>
                </div>
              </div>

              {/* Signature block */}
              <div className="pt-6 border-t border-dashed border-slate-200 text-center">
                <span className="block text-[8px] text-slate-400 font-bold uppercase tracking-widest">Digitally Signed & Validated</span>
                <span className="block text-[10px] text-brand-green font-black mt-1 font-display">Hatty360 Central Finance Secretariat</span>
              </div>

              {/* Control buttons */}
              <div className="flex gap-2 pt-2 print:hidden">
                <button
                  type="button"
                  onClick={printReceipt}
                  className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs transition-colors cursor-pointer border border-slate-200"
                >
                  <Printer className="h-4 w-4" />
                  {t.printBtn}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReceiptModal(false)}
                  className="flex-1 flex items-center justify-center py-3 px-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-2xl text-xs transition-all shadow-md cursor-pointer border border-brand-green-light/25"
                >
                  Done
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
