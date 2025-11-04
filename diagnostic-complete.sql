-- Script de diagnostic complet pour la base de données
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la table professional_profiles existe
SELECT 
  CASE 
    WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'professional_profiles')
    THEN 'Table professional_profiles EXISTE'
    ELSE 'Table professional_profiles N''EXISTE PAS'
  END as table_status;

-- 2. Vérifier la structure de la table (si elle existe)
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 3. Vérifier les politiques RLS
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'professional_profiles';

-- 4. Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity,
  hasindexes
FROM pg_tables 
WHERE tablename = 'professional_profiles';

-- 5. Vérifier les permissions sur la table
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.table_privileges 
WHERE table_name = 'professional_profiles';

-- 6. Compter les enregistrements
SELECT COUNT(*) as total_records FROM professional_profiles;

-- 7. Vérifier les tables existantes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%profile%'
ORDER BY table_name;


