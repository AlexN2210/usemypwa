-- Script pour corriger tous les problemes de securite Supabase
-- A executer dans le SQL Editor de Supabase

-- ============================================
-- 1. FIXER RLS SUR spatial_ref_sys (PostGIS)
-- ============================================
DO $$ 
BEGIN
    ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'OK: RLS active sur spatial_ref_sys';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'WARNING: Cannot enable RLS - not owner of table (normal for PostGIS system table)';
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR enabling RLS: %', SQLERRM;
END $$;

-- Creer une politique pour spatial_ref_sys si possible
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys;
    CREATE POLICY "Allow read access to spatial_ref_sys"
      ON public.spatial_ref_sys FOR SELECT
      TO public
      USING (true);
    RAISE NOTICE 'OK: Policy created on spatial_ref_sys';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'WARNING: Cannot create policy - insufficient privileges';
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR creating policy: %', SQLERRM;
END $$;

-- ============================================
-- 2. FIXER search_path SUR LES FONCTIONS
-- ============================================

-- Fixer search_path pour get_posts_with_recent_stories
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'get_posts_with_recent_stories'
    ) THEN
        ALTER FUNCTION public.get_posts_with_recent_stories
        SET search_path = public, pg_temp;
        RAISE NOTICE 'OK: search_path fixed for get_posts_with_recent_stories';
    ELSE
        RAISE NOTICE 'INFO: Function get_posts_with_recent_stories does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Fixer search_path pour handle_like
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'handle_like'
    ) THEN
        ALTER FUNCTION public.handle_like
        SET search_path = public, pg_temp;
        RAISE NOTICE 'OK: search_path fixed for handle_like';
    ELSE
        RAISE NOTICE 'INFO: Function handle_like does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Fixer search_path pour calculate_distance
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'calculate_distance'
    ) THEN
        ALTER FUNCTION public.calculate_distance
        SET search_path = public, pg_temp;
        RAISE NOTICE 'OK: search_path fixed for calculate_distance';
    ELSE
        RAISE NOTICE 'INFO: Function calculate_distance does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Fixer search_path pour find_nearby_professionals
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'find_nearby_professionals'
    ) THEN
        ALTER FUNCTION public.find_nearby_professionals
        SET search_path = public, pg_temp;
        RAISE NOTICE 'OK: search_path fixed for find_nearby_professionals';
    ELSE
        RAISE NOTICE 'INFO: Function find_nearby_professionals does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Fixer search_path pour update_updated_at_column
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'update_updated_at_column'
    ) THEN
        ALTER FUNCTION public.update_updated_at_column
        SET search_path = public, pg_temp;
        RAISE NOTICE 'OK: search_path fixed for update_updated_at_column';
    ELSE
        RAISE NOTICE 'INFO: Function update_updated_at_column does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Fixer search_path pour update_match_status (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'update_match_status'
    ) THEN
        ALTER FUNCTION public.update_match_status
        SET search_path = public, pg_temp;
        RAISE NOTICE 'OK: search_path fixed for update_match_status';
    ELSE
        RAISE NOTICE 'INFO: Function update_match_status does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- Fixer search_path pour update_updated_at (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname = 'public' AND p.proname = 'update_updated_at'
    ) THEN
        ALTER FUNCTION public.update_updated_at
        SET search_path = public, pg_temp;
        RAISE NOTICE 'OK: search_path fixed for update_updated_at';
    ELSE
        RAISE NOTICE 'INFO: Function update_updated_at does not exist';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- ============================================
-- 3. DEPLACER POSTGIS VERS UN AUTRE SCHEMA
-- ============================================
-- Note: Cette operation peut echouer si PostGIS est deja utilise
-- Il faut d'abord creer un nouveau schema pour PostGIS

-- Creer le schema extensions si il n'existe pas
CREATE SCHEMA IF NOT EXISTS extensions;

-- Essayer de deplacer PostGIS (peut echouer si des objets l'utilisent)
DO $$
BEGIN
    -- Verifier si PostGIS est dans public
    IF EXISTS (
        SELECT 1 FROM pg_extension 
        WHERE extname = 'postgis' 
        AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        -- Essayer de deplacer vers le schema extensions
        ALTER EXTENSION postgis SET SCHEMA extensions;
        RAISE NOTICE 'OK: PostGIS moved to extensions schema';
    ELSE
        RAISE NOTICE 'INFO: PostGIS is not in public schema or does not exist';
    END IF;
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'WARNING: Cannot move PostGIS - insufficient privileges';
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR moving PostGIS: %', SQLERRM;
        RAISE NOTICE 'INFO: PostGIS may be in use. You may need to recreate objects that depend on it.';
END $$;

-- ============================================
-- 4. VERIFICATION FINALE
-- ============================================

-- Verifier l'etat de spatial_ref_sys
SELECT 
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'spatial_ref_sys';

-- Verifier les fonctions avec search_path
SELECT 
    n.nspname as schema,
    p.proname as function_name,
    pg_get_functiondef(p.oid) like '%search_path%' as has_search_path
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND p.proname IN (
    'get_posts_with_recent_stories',
    'handle_like',
    'calculate_distance',
    'find_nearby_professionals',
    'update_updated_at_column',
    'update_match_status',
    'update_updated_at'
);

-- Verifier l'emplacement de PostGIS
SELECT 
    extname,
    nspname as schema_name
FROM pg_extension e
JOIN pg_namespace n ON e.extnamespace = n.oid
WHERE extname = 'postgis';

-- Message final
SELECT 'Script de correction de securite termine' as status;

