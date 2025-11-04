-- Script pour créer un trigger automatique qui crée le profil lors de l'inscription
-- Cette approche contourne le problème RLS car le trigger s'exécute avec SECURITY DEFINER
-- À exécuter dans le SQL Editor de Supabase

-- 1. Créer une fonction pour gérer la création automatique du profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insérer le profil dans la table profiles
  -- Les métadonnées seront passées depuis l'application
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'individual')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Créer le trigger qui s'exécute après l'insertion dans auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 3. Vérifier que le trigger est créé
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 4. Message de confirmation
SELECT '✅ Trigger créé - Les profils seront créés automatiquement lors de l''inscription' as message;

