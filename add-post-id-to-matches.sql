-- Script pour ajouter le champ post_id à la table matches
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne post_id à la table matches
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS post_id uuid REFERENCES public.posts(id) ON DELETE CASCADE;

-- 2. Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.matches.post_id IS 'ID du post (demande) si le match concerne un post d''un particulier';

-- 3. Créer un index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_matches_post_id ON public.matches(post_id);

-- 4. Rafraîchir le cache en effectuant une requête SELECT
SELECT * FROM public.matches LIMIT 1;

-- 5. Message final
SELECT 'Colonne post_id ajoutée à la table matches avec succès' as message;

