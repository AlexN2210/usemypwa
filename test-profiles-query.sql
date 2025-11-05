-- Script pour tester la requete de base sur la table profiles
-- Executez ce script pour verifier si le probleme vient de RLS ou de la table elle-meme

-- 1. Tester une requete simple sur profiles
SELECT COUNT(*) as total_profiles FROM public.profiles;

-- 2. Tester une requete avec un ID specifique
SELECT id, full_name, user_type 
FROM public.profiles 
WHERE id = '12b9ddcc-6d76-427c-b4c5-313b00203fd9'::uuid;

-- 3. Verifier les politiques RLS actives
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 4. Verifier si RLS est activee
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public' 
AND tablename = 'profiles';

-- 5. Tester une insertion simple (pour voir si c'est un probleme d'insertion)
-- REMARQUE: Cette requete peut echouer si le profil existe deja, c'est normal
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
  '12b9ddcc-6d76-427c-b4c5-313b00203fd9'::uuid,
  'particulier',
  'Test User',
  'Test',
  'User',
  'Mr',
  '1990-01-01'::date,
  '0000000000',
  'Non renseigne',
  '00000',
  'Non renseigne',
  0,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 6. Verifier que l'insertion a fonctionne
SELECT id, full_name, user_type 
FROM public.profiles 
WHERE id = '12b9ddcc-6d76-427c-b4c5-313b00203fd9'::uuid;

