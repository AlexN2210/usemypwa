-- Script pour vérifier et corriger la colonne ape_code dans professional_profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la colonne ape_code existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'professional_profiles'
      AND column_name = 'ape_code'
    ) THEN 'OK: Colonne ape_code existe'
    ELSE 'ERREUR: Colonne ape_code n''existe pas'
  END as status_ape_code;

-- 2. Si la colonne n'existe pas, la créer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'professional_profiles'
    AND column_name = 'ape_code'
  ) THEN
    ALTER TABLE public.professional_profiles 
    ADD COLUMN ape_code text;
    
    RAISE NOTICE 'Colonne ape_code ajoutee avec succes';
  ELSE
    RAISE NOTICE 'Colonne ape_code existe deja';
  END IF;
END $$;

-- 3. Créer l'index si nécessaire
CREATE INDEX IF NOT EXISTS idx_professional_profiles_ape_code 
ON public.professional_profiles(ape_code);

-- 4. Vérifier la structure complète de la table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 5. Afficher tous les profils avec leur code APE
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

-- 6. Compter les profils avec et sans code APE
SELECT 
  COUNT(*) FILTER (WHERE ape_code IS NOT NULL AND ape_code != '') as avec_ape_code,
  COUNT(*) FILTER (WHERE ape_code IS NULL OR ape_code = '') as sans_ape_code,
  COUNT(*) as total
FROM public.professional_profiles;

-- 7. Rafraîchir le cache en effectuant une requête SELECT
SELECT * FROM public.professional_profiles LIMIT 1;

-- 8. Message final
SELECT 'Verification et correction terminees' as message;

