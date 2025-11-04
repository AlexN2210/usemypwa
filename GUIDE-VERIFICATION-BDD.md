# 🔍 Guide : Vérification complète de la base de données

## ✅ **Points à vérifier**

### **1. Trigger `handle_new_user`**
Le trigger doit créer automatiquement un profil lors de l'inscription d'un utilisateur.

### **2. Politiques RLS (Row Level Security)**
Les politiques RLS doivent permettre aux utilisateurs authentifiés de :
- **SELECT** : Voir tous les profils
- **UPDATE** : Mettre à jour leur propre profil
- **INSERT** : Insérer leur propre profil

### **3. Colonnes `full_name` et `user_type`**
Ces colonnes doivent exister dans la table `profiles`.

## 🚀 **Solution : Script de vérification complet**

### **Étape 1 : Exécuter le script de vérification**

1. **Ouvrez** le SQL Editor de Supabase
2. **Exécutez** le script `verify-and-fix-all.sql`

Ce script va :
- ✅ Vérifier que les colonnes `full_name` et `user_type` existent
- ✅ Les créer si elles sont manquantes
- ✅ Vérifier que le trigger `handle_new_user` existe
- ✅ Le créer s'il est manquant
- ✅ Vérifier et corriger les politiques RLS
- ✅ Afficher un résumé final

### **Étape 2 : Vérifier les résultats**

Après avoir exécuté le script, vous devriez voir :

#### **Colonnes :**
- ✅ `full_name` existe (type: text, NOT NULL)
- ✅ `user_type` existe (type: user_type enum, NOT NULL)

#### **Trigger :**
- ✅ Fonction `handle_new_user` existe
- ✅ Trigger `on_auth_user_created` existe sur `auth.users`

#### **Politiques RLS :**
- ✅ `Users can view all profiles` (SELECT)
- ✅ `Users can update own profile` (UPDATE)
- ✅ `Users can insert own profile` (INSERT)

### **Étape 3 : Test de l'inscription**

Après avoir exécuté le script :

1. **Testez** l'inscription dans votre application
2. **Vérifiez** que le profil est créé automatiquement
3. **Vérifiez** dans Supabase Table Editor que le profil existe

## 🔍 **Vérifications manuelles (optionnel)**

### **Vérifier le trigger :**
```sql
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### **Vérifier les colonnes :**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name IN ('full_name', 'user_type');
```

### **Vérifier les politiques RLS :**
```sql
SELECT policyname, cmd, roles, with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

## ✅ **Résultat attendu**

Après avoir exécuté `verify-and-fix-all.sql` :
- ✅ Toutes les colonnes nécessaires existent
- ✅ Le trigger crée automatiquement les profils
- ✅ Les politiques RLS permettent les opérations nécessaires
- ✅ L'inscription fonctionne sans erreur 401

## 🚨 **Si le problème persiste**

1. **Vérifiez** les logs Supabase : Dashboard → Logs → Postgres Logs
2. **Vérifiez** que le projet Supabase est actif (pas en pause)
3. **Testez** avec un utilisateur de test
4. **Contactez** le support Supabase si nécessaire

