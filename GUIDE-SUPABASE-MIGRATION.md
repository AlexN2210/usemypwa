# Guide d'application de la migration Supabase

## 🚨 **Problème identifié :**

L'erreur 406 indique que la table `professional_profiles` n'existe pas dans votre base de données Supabase.

## 🔧 **Solution :**

### **1. Appliquer la migration :**

```bash
# Se connecter à Supabase
npx supabase login

# Appliquer la migration
npx supabase db push

# Ou appliquer manuellement via le dashboard Supabase
```

### **2. Vérifier les tables :**

Dans le dashboard Supabase :
1. Allez dans **Table Editor**
2. Vérifiez que ces tables existent :
   - `profiles`
   - `professional_profiles`
   - `matches`
   - `posts`
   - `qr_scans`
   - `filters_preferences`

### **3. Appliquer manuellement (si nécessaire) :**

Si la migration ne fonctionne pas, exécutez ce SQL dans le **SQL Editor** de Supabase :

```sql
-- Créer la table professional_profiles
CREATE TABLE IF NOT EXISTS professional_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
  company_name text,
  siret text,
  website text,
  category text,
  tags text[] DEFAULT '{}',
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Activer RLS
ALTER TABLE professional_profiles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques
CREATE POLICY "Anyone can view professional profiles"
  ON professional_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Professionals can update own profile"
  ON professional_profiles FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Professionals can insert own profile"
  ON professional_profiles FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
```

### **4. Vérifier les permissions :**

Assurez-vous que :
- ✅ **RLS est activé** sur toutes les tables
- ✅ **Politiques sont créées** pour les accès
- ✅ **Extensions sont installées** (uuid-ossp, postgis)

### **5. Test de l'application :**

Après avoir appliqué la migration :
1. **Inscription** : Créez un compte professionnel
2. **Validation SIRET** : Entrez un SIRET réel
3. **Profil** : Vérifiez l'affichage des informations

## ✅ **Résultat attendu :**

- ✅ **Table `professional_profiles`** créée
- ✅ **Politiques RLS** configurées
- ✅ **Données SIRET** sauvegardées
- ✅ **Profil professionnel** affiché

**Une fois la migration appliquée, l'application fonctionnera parfaitement !** 🎉
