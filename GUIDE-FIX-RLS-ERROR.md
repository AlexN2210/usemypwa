# 🔧 Guide : Résoudre l'erreur RLS "new row violates row-level security policy"

## 🚨 **Problème**

Erreur lors de l'inscription :
```
new row violates row-level security policy for table "profiles"
```

## ✅ **Solution : Corriger les politiques RLS**

### **Étape 1 : Exécuter le script de correction**

1. **Ouvrez** le SQL Editor de Supabase
2. **Exécutez** le script `fix-rls-policies.sql`

Ce script va :
- ✅ Supprimer les anciennes politiques
- ✅ Recréer les politiques RLS correctement
- ✅ Vérifier que tout est en ordre

### **Étape 2 : Vérifier que les politiques sont correctes**

Après avoir exécuté le script, vérifiez :

```sql
SELECT 
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

Vous devriez voir :
- `Users can view all profiles` (SELECT) - `with_check = NULL` ✅
- `Users can update own profile` (UPDATE) - `with_check = '(auth.uid() = id)'` ✅
- `Users can insert own profile` (INSERT) - `with_check = '(auth.uid() = id)'` ✅

### **Étape 3 : Alternative - Utiliser un trigger pour créer le profil**

Si le problème persiste, on peut créer le profil automatiquement via un trigger :

```sql
-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, user_type)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Utilisateur'),
    COALESCE((NEW.raw_user_meta_data->>'user_type')::user_type, 'individual')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer le profil automatiquement
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Note** : Cette approche nécessite de passer `full_name` et `user_type` dans les métadonnées lors de l'inscription.

### **Étape 4 : Modifier le code pour utiliser les métadonnées (si trigger)**

Si vous utilisez le trigger, modifiez `AuthContext.tsx` :

```typescript
const signUp = async (...) => {
  const { data, error } = await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      data: {
        full_name: fullName,
        user_type: userType
      }
    }
  });
  // Le profil sera créé automatiquement par le trigger
};
```

### **Étape 5 : Solution temporaire - Désactiver RLS (DÉCONSEILLÉ)**

⚠️ **Ne faites cela que pour tester** :

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Puis réactivez-le après les tests :
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

## 🔍 **Vérifications**

### **1. Vérifier que RLS est activé**
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'profiles';
```

### **2. Vérifier les politiques**
```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### **3. Tester l'insertion manuellement**
```sql
-- Remplacez par un vrai user_id
SELECT auth.uid(); -- Vérifier que vous êtes authentifié
```

## ✅ **Résultat attendu**

Après avoir exécuté `fix-rls-policies.sql` :
- ✅ Les politiques RLS sont correctement configurées
- ✅ L'inscription fonctionne sans erreur RLS
- ✅ Les profils sont créés correctement

## 🚨 **Si le problème persiste**

1. **Vérifiez** que l'utilisateur est bien authentifié au moment de l'insertion
2. **Vérifiez** les logs Supabase : Dashboard → Logs → Postgres Logs
3. **Testez** avec un utilisateur de test pour isoler le problème
4. **Considérez** l'utilisation d'un trigger automatique (solution plus robuste)

