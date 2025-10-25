-- Script de vérification de la base de données
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier que la table professional_profiles existe
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'professional_profiles';

--3. Vérifier que RLS est activé
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'professional_profiles';

--4. Test d'insertion (optionnel - à supprimer après test)
-- INSERT INTO professional_profiles (user_id, company_name, siret, category)
-- VALUES ('00000000-0000-0000-0000-000000000000', 'Test Company', '12345678901234', 'Test Category');

--5. Vérifier les données existantes
SELECT COUNT(*) as total_professional_profiles FROM professional_profiles;
