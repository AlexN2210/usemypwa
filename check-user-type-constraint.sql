-- Script pour verifier les contraintes CHECK sur la colonne user_type

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%user_type%';

-- Afficher les valeurs possibles pour user_type
SELECT DISTINCT user_type 
FROM public.profiles 
WHERE user_type IS NOT NULL
LIMIT 10;

