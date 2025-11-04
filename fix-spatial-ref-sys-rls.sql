-- Script pour activer RLS sur la table spatial_ref_sys (PostGIS)
-- Cette table est créée automatiquement par PostGIS et appartient au système
-- À exécuter dans le SQL Editor de Supabase

-- 1. Vérifier si la table existe et son propriétaire
SELECT 
    schemaname,
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'spatial_ref_sys';

-- 2. Tenter d'activer RLS (peut echouer si vous n'etes pas proprietaire - c'est normal)
DO $$ 
BEGIN
    -- Essayer d'activer RLS
    ALTER TABLE IF EXISTS public.spatial_ref_sys ENABLE ROW LEVEL SECURITY;
    RAISE NOTICE 'OK: RLS active sur spatial_ref_sys';
EXCEPTION
    WHEN insufficient_privilege THEN
        RAISE NOTICE 'WARNING: Cannot enable RLS - not owner of table (normal for PostGIS system table)';
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR enabling RLS: %', SQLERRM;
END $$;

-- 3. Essayer de creer une politique (peut aussi echouer)
DO $$
BEGIN
    -- Supprimer l'ancienne politique si elle existe
    DROP POLICY IF EXISTS "Allow read access to spatial_ref_sys" ON public.spatial_ref_sys;
    
    -- Creer une nouvelle politique
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

-- 4. Verifier l'etat final
SELECT 
    tablename,
    tableowner,
    rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'spatial_ref_sys';

-- 5. Verifier les politiques (si elles existent)
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE tablename = 'spatial_ref_sys';

-- 6. Message final
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'spatial_ref_sys' 
            AND rowsecurity = true
        ) THEN 'OK: RLS est active sur spatial_ref_sys'
        ELSE 'INFO: RLS nest pas active (normal si vous netes pas proprietaire de la table systeme)'
    END as statut;

