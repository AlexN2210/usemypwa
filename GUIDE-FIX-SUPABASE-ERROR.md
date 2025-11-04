# 🔧 Guide de résolution - Erreur Supabase ERR_NAME_NOT_RESOLVED

## 🚨 **Problème identifié**

Votre application ne peut pas se connecter à Supabase avec l'erreur :
```
net::ERR_NAME_NOT_RESOLVED
nxosknsfjxvzcdljekpo.supabase.co
```

## ✅ **Solution : Configurer les variables d'environnement**

### **Étape 1 : Créer le fichier `.env.local`**

Dans le dossier `project/`, créez un fichier `.env.local` avec ce contenu :

```env
VITE_SUPABASE_URL=https://nxosknsfjxvzcdljekpo.supabase.co
VITE_SUPABASE_ANON_KEY=votre-clé-anon-ici
```

### **Étape 2 : Trouver vos clés Supabase**

1. **Connectez-vous** à [supabase.com](https://supabase.com)
2. **Sélectionnez** votre projet (ou créez-en un)
3. Allez dans **Settings** → **API**
4. **Copiez** :
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### **Étape 3 : Formater l'URL correctement**

L'URL doit être au format :
```
https://votre-projet-ref.supabase.co
```

**⚠️ Important :**
- ✅ **Bon** : `https://nxosknsfjxvzcdljekpo.supabase.co`
- ❌ **Mauvais** : `nxosknsfjxvzcdljekpo.supabase.co` (sans `https://`)
- ❌ **Mauvais** : `http://nxosknsfjxvzcdljekpo.supabase.co` (utilisez `https://`)

### **Étape 4 : Reconstruire l'application**

Après avoir créé/modifié `.env.local`, **reconstruisez** l'application :

```bash
cd project
npm run build
npm run preview
```

## 🔍 **Vérifications**

### **1. Vérifier que le fichier existe**
```bash
# Dans le dossier project/
cat .env.local
```

Vous devriez voir :
```
VITE_SUPABASE_URL=https://...
VITE_SUPABASE_ANON_KEY=eyJ...
```

### **2. Vérifier dans la console**
Ouvrez la console du navigateur (F12) et vérifiez qu'il n'y a plus d'erreur `ERR_NAME_NOT_RESOLVED`.

### **3. Tester la connexion**
L'application devrait maintenant pouvoir :
- Se connecter à Supabase
- Charger les données
- Authentifier les utilisateurs

## 🚨 **Si le problème persiste**

### **Vérifier votre connexion Internet**
```bash
# Tester si Supabase est accessible
curl https://nxosknsfjxvzcdljekpo.supabase.co
```

### **Vérifier que votre projet Supabase est actif**
1. Allez sur [supabase.com](https://supabase.com)
2. Vérifiez que votre projet est **actif** (pas en pause)
3. Vérifiez que le projet existe toujours

### **Vérifier les variables d'environnement**
Dans la console du navigateur, vérifiez que les variables sont bien chargées :
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

## 📝 **Exemple de fichier `.env.local` complet**

```env
# Configuration Supabase
VITE_SUPABASE_URL=https://nxosknsfjxvzcdljekpo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im54b3Nrbjm6amV4cG8iLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2ODAwMCwiZXhwIjoxOTU0NTQ0MDAwfQ.exemple-clé-anon
```

## ✅ **Résultat attendu**

Après avoir configuré `.env.local` et reconstruit l'application :
- ✅ Plus d'erreur `ERR_NAME_NOT_RESOLVED`
- ✅ L'application se connecte à Supabase
- ✅ L'authentification fonctionne
- ✅ Les données se chargent correctement

## 🎯 **Pour la production (Vercel)**

Si vous déployez sur Vercel, ajoutez les variables d'environnement dans :
1. **Vercel Dashboard** → **Votre projet** → **Settings** → **Environment Variables**
2. Ajoutez :
   - `VITE_SUPABASE_URL` = `https://nxosknsfjxvzcdljekpo.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `votre-clé-anon`

**Important** : Redéployez après avoir ajouté les variables !

