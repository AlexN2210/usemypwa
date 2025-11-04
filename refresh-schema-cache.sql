-- Script pour rafraîchir le cache du schéma Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier que la table profiles existe avec la colonne full_name
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'full_name';

-- 2. Si la colonne n'existe pas, la créer
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN full_name text NOT NULL DEFAULT '';
        
        RAISE NOTICE '✅ Colonne full_name créée';
    ELSE
        RAISE NOTICE '✅ Colonne full_name existe déjà';
    END IF;
END $$;

-- 3. Forcer le rafraîchissement du cache en faisant une requête
SELECT 
    id,
    full_name,
    user_type,
    created_at
FROM profiles
LIMIT 1;

-- 4. Vérifier la structure complète de la table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Vérifier les politiques RLS
SELECT 
    policyname,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 6. Corriger la politique d'insertion si nécessaire
DO $$
BEGIN
    -- Vérifier si la politique d'insertion existe et a la bonne condition
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_policies 
        WHERE tablename = 'profiles' 
        AND policyname = 'Users can insert own profile'
        AND with_check = '(auth.uid() = id)'
    ) THEN
        -- Supprimer l'ancienne politique
        DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
        
        -- Recréer avec la bonne condition
        CREATE POLICY "Users can insert own profile"
          ON profiles FOR INSERT
          TO authenticated
          WITH CHECK (auth.uid() = id);
        
        RAISE NOTICE '✅ Politique d''insertion corrigée';
    ELSE
        RAISE NOTICE '✅ Politique d''insertion est correcte';
    END IF;
END $$;

