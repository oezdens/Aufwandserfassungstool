
import React, { useState, useEffect, useMemo } from 'react';
import { User, Category, Performance, PspElement, TimeCard, BookingStatus, TimeEntry } from '../types';
import { getSplitWeekData, formatDateRange, getDayName, getDayLabel, isHolidayBW } from '../utils/dateUtils';
import { addWeeks, subWeeks, startOfToday, parseISO } from 'date-fns';

// Helper function to generate UUID
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

interface TrackingViewProps {
  user: User;
  categories: Category[];
  performances: Performance[];
  pspElements: PspElement[];
  onSave: (card: TimeCard) => void;
  existingCards: TimeCard[];
  initialCardId: string | null;
}

const TrackingView: React.FC<TrackingViewProps> = ({ 
  user, categories, performances, pspElements, onSave, existingCards, initialCardId
}) => {
  const [baseDate, setBaseDate] = useState(startOfToday());
  const [activeSplitIndex, setActiveSplitIndex] = useState(0);
  const [showConfirm, setShowConfirm] = useState(false);

  const splits = useMemo(() => getSplitWeekData(baseDate), [baseDate]);
  
  useEffect(() => {
    if (initialCardId) {
      const card = existingCards.find(c => c.id === initialCardId);
      if (card) {
        const date = parseISO(card.startDate);
        setBaseDate(date);
        const cardSplits = getSplitWeekData(date);
        const idx = cardSplits.findIndex(s => s.start.toISOString() === card.startDate);
        if (idx >= 0) setActiveSplitIndex(idx);
      }
    }
  }, [initialCardId, existingCards]);

  const currentSplit = splits[activeSplitIndex] || splits[0];
  const [rows, setRows] = useState<TimeEntry[]>([]);
  const [status, setStatus] = useState<BookingStatus>(BookingStatus.OPEN);
  const [rejectionReason, setRejectionReason] = useState<string | undefined>();

  const isReadOnly = status === BookingStatus.SUBMITTED || status === BookingStatus.APPROVED;

  useEffect(() => {
    // First try to find by initialCardId if provided
    let existing = initialCardId ? existingCards.find(c => c.id === initialCardId) : null;
    
    // If not found by ID, try to find by date range
    if (!existing) {
      existing = existingCards.find(c => {
        const cardStart = new Date(c.startDate).toDateString();
        const cardEnd = new Date(c.endDate).toDateString();
        const splitStart = currentSplit.start.toDateString();
        const splitEnd = currentSplit.end.toDateString();
        return c.userId === user.id && cardStart === splitStart && cardEnd === splitEnd;
      });
    }
    
    console.log('Loading TimeCard:', existing);
    console.log('Entries:', existing?.entries);
    
    if (existing) {
      setRows(existing.entries.length > 0 ? existing.entries : [{
        id: generateUUID(),
        categoryId: '',
        performanceId: '',
        pspElementId: '',
        hours: Array(currentSplit.days.length).fill(0)
      }]);
      setStatus(existing.status);
      setRejectionReason(existing.rejectionReason);
    } else {
      setRows([{
        id: generateUUID(),
        categoryId: '',
        performanceId: '',
        pspElementId: '',
        hours: Array(currentSplit.days.length).fill(0)
      }]);
      setStatus(BookingStatus.OPEN);
      setRejectionReason(undefined);
    }
  }, [currentSplit, existingCards, initialCardId, user.id]);

  const addRow = () => {
    if (isReadOnly) return;
    setRows([...rows, {
      id: generateUUID(),
      categoryId: '',
      performanceId: '',
      pspElementId: '',
      hours: Array(currentSplit.days.length).fill(0)
    }]);
  };

  const updateRow = (id: string, updates: Partial<TimeEntry>) => {
    if (isReadOnly) return;
    setRows(rows.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const updateHours = (rowId: string, dayIdx: number, val: string) => {
    if (isReadOnly) return;
    const num = parseFloat(val) || 0;
    const clamped = Math.min(10, Math.max(0, num));
    setRows(rows.map(r => {
      if (r.id === rowId) {
        const newHours = [...r.hours];
        newHours[dayIdx] = clamped;
        return { ...r, hours: newHours };
      }
      return r;
    }));
  };

  const deleteRow = (id: string) => {
    if (isReadOnly) return;
    if (rows.length > 1) {
      setRows(rows.filter(r => r.id !== id));
    }
  };

  const handleFinalSubmit = () => {
    // Check if there's an existing card for this period (by ID first, then by date)
    let existing = initialCardId ? existingCards.find(c => c.id === initialCardId) : null;
    
    if (!existing) {
      existing = existingCards.find(c => {
        const cardStart = new Date(c.startDate).toDateString();
        const cardEnd = new Date(c.endDate).toDateString();
        const splitStart = currentSplit.start.toDateString();
        const splitEnd = currentSplit.end.toDateString();
        return c.userId === user.id && cardStart === splitStart && cardEnd === splitEnd;
      });
    }
    
    const card: TimeCard = {
      id: existing?.id || generateUUID(),
      userId: user.id,
      weekLabel: currentSplit.label,
      startDate: currentSplit.start.toISOString(),
      endDate: currentSplit.end.toISOString(),
      entries: rows,
      status: BookingStatus.SUBMITTED
    };
    
    console.log('Submitting TimeCard:', card);
    onSave(card);
    setStatus(BookingStatus.SUBMITTED);
    setShowConfirm(false);
  };

  const handleSave = () => {
    // Check if there's an existing card for this period
    const existing = existingCards.find(c => 
      c.userId === user.id &&
      c.startDate === currentSplit.start.toISOString() && 
      c.endDate === currentSplit.end.toISOString()
    );
    
    // Determine the status - keep existing status if rejected (so user can resubmit), otherwise use SAVED
    const newStatus = status === BookingStatus.REJECTED ? BookingStatus.OPEN : 
                      (existing?.status === BookingStatus.OPEN || !existing) ? BookingStatus.SAVED : existing.status;
    
    const card: TimeCard = {
      id: existing?.id || generateUUID(),
      userId: user.id,
      weekLabel: currentSplit.label,
      startDate: currentSplit.start.toISOString(),
      endDate: currentSplit.end.toISOString(),
      entries: rows,
      status: newStatus
    };
    
    console.log('Saving TimeCard:', card);
    onSave(card);
    setStatus(newStatus);
  };

  const handleCopyPreviousWeek = () => {
    if (isReadOnly) return;
    
    // Calculate previous week's date range
    const prevWeekStart = subWeeks(currentSplit.start, 1);
    const prevWeekEnd = subWeeks(currentSplit.end, 1);
    
    // Find the previous week's timecard
    const previousCard = existingCards.find(c => {
      const cardStart = new Date(c.startDate).toDateString();
      const cardEnd = new Date(c.endDate).toDateString();
      return c.userId === user.id && 
             cardStart === prevWeekStart.toDateString() && 
             cardEnd === prevWeekEnd.toDateString();
    });
    
    if (!previousCard || previousCard.entries.length === 0) {
      alert('Keine Daten aus der Vorwoche gefunden.');
      return;
    }
    
    // Copy entries from previous week, adjusting hours for holidays
    const newRows: TimeEntry[] = previousCard.entries.map(entry => ({
      id: generateUUID(),
      categoryId: entry.categoryId,
      performanceId: entry.performanceId,
      pspElementId: entry.pspElementId,
      // Copy hours, but set to 0 for holidays in current week
      hours: entry.hours.map((h, idx) => {
        const day = currentSplit.days[idx];
        if (day && isHolidayBW(day)) {
          return 0; // No hours on holidays
        }
        return h;
      })
    }));
    
    setRows(newRows);
    console.log('Copied from previous week:', newRows);
  };

  const daySummaries = currentSplit.days.map((_, idx) => {
    return rows.reduce((sum, row) => sum + (row.hours[idx] || 0), 0);
  });

  const totalWeekHours = daySummaries.reduce((a, b) => a + b, 0);

  // Auto-save current timecard before navigating
  const autoSaveCurrentCard = () => {
    // Only auto-save if not read-only and there are entries with data
    if (isReadOnly) return;
    
    const hasData = rows.some(r => 
      r.categoryId || r.performanceId || r.pspElementId || r.hours.some(h => h > 0)
    );
    
    if (!hasData) return;
    
    // Find existing card or create new
    let existing = existingCards.find(c => {
      const cardStart = new Date(c.startDate).toDateString();
      const cardEnd = new Date(c.endDate).toDateString();
      const splitStart = currentSplit.start.toDateString();
      const splitEnd = currentSplit.end.toDateString();
      return c.userId === user.id && cardStart === splitStart && cardEnd === splitEnd;
    });
    
    const card: TimeCard = {
      id: existing?.id || generateUUID(),
      userId: user.id,
      weekLabel: currentSplit.label,
      startDate: currentSplit.start.toISOString(),
      endDate: currentSplit.end.toISOString(),
      entries: rows,
      status: existing?.status || BookingStatus.OPEN
    };
    
    console.log('Auto-saving TimeCard:', card);
    onSave(card);
  };

  const navigateNext = () => {
    autoSaveCurrentCard();
    if (activeSplitIndex < splits.length - 1) {
      setActiveSplitIndex(activeSplitIndex + 1);
    } else {
      const nextDate = addWeeks(baseDate, 1);
      setBaseDate(nextDate);
      setActiveSplitIndex(0);
    }
  };

  const navigatePrev = () => {
    autoSaveCurrentCard();
    if (activeSplitIndex > 0) {
      setActiveSplitIndex(activeSplitIndex - 1);
    } else {
      const prevDate = subWeeks(baseDate, 1);
      const prevSplits = getSplitWeekData(prevDate);
      setBaseDate(prevDate);
      setActiveSplitIndex(prevSplits.length - 1);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      {showConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-2xl max-w-md w-full border border-slate-200 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-black mb-2">Timecard einreichen?</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mb-8">
              Möchtest du deine Timecard für {currentSplit.label} wirklich einreichen? Danach sind keine Änderungen mehr möglich.
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
              >
                Nein, Abbrechen
              </button>
              <button 
                onClick={handleFinalSubmit}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
              >
                Ja, Einreichen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Notification */}
      {status === BookingStatus.REJECTED && rejectionReason && (
        <div className="bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/50 p-6 rounded-[2rem] flex items-start gap-4 animate-in slide-in-from-top-4">
          <div className="bg-red-500 text-white p-2 rounded-xl">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
          <div>
             <h4 className="text-sm font-black text-red-700 dark:text-red-400 uppercase tracking-widest mb-1">Ablehnungsgrund</h4>
             <p className="text-red-600 dark:text-red-300 text-sm italic">"{rejectionReason}"</p>
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 p-1.5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-inner">
             <button 
                onClick={navigatePrev}
                className="p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-600 text-slate-500 hover:text-primary-600 transition-all active:scale-90"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
             <div className="text-center px-10 min-w-[160px]">
               <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">{currentSplit.label}</h2>
               <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{formatDateRange(currentSplit.start, currentSplit.end)}</p>
             </div>
             <button 
                onClick={navigateNext}
                className="p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-600 text-slate-500 hover:text-primary-600 transition-all active:scale-90"
             >
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm border ${
            status === BookingStatus.SUBMITTED ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-blue-900/20 dark:border-blue-800' :
            status === BookingStatus.APPROVED ? 'bg-green-50 border-green-200 text-green-600 dark:bg-green-900/20 dark:border-green-800' :
            status === BookingStatus.REJECTED ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800' :
            'bg-slate-50 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
          }`}>
             {status}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
        {currentSplit.days.map((day, idx) => {
          const holiday = isHolidayBW(day);
          return (
            <div key={idx} className={`rounded-3xl p-5 border shadow-sm hover:shadow-lg transition-all ${holiday ? 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
              <div className="flex justify-between items-start">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{getDayName(day)}</p>
                {holiday && <span className="text-[10px] font-bold text-red-500 dark:text-red-400">F</span>}
              </div>
              <p className="text-3xl font-black text-slate-800 dark:text-slate-100">{daySummaries[idx].toFixed(1)}</p>
            </div>
          );
        })}
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-5 shadow-2xl shadow-primary-500/30">
          <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">Total</p>
          <p className="text-3xl font-black text-white">{totalWeekHours.toFixed(1)}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-8">
        <button 
          disabled={isReadOnly} 
          onClick={handleCopyPreviousWeek}
          className="flex items-center space-x-2 px-6 py-3.5 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-2xl text-xs font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-50 transition-all disabled:opacity-30 shadow-sm group"
        >
          <svg className="w-4 h-4 text-primary-500 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
          <span>Vorwoche übernehmen</span>
        </button>
        
        {!isReadOnly ? (
          <button 
            onClick={() => setShowConfirm(true)}
            className="shiny-cta"
          >
            <span>Einreichen</span>
          </button>
        ) : (
          <div className="px-8 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-2xl text-xs font-black uppercase tracking-widest border border-slate-200 dark:border-slate-700 flex items-center space-x-3">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
             <span>Timecard gesperrt</span>
          </div>
        )}
      </div>

      <div className="overflow-x-auto no-scrollbar -mx-6 px-6">
        <table className="w-full min-w-[1200px] border-separate border-spacing-y-4">
          <thead>
            <tr className="text-left">
              <th className="pb-2 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/5">Kategorie</th>
              <th className="pb-2 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/5">Leistung</th>
              <th className="pb-2 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-1/5">PSP-Element</th>
              {currentSplit.days.map((day, idx) => {
                const holiday = isHolidayBW(day);
                return (
                  <th key={idx} className="pb-2 px-2 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <div className={`py-2 rounded-t-2xl border-t border-x border-slate-200 dark:border-slate-800 ${holiday ? 'bg-slate-200 dark:bg-slate-900' : 'bg-slate-50 dark:bg-slate-900/50'}`}>
                      <span className="text-primary-600 dark:text-primary-400">{getDayName(day)}</span><br/>{getDayLabel(day)}
                    </div>
                  </th>
                );
              })}
              {!isReadOnly && <th className="pb-2 px-6 w-12"></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="group bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100 dark:border-slate-700">
                <td className="p-5 pl-8">
                  <select 
                    value={row.categoryId}
                    disabled={isReadOnly}
                    onChange={(e) => updateRow(row.id, { categoryId: e.target.value, performanceId: '', pspElementId: '' })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Kategorie...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td className="p-5">
                  <select 
                    value={row.performanceId}
                    disabled={!row.categoryId || isReadOnly}
                    onChange={(e) => updateRow(row.id, { performanceId: e.target.value, pspElementId: '' })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Leistung...</option>
                    {performances.filter(p => p.categoryId === row.categoryId).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="p-5">
                  <select 
                    value={row.pspElementId}
                    disabled={!row.performanceId || isReadOnly}
                    onChange={(e) => updateRow(row.id, { pspElementId: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-2xl px-5 py-4 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <option value="">PSP-Element...</option>
                    {pspElements.filter(psp => psp.performanceId === row.performanceId).map(psp => (
                      <option key={psp.id} value={psp.id}>{psp.code}</option>
                    ))}
                  </select>
                </td>
                {currentSplit.days.map((day, idx) => {
                  const holiday = isHolidayBW(day);
                  return (
                    <td key={idx} className={`p-5 ${holiday ? 'bg-slate-100 dark:bg-slate-900/40' : ''}`}>
                      <input 
                        type="number" 
                        min="0" max="10" step="0.5"
                        disabled={isReadOnly || holiday}
                        value={holiday ? '' : (row.hours[idx] || '')}
                        onChange={(e) => updateHours(row.id, idx, e.target.value)}
                        placeholder={holiday ? "F" : "0.0"}
                        className={`w-16 mx-auto border-none rounded-2xl py-4 text-center text-xs font-black focus:ring-2 focus:ring-primary-500 transition-all shadow-inner ${holiday ? 'bg-slate-200 dark:bg-slate-950 text-red-500 placeholder-red-500' : 'bg-slate-50 dark:bg-slate-900 disabled:opacity-40'}`}
                      />
                    </td>
                  );
                })}
                {!isReadOnly && (
                  <td className="p-5 pr-8 text-right">
                    <button 
                      onClick={() => deleteRow(row.id)}
                      className="p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-2xl transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isReadOnly && (
        <button 
          onClick={addRow}
          className="flex items-center space-x-3 px-10 py-6 bg-primary-500/5 text-primary-600 dark:text-primary-400 rounded-[2.5rem] text-xs font-black uppercase tracking-widest hover:bg-primary-500/10 transition-all border-2 border-dashed border-primary-500/20 w-full justify-center group"
        >
          <div className="bg-primary-500 text-white p-1 rounded-lg group-hover:rotate-90 transition-transform shadow-lg shadow-primary-500/30">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          </div>
          <span>Leistungszeile hinzufügen</span>
        </button>
      )}
    </div>
  );
};

export default TrackingView;
