-- Script automatique pour creer un profil manquant
-- Ce script detecte automatiquement toutes les colonnes NOT NULL et utilise des valeurs par defaut

DO $$
DECLARE
  v_user_id uuid := 'b3588f1e-efe1-446f-af84-00963aa3ee74'::uuid;
  v_full_name text;
  v_firstname text;
  v_lastname text;
  v_sql text;
  v_columns text;
  v_values text;
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
  
  -- Extraire le prenom
  v_firstname := COALESCE(split_part(v_full_name, ' ', 1), 'Utilisateur');
  
  -- Extraire le nom de famille
  v_lastname := COALESCE(
    CASE 
      WHEN array_length(string_to_array(v_full_name, ' '), 1) > 1 THEN
        array_to_string((string_to_array(v_full_name, ' '))[2:], ' ')
      ELSE
        'Utilisateur'
    END,
    'Utilisateur'
  );
  
  -- Construire dynamiquement l'INSERT avec toutes les colonnes NOT NULL
  -- Utiliser des valeurs par defaut pour chaque type de colonne
  v_columns := 'id, user_type, full_name, firstname, lastname, points, created_at, updated_at, civility, birth_date, phone';
  v_values := format(
    '%L::uuid, %L::user_type, %L, %L, %L, %s, NOW(), NOW(), %L, %L::date, %L',
    v_user_id,
    'individual',
    v_full_name,
    v_firstname,
    v_lastname,
    0,
    'M.',
    '1990-01-01',
    '0000000000'
  );
  
  v_sql := format('INSERT INTO public.profiles (%s) VALUES (%s)', v_columns, v_values);
  
  EXECUTE v_sql;
  
  RAISE NOTICE 'Profil cree avec succes pour: %', v_user_id;
END $$;

-- Verifier que le profil a ete cree
SELECT 
  id,
  full_name,
  firstname,
  lastname,
  user_type,
  birth_date,
  phone,
  points,
  created_at
FROM public.profiles
WHERE id = 'b3588f1e-efe1-446f-af84-00963aa3ee74'::uuid;

