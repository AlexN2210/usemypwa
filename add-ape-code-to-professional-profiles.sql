-- Script pour ajouter le champ ape_code à la table professional_profiles
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne ape_code si elle n'existe pas
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

-- 2. Créer un index pour permettre le tri/filtrage par code APE
CREATE INDEX IF NOT EXISTS idx_professional_profiles_ape_code 
ON public.professional_profiles(ape_code);

-- 3. Vérifier la structure de la table
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 4. Message final
SELECT 'Colonne ape_code ajoutee et index cree' as message;

