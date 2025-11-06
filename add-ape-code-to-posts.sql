-- Script pour ajouter le champ ape_code à la table posts
-- À exécuter dans le SQL Editor de Supabase

-- 1. Ajouter la colonne ape_code à la table posts
ALTER TABLE public.posts 
ADD COLUMN IF NOT EXISTS ape_code text;

-- 2. Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.posts.ape_code IS 'Code APE (Activité Principale Exercée) choisi par le particulier pour sa demande';

-- 3. Créer un index pour améliorer les performances des requêtes de filtrage
CREATE INDEX IF NOT EXISTS idx_posts_ape_code ON public.posts(ape_code);

-- 4. Rafraîchir le cache en effectuant une requête SELECT
SELECT * FROM public.posts LIMIT 1;

-- 5. Message final
SELECT 'Colonne ape_code ajoutée à la table posts avec succès' as message;

