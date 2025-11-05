-- Script pour creer un profil manquant pour un utilisateur existant
-- Remplacez USER_ID par l'ID de l'utilisateur (b3588f1e-efe1-446f-af84-00963aa3ee74)

DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('professional', 'individual');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Type user_type existe deja';
END $$;

DO $$
DECLARE
  v_user_id uuid := 'b3588f1e-efe1-446f-af84-00963aa3ee74'::uuid;
  v_full_name text;
  v_firstname text;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RAISE NOTICE 'Le profil existe deja pour cet utilisateur';
    RETURN;
  END IF;
  
  SELECT COALESCE(raw_user_meta_data->>'full_name', 'Utilisateur')
  INTO v_full_name
  FROM auth.users
  WHERE id = v_user_id;
  
  v_firstname := COALESCE(
    split_part(v_full_name, ' ', 1),
    'Utilisateur'
  );
  
  INSERT INTO public.profiles (
    id,
    user_type,
    full_name,
    firstname,
    points,
    created_at,
    updated_at,
    civility
  ) VALUES (
    v_user_id,
    'individual'::user_type,
    v_full_name,
    v_firstname,
    0,
    NOW(),
    NOW(),
    'M.'
  );
  
  RAISE NOTICE 'Profil cree avec succes pour: %', v_user_id;
END $$;

SELECT 
  id,
  full_name,
  firstname,
  user_type,
  points,
  created_at
FROM public.profiles
WHERE id = 'b3588f1e-efe1-446f-af84-00963aa3ee74'::uuid;

