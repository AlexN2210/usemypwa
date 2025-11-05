-- Script pour vérifier et corriger la table matches
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier la structure actuelle de la table matches
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'matches'
ORDER BY ordinal_position;

-- 2. Vérifier si la colonne target_user_id existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'matches'
      AND column_name = 'target_user_id'
    ) THEN 'OK: Colonne target_user_id existe'
    ELSE 'ERREUR: Colonne target_user_id n''existe pas'
  END as status;

-- 3. Si la colonne n'existe pas, la créer
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'matches'
    AND column_name = 'target_user_id'
  ) THEN
    ALTER TABLE public.matches 
    ADD COLUMN target_user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL;
    
    RAISE NOTICE 'Colonne target_user_id ajoutee avec succes';
  ELSE
    RAISE NOTICE 'Colonne target_user_id existe deja';
  END IF;
END $$;

-- 4. Vérifier que la contrainte UNIQUE existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'matches_user_id_target_user_id_key'
  ) THEN
    ALTER TABLE public.matches 
    ADD CONSTRAINT matches_user_id_target_user_id_key 
    UNIQUE(user_id, target_user_id);
    
    RAISE NOTICE 'Contrainte UNIQUE ajoutee avec succes';
  ELSE
    RAISE NOTICE 'Contrainte UNIQUE existe deja';
  END IF;
END $$;

-- 5. Créer l'index si nécessaire
CREATE INDEX IF NOT EXISTS idx_matches_target_user_id 
ON public.matches(target_user_id);

-- 6. Rafraîchir le cache en effectuant une requête SELECT
SELECT * FROM public.matches LIMIT 1;

-- 7. Message final
SELECT 'Table matches verifiee et corrigee' as message;

