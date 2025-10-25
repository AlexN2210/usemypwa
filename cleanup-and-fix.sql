-- Script de nettoyage et correction
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer les politiques existantes (si nécessaire)
DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view professional profiles" ON professional_profiles;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Professionals can update own profile" ON professional_profiles;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Professionals can insert own profile" ON professional_profiles;
EXCEPTION
  WHEN undefined_object THEN null;
END $$;

-- 2. Recréer la table si nécessaire (ATTENTION: supprime les données)
-- DROP TABLE IF EXISTS professional_profiles CASCADE;

-- 3. Créer la table professional_profiles
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

-- 4. Activer RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- 5. Créer les politiques
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
SELECT 'Table professional_profiles créée avec succès' as status;
