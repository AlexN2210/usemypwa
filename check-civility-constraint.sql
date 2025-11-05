-- Script pour verifier les contraintes CHECK sur la colonne civility

SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid = 'public.profiles'::regclass
AND conname LIKE '%civility%';

-- Afficher les valeurs possibles pour civility
SELECT DISTINCT civility 
FROM public.profiles 
WHERE civility IS NOT NULL
LIMIT 10;

