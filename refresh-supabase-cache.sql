-- Script pour rafraîchir le cache du schéma Supabase
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier que la table existe et afficher sa structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 2. Forcer le rafraîchissement du cache en effectuant une requête SELECT
SELECT * FROM public.professional_profiles LIMIT 1;

-- 3. Vérifier que la colonne 'category' existe (et non 'profession')
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'professional_profiles'
      AND column_name = 'category'
    ) THEN 'OK: Colonne category existe'
    ELSE 'ERREUR: Colonne category n''existe pas'
  END as status_category;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'professional_profiles'
      AND column_name = 'profession'
    ) THEN 'ATTENTION: Colonne profession existe (devrait être category)'
    ELSE 'OK: Colonne profession n''existe pas (correct)'
  END as status_profession;

-- 4. Message final
SELECT 'Cache rafraichi - Vérifiez que la colonne est bien "category" et non "profession"' as message;

