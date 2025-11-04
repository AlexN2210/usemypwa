-- Script pour vérifier et corriger l'authentification et les politiques RLS
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier que RLS est activé sur profiles
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- 2. Vérifier toutes les politiques RLS sur profiles
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 3. Supprimer toutes les politiques existantes pour les recréer proprement
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- 4. Recréer les politiques RLS correctement

-- Politique pour SELECT : Tous les utilisateurs authentifiés peuvent voir tous les profils
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Politique pour UPDATE : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique pour INSERT : Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. Vérifier que les politiques sont correctement créées
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    CASE 
        WHEN qual IS NULL THEN 'Aucune condition USING'
        ELSE qual::text
    END as using_condition,
    CASE 
        WHEN with_check IS NULL THEN 'Aucune condition WITH CHECK'
        ELSE with_check::text
    END as with_check_condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 6. Vérifier que RLS est bien activé
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Tester avec un utilisateur de test (si vous en avez un)
-- Remplacez 'user-id-here' par un vrai user_id de votre table auth.users
-- SELECT auth.uid(); -- Pour vérifier l'utilisateur actuel
-- SELECT * FROM profiles WHERE id = auth.uid();

-- 8. Message de confirmation
SELECT '✅ Politiques RLS corrigées et vérifiées' as message;

