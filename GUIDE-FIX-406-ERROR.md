# 🚨 **Correction de l'erreur 406 - Table professional_profiles manquante**

## **Problème :**
```
GET https://nxosknsfjxvzcdljekpo.supabase.co/rest/v1/professional_profiles?select=*&user_id=eq.9d3460e2-0bd0-4548-8047-30abd2488ad5 406 (Not Acceptable)
```

## **Cause :**
La table `professional_profiles` n'existe pas dans votre base de données Supabase.

## **🔧 Solution rapide :**

### **Étape 1 : Ouvrir le dashboard Supabase**
1. Allez sur [supabase.com](https://supabase.com)
2. Connectez-vous à votre projet
3. Allez dans **SQL Editor**

### **Étape 2 : Exécuter le script de correction**
Copiez et collez ce code dans l'éditeur SQL :

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

### **Étape 3 : Vérifier la création**
Exécutez cette requête pour vérifier :

```sql
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'professional_profiles';
```

### **Étape 4 : Tester l'application**
1. **Rechargez** votre application
2. **Inscrivez-vous** comme professionnel
3. **Validez un SIRET** (ex: 77567146400013)
4. **Vérifiez le profil** - les informations doivent s'afficher

## **✅ Résultat attendu :**

- ✅ **Table créée** : `professional_profiles`
- ✅ **Politiques configurées** : RLS activé
- ✅ **Données sauvegardées** : SIRET, entreprise, profession
- ✅ **Profil affiché** : Informations professionnelles visibles

## **🔍 Vérification finale :**

Dans le **Table Editor** de Supabase, vous devriez voir :
- Table `professional_profiles` avec les colonnes :
  - `id`, `user_id`, `company_name`, `siret`, `category`, etc.

**Une fois cette correction appliquée, votre application fonctionnera parfaitement !** 🎉
