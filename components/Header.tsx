
import React, { useState } from 'react';
import { AppView, User, TimeCard, BookingStatus } from '../types';
import { Icons } from '../constants';

interface HeaderProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  user: User;
  onUpdateUser: (updates: Partial<User>) => Promise<void>;
  onSignOut?: () => void;
  rejectedTimeCards?: TimeCard[];
  onViewCard?: (cardId: string) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  activeView, 
  onNavigate, 
  user,
  onUpdateUser,
  onSignOut,
  rejectedTimeCards = [],
  onViewCard
}) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [managerEmail, setManagerEmail] = useState(user.managerEmail || '');

  const navItems = [
    { view: AppView.TRACKING, icon: <Icons.Tracking />, label: 'Erfassung' },
    { view: AppView.BOOKINGS, icon: <Icons.Bookings />, label: 'Buchungen' },
    { view: AppView.TEAM, icon: <Icons.Team />, label: 'Team' },
    { view: AppView.OVERVIEW, icon: <Icons.Overview />, label: 'Übersicht' },
    { view: AppView.MASTER_DATA, icon: <Icons.MasterData />, label: 'Stammdaten' },
  ];

  const handleSaveManager = async () => {
    try {
      await onUpdateUser({ managerEmail });
      alert('Führungskraft erfolgreich gespeichert!');
      setShowUserDropdown(false);
    } catch (error) {
      console.error('Error saving manager:', error);
      alert('Fehler beim Speichern der Führungskraft');
    }
  };

  return (
    <header className="sticky top-0 z-[100] w-full bg-[#0d152b] text-white shadow-lg">
      <div className="max-w-[1600px] mx-auto px-8 flex items-center justify-between h-20">
        {/* Logo / Title */}
        <div className="flex items-center space-x-4 cursor-pointer group" onClick={() => onNavigate(AppView.TRACKING)}>
          <div className="bg-primary-600 p-2 rounded-xl shadow-lg shadow-primary-500/20 group-hover:scale-105 transition-all">
             <Icons.Tracking />
          </div>
          <span className="font-black text-2xl tracking-tighter uppercase">SEROS</span>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => (
            <button
              key={item.view}
              onClick={() => onNavigate(item.view)}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${
                activeView === item.view 
                  ? 'bg-primary-600/30 text-primary-300 border border-primary-500/30 shadow-lg' 
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {/* Notification Bell */}
          <div className="relative">
            <button 
              onMouseEnter={() => setShowNotifications(true)}
              onMouseLeave={() => setShowNotifications(false)}
              className="relative p-2.5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
            >
              <svg className="w-5 h-5 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {rejectedTimeCards.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {rejectedTimeCards.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && rejectedTimeCards.length > 0 && (
              <div 
                onMouseEnter={() => setShowNotifications(true)}
                onMouseLeave={() => setShowNotifications(false)}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-2xl py-4 z-[110] shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4"
              >
                <div className="px-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    Abgelehnte Timecards
                  </p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {rejectedTimeCards.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => {
                        setShowNotifications(false);
                        onViewCard?.(card.id);
                      }}
                      className="w-full px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left flex items-center gap-3"
                    >
                      <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{card.weekLabel}</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {card.rejectionReason || 'Keine Begründung'}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="relative">
            <button 
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-4 pl-4 pr-3 py-2 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
            >
              <div className="text-right hidden sm:block">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">SIS Mitarbeiter</p>
                <p className="text-sm font-bold text-white tracking-tight">{user.name}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white font-black text-sm shadow-lg">
                {user.name.charAt(0)}
              </div>
            </button>

            {showUserDropdown && (
              <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-slate-800 rounded-2xl py-5 px-5 z-[110] shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in slide-in-from-top-4 text-slate-900 dark:text-white">
                <div className="mb-4">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Mein Profil</p>
                  <p className="text-sm font-bold">{user.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">{user.email}</p>
                </div>
                
                <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Führungskraft festlegen</p>
                  <div className="space-y-3">
                    <input 
                      type="email" 
                      placeholder="E-Mail der Führungskraft"
                      value={managerEmail}
                      onChange={(e) => setManagerEmail(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-bold focus:ring-2 focus:ring-primary-500 transition-all"
                    />
                    <button 
                      onClick={handleSaveManager}
                      className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-primary-500/20"
                    >
                      Speichern
                    </button>
                  </div>
                </div>

                {onSignOut && (
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-700">
                    <button 
                      onClick={() => {
                        setShowUserDropdown(false);
                        onSignOut();
                      }}
                      className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Abmelden</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
