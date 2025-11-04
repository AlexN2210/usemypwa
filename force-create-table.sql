-- Script de création forcée de la table professional_profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer complètement la table si elle existe (ATTENTION: supprime les données)
DROP TABLE IF EXISTS professional_profiles CASCADE;

-- 2. Créer la table professional_profiles
CREATE TABLE professional_profiles (
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

-- 4. Créer les politiques
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

-- 5. Vérification finale
SELECT 'Table professional_profiles créée avec succès' as status;

-- 6. Test d'insertion (optionnel - à supprimer après test)
-- INSERT INTO professional_profiles (user_id, company_name, siret, category)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Company', '12345678901234', 'Test Category');


