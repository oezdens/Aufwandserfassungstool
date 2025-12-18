import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { User } from '../types';

interface AuthContextType {
  user: SupabaseUser | null;
  userProfile: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const ensureUserInDatabase = async (userId: string, email: string, name: string) => {
    try {
      // Try to insert the user - if they exist, this will fail silently due to ON CONFLICT
      const { error } = await supabase
        .from('users')
        .upsert({
          id: userId,
          email: email,
          name: name
        }, { onConflict: 'id' });
      
      if (error) {
        console.warn('Could not ensure user in database:', error.message);
      }
    } catch (err) {
      console.warn('Error ensuring user in database:', err);
    }
  };

  const fetchUserProfile = async (userId: string, userEmail?: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (data && !error) {
        setUserProfile({
          id: data.id,
          name: data.name,
          email: data.email,
          managerId: data.manager_id,
          managerEmail: data.manager_email
        });
      } else {
        // Fallback: Create a basic profile from auth user data
        // This happens if the users table doesn't exist yet or has no entry
        console.warn('Could not fetch user profile from database, using fallback');
        const fallbackName = userEmail?.split('@')[0] || 'Benutzer';
        
        // Try to create the user in the database
        if (userEmail) {
          await ensureUserInDatabase(userId, userEmail, fallbackName);
        }
        
        setUserProfile({
          id: userId,
          name: fallbackName,
          email: userEmail || ''
        });
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      const fallbackName = userEmail?.split('@')[0] || 'Benutzer';
      
      // Try to create the user in the database
      if (userEmail) {
        await ensureUserInDatabase(userId, userEmail, fallbackName);
      }
      
      setUserProfile({
        id: userId,
        name: fallbackName,
        email: userEmail || ''
      });
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserProfile(session.user.id, session.user.email);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: { name }
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setUserProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return;

    const dbUpdates: Record<string, unknown> = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.managerId !== undefined) dbUpdates.manager_id = updates.managerId;
    if (updates.managerEmail !== undefined) {
      dbUpdates.manager_email = updates.managerEmail;
      
      // Try to find the manager's ID by email
      if (updates.managerEmail) {
        const { data: managerData } = await supabase
          .from('users')
          .select('id')
          .eq('email', updates.managerEmail)
          .single();
        
        if (managerData) {
          dbUpdates.manager_id = managerData.id;
          updates.managerId = managerData.id;
        }
      } else {
        dbUpdates.manager_id = null;
      }
    }

    const { error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    
    if (userProfile) {
      setUserProfile({ ...userProfile, ...updates });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      userProfile, 
      session, 
      loading, 
      signIn, 
      signUp, 
      signOut,
      updateProfile 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
