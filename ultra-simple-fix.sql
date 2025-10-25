-- Script ultra-simple pour créer la table professional_profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer la table professional_profiles
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

-- 2. Activer RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Créer les politiques (ignore les erreurs si elles existent déjà)
DO $$ 
BEGIN
  CREATE POLICY "Anyone can view professional profiles"
    ON professional_profiles FOR SELECT
    TO authenticated
    USING (true);
EXCEPTION
  WHEN duplicate_object THEN
    -- Politique existe déjà, continuer
    NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Professionals can update own profile"
    ON professional_profiles FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN
    -- Politique existe déjà, continuer
    NULL;
END $$;

DO $$ 
BEGIN
  CREATE POLICY "Professionals can insert own profile"
    ON professional_profiles FOR INSERT
    TO authenticated
    WITH CHECK (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN
    -- Politique existe déjà, continuer
    NULL;
END $$;

-- 4. Vérification finale
SELECT 'Table professional_profiles prête à utiliser' as status;
