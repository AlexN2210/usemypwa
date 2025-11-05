-- Script pour obtenir toutes les colonnes NOT NULL de la table profiles
-- Cela nous aidera a voir toutes les colonnes requises

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
AND is_nullable = 'NO'
ORDER BY ordinal_position;

