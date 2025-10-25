-- Script de test pour vérifier que professional_profiles fonctionne
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier la structure de la table
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 2. Vérifier les politiques RLS
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'professional_profiles';

-- 3. Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'professional_profiles';

-- 4. Compter les enregistrements existants
SELECT COUNT(*) as total_records FROM professional_profiles;

-- 5. Test d'insertion (simulation - ne pas exécuter en production)
-- SELECT 'Test d\'insertion réussi' as test_result;
