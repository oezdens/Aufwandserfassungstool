
import React, { useState } from 'react';
import { User, TimeCard, BookingStatus } from '../types';
import { format } from 'date-fns';

interface BookingsViewProps {
  user: User;
  timeCards: TimeCard[];
  onViewCard: (cardId: string) => void;
}

const BookingsView: React.FC<BookingsViewProps> = ({ user, timeCards, onViewCard }) => {
  const [filterKW, setFilterKW] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('');

  const filtered = timeCards.filter(c => {
    return (!filterKW || c.weekLabel.includes(filterKW)) && 
           (!filterStatus || c.status === filterStatus);
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h2 className="text-2xl font-bold">Meine Buchungen</h2>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-6 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 dark:shadow-none">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            <span>Exportieren</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Nach KW filtern..."
            value={filterKW}
            onChange={(e) => setFilterKW(e.target.value)}
            className="w-full bg-white dark:bg-slate-900 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <svg className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
        </div>
        <select 
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary-500 transition-all"
        >
          <option value="">Alle Status</option>
          {Object.values(BookingStatus).map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto no-scrollbar rounded-xl border border-slate-200 dark:border-slate-800">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/80">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">KW</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Datum/Zeitraum</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Anzahl Stunden</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 w-16 text-right">Aktion</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Keine Buchungen gefunden.</td>
              </tr>
            ) : (
              filtered.map((card) => {
                const totalHours = card.entries.reduce((sum, e) => sum + e.hours.reduce((a, b) => a + b, 0), 0);
                return (
                  <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-primary-600 dark:text-primary-400">{card.weekLabel}</td>
                    <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400">
                      {format(new Date(card.startDate), 'dd.MM.yyyy')} - {format(new Date(card.endDate), 'dd.MM.yyyy')}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold">{totalHours.toFixed(1)} h</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        card.status === BookingStatus.SUBMITTED ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                        card.status === BookingStatus.APPROVED ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                        card.status === BookingStatus.REJECTED ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                        'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                      }`}>
                        {card.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                       <button 
                         onClick={() => onViewCard(card.id)}
                         className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-primary-500 hover:bg-primary-50 transition-all group"
                         title="Timecard ansehen"
                       >
                         <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
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
  );
};

export default BookingsView;
