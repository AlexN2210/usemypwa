# 🔧 Guide : Résoudre l'avertissement RLS sur spatial_ref_sys

## 🚨 **Avertissement**

```
public.spatial_ref_sys is public, but RLS has not been enabled.
```

## 📋 **Explication**

La table `spatial_ref_sys` est créée automatiquement par l'extension PostGIS (active dans votre projet). C'est une table système qui contient les définitions de systèmes de référence spatiale.

Supabase recommande d'activer RLS sur toutes les tables publiques pour des raisons de sécurité, même les tables système.

## ✅ **Solution : Activer RLS sur spatial_ref_sys**

### **Étape 1 : Exécuter le script SQL**

1. **Ouvrez** le SQL Editor de Supabase
2. **Exécutez** le script `fix-spatial-ref-sys-rls.sql`

Ce script va :
- ✅ Activer RLS sur la table `spatial_ref_sys`
- ✅ Créer une politique pour permettre la lecture à tous
- ✅ Vérifier que tout est correctement configuré

### **Étape 2 : Vérifier**

Après avoir exécuté le script, l'avertissement devrait disparaître.

## 🔍 **Pourquoi cette table existe ?**

Cette table est créée automatiquement quand vous activez l'extension PostGIS dans votre migration :
```sql
CREATE EXTENSION IF NOT EXISTS "postgis";
```

Elle est nécessaire pour que PostGIS fonctionne correctement (calculs géospatiaux, coordonnées GPS, etc.).

## ✅ **Résultat attendu**

Après avoir exécuté le script :
- ✅ RLS est activé sur `spatial_ref_sys`
- ✅ La lecture est autorisée pour tous (nécessaire pour PostGIS)
- ✅ L'avertissement disparaît dans Supabase

## 🚨 **Note importante**

Cette table est en **lecture seule** et ne doit pas être modifiée. La politique créée permet uniquement la lecture (`SELECT`), ce qui est suffisant pour PostGIS.

