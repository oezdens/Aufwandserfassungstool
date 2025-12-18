
import React, { useState, useEffect } from 'react';
import { AppView, User, Category, Performance, PspElement, TimeCard, BookingStatus } from './types';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { 
  fetchCategories, 
  fetchPerformances, 
  fetchPspElements, 
  fetchUsers,
  fetchTimeCards,
  fetchAllTimeCards,
  saveTimeCard as saveTimeCardToDb,
  updateTimeCardStatus
} from './services/database';
import Header from './components/Header';
import TrackingView from './components/TrackingView';
import BookingsView from './components/BookingsView';
import TeamView from './components/TeamView';
import OverviewView from './components/OverviewView';
import MasterDataView from './components/MasterDataView';
import LoginView from './components/LoginView';

const AppContent: React.FC = () => {
  const { userProfile, loading: authLoading, updateProfile, signOut } = useAuth();
  const [activeView, setActiveView] = useState<AppView>(AppView.TRACKING);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [pspElements, setPspElements] = useState<PspElement[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [timeCards, setTimeCards] = useState<TimeCard[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      if (!userProfile) return;
      
      try {
        setDataLoading(true);
        const [cats, perfs, psps, usrs, cards] = await Promise.all([
          fetchCategories(),
          fetchPerformances(),
          fetchPspElements(),
          fetchUsers(),
          fetchAllTimeCards()
        ]);
        
        setCategories(cats);
        setPerformances(perfs);
        setPspElements(psps);
        setUsers(usrs);
        setTimeCards(cards);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadData();
  }, [userProfile]);

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const handleSaveTimeCard = async (card: TimeCard) => {
    setSaveError(null);
    setSaveSuccess(null);
    try {
      console.log('=== SAVING TIMECARD ===');
      console.log('Card data:', JSON.stringify(card, null, 2));
      console.log('User ID:', card.userId);
      
      const savedCard = await saveTimeCardToDb(card);
      
      console.log('=== TIMECARD SAVED SUCCESSFULLY ===');
      console.log('Saved card:', JSON.stringify(savedCard, null, 2));
      
      setSaveSuccess('TimeCard erfolgreich gespeichert!');
      setTimeout(() => setSaveSuccess(null), 3000);
      
      setTimeCards(prev => {
        const idx = prev.findIndex(c => c.id === savedCard.id);
        if (idx >= 0) {
          const newCards = [...prev];
          newCards[idx] = savedCard;
          return newCards;
        }
        return [...prev, savedCard];
      });
    } catch (error: unknown) {
      console.error('=== ERROR SAVING TIMECARD ===');
      console.error('Full error:', error);
      
      let errorMessage = 'Unbekannter Fehler';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null) {
        errorMessage = JSON.stringify(error);
      }
      
      setSaveError(`Fehler: ${errorMessage}`);
      alert(`Fehler beim Speichern:\n\n${errorMessage}\n\nBitte führe das SQL-Schema in Supabase aus!`);
    }
  };

  const handleUpdateStatus = async (cardId: string, newStatus: BookingStatus, reason?: string) => {
    try {
      await updateTimeCardStatus(cardId, newStatus, reason);
      setTimeCards(prev => prev.map(c => 
        c.id === cardId 
          ? { ...c, status: newStatus, rejectionReason: reason } 
          : c
      ));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleViewCard = (cardId: string) => {
    setSelectedCardId(cardId);
    setActiveView(AppView.TRACKING);
  };

  const handleUpdateUser = async (updates: Partial<User>) => {
    await updateProfile(updates);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 dark:text-slate-400">Laden...</p>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return <LoginView />;
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-primary-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 dark:text-slate-400">Daten werden geladen...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      {/* Success/Error Toast */}
      {saveSuccess && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg animate-in slide-in-from-top">
          ✓ {saveSuccess}
        </div>
      )}
      {saveError && (
        <div className="fixed top-4 right-4 z-50 bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg max-w-md">
          ✗ {saveError}
        </div>
      )}
      
      <Header 
        activeView={activeView} 
        onNavigate={(view) => { setActiveView(view); setSelectedCardId(null); }} 
        user={userProfile}
        onUpdateUser={handleUpdateUser}
        onSignOut={signOut}
        rejectedTimeCards={timeCards.filter(c => c.userId === userProfile.id && c.status === BookingStatus.REJECTED)}
        onViewCard={handleViewCard}
      />
      
      <main className="max-w-[1600px] mx-auto p-6 md:p-8 animate-in fade-in duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 md:p-12 min-h-[700px] shadow-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="relative z-10">
            {activeView === AppView.TRACKING && (
              <TrackingView 
                user={userProfile} 
                categories={categories}
                performances={performances}
                pspElements={pspElements}
                onSave={handleSaveTimeCard}
                existingCards={timeCards.filter(c => c.userId === userProfile.id)}
                initialCardId={selectedCardId}
              />
            )}
            {activeView === AppView.BOOKINGS && (
              <BookingsView 
                user={userProfile} 
                timeCards={timeCards.filter(c => c.userId === userProfile.id)}
                onViewCard={handleViewCard}
              />
            )}
            {activeView === AppView.TEAM && (
              <TeamView 
                currentUser={userProfile}
                users={users}
                allTimeCards={timeCards}
                onUpdateStatus={handleUpdateStatus}
                onViewCard={handleViewCard}
                categories={categories}
                performances={performances}
                pspElements={pspElements}
              />
            )}
            {activeView === AppView.OVERVIEW && (
              <OverviewView 
                timeCards={timeCards}
                users={users}
                categories={categories}
                pspElements={pspElements}
              />
            )}
            {activeView === AppView.MASTER_DATA && (
              <MasterDataView 
                categories={categories}
                setCategories={setCategories}
                performances={performances}
                setPerformances={setPerformances}
                pspElements={pspElements}
                setPspElements={setPspElements}
                users={users}
                setUsers={setUsers}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
