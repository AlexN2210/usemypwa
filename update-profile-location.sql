-- Script pour mettre à jour les données de localisation d'un profil professionnel
-- Remplacez l'ID utilisateur et les valeurs par celles de votre profil

DO $$
DECLARE
  v_user_id uuid := '7abc3cad-686e-4791-8d23-587cbe5ba62b'::uuid;
  v_address text := 'Adresse récupérée via SIRET';
  v_postal_code text := 'Code postal récupéré via SIRET';
  v_city text := 'Ville récupérée via SIRET';
BEGIN
  -- Vérifier si le profil existe
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RAISE EXCEPTION 'Profil avec ID % non trouve', v_user_id;
  END IF;
  
  -- Mettre à jour les données de localisation
  UPDATE public.profiles
  SET 
    address = v_address,
    postal_code = v_postal_code,
    city = v_city,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  RAISE NOTICE 'Profil mis a jour avec succes:';
  RAISE NOTICE '  - Adresse: %', v_address;
  RAISE NOTICE '  - Code postal: %', v_postal_code;
  RAISE NOTICE '  - Ville: %', v_city;
END $$;

-- Vérifier que les données ont été mises à jour
SELECT 
  id,
  full_name,
  address,
  postal_code,
  city,
  updated_at
FROM public.profiles
WHERE id = '7abc3cad-686e-4791-8d23-587cbe5ba62b'::uuid;

