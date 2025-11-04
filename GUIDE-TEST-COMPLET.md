# 🧪 **Guide de test complet - Tables créées**

## **✅ Étape 1 : Vérification des politiques RLS**

### **Exécutez dans le SQL Editor :**
```sql
-- Vérifier les politiques
SELECT 
  policyname,
  cmd,
  permissive,
  roles
FROM pg_policies 
WHERE tablename = 'professional_profiles';
```

### **Résultat attendu :**
- ✅ 3 politiques : SELECT, INSERT, UPDATE
- ✅ Rôles : authenticated
- ✅ Commandes : SELECT, INSERT, UPDATE

## **🔧 Étape 2 : Correction des politiques (si nécessaire)**

### **Si les politiques sont incorrectes :**
1. **Exécutez** `fix-rls-policies.sql`
2. **Vérifiez** que 3 politiques sont créées

## **🧪 Étape 3 : Test d'insertion manuelle**

### **Exécutez dans le SQL Editor :**
```sql
-- Insérer un enregistrement de test
INSERT INTO professional_profiles (user_id, company_name, siret, category)
VALUES (
  (SELECT id FROM profiles LIMIT 1), 
  'Test Company', 
  '12345678901234', 
  'Test Category'
);

-- Vérifier l'insertion
SELECT * FROM professional_profiles;
```

## **🚀 Étape 4 : Test de l'application**

### **1. Reconstruire l'application :**
```bash
cd project
npm run build
npm run preview
```

### **2. Tester l'inscription :**
1. **Ouvrez** l'application
2. **Inscrivez-vous** comme professionnel
3. **Sélectionnez** une profession
4. **Validez** un SIRET (ex: 77567146400013)
5. **Vérifiez** l'affichage dans le profil

## **🔍 Étape 5 : Diagnostic des erreurs**

### **Si l'erreur 406 persiste :**

1. **Vérifiez** les clés API dans `.env`
2. **Vérifiez** l'URL Supabase
3. **Vérifiez** que l'utilisateur est authentifié

### **Si les données ne s'affichent pas :**

1. **Vérifiez** que l'insertion a fonctionné
2. **Vérifiez** les politiques RLS
3. **Vérifiez** les permissions

## **✅ Résultat final attendu :**

- ✅ **Tables créées** : `profiles`, `professional_profiles`
- ✅ **Politiques RLS** : 3 politiques configurées
- ✅ **Insertion** : Données SIRET sauvegardées
- ✅ **Affichage** : Informations dans le profil
- ✅ **Application PWA** : Fonctionnelle

## **📞 Si le problème persiste :**

1. **Partagez** les résultats des scripts de test
2. **Vérifiez** les logs de la console
3. **Testez** avec un utilisateur différent

**Une fois les politiques RLS corrigées, votre application fonctionnera parfaitement !** 🎉


