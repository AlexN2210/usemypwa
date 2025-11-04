# 🔧 Guide : Résoudre l'erreur 401 (Unauthorized)

## 🚨 **Problème**

Erreur lors de l'accès à l'API Supabase :
```
Failed to load resource: the server responded with a status of 401 ()
neucmsawqhaglkuxsfag.supabase.co/rest/v1/profiles
```

## ✅ **Solutions**

### **Cause 1 : Session expirée ou non authentifiée**

L'erreur 401 signifie que l'utilisateur n'est pas authentifié ou que la session a expiré.

#### **Solution : Vérifier l'état de l'authentification**

1. **Ouvrez** la console du navigateur (F12)
2. **Vérifiez** si vous êtes connecté :
   ```javascript
   // Dans la console
   const { data: { session } } = await supabase.auth.getSession();
   console.log('Session:', session);
   ```

3. **Si la session est null** :
   - Reconnectez-vous
   - Vérifiez que l'inscription s'est bien passée

### **Cause 2 : Politiques RLS trop restrictives**

Les politiques RLS peuvent bloquer l'accès même pour les utilisateurs authentifiés.

#### **Solution : Vérifier les politiques RLS**

1. **Exécutez** dans le SQL Editor de Supabase :
   ```sql
   SELECT 
       policyname,
       cmd,
       with_check
   FROM pg_policies
   WHERE tablename = 'profiles';
   ```

2. **Vérifiez** que la politique SELECT existe :
   ```sql
   -- Si elle n'existe pas, créez-la :
   CREATE POLICY "Users can view all profiles"
     ON profiles FOR SELECT
     TO authenticated
     USING (true);
   ```

### **Cause 3 : Token d'authentification manquant**

Les requêtes Supabase nécessitent un token d'authentification.

#### **Solution : Vérifier le client Supabase**

1. **Vérifiez** que le client Supabase est correctement configuré :
   ```typescript
   // Dans src/lib/supabase.ts
   export const supabase = createClient(
     import.meta.env.VITE_SUPABASE_URL,
     import.meta.env.VITE_SUPABASE_ANON_KEY,
     {
       auth: {
         persistSession: true,
         autoRefreshToken: true,
         detectSessionInUrl: true
       }
     }
   );
   ```

2. **Vérifiez** que les variables d'environnement sont définies :
   ```bash
   # Dans .env.local
   VITE_SUPABASE_URL=https://neucmsawqhaglkuxsfag.supabase.co
   VITE_SUPABASE_ANON_KEY=votre-clé-ici
   ```

### **Cause 4 : Build non à jour**

L'erreur montre `your-project-ref` au lieu de `neucmsawqhaglkuxsfag`, ce qui signifie que le build n'est pas à jour.

#### **Solution : Reconstruire l'application**

```bash
# Arrêtez le serveur (Ctrl+C)
npm run build
npm run preview
```

Ou en développement :
```bash
npm run dev
```

## 🔍 **Vérifications étape par étape**

### **1. Vérifier l'authentification**
```javascript
// Dans la console du navigateur
const { data: { session }, error } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Error:', error);
```

### **2. Vérifier les politiques RLS**
```sql
-- Dans le SQL Editor de Supabase
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### **3. Vérifier les variables d'environnement**
```bash
# Dans le terminal
cat .env.local
```

### **4. Vérifier les logs Supabase**
- Dashboard Supabase → **Logs** → **API Logs**
- Cherchez les requêtes 401 et leurs causes

## ✅ **Actions immédiates**

1. **Reconstruisez** l'application :
   ```bash
   npm run build
   npm run preview
   ```

2. **Vérifiez** que vous êtes connecté :
   - Connectez-vous à nouveau si nécessaire

3. **Exécutez** `fix-rls-policies.sql` si vous ne l'avez pas encore fait

4. **Videz** le cache du navigateur (Ctrl+Shift+Delete)

## 🚨 **Si le problème persiste**

1. **Vérifiez** les logs Supabase pour plus de détails
2. **Testez** avec un utilisateur de test
3. **Vérifiez** que le projet Supabase est actif (pas en pause)

