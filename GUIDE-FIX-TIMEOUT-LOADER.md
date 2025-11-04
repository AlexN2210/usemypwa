# 🔧 Guide : Résoudre le loader bloqué (Timeout)

## 🚨 **Problème**

Le loader tourne indéfiniment et finit par timeout :
```
⚠️ Timeout de chargement - Arrêt du loader
```

## 🔍 **Cause probable**

`supabase.auth.getSession()` ne répond pas. Cela peut être dû à :

1. **Projet Supabase en pause**
2. **Connexion Internet bloquée ou lente**
3. **Variables d'environnement incorrectes**
4. **Problème de CORS ou de configuration**

## ✅ **Solutions**

### **Solution 1 : Vérifier que le projet Supabase est actif**

1. **Dashboard Supabase** → Votre projet
2. **Vérifiez** que le projet n'est pas en pause
3. Si en pause, cliquez sur **"Resume"** ou **"Restart"**

### **Solution 2 : Vérifier les variables d'environnement**

Dans la console du navigateur, vous devriez voir :
```
🔧 Configuration Supabase: {
  url: "https://neucmsawqhaglkuxsfag.supabase.co",
  hasAnonKey: true,
  keyLength: 200+
}
```

Si vous voyez `hasAnonKey: false` ou `keyLength: 0`, les variables ne sont pas chargées.

**Vérifiez** le fichier `.env` :
```bash
cat .env
```

**Doit contenir** :
```
VITE_SUPABASE_URL=https://neucmsawqhaglkuxsfag.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **Solution 3 : Tester la connexion Supabase**

Dans la console du navigateur, testez manuellement :

```javascript
// Vérifier la configuration
console.log('URL:', import.meta.env.VITE_SUPABASE_URL);
console.log('Key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');

// Tester la connexion
const { data, error } = await supabase.auth.getSession();
console.log('Session:', data);
console.log('Error:', error);
```

### **Solution 4 : Vérifier la connexion Internet**

1. **Testez** si Supabase est accessible :
   - Ouvrez `https://neucmsawqhaglkuxsfag.supabase.co` dans votre navigateur
   - Vous devriez voir une page Supabase

2. **Vérifiez** votre connexion Internet

### **Solution 5 : Vider le cache et redémarrer**

1. **Videz** le cache du navigateur (Ctrl+Shift+Delete)
2. **Redémarrez** le serveur de développement :
   ```bash
   npm run dev
   ```

### **Solution 6 : Mode hors ligne (temporaire)**

Si Supabase ne répond vraiment pas, vous pouvez temporairement désactiver le chargement automatique :

```typescript
// Dans AuthContext.tsx, commenter temporairement :
// const { data: { session } } = await supabase.auth.getSession();
// Et mettre directement :
setLoading(false);
```

## 🔍 **Diagnostic dans la console**

Après avoir rechargé, vérifiez dans la console :

1. **`🔧 Configuration Supabase`** - Doit apparaître
2. **`🔄 Initialisation de la session...`** - Doit apparaître
3. **`🔍 Appel à supabase.auth.getSession()...`** - Doit apparaître
4. **Si timeout** : `❌ Timeout : supabase.auth.getSession() ne répond pas`

## ✅ **Résultat attendu**

Après avoir résolu le problème :
- ✅ Le loader s'arrête après quelques secondes
- ✅ L'application affiche l'écran de connexion ou l'application principale
- ✅ Plus de timeout

## 🚨 **Si le problème persiste**

1. **Vérifiez** les logs Supabase : Dashboard → Logs → API Logs
2. **Testez** avec un autre navigateur
3. **Vérifiez** que le projet Supabase n'est pas en pause
4. **Contactez** le support Supabase si nécessaire

