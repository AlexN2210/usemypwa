# 🚀 **Déploiement des migrations Supabase**

## **Commandes à exécuter dans votre terminal :**

### **1. Se connecter à Supabase :**
```bash
cd project
npx supabase login
```
*Suivez les instructions pour vous connecter via le navigateur*

### **2. Lier votre projet :**
```bash
npx supabase link --project-ref nxosknsfjxvzcdljekpo
```
*Remplacez par votre vrai project-ref si différent*

### **3. Pousser les migrations :**
```bash
npx supabase db push
```

### **4. Vérifier les tables créées :**
```bash
npx supabase db diff
```

## **Alternative manuelle :**

Si les commandes CLI ne fonctionnent pas, utilisez le **SQL Editor** dans le dashboard Supabase :

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **SQL Editor**
4. Copiez et exécutez le contenu de `fix-professional-profiles.sql`

## **✅ Résultat attendu :**

Après le déploiement, vous devriez voir dans le **Table Editor** :
- ✅ `profiles`
- ✅ `professional_profiles` 
- ✅ `matches`
- ✅ `posts`
- ✅ `qr_scans`
- ✅ `filters_preferences`

**Une fois les migrations appliquées, votre application PWA fonctionnera parfaitement !** 🎉
