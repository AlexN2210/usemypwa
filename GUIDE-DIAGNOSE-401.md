# 🔍 Guide : Diagnostiquer l'erreur 401 (Unauthorized)

## 🚨 **Problème**

Erreur persistante :
```
Failed to load resource: the server responded with a status of 401 ()
neucmsawqhaglkuxsfag.supabase.co/rest/v1/profiles
```

## ✅ **Diagnostic étape par étape**

### **Étape 1 : Vérifier l'authentification dans la console**

Ouvrez la console du navigateur (F12) et exécutez :

```javascript
// Vérifier la session
const { data: { session }, error } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Error:', error);

// Si session est null, vous n'êtes pas authentifié
if (!session) {
  console.warn('⚠️ Pas de session active - Vous devez vous connecter');
}
```

**Résultat attendu :**
- ✅ `session` devrait contenir un objet avec `user` et `access_token`
- ❌ Si `session` est `null`, vous devez vous connecter

### **Étape 2 : Vérifier les politiques RLS**

Dans le SQL Editor de Supabase, exécutez `verify-and-fix-auth.sql` :

```sql
-- Vérifier les politiques
SELECT 
    policyname,
    cmd,
    roles,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

**Résultat attendu :**
- ✅ `Users can view all profiles` (SELECT) avec `roles = '{authenticated}'`
- ✅ `Users can update own profile` (UPDATE)
- ✅ `Users can insert own profile` (INSERT)

### **Étape 3 : Vérifier que RLS est activé**

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

**Résultat attendu :**
- ✅ `rowsecurity = true`

### **Étape 4 : Tester l'accès manuellement**

Dans la console du navigateur :

```javascript
// Vérifier que vous êtes authentifié
const { data: { session } } = await supabase.auth.getSession();
console.log('User ID:', session?.user?.id);

// Tester l'accès à profiles
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .limit(1);

console.log('Data:', data);
console.log('Error:', error);
```

**Si vous obtenez une erreur 401 :**
- Votre session n'est pas valide
- Les politiques RLS bloquent l'accès
- Le token d'authentification a expiré

## 🔧 **Solutions**

### **Solution 1 : Reconnectez-vous**

1. **Déconnectez-vous** de l'application
2. **Reconnectez-vous** avec vos identifiants
3. **Vérifiez** que la session est active

### **Solution 2 : Exécuter le script de correction RLS**

Exécutez `verify-and-fix-auth.sql` dans le SQL Editor de Supabase :

1. **Ouvrez** le SQL Editor
2. **Copiez-collez** le contenu de `verify-and-fix-auth.sql`
3. **Exécutez** le script
4. **Vérifiez** que toutes les politiques sont créées

### **Solution 3 : Vérifier la configuration Supabase**

Vérifiez que les variables d'environnement sont correctes :

```bash
# Dans .env.local
VITE_SUPABASE_URL=https://neucmsawqhaglkuxsfag.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-ici
```

### **Solution 4 : Vider le cache d'authentification**

Dans la console du navigateur :

```javascript
// Déconnecter
await supabase.auth.signOut();

// Vider le localStorage
localStorage.clear();

// Recharger la page
window.location.reload();
```

## 🔍 **Vérifications supplémentaires**

### **1. Vérifier les logs Supabase**

1. **Dashboard Supabase** → **Logs** → **API Logs**
2. **Cherchez** les requêtes 401
3. **Vérifiez** les détails de l'erreur

### **2. Vérifier le token d'authentification**

Dans la console :

```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Access Token:', session?.access_token?.substring(0, 20) + '...');
console.log('Token expires:', new Date(session?.expires_at * 1000));
```

### **3. Vérifier que l'utilisateur existe dans auth.users**

Dans le SQL Editor de Supabase :

```sql
-- Vérifier les utilisateurs (remplacez par votre user_id)
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
```

## ✅ **Résultat attendu**

Après avoir appliqué les solutions :
- ✅ La session est active et valide
- ✅ Les politiques RLS permettent l'accès
- ✅ Plus d'erreur 401 sur `/rest/v1/profiles`
- ✅ Les profils se chargent correctement

## 🚨 **Si le problème persiste**

1. **Vérifiez** que le projet Supabase est actif (pas en pause)
2. **Vérifiez** les logs Supabase pour plus de détails
3. **Testez** avec un utilisateur de test
4. **Contactez** le support Supabase si nécessaire

