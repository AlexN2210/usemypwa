-- Script pour corriger la colonne email dans profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la colonne email existe dans profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'email';

-- 2. Vérifier la structure complète de la table profiles
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Corriger la colonne email
-- Option A : Supprimer la colonne email (recommandé car l'email est dans auth.users)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        -- Supprimer la contrainte NOT NULL si elle existe
        ALTER TABLE profiles 
        ALTER COLUMN email DROP NOT NULL;
        
        -- Ou supprimer complètement la colonne (décommentez si vous préférez)
        -- ALTER TABLE profiles DROP COLUMN email;
        
        RAISE NOTICE '✅ Contrainte NOT NULL supprimée de la colonne email';
    ELSE
        RAISE NOTICE '✅ Colonne email n''existe pas (c''est normal)';
    END IF;
END $$;

-- 4. Si vous préférez supprimer complètement la colonne email :
-- (L'email est déjà dans auth.users, pas besoin de le dupliquer dans profiles)
-- ALTER TABLE profiles DROP COLUMN IF EXISTS email;

-- 5. Vérifier les contraintes NOT NULL sur profiles
SELECT 
    column_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
AND is_nullable = 'NO'
ORDER BY column_name;

-- 6. Message de confirmation
SELECT '✅ Correction appliquée - La colonne email ne bloque plus les insertions' as message;

