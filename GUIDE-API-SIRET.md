# Guide de configuration de l'API SIRET INSEE

## 🔧 Configuration requise

L'API SIRET utilise maintenant l'API INSEE officielle avec vos identifiants :

### 1. Identifiants configurés

✅ **Client ID** : `abfefc1a-52b5-4394-b750-7ca4a9ed2b93`  
✅ **Client Secret** : `abfefc1a-52b5-4394-b750-7ca4a9ed2b93`  
✅ **URL API** : `https://api.insee.fr/api-sirene/3.11`

### 2. Authentification automatique

L'application gère automatiquement :
- ✅ **OAuth2** avec client credentials
- ✅ **Token d'accès** automatique
- ✅ **Renouvellement** du token si nécessaire

### 3. Aucune configuration supplémentaire requise

L'application est prête à utiliser l'API INSEE officielle !

## 🚀 Fonctionnement

### Mode API gouvernementale (avec token)
- ✅ Validation réelle des SIRET
- ✅ Données officielles des entreprises
- ✅ Informations complètes (nom, adresse, activité)

### Mode simulation (sans token)
- ⚠️ Validation simulée pour le développement
- ⚠️ Données fictives
- ⚠️ SIRET de test : `12345678901234`

## 🔍 Test de l'API

### SIRET de test valides :
- `12345678901234` (simulation)
- `12345678901235` (simulation)
- Tout SIRET commençant par `123` (simulation)

### SIRET réels (avec token API) :
- Utilisez des SIRET d'entreprises réelles
- L'API retournera les vraies données

## ⚠️ Limitations

- **Rate limiting** : L'API gouvernementale a des limites de requêtes
- **Token requis** : Sans token, le système utilise la simulation
- **Données en temps réel** : Les données peuvent être mises à jour avec un délai

## 🛠️ Dépannage

### Erreur "Token API invalide"
- Vérifiez que votre token est correct
- Vérifiez que le fichier `.env.local` existe
- Redémarrez l'application

### Erreur "SIRET non trouvé"
- Vérifiez que le SIRET est correct (14 chiffres)
- Vérifiez que l'entreprise existe encore
- Testez avec un SIRET de test

### Mode simulation activé
- Normal si vous n'avez pas configuré de token
- Les données affichées sont fictives
- Configurez un token pour utiliser l'API réelle
