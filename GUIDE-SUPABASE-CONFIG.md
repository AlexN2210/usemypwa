# Guide de configuration Supabase

## 🔧 **Problème identifié :**

L'URL Supabase n'est pas configurée avec votre vraie référence de projet :
- ❌ **Actuel** : `https://your-project-ref.supabase.co/functions/v1/siret`
- ✅ **Nécessaire** : `https://VOTRE-PROJECT-REF.supabase.co/functions/v1/siret`

## 🚀 **Solution :**

### **1. Trouver votre URL Supabase :**

1. Connectez-vous à [supabase.com](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** → **API**
4. Copiez l'URL de votre projet (ex: `https://abcdefghijklmnop.supabase.co`)

### **2. Mettre à jour le service :**

Dans `src/lib/siretService.ts`, remplacez :

```typescript
// AVANT
private static readonly SUPABASE_FUNCTION_URL = 'https://your-project-ref.supabase.co/functions/v1/siret';

// APRÈS (avec votre vraie URL)
private static readonly SUPABASE_FUNCTION_URL = 'https://abcdefghijklmnop.supabase.co/functions/v1/siret';
```

### **3. Déployer la fonction Edge Function :**

```bash
# Se connecter à Supabase
npx supabase login

# Déployer la fonction
npx supabase functions deploy siret
```

### **4. Tester la fonction :**

```bash
# Tester avec curl
curl "https://VOTRE-PROJECT-REF.supabase.co/functions/v1/siret?siret=77567146400013"
```

## 🔄 **Architecture actuelle :**

```
1. Essai Supabase Edge Function (si configurée)
   ↓ (si échec)
2. Simulation locale (toujours fonctionnelle)
```

## ✅ **Avantages de la fonction Supabase :**

- **Données réelles** : API gouvernementale française
- **Performance** : Plus rapide que les proxies
- **Fiabilité** : Service dédié et stable
- **Sécurité** : Contrôle total sur les requêtes
- **Logs** : Monitoring des appels API

## 🚨 **En attendant la configuration :**

L'application fonctionne parfaitement avec la simulation locale :
- ✅ **Validation de format** : 14 chiffres
- ✅ **SIRET de test** : McDonald's, Carrefour, Total
- ✅ **Simulation intelligente** : Données réalistes
- ✅ **Pas de CORS** : Fonctionne immédiatement

**Une fois configurée, la fonction Supabase prendra automatiquement le relais !** 🎉
