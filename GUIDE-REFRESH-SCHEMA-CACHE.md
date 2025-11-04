# 🔄 Guide : Rafraîchir le cache du schéma Supabase

## 🚨 **Problème**

Erreur : `could not find the "full-name" column of profiles in the schema cache`

Même si :
- ✅ La colonne `full_name` existe dans la base de données
- ✅ Les politiques RLS sont correctes
- ✅ Le code utilise bien `full_name`

## ✅ **Solution : Rafraîchir le cache Supabase**

### **Méthode 1 : Script SQL (Recommandé)**

1. **Ouvrez** le SQL Editor de Supabase
2. **Exécutez** le script `force-refresh-schema.sql`
3. **Redémarrez** votre application :
   ```bash
   # Arrêtez le serveur (Ctrl+C)
   npm run dev
   ```

### **Méthode 2 : Redémarrer le projet Supabase**

1. **Dashboard Supabase** → **Settings** → **General**
2. **Pause** puis **Resume** votre projet
3. **Attendez** quelques secondes
4. **Redémarrez** votre application

### **Méthode 3 : Requête manuelle**

Dans le SQL Editor, exécutez :

```sql
-- Forcer le rafraîchissement en faisant plusieurs requêtes
SELECT * FROM profiles LIMIT 1;
SELECT column_name FROM information_schema.columns WHERE table_name = 'profiles';
SELECT COUNT(*) FROM profiles;
```

Puis redémarrez votre application.

### **Méthode 4 : Vider le cache côté client**

1. **Arrêtez** votre application
2. **Supprimez** le dossier `node_modules/.vite` (si présent)
3. **Reconstruisez** :
   ```bash
   npm run build
   npm run preview
   ```

### **Méthode 5 : Redémarrer l'application complètement**

1. **Arrêtez** complètement votre serveur de développement
2. **Fermez** tous les onglets du navigateur avec l'application
3. **Videz** le cache du navigateur (Ctrl+Shift+Delete)
4. **Redémarrez** :
   ```bash
   npm run dev
   ```
5. **Ouvrez** un nouvel onglet incognito/navigation privée

## 🔍 **Vérifications après rafraîchissement**

### **1. Vérifier dans la console**
Ouvrez la console du navigateur (F12) et vérifiez qu'il n'y a plus d'erreur `full-name`.

### **2. Tester l'inscription**
- Créez un nouveau compte
- Vérifiez que l'inscription fonctionne sans erreur

### **3. Vérifier les données**
Dans Supabase SQL Editor :
```sql
SELECT id, full_name, user_type, created_at 
FROM profiles 
ORDER BY created_at DESC 
LIMIT 5;
```

## ✅ **Résultat attendu**

Après le rafraîchissement :
- ✅ Plus d'erreur `full-name` dans le cache
- ✅ L'inscription fonctionne correctement
- ✅ Les profils sont créés avec `full_name`

## 🚨 **Si le problème persiste**

1. **Vérifiez** que la migration a bien été appliquée :
   ```sql
   SELECT column_name 
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND column_name = 'full_name';
   ```
   Devrait retourner `full_name`

2. **Vérifiez** les logs Supabase :
   - Dashboard → **Logs** → **API Logs**
   - Cherchez les erreurs liées à `profiles`

3. **Contactez** le support Supabase si le problème persiste après toutes ces étapes

