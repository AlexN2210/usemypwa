-- Script pour vérifier si un profil existe pour un utilisateur
-- Remplacez USER_ID par l'ID de l'utilisateur (d39acb1c-b9a1-40b2-b1b1-6f468919dcb4)

-- 1. Vérifier si le profil existe
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
  created_at,
  updated_at
FROM public.profiles
WHERE id = 'd39acb1c-b9a1-40b2-b1b1-6f468919dcb4'::uuid;

-- 2. Vérifier si l'utilisateur existe dans auth.users
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'full_name' as full_name,
  raw_user_meta_data->>'user_type' as user_type
FROM auth.users
WHERE id = 'd39acb1c-b9a1-40b2-b1b1-6f468919dcb4'::uuid;

-- 3. Vérifier les politiques RLS sur la table profiles
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
WHERE tablename = 'profiles';

-- 4. Message de diagnostic
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.profiles WHERE id = 'd39acb1c-b9a1-40b2-b1b1-6f468919dcb4'::uuid) THEN 
      '✅ Le profil existe dans la base de données'
    ELSE 
      '❌ Le profil N''EXISTE PAS dans la base de données - Il doit être créé'
  END as diagnostic;

