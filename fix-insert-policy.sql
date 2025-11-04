-- Script pour corriger la politique d'insertion sur profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Supprimer la politique d'insertion existante si elle existe
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 2. Recréer la politique d'insertion avec la bonne condition
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. Vérifier que la politique est correctement créée
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
AND policyname = 'Users can insert own profile';

-- 4. Vérifier toutes les politiques pour s'assurer qu'elles sont correctes
SELECT 
    policyname,
    cmd,
    CASE 
        WHEN qual IS NULL THEN 'Pas de condition USING'
        ELSE qual::text
    END as using_condition,
    CASE 
        WHEN with_check IS NULL THEN 'Pas de condition WITH CHECK'
        ELSE with_check::text
    END as with_check_condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

