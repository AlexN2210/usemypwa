-- Script complet pour vérifier et corriger tous les points critiques
-- À exécuter dans le SQL Editor de Supabase

-- ============================================
-- 1. VÉRIFIER LES COLONNES DE LA TABLE PROFILES
-- ============================================

SELECT '🔍 Vérification des colonnes...' as etape;

-- Vérifier que full_name existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'full_name'
        ) THEN '✅ Colonne full_name existe'
        ELSE '❌ Colonne full_name MANQUANTE'
    END as statut_full_name;

-- Vérifier que user_type existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'user_type'
        ) THEN '✅ Colonne user_type existe'
        ELSE '❌ Colonne user_type MANQUANTE'
    END as statut_user_type;

-- Afficher toutes les colonnes de profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Ajouter les colonnes manquantes si nécessaire
DO $$ 
BEGIN
    -- Ajouter full_name si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
    ) THEN
        ALTER TABLE profiles ADD COLUMN full_name text NOT NULL DEFAULT '';
        RAISE NOTICE '✅ Colonne full_name ajoutée';
    END IF;

    -- Ajouter user_type si elle n'existe pas (mais vérifier le type enum d'abord)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'user_type'
    ) THEN
        -- Créer le type enum s'il n'existe pas
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_type') THEN
            CREATE TYPE user_type AS ENUM ('professional', 'individual');
        END IF;
        
        ALTER TABLE profiles ADD COLUMN user_type user_type NOT NULL DEFAULT 'individual';
        RAISE NOTICE '✅ Colonne user_type ajoutée';
    END IF;
END $$;

-- ============================================
-- 2. VÉRIFIER ET CRÉER LE TRIGGER handle_new_user
-- ============================================

SELECT '🔍 Vérification du trigger handle_new_user...' as etape;

-- Vérifier si le trigger existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
        ) THEN '✅ Trigger on_auth_user_created existe'
        ELSE '❌ Trigger on_auth_user_created MANQUANT'
    END as statut_trigger;

-- Vérifier si la fonction existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc p
            JOIN pg_namespace n ON p.pronamespace = n.oid
            WHERE n.nspname = 'public' AND p.proname = 'handle_new_user'
        ) THEN '✅ Fonction handle_new_user existe'
        ELSE '❌ Fonction handle_new_user MANQUANTE'
    END as statut_fonction;

-- Créer la fonction si elle n'existe pas
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insérer le profil dans la table profiles
  -- Utiliser les métadonnées passées depuis l'application
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'individual')
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Logger l'erreur mais ne pas bloquer la création de l'utilisateur
    RAISE WARNING 'Erreur lors de la création du profil pour user_id %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- Créer le trigger si il n'existe pas
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Trigger handle_new_user créé/vérifié' as confirmation;

-- ============================================
-- 3. VÉRIFIER ET CORRIGER LES POLITIQUES RLS
-- ============================================

SELECT '🔍 Vérification des politiques RLS...' as etape;

-- Vérifier que RLS est activé
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ RLS activé'
        ELSE '❌ RLS désactivé'
    END as statut_rls
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'profiles';

-- Activer RLS si nécessaire
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Afficher les politiques actuelles
SELECT 
    policyname,
    cmd,
    roles,
    CASE 
        WHEN qual IS NULL THEN 'Aucune condition USING'
        ELSE qual::text
    END as using_condition,
    CASE 
        WHEN with_check IS NULL THEN 'Aucune condition WITH CHECK'
        ELSE with_check::text
    END as with_check_condition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd;

-- Supprimer toutes les anciennes politiques pour les recréer proprement
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON profiles;

-- Recréer les politiques RLS correctement

-- Politique SELECT : Tous les utilisateurs authentifiés peuvent voir tous les profils
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

-- Politique UPDATE : Les utilisateurs peuvent mettre à jour leur propre profil
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique INSERT : Les utilisateurs peuvent insérer leur propre profil
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

SELECT '✅ Politiques RLS créées/vérifiées' as confirmation;

-- ============================================
-- 4. RÉSUMÉ FINAL
-- ============================================

SELECT '📋 RÉSUMÉ FINAL' as section;

-- Vérifier les colonnes
SELECT 
    'Colonnes' as categorie,
    COUNT(*) FILTER (WHERE column_name = 'full_name') as full_name_exists,
    COUNT(*) FILTER (WHERE column_name = 'user_type') as user_type_exists
FROM information_schema.columns
WHERE table_name = 'profiles';

-- Vérifier le trigger
SELECT 
    'Trigger' as categorie,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
        ) THEN '✅ Existe'
        ELSE '❌ Manquant'
    END as statut
FROM (SELECT 1) as dummy;

-- Vérifier les politiques RLS
SELECT 
    'Politiques RLS' as categorie,
    COUNT(*) FILTER (WHERE cmd = 'SELECT') as select_policies,
    COUNT(*) FILTER (WHERE cmd = 'UPDATE') as update_policies,
    COUNT(*) FILTER (WHERE cmd = 'INSERT') as insert_policies
FROM pg_policies
WHERE tablename = 'profiles';

-- Message de confirmation final
SELECT '✅ Vérification terminée - Tous les éléments ont été vérifiés et corrigés si nécessaire' as message;

