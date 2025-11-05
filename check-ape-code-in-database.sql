-- Script pour vérifier si le code APE existe dans les profils professionnels
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier la structure de la table professional_profiles
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 2. Vérifier si la colonne ape_code existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'professional_profiles'
      AND column_name = 'ape_code'
    ) THEN 'OK: Colonne ape_code existe'
    ELSE 'ERREUR: Colonne ape_code n''existe pas - Exécutez add-ape-code-to-professional-profiles.sql'
  END as status_ape_code;

-- 3. Afficher tous les profils professionnels avec leur code APE
SELECT 
  id,
  user_id,
  company_name,
  siret,
  category,
  ape_code,
  created_at
FROM public.professional_profiles
ORDER BY created_at DESC
LIMIT 10;

-- 4. Compter les profils avec et sans code APE
SELECT 
  COUNT(*) FILTER (WHERE ape_code IS NOT NULL AND ape_code != '') as avec_ape_code,
  COUNT(*) FILTER (WHERE ape_code IS NULL OR ape_code = '') as sans_ape_code,
  COUNT(*) as total
FROM public.professional_profiles;

-- 5. Message final
SELECT 'Vérification terminée - Vérifiez les résultats ci-dessus' as message;

