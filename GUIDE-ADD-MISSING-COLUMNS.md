# 🔧 Guide : Ajouter les colonnes manquantes

## 🚨 **Problème**

Erreur : `column "points" of relation "profiles" does not exist`

Votre table `profiles` n'a pas toutes les colonnes définies dans le schéma.

## ✅ **Solution : Ajouter les colonnes manquantes**

### **Étape 1 : Exécuter le script SQL**

1. **Ouvrez** le SQL Editor de Supabase
2. **Exécutez** le script `add-missing-columns.sql`

Ce script va :
- ✅ Vérifier quelles colonnes existent
- ✅ Ajouter la colonne `points` si elle n'existe pas
- ✅ Ajouter toutes les autres colonnes manquantes
- ✅ Afficher un résumé des colonnes ajoutées

### **Étape 2 : Vérifier que tout est en ordre**

Après avoir exécuté le script, vérifiez la structure :

```sql
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

Vous devriez voir toutes ces colonnes :
- ✅ `id`
- ✅ `user_type`
- ✅ `full_name`
- ✅ `avatar_url`
- ✅ `bio`
- ✅ `phone`
- ✅ `address`
- ✅ `latitude`
- ✅ `longitude`
- ✅ `city`
- ✅ `postal_code`
- ✅ `points`
- ✅ `created_at`
- ✅ `updated_at`

### **Étape 3 : Redémarrer l'application**

```bash
# Arrêtez le serveur (Ctrl+C)
npm run dev
```

### **Étape 4 : Tester l'inscription**

- Créez un nouveau compte
- L'erreur devrait être résolue

## 📋 **Colonnes qui seront ajoutées**

Si elles n'existent pas déjà :
- `points` (integer, DEFAULT 0) - Points de cashback
- `avatar_url` (text) - URL de l'avatar
- `bio` (text) - Biographie
- `phone` (text) - Téléphone
- `address` (text) - Adresse
- `latitude` (numeric) - Latitude GPS
- `longitude` (numeric) - Longitude GPS
- `city` (text) - Ville
- `postal_code` (text) - Code postal
- `updated_at` (timestamptz) - Date de mise à jour

## ✅ **Résultat attendu**

Après avoir exécuté le script :
- ✅ Toutes les colonnes nécessaires existent
- ✅ L'inscription fonctionne sans erreur
- ✅ Les profils sont créés correctement avec tous les champs

## 🚨 **Si le problème persiste**

1. **Vérifiez** que le script s'est exécuté sans erreur
2. **Vérifiez** que toutes les colonnes ont été ajoutées (requête de vérification ci-dessus)
3. **Redémarrez** complètement votre application
4. **Videz** le cache du navigateur

