import { supabase } from '../lib/supabase';
import { Category, Performance, PspElement, User, TimeCard, TimeEntry, BookingStatus } from '../types';

// ============== CATEGORIES ==============
export const fetchCategories = async (): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data?.map(c => ({ id: c.id, name: c.name })) || [];
};

export const createCategory = async (name: string): Promise<Category> => {
  const { data, error } = await supabase
    .from('categories')
    .insert({ name })
    .select()
    .single();
  
  if (error) throw error;
  return { id: data.id, name: data.name };
};

export const updateCategory = async (id: string, name: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============== PERFORMANCES ==============
export const fetchPerformances = async (): Promise<Performance[]> => {
  const { data, error } = await supabase
    .from('performances')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data?.map(p => ({ 
    id: p.id, 
    categoryId: p.category_id, 
    name: p.name 
  })) || [];
};

export const createPerformance = async (categoryId: string, name: string): Promise<Performance> => {
  const { data, error } = await supabase
    .from('performances')
    .insert({ category_id: categoryId, name })
    .select()
    .single();
  
  if (error) throw error;
  return { id: data.id, categoryId: data.category_id, name: data.name };
};

export const updatePerformance = async (id: string, updates: { categoryId?: string; name?: string }): Promise<void> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.categoryId) dbUpdates.category_id = updates.categoryId;
  if (updates.name) dbUpdates.name = updates.name;

  const { error } = await supabase
    .from('performances')
    .update(dbUpdates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deletePerformance = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('performances')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============== PSP ELEMENTS ==============
export const fetchPspElements = async (): Promise<PspElement[]> => {
  const { data, error } = await supabase
    .from('psp_elements')
    .select('*')
    .order('code');
  
  if (error) throw error;
  return data?.map(p => ({ 
    id: p.id, 
    performanceId: p.performance_id, 
    code: p.code,
    description: p.description 
  })) || [];
};

export const createPspElement = async (performanceId: string, code: string, description: string): Promise<PspElement> => {
  const { data, error } = await supabase
    .from('psp_elements')
    .insert({ performance_id: performanceId, code, description })
    .select()
    .single();
  
  if (error) throw error;
  return { 
    id: data.id, 
    performanceId: data.performance_id, 
    code: data.code,
    description: data.description 
  };
};

export const updatePspElement = async (id: string, updates: { performanceId?: string; code?: string; description?: string }): Promise<void> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.performanceId) dbUpdates.performance_id = updates.performanceId;
  if (updates.code) dbUpdates.code = updates.code;
  if (updates.description) dbUpdates.description = updates.description;

  const { error } = await supabase
    .from('psp_elements')
    .update(dbUpdates)
    .eq('id', id);
  
  if (error) throw error;
};

export const deletePspElement = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('psp_elements')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

// ============== USERS ==============
export const fetchUsers = async (): Promise<User[]> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data?.map(u => ({ 
    id: u.id, 
    name: u.name, 
    email: u.email,
    managerId: u.manager_id,
    managerEmail: u.manager_email
  })) || [];
};

export const updateUser = async (id: string, updates: Partial<User>): Promise<void> => {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.name) dbUpdates.name = updates.name;
  if (updates.managerId !== undefined) dbUpdates.manager_id = updates.managerId || null;
  if (updates.managerEmail !== undefined) dbUpdates.manager_email = updates.managerEmail || null;

  const { error } = await supabase
    .from('users')
    .update(dbUpdates)
    .eq('id', id);
  
  if (error) throw error;
};

