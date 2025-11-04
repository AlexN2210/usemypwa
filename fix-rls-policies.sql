-- Script pour corriger les politiques RLS
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer toutes les politiques existantes
DO $$ 
DECLARE
  policy_name text;
BEGIN
  FOR policy_name IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'professional_profiles'
  LOOP
    EXECUTE 'DROP POLICY "' || policy_name || '" ON professional_profiles';
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    -- Ignorer les erreurs
    NULL;
END $$;

-- 2. Recréer les politiques correctement
CREATE POLICY "Enable read access for all users"
  ON professional_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Enable insert for authenticated users only"
  ON professional_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Enable update for users based on user_id"
  ON professional_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Vérifier que les politiques sont créées
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'professional_profiles';

-- 4. Test d'insertion
SELECT 'Politiques RLS configurées avec succès' as status;


