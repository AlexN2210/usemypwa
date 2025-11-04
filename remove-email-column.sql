-- Script pour supprimer la colonne email de profiles
-- L'email est déjà dans auth.users, pas besoin de le dupliquer
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la colonne email existe
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'email';

-- 2. Supprimer la colonne email (recommandé)
-- L'email est déjà accessible via auth.users
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'email'
    ) THEN
        -- Supprimer la colonne email
        ALTER TABLE profiles DROP COLUMN email;
        RAISE NOTICE '✅ Colonne email supprimée de profiles (l''email est dans auth.users)';
    ELSE
        RAISE NOTICE '✅ Colonne email n''existe pas déjà';
    END IF;
END $$;

-- 3. Vérifier que la colonne a bien été supprimée
SELECT 
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Message de confirmation
SELECT '✅ Correction terminée - L''inscription devrait maintenant fonctionner' as message;

