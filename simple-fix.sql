-- Script simple et sûr pour corriger la table professional_profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la table existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_name = 'professional_profiles'
) as table_exists;

-- 2. Créer la table si elle n'existe pas
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

-- 3. Activer RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- 4. Supprimer les politiques existantes (sans erreur)
DO $$ 
DECLARE
  policy_exists boolean;
BEGIN
  -- Vérifier et supprimer "Anyone can view professional profiles"
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'professional_profiles' 
    AND policyname = 'Anyone can view professional profiles'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    DROP POLICY "Anyone can view professional profiles" ON professional_profiles;
  END IF;
  
  -- Vérifier et supprimer "Professionals can update own profile"
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'professional_profiles' 
    AND policyname = 'Professionals can update own profile'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    DROP POLICY "Professionals can update own profile" ON professional_profiles;
  END IF;
  
  -- Vérifier et supprimer "Professionals can insert own profile"
  SELECT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'professional_profiles' 
    AND policyname = 'Professionals can insert own profile'
  ) INTO policy_exists;
  
  IF policy_exists THEN
    DROP POLICY "Professionals can insert own profile" ON professional_profiles;
  END IF;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorer les erreurs
    NULL;
END $$;

-- 5. Créer les nouvelles politiques
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

-- 6. Vérification finale
SELECT 'Table professional_profiles prête à utiliser' as status;
