-- Script de test des politiques RLS
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier que RLS est activé
SELECT 
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename = 'professional_profiles';

-- 2. Vérifier les politiques existantes
SELECT 
  policyname,
  cmd,
  permissive,
  roles,
  qual
FROM pg_policies 
WHERE tablename = 'professional_profiles';

-- 3. Vérifier d'abord s'il y a des utilisateurs dans profiles
SELECT COUNT(*) as total_profiles FROM profiles;
SELECT id, full_name, user_type FROM profiles LIMIT 5;

-- 4. Tester l'insertion d'un enregistrement de test (seulement si des utilisateurs existent)
DO $$ 
DECLARE
  user_count integer;
  test_user_id uuid;
BEGIN
  -- Compter les utilisateurs
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  IF user_count > 0 THEN
    -- Récupérer le premier utilisateur
    SELECT id INTO test_user_id FROM profiles LIMIT 1;
    
    -- Insérer l'enregistrement de test
    INSERT INTO professional_profiles (user_id, company_name, siret, category)
    VALUES (test_user_id, 'Test Company', '12345678901234', 'Test Category');
    
    RAISE NOTICE 'Enregistrement de test inséré avec user_id: %', test_user_id;
  ELSE
    RAISE NOTICE 'Aucun utilisateur trouvé dans la table profiles';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur lors de l''insertion: %', SQLERRM;
END $$;

-- 4. Vérifier que l'enregistrement a été inséré
SELECT * FROM professional_profiles;

-- 5. Tester la lecture
SELECT 
  p.full_name,
  pp.company_name,
  pp.siret,
  pp.category
FROM profiles p
LEFT JOIN professional_profiles pp ON p.id = pp.user_id
WHERE p.user_type = 'professional';
