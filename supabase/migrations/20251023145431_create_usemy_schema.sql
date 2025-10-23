/*
  # Usemy Application Database Schema
  
  ## Overview
  Complete database schema for the Usemy professional networking application.
  This migration creates all necessary tables for user management, matching,
  geolocation, posts, and professional services.
  
  ## New Tables
  
  ### 1. profiles
  Extended user profile information beyond auth.users
  - `id` (uuid, FK to auth.users)
  - `user_type` (enum: 'professional' or 'individual')
  - `full_name` (text)
  - `avatar_url` (text)
  - `bio` (text)
  - `phone` (text)
  - `address` (text)
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `city` (text)
  - `postal_code` (text)
  - `points` (integer) - Cashback points
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### 2. professional_profiles
  Additional information for professional users
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `company_name` (text)
  - `siret` (text)
  - `website` (text)
  - `category` (text) - Health, Home, Beauty, Technology, etc.
  - `tags` (text[]) - Array of service tags
  - `verified` (boolean)
  - `created_at` (timestamptz)
  
  ### 3. matches
  Stores user interactions (likes, super likes, matches)
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `target_user_id` (uuid, FK to profiles)
  - `action` (enum: 'like', 'pass', 'super_like')
  - `matched` (boolean) - True when both users liked each other
  - `created_at` (timestamptz)
  
  ### 4. posts
  User-generated content and stories
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `content` (text)
  - `image_url` (text)
  - `type` (enum: 'post' or 'story')
  - `views` (integer)
  - `expires_at` (timestamptz) - For stories
  - `created_at` (timestamptz)
  
  ### 5. qr_scans
  QR code scan tracking for cashback system
  - `id` (uuid, primary key)
  - `scanner_id` (uuid, FK to profiles) - User who scanned
  - `professional_id` (uuid, FK to profiles) - Professional being scanned
  - `points_earned` (integer)
  - `created_at` (timestamptz)
  
  ### 6. filters_preferences
  User search preferences and filters
  - `id` (uuid, primary key)
  - `user_id` (uuid, FK to profiles)
  - `max_distance` (integer) - in kilometers
  - `categories` (text[])
  - `updated_at` (timestamptz)
  
  ## Security
  - Enable RLS on all tables
  - Users can read/update their own profile
  - Users can read other public profiles
  - Users can manage their own matches, posts, and preferences
  - QR scans are tracked but not user-editable
  
  ## Indexes
  - Geospatial indexes for location-based queries
  - User relationship indexes for matches
  - Category indexes for filtering
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('professional', 'individual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE match_action AS ENUM ('like', 'pass', 'super_like');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE post_type AS ENUM ('post', 'story');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_type user_type NOT NULL DEFAULT 'individual',
  full_name text NOT NULL,
  avatar_url text,
  bio text,
  phone text,
  address text,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  city text,
  postal_code text,
  points integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Professional profiles table
CREATE TABLE IF NOT EXISTS professional_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name text,
  siret text,
  website text,
  category text,
  tags text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Matches table
CREATE TABLE IF NOT EXISTS matches (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  target_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  action match_action NOT NULL,
  matched boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, target_user_id)
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text,
  image_url text,
  type post_type DEFAULT 'post',
  views integer DEFAULT 0,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- QR Scans table
CREATE TABLE IF NOT EXISTS qr_scans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  scanner_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  professional_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  points_earned integer DEFAULT 10,
  created_at timestamptz DEFAULT now()
);

-- Filter preferences table
CREATE TABLE IF NOT EXISTS filters_preferences (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  max_distance integer DEFAULT 25,
  categories text[] DEFAULT '{}',
  updated_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_location ON profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_professional_profiles_category ON professional_profiles(category);
CREATE INDEX IF NOT EXISTS idx_matches_user_id ON matches(user_id);
CREATE INDEX IF NOT EXISTS idx_matches_target_user_id ON matches(target_user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_qr_scans_scanner ON qr_scans(scanner_id);
CREATE INDEX IF NOT EXISTS idx_qr_scans_professional ON qr_scans(professional_id);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE qr_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE filters_preferences ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Professional profiles policies
CREATE POLICY "Anyone can view professional profiles"
  ON professional_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professionals can update own profile"
  ON professional_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can insert own profile"
  ON professional_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Matches policies
CREATE POLICY "Users can view own matches"
  ON matches FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR target_user_id = auth.uid());

CREATE POLICY "Users can create matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Posts policies
CREATE POLICY "Anyone can view posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- QR Scans policies
CREATE POLICY "Users can view own scans"
  ON qr_scans FOR SELECT
  TO authenticated
  USING (scanner_id = auth.uid() OR professional_id = auth.uid());

CREATE POLICY "Users can create QR scans"
  ON qr_scans FOR INSERT
  TO authenticated
  WITH CHECK (scanner_id = auth.uid());

-- Filter preferences policies
CREATE POLICY "Users can view own preferences"
  ON filters_preferences FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can manage own preferences"
  ON filters_preferences FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own preferences"
  ON filters_preferences FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to update matched status
CREATE OR REPLACE FUNCTION update_match_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if target user has also liked back
  IF NEW.action = 'like' THEN
    UPDATE matches
    SET matched = true
    WHERE user_id = NEW.target_user_id
      AND target_user_id = NEW.user_id
      AND action = 'like';
    
    -- Update current match if reciprocal like exists
    IF EXISTS (
      SELECT 1 FROM matches
      WHERE user_id = NEW.target_user_id
        AND target_user_id = NEW.user_id
        AND action = 'like'
    ) THEN
      NEW.matched = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for match updates
DROP TRIGGER IF EXISTS trigger_update_match_status ON matches;
CREATE TRIGGER trigger_update_match_status
  BEFORE INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION update_match_status();

-- Function to update profile timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for profile updates
DROP TRIGGER IF EXISTS trigger_update_profiles_timestamp ON profiles;
CREATE TRIGGER trigger_update_profiles_timestamp
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();