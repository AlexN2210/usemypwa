# 🔧 Guide : Résoudre l'erreur "must be owner of table spatial_ref_sys"

## 🚨 **Erreur**

```
ERROR: 42501: must be owner of table spatial_ref_sys
```

## 📋 **Explication**

La table `spatial_ref_sys` est une **table système** créée automatiquement par l'extension PostGIS. Elle appartient au système PostgreSQL/PostGIS, pas à votre utilisateur.

**C'est normal** que vous ne puissiez pas la modifier directement. Cette table est gérée par PostGIS.

## ✅ **Solutions**

### **Option 1 : Ignorer l'avertissement (Recommandé)**

Cet avertissement est **cosmétique** et n'affecte pas la sécurité réelle de votre application car :
- La table `spatial_ref_sys` est en **lecture seule**
- Elle contient uniquement des données de référence PostGIS
- Elle n'expose pas de données utilisateur

**Vous pouvez ignorer cet avertissement en toute sécurité.**

### **Option 2 : Demander à Supabase d'activer RLS**

Si vous voulez vraiment corriger l'avertissement :

1. **Contactez** le support Supabase
2. **Demandez-leur** d'activer RLS sur `spatial_ref_sys`
3. Ils peuvent le faire avec les privilèges administrateur

### **Option 3 : Utiliser un script avec gestion d'erreur**

Le script `fix-spatial-ref-sys-rls.sql` a été mis à jour pour gérer cette erreur gracieusement. Il :
- ✅ Tente d'activer RLS
- ✅ Gère l'erreur si vous n'êtes pas propriétaire
- ✅ Affiche un message informatif

## 🔍 **Vérification**

Pour vérifier qui est le propriétaire de la table :

```sql
SELECT 
    tablename,
    tableowner,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'spatial_ref_sys';
```

## ✅ **Conclusion**

**Vous pouvez ignorer cet avertissement**. Il n'affecte pas :
- ✅ La sécurité de votre application
- ✅ Le fonctionnement de PostGIS
- ✅ Les fonctionnalités géospatiales

C'est simplement une recommandation Supabase pour les tables publiques, mais les tables système PostGIS sont généralement gérées par le système lui-même.

