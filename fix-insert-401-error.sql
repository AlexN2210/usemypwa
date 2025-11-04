-- Script pour résoudre l'erreur 401 lors de l'insertion dans profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier les politiques RLS actuelles
SELECT 
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- 2. Supprimer toutes les politiques d'insertion existantes
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- 3. Vérifier que RLS est activé mais pas trop restrictif
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Créer une politique d'insertion plus permissive pour le debugging
-- Cette politique permet à n'importe quel utilisateur authentifié d'insérer
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 5. Alternative : Créer une politique temporairement plus permissive pour tester
-- (À supprimer après les tests)
-- CREATE POLICY "Authenticated users can insert profiles"
--   ON profiles FOR INSERT
--   TO authenticated
--   WITH CHECK (true);

-- 6. Vérifier que la politique est créée
SELECT 
    policyname,
    cmd,
    roles,
    with_check
FROM pg_policies
WHERE tablename = 'profiles'
AND cmd = 'INSERT';

-- 7. Vérifier que l'utilisateur peut insérer (remplacez par un vrai user_id)
-- SELECT auth.uid(); -- Pour voir l'ID de l'utilisateur actuel

-- 8. Message de confirmation
SELECT '✅ Politique d''insertion recréée - Testez l''inscription maintenant' as message;

