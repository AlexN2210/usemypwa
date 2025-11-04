# 🚨 **Guide de dépannage - Erreur 406 persistante**

## **Problème :**
```
GET https://nxosknsfjxvzcdljekpo.supabase.co/rest/v1/professional_profiles?select=*&user_id=eq.264c5f08-6d7b-4e29-ae43-70915e8a5634 406 (Not Acceptable)
```

## **🔍 Diagnostic étape par étape :**

### **Étape 1 : Diagnostic complet**
1. **Ouvrez votre dashboard Supabase** : [supabase.com](https://supabase.com)
2. **Allez dans SQL Editor**
3. **Exécutez** `diagnostic-complete.sql`
4. **Notez** les résultats

### **Étape 2 : Solutions selon le diagnostic :**

#### **Si la table n'existe pas :**
- Exécutez `force-create-table.sql`
- ⚠️ **ATTENTION** : Ce script supprime et recrée la table

#### **Si la table existe mais RLS bloque :**
- Vérifiez les politiques dans le Table Editor
- Exécutez `ultra-simple-fix.sql`

#### **Si les politiques sont incorrectes :**
- Exécutez `force-create-table.sql`

### **Étape 3 : Vérification finale**
1. **Exécutez** `test-professional-profiles.sql`
2. **Vérifiez** dans le Table Editor que la table existe
3. **Testez** l'insertion manuelle d'un enregistrement

### **Étape 4 : Test de l'application**
1. **Rechargez** votre application
2. **Inscrivez-vous** comme professionnel
3. **Validez** un SIRET
4. **Vérifiez** l'affichage dans le profil

## **🔧 Solutions alternatives :**

### **Solution 1 : Création manuelle via Table Editor**
1. **Allez dans Table Editor**
2. **Cliquez sur "New Table"**
3. **Nom** : `professional_profiles`
4. **Colonnes** :
   - `id` (uuid, primary key)
   - `user_id` (uuid, foreign key vers profiles)
   - `company_name` (text)
   - `siret` (text)
   - `category` (text)
   - `verified` (boolean)
   - `created_at` (timestamptz)

### **Solution 2 : Vérifier les permissions**
1. **Allez dans Authentication > Policies**
2. **Vérifiez** que les politiques existent
3. **Activez** RLS si nécessaire

## **✅ Résultat attendu :**

- ✅ **Table `professional_profiles`** créée
- ✅ **Politiques RLS** configurées
- ✅ **Application PWA** fonctionnelle
- ✅ **Données SIRET** sauvegardées et affichées

## **📞 Si le problème persiste :**

1. **Vérifiez** votre URL Supabase dans `.env`
2. **Vérifiez** vos clés API
3. **Contactez** le support Supabase

**Une fois la table créée correctement, votre application fonctionnera !** 🎉


