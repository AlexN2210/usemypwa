-- Script pour creer un profil manquant pour l'utilisateur 4cfc3baf-2c9a-4709-aa3f-f5a92d5ec75d
DO $$
DECLARE
  v_user_id uuid := '4cfc3baf-2c9a-4709-aa3f-f5a92d5ec75d'::uuid;
  v_full_name text;
  v_firstname text;
  v_lastname text;
BEGIN
  -- Verifier si le profil existe deja
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
    RAISE NOTICE 'Le profil existe deja pour cet utilisateur';
    RETURN;
  END IF;
  
  -- Recuperer le nom depuis auth.users
  SELECT COALESCE(raw_user_meta_data->>'full_name', 'Utilisateur')
  INTO v_full_name
  FROM auth.users
  WHERE id = v_user_id;
  
  -- Si aucun nom n'est trouve dans auth.users, utiliser une valeur par defaut
  IF v_full_name IS NULL THEN
    v_full_name := 'Utilisateur';
  END IF;
  
  -- Extraire le prenom du nom complet (premier mot)
  v_firstname := COALESCE(
    split_part(v_full_name, ' ', 1),
    'Utilisateur'
  );
  
  -- Extraire le nom de famille (tout le reste apres le premier mot)
  v_lastname := COALESCE(
    CASE 
      WHEN array_length(string_to_array(v_full_name, ' '), 1) > 1 THEN
        array_to_string((string_to_array(v_full_name, ' '))[2:], ' ')
      ELSE
        'Utilisateur'
    END,
    'Utilisateur'
  );
  
  -- Creer le profil avec TOUTES les colonnes requises (NOT NULL)
  INSERT INTO public.profiles (
    id,
    user_type,
    full_name,
    firstname,
    lastname,
    civility,
    birth_date,
    phone,
    address,
    postal_code,
    city,
    points,
    created_at,
    updated_at
  ) VALUES (
    v_user_id,
    'particulier',
    v_full_name,
    v_firstname,
    v_lastname,
    'Mr',
    '1990-01-01'::date,
    '0000000000',
    'Non renseigne',
    '00000',
    'Non renseigne',
    0,
    NOW(),
    NOW()
  );
  
  RAISE NOTICE 'Profil cree avec succes pour: %', v_user_id;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'ERREUR lors de la creation du profil: %', SQLERRM;
END $$;

-- Verifier que le profil a ete cree
SELECT 
  id,
  full_name,
  firstname,
  lastname,
  user_type,
  civility,
  birth_date,
  phone,
  address,
  postal_code,
  city,
  points,
  created_at
FROM public.profiles
WHERE id = '4cfc3baf-2c9a-4709-aa3f-f5a92d5ec75d'::uuid;

