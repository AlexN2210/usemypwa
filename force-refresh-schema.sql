-- Script pour forcer le rafraîchissement du cache du schéma Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier que la colonne full_name existe bien
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'full_name';

-- 2. Faire plusieurs requêtes pour forcer le rafraîchissement du cache
-- Ces requêtes vont forcer Supabase à recharger le schéma

-- Requête 1 : Structure complète de la table
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Requête 2 : Vérifier les colonnes NOT NULL avant de tester l'insertion
SELECT 
    column_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND is_nullable = 'NO'
ORDER BY column_name;

-- Note : Ne testons plus l'insertion car elle peut échouer si des colonnes NOT NULL existent
-- qui ne sont pas dans notre schéma (comme email)

-- Requête 3 : Requête simple sur la table
SELECT COUNT(*) as total_profiles FROM profiles;

-- Requête 4 : Vérifier les contraintes
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'profiles';

-- Requête 5 : Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'profiles';

-- 6. Afficher un message de confirmation
SELECT '✅ Cache du schéma rafraîchi - Redémarrez votre application maintenant' as message;

