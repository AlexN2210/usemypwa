-- Script complet pour creer un profil avec TOUTES les colonnes requises
-- Ce script inclut toutes les colonnes NOT NULL detectees jusqu'ici

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
  v_lastname text;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RAISE NOTICE 'Le profil existe deja pour cet utilisateur';
    RETURN;
  END IF;
  
  SELECT COALESCE(raw_user_meta_data->>'full_name', 'Utilisateur')
  INTO v_full_name
  FROM auth.users
  WHERE id = v_user_id;
  
  v_firstname := COALESCE(split_part(v_full_name, ' ', 1), 'Utilisateur');
  v_lastname := COALESCE(
    CASE 
      WHEN array_length(string_to_array(v_full_name, ' '), 1) > 1 THEN
        array_to_string((string_to_array(v_full_name, ' '))[2:], ' ')
      ELSE
        'Utilisateur'
    END,
    'Utilisateur'
  );
  
  -- INSERT avec TOUTES les colonnes NOT NULL detectees
  INSERT INTO public.profiles (
    id,
    user_type,
    full_name,
    firstname,
    lastname,
    points,
    created_at,
    updated_at,
    civility,
    birth_date,
    phone,
    address
  ) VALUES (
    v_user_id,
    'individual'::user_type,
    v_full_name,
    v_firstname,
    v_lastname,
    0,
    NOW(),
    NOW(),
    'M.',
    '1990-01-01'::date,
    '0000000000',
    'Non renseigne'
  );
  
  RAISE NOTICE 'Profil cree avec succes pour: %', v_user_id;
END $$;

SELECT 
  id,
  full_name,
  firstname,
  lastname,
  user_type,
  birth_date,
  phone,
  address,
  points,
  created_at
FROM public.profiles
WHERE id = 'b3588f1e-efe1-446f-af84-00963aa3ee74'::uuid;

