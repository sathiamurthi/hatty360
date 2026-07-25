import React, { useState, useEffect } from 'react';
import { Landmark, Users, Plus, IndianRupee, ArrowRight, ShieldCheck, Heart, AlertCircle } from 'lucide-react';
import axios from 'axios';
import confetti from 'canvas-confetti';

interface WomensGroupProps {
  user: any;
  language: string;
}

export default function WomensGroup({ user, language }: WomensGroupProps) {
  const [groups, setGroups] = useState<any[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Proposal State
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [monthlySavings, setMonthlySavings] = useState('500');

  // Transaction State
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [txnType, setTxnType] = useState('savings'); // 'savings', 'loan_disbursement', 'loan_repayment'
  const [txnAmount, setTxnAmount] = useState('');
  const [targetMemberId, setTargetMemberId] = useState(user ? user.id.toString() : '');
  const [groupMembers, setGroupMembers] = useState<any[]>([]);

  useEffect(() => {
    fetchGroups();
  }, [user]);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/shg', {
        params: { hatty_id: user?.hatty_id }
      });
      setGroups(res.data.groups);
      if (res.data.groups.length > 0 && !selectedGroup) {
        selectGroup(res.data.groups[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectGroup = async (group: any) => {
    setSelectedGroup(group);
    try {
      const ledgerRes = await axios.get(`/api/shg/${group.id}/ledger`);
      setLedger(ledgerRes.data.ledger);
      setSummary(ledgerRes.data.summary);
      
      // Load members for transaction dropdown (mocking based on directory)
      const dirRes = await axios.get('/api/members', { params: { hatty_id: group.hatty_id } });
      setGroupMembers(dirRes.data.members.filter((m: any) => m.gender === 'Female'));
    } catch (err) {
      console.error(err);
    }
  };

  const handleProposeGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !monthlySavings) return;
    setLoading(true);

    try {
      const res = await axios.post('/api/shg', {
        name: groupName,
        hatty_id: user.hatty_id,
        head_id: user.id,
        monthly_savings_amt: parseFloat(monthlySavings)
      });
      setGroupName('');
      setShowProposeModal(false);
      confetti({ particleCount: 50, spread: 60 });
      fetchGroups();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTxnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txnAmount || !targetMemberId || !selectedGroup) return;
    setLoading(true);

    try {
      await axios.post(`/api/shg/${selectedGroup.id}/ledger`, {
        user_id: parseInt(targetMemberId),
        type: txnType,
        amount: parseFloat(txnAmount)
      });
      setTxnAmount('');
      setShowTxnModal(false);
      confetti({ particleCount: 40 });
      selectGroup(selectedGroup);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isEligible = user?.gender === 'Female';

  const t = {
    en: {
      title: "Women's Self-Help Groups (SHG)",
      sub: "Manage monthly savings log, loans, and rotation tracking for community SHGs.",
      eligibilityErr: "Eligibility Notice: Access to SHG ledgers and proposals is restricted to female community members as per the community guidelines.",
      proposeBtn: "Propose SHG",
      ledgerTitle: "Group Savings Ledger",
      savings: "Total Savings",
      loans: "Outstanding Loans",
      repay: "Repayments",
      bal: "Cash Balance",
      logTxn: "Log Transaction",
      noGroups: "No Self Help Groups proposed in your hatty yet."
    },
    kn: {
      title: "ಮಹಿಳಾ ಸ್ವಸಹಾಯ ಸಂಘಗಳು (SHG)",
      sub: "ಮಹಿಳಾ ಸಂಘಗಳ ಮಾಸಿಕ ಉಳಿತಾಯ ಡೈರಿ ಮತ್ತು ಸಾಲ ವಹಿವಾಟು ನಿರ್ವಹಣೆ.",
      eligibilityErr: "ಅರ್ಹತೆಯ ಸೂಚನೆ: ಸಮುದಾಯ ಮಾರ್ಗಸೂಚಿಗಳ ಪ್ರಕಾರ ಸ್ವಸಹಾಯ ಸಂಘಗಳ ಪ್ರವೇಶ ಮಹಿಳಾ ಸದಸ್ಯರಿಗೆ ಮಾತ್ರ ಸೀಮಿತವಾಗಿದೆ.",
      proposeBtn: "ಹೊಸ ಸಂಘ ಪ್ರಸ್ತಾಪಿಸಿ",
      ledgerTitle: "ಸಂಘದ ಉಳಿತಾಯ ಲೆಡ್ಜರ್",
      savings: "ಒಟ್ಟು ಉಳಿತಾಯ",
      loans: "ನೀಡಿದ ಸಾಲಗಳು",
      repay: "ಮರುಪಾವತಿಗಳು",
      bal: "ಸಂಘದ ನಗದು ಬ್ಯಾಲೆನ್ಸ್",
      logTxn: "ವಹಿವಾಟು ದಾಖಲಿಸಿ",
      noGroups: "ನಿಮ್ಮ ಹಟ್ಟಿಯಲ್ಲಿ ಇನ್ನೂ ಯಾವುದೇ ಸ್ವಸಹಾಯ ಸಂಘಗಳಿಲ್ಲ."
    },
    ta: {
      title: "மகளிர் சுயஉதவிக் குழுக்கள் (SHG)",
      sub: "மகளிர் குழுக்களின் மாதாந்திர சேமிப்பு, கடன்கள் மற்றும் சுழற்சி கண்காணிப்பு.",
      eligibilityErr: "தகுதி அறிவிப்பு: மகளிர் சுயஉதவி குழுக்கள் பெண் உறுப்பினர்களுக்கு மட்டுமே அனுமதிக்கப்படுகிறது.",
      proposeBtn: "குழுவை உருவாக்கு",
      ledgerTitle: "சேமிப்பு கணக்கு பேரேடு",
      savings: "மொத்த சேமிப்பு",
      loans: "வழங்கப்பட்ட கடன்கள்",
      repay: "திரும்பப் பெறப்பட்ட கடன்கள்",
      bal: "குழுவின் ரொக்க இருப்பு",
      logTxn: "பரிவர்த்தனை பதிவுசெய்",
      noGroups: "உங்கள் ஹட்டியில் இதுவரை மகளிர் குழுக்கள் ஏதும் இல்லை."
    },
    bd: {
      title: "Women's Self-Help Groups (SHG)",
      sub: "Manage monthly savings log, loans, and rotation tracking for community SHGs.",
      eligibilityErr: "Eligibility Notice: Access to SHG ledgers and proposals is restricted to female community members as per the community guidelines.",
      proposeBtn: "Propose SHG",
      ledgerTitle: "Group Savings Ledger",
      savings: "Total Savings",
      loans: "Outstanding Loans",
      repay: "Repayments",
      bal: "Cash Balance",
      logTxn: "Log Transaction",
      noGroups: "No Self Help Groups proposed in your hatty yet."
    }
  }[language as 'en'|'kn'|'ta'|'bd'] || {
    title: "Women's Self-Help Groups (SHG)",
    sub: "Manage monthly savings log, loans, and rotation tracking for community SHGs.",
    eligibilityErr: "Eligibility Notice: Access to SHG ledgers and proposals is restricted to female community members as per the community guidelines.",
    proposeBtn: "Propose SHG",
    ledgerTitle: "Group Savings Ledger",
    savings: "Total Savings",
    loans: "Outstanding Loans",
    repay: "Repayments",
    bal: "Cash Balance",
    logTxn: "Log Transaction",
    noGroups: "No Self Help Groups proposed in your hatty yet."
  };

  if (!isEligible) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6 flex items-start gap-4 shadow-sm">
          <AlertCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-extrabold text-lg text-red-900 font-display">Access Restricted</h3>
            <p className="text-sm font-medium mt-1 leading-relaxed">{t.eligibilityErr}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight font-display">{t.title}</h2>
          <p className="text-sm text-slate-500 font-medium mt-1">{t.sub}</p>
        </div>
        <button
          onClick={() => setShowProposeModal(true)}
          className="bg-brand-green hover:bg-brand-green-dark text-white font-bold py-3 px-6 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer font-display text-sm tracking-wide self-start"
        >
          <Plus className="h-4 w-4" />
          {t.proposeBtn}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Groups list */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight font-display border-b border-slate-100 pb-3">
            Active SHGs ({groups.length})
          </h3>

          {groups.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">{t.noGroups}</p>
          ) : (
            <div className="space-y-3">
              {groups.map((group) => (
                <button
                  key={group.id}
                  onClick={() => selectGroup(group)}
                  className={`w-full text-left p-5 rounded-3xl border transition-all flex items-center justify-between ${
                    selectedGroup?.id === group.id
                      ? 'border-brand-green bg-brand-green/5 text-brand-green shadow-sm'
                      : 'border-slate-100 bg-white text-slate-700 hover:border-slate-200'
                  }`}
                >
                  <div className="space-y-1.5">
                    <h4 className="font-extrabold text-slate-950 leading-tight font-display">{group.name}</h4>
                    <span className="text-[9px] font-bold text-slate-400 block">
                      Led by: {group.head_name} • Savings: ₹{group.monthly_savings_amt}/mo
                    </span>
                  </div>
                  <Users className="h-5 w-5 text-slate-400" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Selected Group Ledger & Summary */}
        <div className="lg:col-span-8 space-y-6">
          {selectedGroup && summary ? (
            <div className="space-y-6">
              
              {/* Summary Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t.savings}</span>
                  <span className="text-base font-black text-slate-900 mt-1 block">₹{summary.totalSavings.toLocaleString('en-IN')}</span>
                </div>
                
                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t.loans}</span>
                  <span className="text-base font-black text-red-600 mt-1 block">₹{summary.totalLoans.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-center">
                  <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block">{t.repay}</span>
                  <span className="text-base font-black text-brand-green mt-1 block">₹{summary.totalRepayments.toLocaleString('en-IN')}</span>
                </div>

                <div className="bg-gradient-to-br from-brand-green to-brand-green-dark rounded-2xl p-4 text-white text-center shadow-md">
                  <span className="text-[9px] font-black text-emerald-200 uppercase tracking-widest block">{t.bal}</span>
                  <span className="text-base font-black mt-1 block">₹{summary.balance.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Ledger Table */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                  <h3 className="text-lg font-extrabold text-slate-900 tracking-tight font-display">
                    {t.ledgerTitle}
                  </h3>
                  <button
                    onClick={() => setShowTxnModal(true)}
                    className="bg-brand-blue hover:bg-brand-blue-dark text-white font-bold py-2 px-4 rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    {t.logTxn}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-semibold text-slate-500">
                    <thead>
                      <tr className="text-[10px] text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">
                        <th className="py-2.5">Date</th>
                        <th className="py-2.5">Member</th>
                        <th className="py-2.5">Type</th>
                        <th className="py-2.5 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {ledger.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-50/50">
                          <td className="py-3 font-medium text-slate-400">
                            {new Date(log.log_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </td>
                          <td className="py-3 text-slate-900 font-bold">{log.user_name}</td>
                          <td className="py-3">
                            <span className={`px-2 py-0.5 rounded text-[8px] uppercase tracking-wider font-black ${
                              log.type === 'savings' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                              log.type === 'loan_repayment' ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                              'bg-red-50 text-red-600 border border-red-100'
                            }`}>
                              {log.type === 'savings' ? 'Monthly Deposit' :
                               log.type === 'loan_repayment' ? 'Repayment' : 'Loan Disbursed'}
                            </span>
                          </td>
                          <td className={`py-3 text-right text-sm font-black ${
                            log.type === 'loan_disbursement' ? 'text-red-500' : 'text-brand-green'
                          }`}>
                            {log.type === 'loan_disbursement' ? '-' : '+'}₹{parseFloat(log.amount).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          ) : (
            <p className="text-sm text-slate-400 font-medium text-center py-12">
              Select or Propose a Self Help Group to view financial registers.
            </p>
          )}
        </div>

      </div>

      {/* PROPOSE GROUP MODAL */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg font-display tracking-tight">Propose New SHG</h3>
              <button onClick={() => setShowProposeModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                Cancel
              </button>
            </div>

            <form onSubmit={handleProposeGroup} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Group Name</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="e.g. Akkamahadevi Mahila Mandali"
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Monthly Savings Target (INR)</label>
                <select
                  value={monthlySavings}
                  onChange={(e) => setMonthlySavings(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium bg-white"
                >
                  <option value="200">₹200 / month</option>
                  <option value="500">₹500 / month</option>
                  <option value="1000">₹1,000 / month</option>
                </select>
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-xs text-brand-green font-semibold leading-relaxed">
                <ShieldCheck className="h-5 w-5 text-emerald-600 flex-shrink-0" />
                <span>As the proposer, you will be seeded as the initial President/Head of this group. All monthly ledger logs will route under your management.</span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer font-display tracking-wider"
              >
                Create & Initialize Group
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TRANSACTION MODAL */}
      {showTxnModal && selectedGroup && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-100 animate-scaleUp">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-lg font-display tracking-tight">Log Ledger Entry</h3>
              <button onClick={() => setShowTxnModal(false)} className="text-slate-400 hover:text-white text-xs font-bold">
                Cancel
              </button>
            </div>

            <form onSubmit={handleTxnSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Member</label>
                <select
                  value={targetMemberId}
                  onChange={(e) => setTargetMemberId(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-medium bg-white"
                >
                  <option value="">Select Member...</option>
                  {groupMembers.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Transaction Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { code: 'savings', label: 'Savings' },
                    { code: 'loan_disbursement', label: 'Disburse Loan' },
                    { code: 'loan_repayment', label: 'Repay Loan' }
                  ].map((t) => (
                    <button
                      key={t.code}
                      type="button"
                      onClick={() => setTxnType(t.code)}
                      className={`py-2 px-3 border rounded-xl text-xs font-bold tracking-wide transition-colors ${
                        txnType === t.code
                          ? 'border-brand-green bg-brand-green/5 text-brand-green'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Amount (INR)</label>
                <div className="relative rounded-xl shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-slate-400 text-sm font-black">₹</span>
                  </div>
                  <input
                    type="number"
                    required
                    value={txnAmount}
                    onChange={(e) => setTxnAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl text-slate-800 focus:outline-none input-glow text-sm font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-4 px-4 bg-brand-green hover:bg-brand-green-dark text-white font-bold rounded-2xl text-sm transition-all shadow-md cursor-pointer font-display tracking-wider"
              >
                Log Entry in Register
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
