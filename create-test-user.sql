-- Script pour créer un utilisateur de test
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier s'il y a des utilisateurs
SELECT COUNT(*) as total_profiles FROM profiles;

-- 2. Si aucun utilisateur, créer un utilisateur de test
DO $$ 
DECLARE
  user_count integer;
  test_user_id uuid;
BEGIN
  -- Compter les utilisateurs
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  IF user_count = 0 THEN
    -- Créer un utilisateur de test
    test_user_id := gen_random_uuid();
    
    INSERT INTO profiles (id, full_name, user_type, points)
    VALUES (test_user_id, 'Test User', 'professional', 0);
    
    RAISE NOTICE 'Utilisateur de test créé avec ID: %', test_user_id;
    
    -- Créer un profil professionnel pour cet utilisateur
    INSERT INTO professional_profiles (user_id, company_name, siret, category)
    VALUES (test_user_id, 'Test Company', '12345678901234', 'Test Category');
    
    RAISE NOTICE 'Profil professionnel de test créé';
  ELSE
    RAISE NOTICE 'Utilisateurs existants trouvés: %', user_count;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Erreur: %', SQLERRM;
END $$;

-- 3. Vérifier les utilisateurs créés
SELECT 
  p.id,
  p.full_name,
  p.user_type,
  pp.company_name,
  pp.siret,
  pp.category
FROM profiles p
LEFT JOIN professional_profiles pp ON p.id = pp.user_id
ORDER BY p.created_at DESC;


