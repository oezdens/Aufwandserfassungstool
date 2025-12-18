
import React, { useState } from 'react';
import { Category, Performance, PspElement, User } from '../types';
import { 
  createCategory, updateCategory, deleteCategory,
  createPerformance, updatePerformance, deletePerformance,
  createPspElement, updatePspElement, deletePspElement,
  updateUser
} from '../services/database';

interface MasterDataViewProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  performances: Performance[];
  setPerformances: React.Dispatch<React.SetStateAction<Performance[]>>;
  pspElements: PspElement[];
  setPspElements: React.Dispatch<React.SetStateAction<PspElement[]>>;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const MasterDataView: React.FC<MasterDataViewProps> = ({
  categories, setCategories, performances, setPerformances, 
  pspElements, setPspElements, users, setUsers
}) => {
  const [tab, setTab] = useState<'categories' | 'performances' | 'psp' | 'users'>('categories');
  const [loading, setLoading] = useState(false);

  const addItem = async (type: string) => {
    setLoading(true);
    try {
      if (type === 'categories') {
        const newCat = await createCategory('Neue Kategorie');
        setCategories([...categories, newCat]);
      }
      if (type === 'performances' && categories.length > 0) {
        const newPerf = await createPerformance(categories[0].id, 'Neue Leistung');
        setPerformances([...performances, newPerf]);
      }
      if (type === 'psp' && performances.length > 0) {
        const newPsp = await createPspElement(performances[0].id, 'NEW-CODE', 'Neue Beschreibung');
        setPspElements([...pspElements, newPsp]);
      }
    } catch (error) {
      console.error('Error adding item:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateItem = async (type: string, id: string, name: string) => {
    try {
      if (type === 'categories') {
        await updateCategory(id, name);
        setCategories(categories.map(c => c.id === id ? { ...c, name } : c));
      }
      if (type === 'performances') {
        await updatePerformance(id, { name });
        setPerformances(performances.map(p => p.id === id ? { ...p, name } : p));
      }
      if (type === 'psp') {
        await updatePspElement(id, { code: name });
        setPspElements(pspElements.map(p => p.id === id ? { ...p, code: name } : p));
      }
      if (type === 'users') {
        await updateUser(id, { name });
        setUsers(users.map(u => u.id === id ? { ...u, name } : u));
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  const updateUserManager = async (userId: string, managerId: string) => {
    try {
      const manager = users.find(u => u.id === managerId);
      await updateUser(userId, { 
        managerId: managerId === 'none' ? undefined : managerId,
        managerEmail: manager?.email
      });
      setUsers(users.map(u => u.id === userId ? { 
        ...u, 
        managerId: managerId === 'none' ? undefined : managerId,
        managerEmail: manager?.email
      } : u));
    } catch (error) {
      console.error('Error updating manager:', error);
    }
  };

  const deleteItem = async (type: string, id: string) => {
    setLoading(true);
    try {
      if (type === 'categories') {
        await deleteCategory(id);
        setCategories(categories.filter(c => c.id !== id));
      }
      if (type === 'performances') {
        await deletePerformance(id);
        setPerformances(performances.filter(p => p.id !== id));
      }
      if (type === 'psp') {
        await deletePspElement(id);
        setPspElements(pspElements.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePerformanceCategory = async (perfId: string, categoryId: string) => {
    try {
      await updatePerformance(perfId, { categoryId });
      setPerformances(performances.map(p => p.id === perfId ? { ...p, categoryId } : p));
    } catch (error) {
      console.error('Error updating performance category:', error);
    }
  };

  const updatePspPerformance = async (pspId: string, performanceId: string) => {
    try {
      await updatePspElement(pspId, { performanceId });
      setPspElements(pspElements.map(p => p.id === pspId ? { ...p, performanceId } : p));
    } catch (error) {
      console.error('Error updating PSP performance:', error);
    }
  };

  const updatePspDescription = async (pspId: string, description: string) => {
    try {
      await updatePspElement(pspId, { description });
      setPspElements(pspElements.map(p => p.id === pspId ? { ...p, description } : p));
    } catch (error) {
      console.error('Error updating PSP description:', error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Stammdaten</h2>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
           {(['categories', 'performances', 'psp', 'users'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === t 
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-300 shadow-sm' 
                    : 'text-slate-500'
                }`}
              >
                {t === 'categories' ? 'Kategorien' : t === 'performances' ? 'Leistungen' : t === 'psp' ? 'PSP' : 'Benutzer'}
              </button>
           ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between border-b border-slate-200 dark:border-slate-700">
           <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{tab}</p>
           <button 
             onClick={() => addItem(tab)}
             className="px-3 py-1 bg-primary-600 text-white text-xs font-bold rounded-lg hover:bg-primary-700"
           >
             + Neu
           </button>
        </div>
        
        <div className="divide-y divide-slate-100 dark:divide-slate-700">
          {tab === 'categories' && categories.map(c => (
            <div key={c.id} className="p-4 flex items-center justify-between group">
              <input 
                type="text" 
                value={c.name} 
                onChange={(e) => updateItem('categories', c.id, e.target.value)}
                className="bg-transparent border-none p-0 font-medium focus:ring-0 text-sm w-1/2"
              />
              <button onClick={() => deleteItem('categories', c.id)} className="text-red-500 hover:text-red-700 transition-all p-2 rounded-lg hover:bg-red-50">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
          ))}

          {tab === 'users' && users.map(u => (
            <div key={u.id} className="p-4 flex items-center justify-between group gap-4">
              <input 
                type="text" 
                value={u.name} 
                onChange={(e) => updateItem('users', u.id, e.target.value)}
                className="bg-transparent border-none p-0 font-medium focus:ring-0 text-sm w-1/3"
              />
              <div className="flex items-center space-x-2 w-1/3">
                 <span className="text-[10px] font-bold text-slate-400 uppercase">Vorgesetzter:</span>
                 <select 
                   value={u.managerId || 'none'}
                   onChange={(e) => updateUserManager(u.id, e.target.value)}
                   className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs py-1 shadow-inner"
                 >
                   <option value="none">Keiner</option>
                   {users.filter(other => other.id !== u.id).map(other => (
                     <option key={other.id} value={other.id}>{other.name}</option>
                   ))}
                 </select>
              </div>
              <span className="text-xs text-slate-400">{u.email}</span>
            </div>
          ))}

          {tab === 'performances' && (
            <>
              {performances.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between group gap-4">
                  <input 
                    type="text" 
                    value={p.name} 
                    onChange={(e) => updateItem('performances', p.id, e.target.value)}
                    className="bg-transparent border-none p-0 font-medium focus:ring-0 text-sm w-1/3"
                  />
                  <div className="flex items-center space-x-2 w-1/3">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Kategorie:</span>
                    <select 
                      value={p.categoryId}
                      onChange={(e) => updatePerformanceCategory(p.id, e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs py-1 shadow-inner"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => deleteItem('performances', p.id)} className="text-red-500 hover:text-red-700 transition-all p-2 rounded-lg hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              {performances.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm">Keine Leistungen vorhanden.</div>
              )}
            </>
          )}
          {tab === 'psp' && (
            <>
              {pspElements.map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between group gap-4">
                  <input 
                    type="text" 
                    value={p.code} 
                    onChange={(e) => updateItem('psp', p.id, e.target.value)}
                    className="bg-transparent border-none p-0 font-medium focus:ring-0 text-sm w-1/4"
                    placeholder="Code"
                  />
                  <input 
                    type="text" 
                    value={p.description} 
                    onChange={(e) => updatePspDescription(p.id, e.target.value)}
                    className="bg-transparent border-none p-0 font-medium focus:ring-0 text-sm w-1/4 text-slate-500"
                    placeholder="Beschreibung"
                  />
                  <div className="flex items-center space-x-2 w-1/4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Leistung:</span>
                    <select 
                      value={p.performanceId}
                      onChange={(e) => updatePspPerformance(p.id, e.target.value)}
                      className="bg-slate-50 dark:bg-slate-900 border-none rounded-lg text-xs py-1 shadow-inner"
                    >
                      {performances.map(perf => (
                        <option key={perf.id} value={perf.id}>{perf.name}</option>
                      ))}
                    </select>
                  </div>
                  <button onClick={() => deleteItem('psp', p.id)} className="text-red-500 hover:text-red-700 transition-all p-2 rounded-lg hover:bg-red-50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
              {pspElements.length === 0 && (
                <div className="p-12 text-center text-slate-400 italic text-sm">Keine PSP-Elemente vorhanden.</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDataView;
