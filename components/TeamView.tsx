
import React, { useState, useMemo } from 'react';
import { User, TimeCard, BookingStatus, Category, Performance, PspElement } from '../types';
import { getDayName, getDayLabel } from '../utils/dateUtils';
import { eachDayOfInterval, parseISO } from 'date-fns';

interface TeamViewProps {
  currentUser: User;
  users: User[];
  allTimeCards: TimeCard[];
  onUpdateStatus: (cardId: string, status: BookingStatus, reason?: string) => void;
  onViewCard: (cardId: string) => void;
  categories: Category[];
  performances: Performance[];
  pspElements: PspElement[];
}

const TeamView: React.FC<TeamViewProps> = ({ 
  currentUser, users, allTimeCards, onUpdateStatus, onViewCard,
  categories, performances, pspElements
}) => {
  // Members are those whose managerEmail matches the currentUser's email
  const teamMembers = useMemo(() => users.filter(u => u.managerEmail === currentUser.email), [users, currentUser]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKW, setFilterKW] = useState('');
  const [rejectingCardId, setRejectingCardId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [detailCardId, setDetailCardId] = useState<string | null>(null);

  const filteredCards = useMemo(() => {
    return allTimeCards.filter(c => {
      const member = teamMembers.find(m => m.id === c.userId);
      if (!member) return false;
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesKW = !filterKW || c.weekLabel === filterKW;
      return matchesSearch && matchesKW;
    }).sort((a, b) => b.startDate.localeCompare(a.startDate));
  }, [allTimeCards, teamMembers, searchTerm, filterKW]);

  const uniqueKWs = useMemo(() => Array.from(new Set(allTimeCards.map(c => c.weekLabel))), [allTimeCards]);

  const handleReject = () => {
    if (rejectingCardId && rejectionReason.trim()) {
      onUpdateStatus(rejectingCardId, BookingStatus.REJECTED, rejectionReason);
      setRejectingCardId(null);
      setRejectionReason('');
      setDetailCardId(null);
    }
  };

  const selectedDetailCard = useMemo(() => 
    allTimeCards.find(c => c.id === detailCardId), [allTimeCards, detailCardId]);

  const detailDays = useMemo(() => {
    if (!selectedDetailCard) return [];
    return eachDayOfInterval({
      start: parseISO(selectedDetailCard.startDate),
      end: parseISO(selectedDetailCard.endDate)
    });
  }, [selectedDetailCard]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {/* Rejection Modal */}
      {rejectingCardId && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-md z-[110] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] p-10 shadow-2xl max-w-lg w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-2xl flex items-center justify-center mb-6">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <h3 className="text-2xl font-black mb-2">Grund der Ablehnung</h3>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">Bitte gib an, warum diese Timecard abgelehnt wird. Dein Teammitglied sieht diesen Grund sofort in seiner Erfassungsansicht.</p>
            <textarea 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Beispiel: Die Stunden am Montag scheinen nicht korrekt zu sein..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 text-sm min-h-[140px] focus:ring-2 focus:ring-red-500 transition-all mb-8 shadow-inner"
            />
            <div className="flex gap-3">
              <button onClick={() => setRejectingCardId(null)} className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-200 transition-colors">Abbrechen</button>
              <button 
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
              >
                Ablehnung bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail View Modal */}
      {selectedDetailCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 shadow-3xl max-w-[1250px] w-full max-h-[95vh] overflow-y-auto border border-slate-200 dark:border-slate-800 no-scrollbar animate-in zoom-in-95 duration-300">
            <div className="flex items-center justify-between mb-10">
               <div className="flex items-center space-x-5">
                  <div className="w-16 h-16 rounded-[1.5rem] bg-primary-600 flex items-center justify-center text-white text-2xl font-black shadow-xl shadow-primary-500/30">
                     {users.find(u => u.id === selectedDetailCard.userId)?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-3xl font-black tracking-tight">{users.find(u => u.id === selectedDetailCard.userId)?.name}</h3>
                    <div className="flex items-center space-x-3 mt-1">
                      <span className="text-[10px] font-black bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full uppercase tracking-widest">{selectedDetailCard.weekLabel}</span>
                      <span className="text-xs text-slate-400 font-medium">{detailDays[0] && detailDays[detailDays.length-1] && `${detailDays[0].toLocaleDateString('de-DE')} - ${detailDays[detailDays.length-1].toLocaleDateString('de-DE')}`}</span>
                    </div>
                  </div>
               </div>
               <button onClick={() => setDetailCardId(null)} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl hover:rotate-90 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
               </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden mb-10 shadow-inner">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr className="bg-white/50 dark:bg-slate-800/50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Kategorie & PSP</th>
                    {detailDays.map((day, i) => (
                      <th key={i} className="text-center py-5 border-b border-l border-slate-200 dark:border-slate-800 min-w-[80px]">
                        <div className="text-[10px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-tighter">{getDayName(day)}</div>
                        <div className="text-[11px] font-bold text-slate-400">{getDayLabel(day)}</div>
                      </th>
                    ))}
                    <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-200 dark:border-slate-800">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {selectedDetailCard.entries.map(entry => {
                    const rowTotal = entry.hours.reduce((a, b) => a + b, 0);
                    return (
                      <tr key={entry.id} className="hover:bg-white/30 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-8 py-5">
                          <div className="text-sm font-black text-slate-800 dark:text-slate-100">{categories.find(c => c.id === entry.categoryId)?.name}</div>
                          <div className="text-[10px] font-bold text-slate-500 mt-1 uppercase tracking-tight">{pspElements.find(p => p.id === entry.pspElementId)?.code}</div>
                        </td>
                        {entry.hours.map((h, i) => (
                          <td key={i} className={`text-center py-5 border-l border-slate-200 dark:border-slate-800 font-black text-sm ${h > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-700'}`}>
                            {h > 0 ? h.toFixed(1) : '-'}
                          </td>
                        ))}
                        <td className="px-8 py-5 text-right font-black text-primary-600 dark:text-primary-400">{rowTotal.toFixed(1)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-primary-600/5">
                   <tr className="border-t-2 border-primary-500/20">
                      <td className="px-8 py-6 text-sm font-black uppercase tracking-widest text-primary-600 dark:text-primary-400">Tages-Summen</td>
                      {detailDays.map((_, i) => {
                        const dayTotal = selectedDetailCard.entries.reduce((sum, e) => sum + (e.hours[i] || 0), 0);
                        return <td key={i} className="text-center py-6 border-l border-slate-200 dark:border-slate-800 font-black text-primary-600 dark:text-primary-400">{dayTotal.toFixed(1)}</td>
                      })}
                      <td className="px-8 py-6 text-right text-xl font-black text-primary-600 dark:text-primary-400">
                        {selectedDetailCard.entries.reduce((sum, e) => sum + e.hours.reduce((a, b) => a + b, 0), 0).toFixed(1)} h
                      </td>
                   </tr>
                </tfoot>
              </table>
            </div>

            {selectedDetailCard.status === BookingStatus.SUBMITTED && (
              <div className="flex gap-4">
                <button 
                  onClick={() => setRejectingCardId(selectedDetailCard.id)}
                  className="flex-1 py-5 bg-red-50 text-red-600 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all border border-red-200/50"
                >
                  Ablehnen
                </button>
                <button 
                  onClick={() => { onUpdateStatus(selectedDetailCard.id, BookingStatus.APPROVED); setDetailCardId(null); }}
                  className="flex-1 py-5 bg-primary-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-primary-700 shadow-2xl shadow-primary-500/40 transition-all transform hover:scale-[1.02] active:scale-95"
                >
                  Freigeben
                </button>
              </div>
            )}
            
            {selectedDetailCard.status !== BookingStatus.SUBMITTED && (
              <div className="text-center py-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                 <p className="text-sm font-bold text-slate-500 italic">Diese Timecard wurde bereits final bearbeitet ({selectedDetailCard.status}).</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
           <h2 className="text-4xl font-black tracking-tight mb-2 uppercase">Mein Team</h2>
           <p className="text-sm text-slate-500 font-medium">Zentrale Steuerung für {teamMembers.length} Teammitglieder</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[350px]">
            <input 
              type="text" 
              placeholder="Mitarbeiter suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary-500 transition-all shadow-inner"
            />
            <svg className="w-5 h-5 absolute left-4 top-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>
          <select 
            value={filterKW}
            onChange={(e) => setFilterKW(e.target.value)}
            className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-6 py-4 text-sm font-black focus:ring-2 focus:ring-primary-500 transition-all min-w-[150px] shadow-inner"
          >
            <option value="">Alle KW</option>
            {uniqueKWs.map(kw => <option key={kw} value={kw}>{kw}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[3rem] border border-slate-100 dark:border-slate-700 shadow-xl overflow-hidden">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50">
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mitarbeiter</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Woche</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stunden</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                <th className="px-10 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aktionen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {filteredCards.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center text-slate-400 italic text-sm">Keine entsprechenden Timecards zur Prüfung gefunden.</td>
                </tr>
              ) : (
                filteredCards.map(card => {
                  const member = teamMembers.find(m => m.id === card.userId);
                  const total = card.entries.reduce((s, e) => s + e.hours.reduce((a, b) => a + b, 0), 0);
                  return (
                    <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group">
                      <td className="px-10 py-6">
                        <div className="flex items-center space-x-4">
                           <div className="w-11 h-11 rounded-2xl bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 flex items-center justify-center font-black shadow-sm">
                              {member?.name.charAt(0)}
                           </div>
                           <div className="flex flex-col">
                              <span className="font-bold text-sm tracking-tight">{member?.name}</span>
                              <span className="text-[10px] text-slate-400">{member?.email}</span>
                           </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-sm font-medium text-slate-600 dark:text-slate-400">{card.weekLabel}</td>
                      <td className="px-10 py-6 text-center font-black text-slate-800 dark:text-white text-lg">{total.toFixed(1)} h</td>
                      <td className="px-10 py-6 text-center">
                        <span className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                          card.status === BookingStatus.SUBMITTED ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' :
                          card.status === BookingStatus.APPROVED ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' :
                          card.status === BookingStatus.REJECTED ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {card.status}
                        </span>
                      </td>
                      <td className="px-10 py-6 text-right">
                         <button 
                           onClick={() => setDetailCardId(card.id)}
                           className="px-5 py-3 bg-slate-100 dark:bg-slate-700 rounded-2xl text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-all font-black uppercase text-[10px] tracking-widest flex items-center gap-2 ml-auto group-hover:bg-primary-600 group-hover:text-white"
                         >
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                           Prüfen
                         </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeamView;
