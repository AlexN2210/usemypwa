-- Script pour vérifier la structure réelle de la table profiles
-- Cela nous aidera à voir toutes les colonnes requises

-- Vérifier toutes les colonnes de la table profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Vérifier les contraintes NOT NULL
SELECT 
    conname as constraint_name,
    a.attname as column_name
FROM pg_constraint con
JOIN pg_attribute a ON a.attrelid = con.conrelid AND a.attnum = ANY(con.conkey)
JOIN pg_class c ON c.oid = con.conrelid
WHERE con.contype = 'n' -- NOT NULL constraint
AND c.relname = 'profiles'
AND a.attnum > 0;

