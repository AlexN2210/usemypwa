-- Script pour corriger les politiques RLS sur la table profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier les politiques RLS actuelles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 2. Supprimer toutes les politiques existantes pour les recréer proprement
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- 3. Recréer les politiques RLS correctement

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
-- Important : La condition WITH CHECK doit permettre l'insertion lors de l'inscription
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 4. Vérifier que les politiques sont correctement créées
SELECT 
    policyname,
    cmd,
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

-- 5. Vérifier que RLS est activé
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- 6. Message de confirmation
SELECT '✅ Politiques RLS corrigées - L''inscription devrait maintenant fonctionner' as message;
