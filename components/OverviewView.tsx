
import React from 'react';
import { User, TimeCard, BookingStatus, Category, PspElement } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';

interface OverviewViewProps {
  timeCards: TimeCard[];
  users: User[];
  categories: Category[];
  pspElements: PspElement[];
}

const OverviewView: React.FC<OverviewViewProps> = ({ timeCards, users, categories, pspElements }) => {
  const chartData = users.map(u => {
    const userCards = timeCards.filter(c => c.userId === u.id);
    const total = userCards.reduce((sum, c) => 
      sum + c.entries.reduce((s, e) => s + e.hours.reduce((a, b) => a + b, 0), 0), 0
    );
    return { name: u.name, hours: total };
  }).filter(d => d.hours > 0);

  const totalHours = timeCards.reduce((sum, c) => sum + c.entries.reduce((s, e) => s + e.hours.reduce((a, b) => a + b, 0), 0), 0);
  const activeUsers = new Set(timeCards.map(c => c.userId)).size;
  const submittedCards = timeCards.filter(c => c.status === BookingStatus.SUBMITTED || c.status === BookingStatus.APPROVED).length;

  const stats = [
    { label: 'Gesamtstunden', value: totalHours.toFixed(1), color: 'text-primary-600' },
    { label: 'Aktive Mitarbeiter', value: activeUsers, color: 'text-blue-600' },
    { label: 'Eingereichte Timecards', value: submittedCards, color: 'text-green-600' },
  ];

  const handleExport = () => {
    // CSV Header
    let csv = "Mitarbeiter;KW;Datum Start;Datum Ende;Kategorie;PSP;Mon;Die;Mit;Don;Fre;Sam;Son;Status\n";

    timeCards.forEach(card => {
      const user = users.find(u => u.id === card.userId);
      card.entries.forEach(entry => {
        const cat = categories.find(c => c.id === entry.categoryId)?.name || "";
        const psp = pspElements.find(p => p.id === entry.pspElementId)?.code || "";
        const h = entry.hours;
        
        csv += `${user?.name || "Unbekannt"};${card.weekLabel};${format(new Date(card.startDate), 'dd.MM.yyyy')};${format(new Date(card.endDate), 'dd.MM.yyyy')};${cat};${psp};${h[0]||0};${h[1]||0};${h[2]||0};${h[3]||0};${h[4]||0};${h[5]||0};${h[6]||0};${card.status}\n`;
      });
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `EffortTrack_Export_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
         <h2 className="text-3xl font-black tracking-tight">Übersichtsseite</h2>
         <button 
           onClick={handleExport}
           className="px-8 py-3.5 bg-primary-600 text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-500/30 flex items-center gap-3"
         >
           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
           Excel Export (CSV)
         </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <p className={`text-4xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-[2rem] p-8 border border-slate-100 dark:border-slate-800 shadow-sm">
           <h3 className="text-xl font-black mb-8 tracking-tight">Gesamtübersicht aller Buchungen</h3>
           <div className="overflow-x-auto no-scrollbar">
             <table className="w-full text-left">
               <thead>
                 <tr className="border-b border-slate-100 dark:border-slate-700">
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Mitarbeiter</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">KW</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Stunden</th>
                    <th className="pb-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                 {timeCards.length === 0 ? (
                   <tr>
                     <td colSpan={4} className="py-12 text-center text-slate-400 italic text-sm">Noch keine Buchungen im System vorhanden.</td>
                   </tr>
                 ) : (
                   timeCards.sort((a, b) => b.startDate.localeCompare(a.startDate)).map(card => {
                     const user = users.find(u => u.id === card.userId);
                     const cardTotal = card.entries.reduce((sum, e) => sum + e.hours.reduce((a, b) => a + b, 0), 0);
                     return (
                       <tr key={card.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                         <td className="py-4">
                            <div className="flex items-center space-x-3">
                               <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-xs text-slate-600 dark:text-slate-300">
                                 {user?.name.charAt(0)}
                               </div>
                               <span className="text-sm font-bold">{user?.name}</span>
                            </div>
                         </td>
                         <td className="py-4 text-center text-sm font-medium text-primary-600 dark:text-primary-400">{card.weekLabel}</td>
                         <td className="py-4 text-center text-sm font-black">{cardTotal.toFixed(1)}</td>
                         <td className="py-4 text-right">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                              card.status === BookingStatus.SUBMITTED ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20' :
                              card.status === BookingStatus.APPROVED ? 'bg-green-50 text-green-600 dark:bg-green-900/20' :
                              card.status === BookingStatus.REJECTED ? 'bg-red-50 text-red-600 dark:bg-red-900/20' :
                              'bg-slate-50 text-slate-400 dark:bg-slate-700'
                            }`}>
                              {card.status}
                            </span>
                         </td>
                       </tr>
                     );
                   })
                 )}
               </tbody>
             </table>
           </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-900/50 rounded-[2rem] p-8 border border-slate-200 dark:border-slate-800">
          <h3 className="text-xl font-black mb-8 tracking-tight">Verteilung</h3>
          <div className="h-[250px] w-full mb-8">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.1} />
                  <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'rgba(59, 130, 246, 0.05)'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', background: '#1e293b', color: '#fff' }}
                  />
                  <Bar dataKey="hours" radius={[8, 8, 0, 0]} barSize={32}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#60a5fa'} />
                    ))}
                  </Bar>
                </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-4">
             <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Durchschnittliche Buchung</p>
                <p className="text-xl font-black text-slate-800 dark:text-white">{(totalHours / (timeCards.length || 1)).toFixed(1)} h</p>
             </div>
             <div className="p-4 bg-primary-600 text-white rounded-2xl shadow-xl shadow-primary-500/20">
                <p className="text-[10px] font-black text-primary-200 uppercase tracking-widest mb-1">Compliance Score</p>
                <p className="text-xl font-black">98.2%</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewView;
