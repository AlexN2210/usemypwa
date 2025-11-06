-- Script pour géocoder les adresses des professionnels et ajouter les coordonnées
-- 
-- IMPORTANT: Ce script nécessite que les professionnels aient des adresses, codes postaux et villes renseignés
-- Les coordonnées doivent être ajoutées manuellement ou via un service de géocodage externe
--
-- Pour géocoder automatiquement, vous pouvez utiliser:
-- 1. L'API Nominatim (avec rate limiting)
-- 2. Google Geocoding API (payant)
-- 3. Un service de géocodage français (adresse.data.gouv.fr)

-- Exemple de mise à jour manuelle des coordonnées pour quelques professionnels
-- (Les coordonnées sont approximatives basées sur les adresses)

-- SEPHORA ALES (Centre Commercial Grand Garde, 30100 ALES)
-- Coordonnées approximatives: 44.1245, 4.0800
UPDATE public.profiles
SET 
  latitude = 44.1245,
  longitude = 4.0800
WHERE id IN (
  SELECT p.id 
  FROM public.profiles p
  JOIN public.professional_profiles pp ON pp.user_id = p.id
  WHERE pp.siret = '92886899100011'
  AND p.city = 'ALES'
  AND p.postal_code = '30100'
)
AND (latitude IS NULL OR longitude IS NULL);

-- CHAMPAGNE F.BONNET (REIMS 12 ALLEE DU VIGNOBLE, 51100 REIMS)
-- Coordonnées approximatives: 49.2583, 4.0317
UPDATE public.profiles
SET 
  latitude = 49.2583,
  longitude = 4.0317
WHERE id IN (
  SELECT p.id 
  FROM public.profiles p
  JOIN public.professional_profiles pp ON pp.user_id = p.id
  WHERE pp.siret = '09555049700036'
  AND p.city = 'REIMS'
  AND p.postal_code = '51100'
)
AND (latitude IS NULL OR longitude IS NULL);

-- BOULANGERIE PARISIENNE (123 RUE DE LA REPUBLIQUE, 75001 PARIS)
-- Coordonnées approximatives: 48.8606, 2.3376
UPDATE public.profiles
SET 
  latitude = 48.8606,
  longitude = 2.3376
WHERE id IN (
  SELECT p.id 
  FROM public.profiles p
  JOIN public.professional_profiles pp ON pp.user_id = p.id
  WHERE p.city = 'PARIS'
  AND p.postal_code = '75001'
  AND p.address LIKE '%REPUBLIQUE%'
)
AND (latitude IS NULL OR longitude IS NULL);

-- RESTAURANT LE GOURMET (45 AVENUE DES CHAMPS ELYSEES, 75008 PARIS)
-- Coordonnées approximatives: 48.8698, 2.3086
UPDATE public.profiles
SET 
  latitude = 48.8698,
  longitude = 2.3086
WHERE id IN (
  SELECT p.id 
  FROM public.profiles p
  JOIN public.professional_profiles pp ON pp.user_id = p.id
  WHERE p.city = 'PARIS'
  AND p.postal_code = '75008'
  AND p.address LIKE '%CHAMPS%'
)
AND (latitude IS NULL OR longitude IS NULL);

-- SALON DE COIFFURE ELEGANCE (78 BOULEVARD SAINT-GERMAIN, 75005 PARIS)
-- Coordonnées approximatives: 48.8534, 2.3488
UPDATE public.profiles
SET 
  latitude = 48.8534,
  longitude = 2.3488
WHERE id IN (
  SELECT p.id 
  FROM public.profiles p
  JOIN public.professional_profiles pp ON pp.user_id = p.id
  WHERE p.city = 'PARIS'
  AND p.postal_code = '75005'
  AND p.address LIKE '%SAINT-GERMAIN%'
)
AND (latitude IS NULL OR longitude IS NULL);

-- Vérifier les résultats
SELECT 
  p.id,
  p.full_name,
  p.address,
  p.postal_code,
  p.city,
  p.latitude,
  p.longitude,
  pp.company_name,
  pp.siret,
  CASE 
    WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN '✅ Coordonnées'
    ELSE '❌ Pas de coordonnées'
  END as statut
FROM public.profiles p
LEFT JOIN public.professional_profiles pp ON pp.user_id = p.id
WHERE p.user_type IN ('professional', 'professionnel')
ORDER BY 
  CASE WHEN p.latitude IS NOT NULL AND p.longitude IS NOT NULL THEN 0 ELSE 1 END,
  p.full_name;

