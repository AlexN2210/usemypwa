# 🔧 Guide de résolution - Erreur "full-name" column

## 🚨 **Problème identifié**

Erreur lors de l'inscription :
```
could not find the "full-name" column of profiles in the schema cache
```

## ✅ **Solution : Rafraîchir le cache Supabase et vérifier la table**

### **Étape 1 : Vérifier la structure de la table**

1. **Ouvrez** votre dashboard Supabase : [supabase.com](https://supabase.com)
2. **Allez** dans **SQL Editor**
3. **Exécutez** le script `verify-profiles-table.sql` :

```sql
-- Vérifier la structure de la table profiles
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### **Étape 2 : Vérifier que la colonne `full_name` existe**

Le résultat devrait montrer une colonne `full_name` (avec underscore).

Si la colonne n'existe pas, exécutez :

```sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name text NOT NULL DEFAULT '';
```

### **Étape 3 : Rafraîchir le cache du schéma Supabase**

Le cache Supabase peut être obsolète. Voici comment le rafraîchir :

1. **Dans le dashboard Supabase** :
   - Allez dans **Settings** → **API**
   - Cliquez sur **"Refresh schema cache"** ou **"Reload schema"** (si disponible)

2. **Ou via SQL** :
   ```sql
   -- Forcer le rafraîchissement en faisant une requête simple
   SELECT * FROM profiles LIMIT 1;
   ```

3. **Redémarrez votre application** :
   - Arrêtez votre serveur de développement
   - Redémarrez-le : `npm run dev`

### **Étape 4 : Appliquer la migration complète (si nécessaire)**

Si la table `profiles` n'existe pas ou est incomplète :

1. **Dans le SQL Editor**, copiez-collez tout le contenu de :
   `supabase/migrations/20251023145431_create_usemy_schema.sql`

2. **Exécutez** la migration complète

3. **Vérifiez** que toutes les tables sont créées :
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('profiles', 'professional_profiles', 'matches', 'posts');
   ```

### **Étape 5 : Vérifier les RLS (Row Level Security) policies**

Assurez-vous que les politiques RLS sont correctes :

```sql
-- Vérifier les politiques pour la table profiles
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'profiles';
```

Vous devriez voir au moins :
- `Users can view all profiles` (SELECT)
- `Users can update own profile` (UPDATE)
- `Users can insert own profile` (INSERT)

### **Étape 6 : Test de l'inscription**

Après avoir appliqué les corrections :

1. **Reconstruisez** l'application :
   ```bash
   npm run build
   npm run preview
   ```

2. **Testez** l'inscription :
   - Créez un nouveau compte
   - Vérifiez qu'il n'y a plus d'erreur

## 🔍 **Vérifications supplémentaires**

### **Vérifier que la table existe**
```sql
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
);
```

### **Vérifier la structure complète**
```sql
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
```

### **Vérifier les données existantes**
```sql
SELECT id, full_name, user_type, created_at 
FROM profiles 
LIMIT 5;
```

## ✅ **Résultat attendu**

Après ces corrections :
- ✅ La table `profiles` existe avec la colonne `full_name`
- ✅ Le cache Supabase est à jour
- ✅ L'inscription fonctionne sans erreur
- ✅ Les profils sont créés correctement

## 🚨 **Si le problème persiste**

1. **Vérifiez** les logs Supabase dans **Dashboard** → **Logs** → **API Logs**
2. **Vérifiez** que votre projet Supabase est actif
3. **Contactez** le support Supabase si nécessaire

