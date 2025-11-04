-- Script pour ajouter les colonnes manquantes à la table profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier quelles colonnes existent actuellement
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Ajouter la colonne points si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'points'
    ) THEN
        ALTER TABLE profiles 
        ADD COLUMN points integer DEFAULT 0;
        
        RAISE NOTICE '✅ Colonne points ajoutée';
    ELSE
        RAISE NOTICE '✅ Colonne points existe déjà';
    END IF;
END $$;

-- 3. Ajouter d'autres colonnes manquantes si nécessaire
DO $$ 
BEGIN
    -- Colonne avatar_url
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'avatar_url'
    ) THEN
        ALTER TABLE profiles ADD COLUMN avatar_url text;
        RAISE NOTICE '✅ Colonne avatar_url ajoutée';
    END IF;
    
    -- Colonne bio
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'bio'
    ) THEN
        ALTER TABLE profiles ADD COLUMN bio text;
        RAISE NOTICE '✅ Colonne bio ajoutée';
    END IF;
    
    -- Colonne phone
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'phone'
    ) THEN
        ALTER TABLE profiles ADD COLUMN phone text;
        RAISE NOTICE '✅ Colonne phone ajoutée';
    END IF;
    
    -- Colonne address
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'address'
    ) THEN
        ALTER TABLE profiles ADD COLUMN address text;
        RAISE NOTICE '✅ Colonne address ajoutée';
    END IF;
    
    -- Colonne latitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'latitude'
    ) THEN
        ALTER TABLE profiles ADD COLUMN latitude numeric(10, 8);
        RAISE NOTICE '✅ Colonne latitude ajoutée';
    END IF;
    
    -- Colonne longitude
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'longitude'
    ) THEN
        ALTER TABLE profiles ADD COLUMN longitude numeric(11, 8);
        RAISE NOTICE '✅ Colonne longitude ajoutée';
    END IF;
    
    -- Colonne city
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'city'
    ) THEN
        ALTER TABLE profiles ADD COLUMN city text;
        RAISE NOTICE '✅ Colonne city ajoutée';
    END IF;
    
    -- Colonne postal_code
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'postal_code'
    ) THEN
        ALTER TABLE profiles ADD COLUMN postal_code text;
        RAISE NOTICE '✅ Colonne postal_code ajoutée';
    END IF;
    
    -- Colonne updated_at
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE '✅ Colonne updated_at ajoutée';
    END IF;
END $$;

-- 4. Vérifier la structure finale
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 5. Message de confirmation
SELECT '✅ Toutes les colonnes manquantes ont été ajoutées' as message;

