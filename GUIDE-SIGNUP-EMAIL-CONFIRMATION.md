# 📧 Guide : Configuration de la confirmation par email

## 🔍 **Problème identifié**

L'URL `/auth/v1/signup` indique que Supabase appelle l'API d'inscription. Si Supabase est configuré pour exiger une confirmation par email, l'utilisateur n'aura pas de session immédiatement après l'inscription.

## ✅ **Solutions**

### **Option 1 : Désactiver la confirmation par email (Développement)**

Si vous êtes en développement et voulez que l'inscription fonctionne immédiatement :

1. **Dashboard Supabase** → **Authentication** → **Settings**
2. **Désactivez** "Enable email confirmations"
3. **Sauvegardez** les modifications

### **Option 2 : Gérer la confirmation par email (Production)**

Si vous gardez la confirmation par email activée, modifiez le code pour gérer ce cas :

```typescript
const signUp = async (...) => {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        full_name: fullName,
        user_type: userType
      }
    }
  });
  
  if (error) throw error;
  
  // Si email confirmation est requis, data.session sera null
  if (!data.session) {
    // Afficher un message à l'utilisateur
    throw new Error('Un email de confirmation a été envoyé. Veuillez vérifier votre boîte mail.');
  }
  
  // Si session existe, continuer normalement
  // ...
};
```

### **Option 3 : Vérifier la configuration Supabase**

1. **Dashboard Supabase** → **Authentication** → **Settings**
2. **Vérifiez** :
   - ✅ "Enable email confirmations" - activé ou désactivé ?
   - ✅ "Site URL" - est-ce correct ?
   - ✅ "Redirect URLs" - contient votre URL de redirection

## 🔧 **Pour un développement rapide**

**Désactivez la confirmation par email** temporairement :

1. Dashboard Supabase → **Authentication** → **Settings**
2. **Désactivez** "Enable email confirmations"
3. **Sauvegardez**
4. **Testez** l'inscription

## 📝 **Vérification dans les logs**

Dans le Dashboard Supabase → **Logs** → **Auth Logs**, vous verrez :
- Si l'email de confirmation est envoyé
- Si l'utilisateur est créé mais non confirmé
- Les erreurs éventuelles

## ✅ **Résultat attendu**

Après avoir configuré la confirmation par email :
- ✅ Si désactivée : L'inscription fonctionne immédiatement avec session
- ✅ Si activée : L'utilisateur reçoit un email et doit confirmer avant d'avoir une session

