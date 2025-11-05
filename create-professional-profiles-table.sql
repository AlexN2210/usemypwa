-- Script pour creer la table professional_profiles et rafraichir le cache Supabase
-- A executer dans le SQL Editor de Supabase

-- 1. Creer la table professional_profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name text,
  siret text,
  website text,
  category text,
  tags text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Activer RLS
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Supprimer les politiques existantes si necessaire
DROP POLICY IF EXISTS "Anyone can view professional profiles" ON public.professional_profiles;
DROP POLICY IF EXISTS "Professionals can update own profile" ON public.professional_profiles;
DROP POLICY IF EXISTS "Professionals can insert own profile" ON public.professional_profiles;

-- 4. Creer les politiques RLS
CREATE POLICY "Anyone can view professional profiles"
  ON public.professional_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professionals can update own profile"
  ON public.professional_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can insert own profile"
  ON public.professional_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- 5. Creer un index pour la categorie
CREATE INDEX IF NOT EXISTS idx_professional_profiles_category 
  ON public.professional_profiles(category);

-- 6. Rafraichir le cache du schéma Supabase en effectuant une requete
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'professional_profiles'
ORDER BY ordinal_position;

-- 7. Verifier que la table existe
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'professional_profiles'
    ) THEN 'OK: Table professional_profiles existe'
    ELSE 'ERREUR: Table professional_profiles n''existe pas'
  END as status;

-- 8. Afficher le nombre de lignes (pour forcer le rafraichissement du cache)
SELECT COUNT(*) as total_professional_profiles FROM public.professional_profiles;

-- 9. Message final
SELECT 'Table professional_profiles creee et cache rafraichi' as message;

