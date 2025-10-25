# Guide de déploiement de la fonction Edge Function SIRET

## 🚀 Déploiement de la fonction Supabase Edge Function

### 1. Connexion à Supabase

```bash
# Se connecter à Supabase
npx supabase login

# Ou utiliser un token d'accès
export SUPABASE_ACCESS_TOKEN=your_access_token_here
```

### 2. Déploiement de la fonction

```bash
# Déployer la fonction SIRET
npx supabase functions deploy siret

# Ou déployer sans vérification JWT (pour les tests)
npx supabase functions deploy siret --no-verify-jwt
```

### 3. Configuration de l'URL

Une fois déployée, mettez à jour l'URL dans `src/lib/siretService.ts` :

```typescript
private static readonly SUPABASE_FUNCTION_URL = 'https://YOUR-PROJECT-REF.supabase.co/functions/v1/siret';
```

Remplacez `YOUR-PROJECT-REF` par votre référence de projet Supabase.

### 4. Test de la fonction

```bash
# Tester la fonction localement
npx supabase functions serve

# Tester avec curl
curl "https://YOUR-PROJECT-REF.supabase.co/functions/v1/siret?siret=77567146400013"
```

## ✅ Avantages de la fonction Edge Function

- **Performance** : Plus rapide que le proxy CORS
- **Fiabilité** : Service dédié et stable
- **Sécurité** : Contrôle total sur les requêtes
- **Logs** : Monitoring des appels API
- **Rate limiting** : Gestion des limites de requêtes

## 🔧 Fonctionnalités de la fonction

- ✅ **CORS géré** : Headers CORS corrects
- ✅ **Validation SIRET** : Format et longueur
- ✅ **API gouvernementale** : Données officielles
- ✅ **Gestion d'erreurs** : Messages clairs
- ✅ **Logs détaillés** : Suivi des requêtes

## 📊 Structure de la réponse

```json
{
  "valid": true,
  "company": {
    "name": "NOM DE L'ENTREPRISE",
    "address": "ADRESSE",
    "city": "VILLE",
    "postalCode": "CODE POSTAL",
    "activity": "ACTIVITÉ"
  }
}
```

## 🚨 En cas d'erreur

Si la fonction Edge Function n'est pas disponible, le service utilise automatiquement le proxy CORS public comme fallback.

**La fonction Edge Function est maintenant prête à être déployée !** 🎉
