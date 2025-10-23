# Guide de Test PWA - Usemy

## 🚀 Comment tester votre PWA

### 1. **Démarrer le serveur de test**
```bash
npm run preview
```
Ouvrez votre navigateur sur l'URL affichée (généralement `http://localhost:4173`)

### 2. **Tests automatiques**
Ouvrez `http://localhost:4173/test-pwa.html` pour des tests automatiques

### 3. **Tests manuels dans le navigateur**

#### **Chrome/Edge :**
1. Ouvrez les **Outils de développement** (F12)
2. Allez dans l'onglet **Application**
3. Vérifiez :
   - **Manifest** : Doit afficher les informations de votre PWA
   - **Service Workers** : Doit montrer un service worker actif
   - **Storage** : Doit avoir des données en cache

#### **Firefox :**
1. Ouvrez les **Outils de développement** (F12)
2. Allez dans l'onglet **Application**
3. Vérifiez les mêmes sections

### 4. **Test d'installation**

#### **Desktop :**
- Cherchez l'icône **"Installer"** dans la barre d'adresse
- Ou cliquez sur le menu (⋮) → "Installer Usemy"

#### **Mobile :**
- **Android Chrome** : Menu → "Ajouter à l'écran d'accueil"
- **iOS Safari** : Bouton Partager → "Sur l'écran d'accueil"

### 5. **Vérifications importantes**

✅ **Manifest valide** : Pas d'erreurs dans la console  
✅ **Service Worker actif** : Statut "activated"  
✅ **Icônes chargées** : 192x192 et 512x512  
✅ **Mode standalone** : L'app s'ouvre sans barre d'adresse  
✅ **Installation possible** : Prompt d'installation disponible  

### 6. **Problèmes courants**

❌ **Pas d'icône d'installation** : Vérifiez le manifest et les meta tags  
❌ **Service Worker non actif** : Vérifiez la console pour les erreurs  
❌ **Icônes manquantes** : Vérifiez que les fichiers SVG existent  
❌ **Mode navigateur** : Vérifiez que `display: "standalone"` est dans le manifest  

### 7. **URLs de test**
- Application principale : `http://localhost:4173`
- Tests PWA : `http://localhost:4173/test-pwa.html`
- Manifest : `http://localhost:4173/manifest.webmanifest`
- Service Worker : `http://localhost:4173/sw.js`

## 🎯 Résultat attendu

Si tout fonctionne, vous devriez voir :
- Une icône d'installation dans la barre d'adresse
- L'application s'installe comme une vraie app
- Fonctionne hors ligne (après premier chargement)
- Icônes et nom corrects sur l'écran d'accueil
