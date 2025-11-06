-- Script pour insérer des professionnels dans la base de données avec des SIRET réels
-- À exécuter dans le SQL Editor de Supabase
-- 
-- Ce script crée des utilisateurs de test avec des SIRET réels d'entreprises françaises
-- Les données sont basées sur des entreprises réelles mais les emails sont fictifs

-- IMPORTANT: Ce script nécessite que les tables suivantes existent :
-- - auth.users (gérée par Supabase)
-- - public.profiles
-- - public.professional_profiles

-- Liste de professionnels avec SIRET réels
-- Note: Les emails sont fictifs pour les tests

DO $$
DECLARE
  -- Variables pour stocker les IDs générés
  user_id_1 uuid;
  user_id_2 uuid;
  user_id_3 uuid;
  user_id_4 uuid;
  user_id_5 uuid;
BEGIN
  -- ============================================
  -- PROFESSIONNEL 1: SEPHORA (Beauté & Esthétique)
  -- ============================================
  user_id_1 := gen_random_uuid();
  
  -- Créer l'utilisateur dans auth.users
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    user_id_1,
    '00000000-0000-0000-0000-000000000000',
    'sephora.test@example.com',
    crypt('Test123456!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'full_name', 'SEPHORA GARDEZ',
      'user_type', 'professionnel'
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
  
  -- Créer le profil
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
    user_id_1,
    'professionnel',
    'SEPHORA GARDEZ',
    'SEPHORA',
    'GARDEZ',
    'Mr',
    '1990-01-01'::date,
    '0000000000',
    'Centre Commercial Grand Garde',
    '30100',
    'ALES',
    0,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  -- Créer le profil professionnel
  INSERT INTO public.professional_profiles (
    user_id,
    company_name,
    siret,
    category,
    ape_code,
    verified,
    created_at
  ) VALUES (
    user_id_1,
    'SEPHORA GARDEZ (SEPHORA BEAUTY)',
    '92886899100011',
    'Beauté & Esthétique',
    '47.75Z', -- Commerce de détail de parfumerie et de produits de beauté
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 1 créé: SEPHORA (ID: %)', user_id_1;
  
  -- ============================================
  -- PROFESSIONNEL 2: CHAMPAGNE F.BONNET (Vins & Spiritueux)
  -- ============================================
  user_id_2 := gen_random_uuid();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    user_id_2,
    '00000000-0000-0000-0000-000000000000',
    'champagne.bonnet@example.com',
    crypt('Test123456!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'full_name', 'CHAMPAGNE F.BONNET P.& F.',
      'user_type', 'professionnel'
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
  
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
    user_id_2,
    'professionnel',
    'CHAMPAGNE F.BONNET P.& F.',
    'CHAMPAGNE',
    'F.BONNET P.& F.',
    'Mr',
    '1990-01-01'::date,
    '0000000000',
    'REIMS 12 ALLEE DU VIGNOBLE',
    '51100',
    'REIMS',
    0,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  INSERT INTO public.professional_profiles (
    user_id,
    company_name,
    siret,
    category,
    ape_code,
    verified,
    created_at
  ) VALUES (
    user_id_2,
    'CHAMPAGNE F.BONNET P.& F.',
    '09555049700036',
    'Vins & Spiritueux',
    '11.02A', -- Fabrication de vins effervescents
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 2 créé: CHAMPAGNE F.BONNET (ID: %)', user_id_2;
  
  -- ============================================
  -- PROFESSIONNEL 3: Boulangerie (Alimentation)
  -- ============================================
  user_id_3 := gen_random_uuid();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    user_id_3,
    '00000000-0000-0000-0000-000000000000',
    'boulangerie.test@example.com',
    crypt('Test123456!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'full_name', 'BOULANGERIE PARISIENNE',
      'user_type', 'professionnel'
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
  
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
    user_id_3,
    'professionnel',
    'BOULANGERIE PARISIENNE',
    'BOULANGERIE',
    'PARISIENNE',
    'Mr',
    '1990-01-01'::date,
    '0000000000',
    '123 RUE DE LA REPUBLIQUE',
    '75001',
    'PARIS',
    0,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  INSERT INTO public.professional_profiles (
    user_id,
    company_name,
    siret,
    category,
    ape_code,
    verified,
    created_at
  ) VALUES (
    user_id_3,
    'BOULANGERIE PARISIENNE',
    '12345678901234', -- SIRET de test (à remplacer par un vrai)
    'Alimentation',
    '10.71Z', -- Fabrication de pain et de pâtisserie
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 3 créé: BOULANGERIE (ID: %)', user_id_3;
  
  -- ============================================
  -- PROFESSIONNEL 4: Restaurant (Restauration)
  -- ============================================
  user_id_4 := gen_random_uuid();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    user_id_4,
    '00000000-0000-0000-0000-000000000000',
    'restaurant.test@example.com',
    crypt('Test123456!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'full_name', 'RESTAURANT LE GOURMET',
      'user_type', 'professionnel'
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
  
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
    user_id_4,
    'professionnel',
    'RESTAURANT LE GOURMET',
    'RESTAURANT',
    'LE GOURMET',
    'Mr',
    '1990-01-01'::date,
    '0000000000',
    '45 AVENUE DES CHAMPS ELYSEES',
    '75008',
    'PARIS',
    0,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  INSERT INTO public.professional_profiles (
    user_id,
    company_name,
    siret,
    category,
    ape_code,
    verified,
    created_at
  ) VALUES (
    user_id_4,
    'RESTAURANT LE GOURMET',
    '98765432109876', -- SIRET de test (à remplacer par un vrai)
    'Restauration',
    '56.10A', -- Restauration traditionnelle
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 4 créé: RESTAURANT (ID: %)', user_id_4;
  
  -- ============================================
  -- PROFESSIONNEL 5: Coiffeur (Beauté & Esthétique)
  -- ============================================
  user_id_5 := gen_random_uuid();
  
  INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    user_id_5,
    '00000000-0000-0000-0000-000000000000',
    'coiffeur.test@example.com',
    crypt('Test123456!', gen_salt('bf')),
    NOW(),
    jsonb_build_object(
      'full_name', 'SALON DE COIFFURE ELEGANCE',
      'user_type', 'professionnel'
    ),
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  ) ON CONFLICT (id) DO NOTHING;
  
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
    user_id_5,
    'professionnel',
    'SALON DE COIFFURE ELEGANCE',
    'SALON',
    'DE COIFFURE ELEGANCE',
    'Mr',
    '1990-01-01'::date,
    '0000000000',
    '78 BOULEVARD SAINT-GERMAIN',
    '75005',
    'PARIS',
    0,
    NOW(),
    NOW()
  ) ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    updated_at = NOW();
  
  INSERT INTO public.professional_profiles (
    user_id,
    company_name,
    siret,
    category,
    ape_code,
    verified,
    created_at
  ) VALUES (
    user_id_5,
    'SALON DE COIFFURE ELEGANCE',
    '11223344556677', -- SIRET de test (à remplacer par un vrai)
    'Beauté & Esthétique',
    '96.02Z', -- Coiffure et soins de beauté
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 5 créé: COIFFEUR (ID: %)', user_id_5;
  
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Tous les professionnels ont ete crees avec succes';
  RAISE NOTICE '========================================';
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Erreur lors de la creation des professionnels: %', SQLERRM;
END $$;

-- Vérifier que les professionnels ont été créés
SELECT 
  p.id,
  p.full_name,
  p.user_type,
  p.address,
  p.city,
  pp.company_name,
  pp.siret,
  pp.category,
  pp.ape_code,
  pp.verified
FROM public.profiles p
LEFT JOIN public.professional_profiles pp ON pp.user_id = p.id
WHERE p.user_type = 'professionnel'
ORDER BY p.created_at DESC
LIMIT 10;

-- Afficher un résumé
SELECT 
  COUNT(*) as total_professionnels,
  COUNT(pp.ape_code) as avec_code_ape,
  COUNT(*) FILTER (WHERE pp.verified = true) as verifies
FROM public.profiles p
LEFT JOIN public.professional_profiles pp ON pp.user_id = p.id
WHERE p.user_type = 'professionnel';

