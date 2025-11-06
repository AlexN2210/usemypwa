-- Script simplifié pour insérer des professionnels dans la base de données
-- 
-- IMPORTANT: Ce script suppose que les utilisateurs ont déjà été créés via l'interface Supabase Auth
-- ou via l'API Supabase. Il ne crée QUE les profils et profils professionnels.
--
-- Pour créer les utilisateurs, vous pouvez :
-- 1. Les créer manuellement via le dashboard Supabase (Authentication > Users > Add user)
-- 2. Utiliser l'API Supabase Admin (voir insert-professionals-api.ts)
--
-- Après avoir créé les utilisateurs, remplacez les UUID ci-dessous par les vrais IDs des utilisateurs

-- ============================================
-- PROFESSIONNEL 1: SEPHORA (Beauté & Esthétique)
-- SIRET: 92886899100011
-- Code APE: 47.75Z (Commerce de détail de parfumerie et de produits de beauté)
-- ============================================
DO $$
DECLARE
  user_id_1 uuid := '00000000-0000-0000-0000-000000000001'::uuid; -- REMPLACER par le vrai UUID
BEGIN
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
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    city = EXCLUDED.city,
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
    '47.75Z',
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 1 créé: SEPHORA (ID: %)', user_id_1;
END $$;

-- ============================================
-- PROFESSIONNEL 2: CHAMPAGNE F.BONNET (Vins & Spiritueux)
-- SIRET: 09555049700036
-- Code APE: 11.02A (Fabrication de vins effervescents)
-- ============================================
DO $$
DECLARE
  user_id_2 uuid := '00000000-0000-0000-0000-000000000002'::uuid; -- REMPLACER par le vrai UUID
BEGIN
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
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    city = EXCLUDED.city,
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
    '11.02A',
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 2 créé: CHAMPAGNE F.BONNET (ID: %)', user_id_2;
END $$;

-- ============================================
-- PROFESSIONNEL 3: Boulangerie (Alimentation)
-- Code APE: 10.71Z (Fabrication de pain et de pâtisserie)
-- ============================================
DO $$
DECLARE
  user_id_3 uuid := '00000000-0000-0000-0000-000000000003'::uuid; -- REMPLACER par le vrai UUID
BEGIN
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
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    city = EXCLUDED.city,
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
    '12345678901234', -- REMPLACER par un vrai SIRET
    'Alimentation',
    '10.71Z',
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 3 créé: BOULANGERIE (ID: %)', user_id_3;
END $$;

-- ============================================
-- PROFESSIONNEL 4: Restaurant (Restauration)
-- Code APE: 56.10A (Restauration traditionnelle)
-- ============================================
DO $$
DECLARE
  user_id_4 uuid := '00000000-0000-0000-0000-000000000004'::uuid; -- REMPLACER par le vrai UUID
BEGIN
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
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    city = EXCLUDED.city,
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
    '98765432109876', -- REMPLACER par un vrai SIRET
    'Restauration',
    '56.10A',
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 4 créé: RESTAURANT (ID: %)', user_id_4;
END $$;

-- ============================================
-- PROFESSIONNEL 5: Coiffeur (Beauté & Esthétique)
-- Code APE: 96.02Z (Coiffure et soins de beauté)
-- ============================================
DO $$
DECLARE
  user_id_5 uuid := '00000000-0000-0000-0000-000000000005'::uuid; -- REMPLACER par le vrai UUID
BEGIN
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
    address = EXCLUDED.address,
    postal_code = EXCLUDED.postal_code,
    city = EXCLUDED.city,
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
    '11223344556677', -- REMPLACER par un vrai SIRET
    'Beauté & Esthétique',
    '96.02Z',
    true,
    NOW()
  ) ON CONFLICT (user_id) DO UPDATE SET
    company_name = EXCLUDED.company_name,
    siret = EXCLUDED.siret,
    category = EXCLUDED.category,
    ape_code = EXCLUDED.ape_code;
  
  RAISE NOTICE 'Professionnel 5 créé: COIFFEUR (ID: %)', user_id_5;
END $$;

-- ============================================
-- VÉRIFICATIONS
-- ============================================

-- Afficher tous les professionnels créés
SELECT 
  p.id,
  p.full_name,
  p.user_type,
  p.address,
  p.postal_code,
  p.city,
  pp.company_name,
  pp.siret,
  pp.category,
  pp.ape_code,
  pp.verified,
  p.created_at
FROM public.profiles p
LEFT JOIN public.professional_profiles pp ON pp.user_id = p.id
WHERE p.user_type = 'professionnel'
ORDER BY p.created_at DESC;

-- Résumé statistique
SELECT 
  COUNT(*) as total_professionnels,
  COUNT(pp.ape_code) as avec_code_ape,
  COUNT(*) FILTER (WHERE pp.verified = true) as verifies,
  COUNT(DISTINCT pp.category) as categories_differentes
FROM public.profiles p
LEFT JOIN public.professional_profiles pp ON pp.user_id = p.id
WHERE p.user_type = 'professionnel';

