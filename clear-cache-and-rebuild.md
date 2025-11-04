# 🔄 Guide : Vider le cache et reconstruire

## 🚨 **Problème**

L'application montre encore `your-project-ref` au lieu de `neucmsawqhaglkuxsfag`, ce qui signifie que le cache du navigateur ou du service worker utilise encore l'ancien build.

## ✅ **Solution : Vider complètement le cache**

### **Étape 1 : Vider le cache du navigateur**

1. **Ouvrez** les outils de développement (F12)
2. **Allez** dans l'onglet **Application** (Chrome) ou **Stockage** (Firefox)
3. **Cliquez** sur **Clear storage** ou **Vider le stockage**
4. **Cochez** toutes les options :
   - ✅ Cache
   - ✅ Cookies
   - ✅ Service Workers
   - ✅ Local Storage
   - ✅ Session Storage
5. **Cliquez** sur **Clear site data** ou **Vider les données**

### **Étape 2 : Désenregistrer le Service Worker**

Dans la console du navigateur (F12), exécutez :

```javascript
// Désenregistrer tous les service workers
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(registration => {
    registration.unregister();
    console.log('Service Worker désenregistré');
  });
});

// Vider tous les caches
caches.keys().then(names => {
  names.forEach(name => {
    caches.delete(name);
    console.log('Cache supprimé:', name);
  });
});

// Recharger la page
window.location.reload(true);
```

### **Étape 3 : Mode navigation privée**

1. **Ouvrez** un onglet en navigation privée (Ctrl+Shift+N)
2. **Accédez** à votre application
3. **Vérifiez** que l'URL Supabase est correcte

### **Étape 4 : Reconstruire l'application**

```bash
# Nettoyer les caches
rm -rf dist node_modules/.vite

# Reconstruire
npm run build

# Lancer le serveur de prévisualisation
npm run preview
```

### **Étape 5 : Vérifier dans le code source**

Ouvrez le fichier JavaScript compilé dans `dist/assets/index-*.js` et cherchez :
- ❌ `your-project-ref` (ne devrait plus être là)
- ✅ `neucmsawqhaglkuxsfag` (devrait être présent)

## 🔍 **Vérification**

Après avoir vidé le cache :

1. **Ouvrez** la console (F12)
2. **Recherchez** `your-project-ref` dans les erreurs
3. **Si vous voyez encore** `your-project-ref`, le cache n'est pas vidé

## ✅ **Résultat attendu**

Après avoir vidé le cache :
- ✅ Plus d'erreur `your-project-ref`
- ✅ L'URL Supabase Edge Function est correcte
- ✅ L'API SIRET fonctionne (via fallback direct)

## 🚨 **Si le problème persiste**

1. **Fermez** complètement le navigateur
2. **Rouvrez** le navigateur
3. **Accédez** à l'application en navigation privée
4. **Vérifiez** que le build est bien à jour dans `dist/`

