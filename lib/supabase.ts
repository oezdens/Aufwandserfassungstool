import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://caukwvdizlqtkwbycpaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNhdWt3dmRpemxxdGt3YnljcGF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYwNjc0MTIsImV4cCI6MjA4MTY0MzQxMn0.48KCToGNahZYLf8kKyZmlnHy_ZQdRTsN63XlrArPS0I';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database Types
export interface DbUser {
  id: string;
  email: string;
  name: string;
  manager_id?: string;
  manager_email?: string;
  created_at?: string;
}

export interface DbCategory {
  id: string;
  name: string;
  created_at?: string;
}

export interface DbPerformance {
  id: string;
  category_id: string;
  name: string;
  created_at?: string;
}

export interface DbPspElement {
  id: string;
  performance_id: string;
  code: string;
  description: string;
  created_at?: string;
}

export interface DbTimeEntry {
  id: string;
  time_card_id: string;
  category_id: string;
  performance_id: string;
  psp_element_id: string;
  hours: number[];
  created_at?: string;
}

export interface DbTimeCard {
  id: string;
  user_id: string;
  week_label: string;
  start_date: string;
  end_date: string;
  status: string;
  rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
}
