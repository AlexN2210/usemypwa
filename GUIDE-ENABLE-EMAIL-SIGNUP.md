# 🔧 Guide : Activer l'inscription par email dans Supabase

## 🚨 **Problème**

Erreur lors de l'inscription :
```
Email signups are disabled
```

## ✅ **Solution : Activer l'inscription par email**

### **Étape 1 : Ouvrir les paramètres d'authentification**

1. **Connectez-vous** à [supabase.com](https://supabase.com)
2. **Sélectionnez** votre projet : `neucmsawqhaglkuxsfag`
3. Allez dans **Authentication** → **Settings** (ou **Providers**)

### **Étape 2 : Activer l'inscription par email**

1. **Trouvez** la section **"Email"** ou **"Email Provider"**
2. **Activez** l'option :
   - ✅ **"Enable email signups"** ou
   - ✅ **"Enable email provider"** ou
   - ✅ **"Allow email signups"**

3. **Sauvegardez** les modifications

### **Étape 3 : Vérifier les autres paramètres**

Assurez-vous que :
- ✅ **"Enable email confirmations"** - peut être activé ou désactivé selon vos besoins
  - Si **activé** : L'utilisateur doit confirmer son email avant de se connecter
  - Si **désactivé** : L'utilisateur peut se connecter immédiatement après l'inscription

### **Étape 4 : Configurer les URLs de redirection**

1. Dans **Authentication** → **URL Configuration**
2. **Ajoutez** votre URL de production :
   - `https://usemypwa.vercel.app`
   - `https://usemypwa.vercel.app/**` (pour toutes les routes)

3. **Site URL** : `https://usemypwa.vercel.app`

### **Étape 5 : Test de l'inscription**

Après avoir activé l'inscription par email :

1. **Testez** l'inscription dans votre application
2. **Vérifiez** que l'erreur "Email signups are disabled" a disparu

## 📋 **Paramètres recommandés pour le développement**

- ✅ **Enable email signups** : **ACTIVÉ**
- ⚠️ **Enable email confirmations** : **DÉSACTIVÉ** (pour tester rapidement)
- ✅ **Site URL** : Votre URL de production ou `http://localhost:5173` pour le dev

## 📋 **Paramètres recommandés pour la production**

- ✅ **Enable email signups** : **ACTIVÉ**
- ✅ **Enable email confirmations** : **ACTIVÉ** (sécurité)
- ✅ **Site URL** : `https://usemypwa.vercel.app`

## ✅ **Résultat attendu**

Après avoir activé l'inscription par email :
- ✅ Plus d'erreur "Email signups are disabled"
- ✅ L'inscription fonctionne correctement
- ✅ Les utilisateurs peuvent créer un compte

## 🚨 **Si le problème persiste**

1. **Vérifiez** que vous êtes bien dans le bon projet Supabase
2. **Vérifiez** que les modifications ont été sauvegardées
3. **Attendez** quelques secondes pour que les changements prennent effet
4. **Rechargez** votre application

