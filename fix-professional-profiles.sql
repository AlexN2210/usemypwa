-- Script de correction pour la table professional_profiles
-- À exécuter dans le SQL Editor de Supabase

-- Créer la table professional_profiles si elle n'existe pas
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

-- Activer RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques de sécurité
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

-- Vérifier que la table a été créée
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'professional_profiles';
