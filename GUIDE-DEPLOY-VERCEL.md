# Guide de déploiement sur Vercel

## 🚀 Déploiement optimisé

### **Problèmes résolus :**

1. **Conflit de lock files** : Supprimé `package-lock.json`
2. **Configuration Vercel** : Ajouté `vercel.json`
3. **Fichiers ignorés** : Ajouté `.vercelignore`

### **Configuration Vercel :**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/manifest.webmanifest",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### **Fichiers ignorés :**

- `node_modules`
- Fichiers de cache
- Fichiers de logs
- Fichiers temporaires
- Documentation

### **Commandes de déploiement :**

```bash
# 1. Installer Vercel CLI
npm i -g vercel

# 2. Se connecter
vercel login

# 3. Déployer
vercel --prod

# 4. Ou déployer depuis GitHub
# Connecter le repo GitHub à Vercel
```

### **Variables d'environnement :**

Si vous utilisez Supabase, ajoutez dans Vercel :

```
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **✅ Fonctionnalités PWA :**

- ✅ **Service Worker** : Cache optimisé
- ✅ **Manifest** : Installation sur mobile
- ✅ **Headers** : Cache approprié
- ✅ **SPA Routing** : Redirection vers index.html

### **🔧 Optimisations :**

- **Build** : `npm run build` (plus rapide que yarn)
- **Cache** : Service Worker avec Workbox
- **Headers** : Cache approprié pour PWA
- **Routing** : SPA avec redirection

**Votre PWA est maintenant prête pour le déploiement sur Vercel !** 🎉