// ============== TIME CARDS ==============
export const fetchTimeCards = async (userId?: string): Promise<TimeCard[]> => {
  let query = supabase
    .from('time_cards')
    .select(`
      *,
      time_entries (*)
    `)
    .order('start_date', { ascending: false });
  
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;
  
  if (error) throw error;
  
  return data?.map(tc => ({
    id: tc.id,
    userId: tc.user_id,
    weekLabel: tc.week_label,
    startDate: tc.start_date,
    endDate: tc.end_date,
    status: tc.status as BookingStatus,
    rejectionReason: tc.rejection_reason,
    entries: tc.time_entries?.map((te: { 
      id: string; 
      category_id: string; 
      performance_id: string; 
      psp_element_id: string; 
      hours: number[] 
    }) => ({
      id: te.id,
      categoryId: te.category_id,
      performanceId: te.performance_id,
      pspElementId: te.psp_element_id,
      hours: te.hours
    })) || []
  })) || [];
};

export const fetchAllTimeCards = async (): Promise<TimeCard[]> => {
  const { data, error } = await supabase
    .from('time_cards')
    .select(`
      *,
      time_entries (*)
    `)
    .order('start_date', { ascending: false });
  
  if (error) throw error;
  
  return data?.map(tc => ({
    id: tc.id,
    userId: tc.user_id,
    weekLabel: tc.week_label,
    startDate: tc.start_date,
    endDate: tc.end_date,
    status: tc.status as BookingStatus,
    rejectionReason: tc.rejection_reason,
    entries: tc.time_entries?.map((te: { 
      id: string; 
      category_id: string; 
      performance_id: string; 
      psp_element_id: string; 
      hours: number[] 
    }) => ({
      id: te.id,
      categoryId: te.category_id,
      performanceId: te.performance_id,
      pspElementId: te.psp_element_id,
      hours: te.hours
    })) || []
  })) || [];
};

export const saveTimeCard = async (card: TimeCard): Promise<TimeCard> => {
  console.log('saveTimeCard called with:', card);
  
  // First, upsert the time card
  const { data: timeCardData, error: timeCardError } = await supabase
    .from('time_cards')
    .upsert({
      id: card.id,
      user_id: card.userId,
      week_label: card.weekLabel,
      start_date: card.startDate,
      end_date: card.endDate,
      status: card.status,
      rejection_reason: card.rejectionReason,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (timeCardError) {
    console.error('Error upserting time card:', timeCardError);
    throw timeCardError;
  }
  
  console.log('Time card upserted successfully:', timeCardData);

  // Delete existing entries for this time card
  const { error: deleteError } = await supabase
    .from('time_entries')
    .delete()
    .eq('time_card_id', timeCardData.id);
    
  if (deleteError) {
    console.error('Error deleting old time entries:', deleteError);
    // Continue anyway, entries might not exist
  }

  // Insert new entries
  if (card.entries.length > 0) {
    const entriesToInsert = card.entries.map(entry => ({
      time_card_id: timeCardData.id,
      category_id: entry.categoryId || null,
      performance_id: entry.performanceId || null,
      psp_element_id: entry.pspElementId || null,
      hours: entry.hours
    }));
    
    console.log('Inserting time entries:', entriesToInsert);
    
    const { error: entriesError } = await supabase
      .from('time_entries')
      .insert(entriesToInsert);

    if (entriesError) {
      console.error('Error inserting time entries:', entriesError);
      throw entriesError;
    }
    
    console.log('Time entries inserted successfully');
  }

  // Fetch the complete time card with entries
  const fetchedCards = await fetchTimeCards(card.userId);
  const result = fetchedCards.find(tc => tc.id === timeCardData.id) || card;
  console.log('Returning saved time card:', result);
  return result;
};

export const updateTimeCardStatus = async (
  cardId: string, 
  status: BookingStatus, 
  rejectionReason?: string
): Promise<void> => {
  const { error } = await supabase
    .from('time_cards')
    .update({ 
      status, 
      rejection_reason: rejectionReason || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', cardId);

  if (error) throw error;
};

export const deleteTimeCard = async (cardId: string): Promise<void> => {
  const { error } = await supabase
    .from('time_cards')
    .delete()
    .eq('id', cardId);

  if (error) throw error;
};
