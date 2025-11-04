-- Script pour vérifier et corriger la table profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la table profiles existe
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Si la colonne full_name n'existe pas, l'ajouter
DO $$ 
BEGIN
    -- Vérifier si la colonne full_name existe
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'full_name'
    ) THEN
        -- Ajouter la colonne full_name
        ALTER TABLE profiles 
        ADD COLUMN full_name text NOT NULL DEFAULT '';
        
        RAISE NOTICE 'Colonne full_name ajoutée à la table profiles';
    ELSE
        RAISE NOTICE 'Colonne full_name existe déjà';
    END IF;
END $$;

-- 3. Vérifier que la colonne est bien présente
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles' 
AND column_name = 'full_name';

