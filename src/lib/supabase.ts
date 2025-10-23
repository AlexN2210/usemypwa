import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserType = 'professional' | 'individual';
export type MatchAction = 'like' | 'pass' | 'super_like';
export type PostType = 'post' | 'story';

export interface Profile {
  id: string;
  user_type: UserType;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  phone?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  city?: string;
  postal_code?: string;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface ProfessionalProfile {
  id: string;
  user_id: string;
  company_name?: string;
  siret?: string;
  website?: string;
  category?: string;
  tags: string[];
  verified: boolean;
  created_at: string;
}

export interface Match {
  id: string;
  user_id: string;
  target_user_id: string;
  action: MatchAction;
  matched: boolean;
  created_at: string;
}

export interface Post {
  id: string;
  user_id: string;
  content?: string;
  image_url?: string;
  type: PostType;
  views: number;
  expires_at?: string;
  created_at: string;
}

export interface FilterPreferences {
  id: string;
  user_id: string;
  max_distance: number;
  categories: string[];
  updated_at: string;
}
