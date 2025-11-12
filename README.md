# Transport Driver - Application Chauffeur

Application mobile React Native Expo pour les chauffeurs du système de transport urbain.

## 🚀 Fonctionnalités

### 🔐 Authentification
- Connexion/Déconnexion
- Inscription avec vérification email
- Réinitialisation de mot de passe
- Gestion du profil

### 📊 Dashboard
- Statistiques en temps réel
- Tickets validés du jour
- Paiements Wave et espèces
- Tentatives de fraude
- Gestion des véhicules assignés

### 🎫 Gestion des Tickets
- Scanner QR codes des tickets
- Validation automatique
- Confirmation paiements espèces
- Historique des validations

### 🚌 Réservations
- Liste des réservations du chauffeur
- Acceptation/Refus des réservations
- Gestion des statuts
- Notifications temps réel

### 🗺️ Carte Interactive
- Affichage des lignes de transport
- Position des véhicules en temps réel
- Sélection de véhicule
- Contrôle GPS

### 📱 Notifications
- Notifications push temps réel
- Nouvelles réservations
- Alertes système
- Gestion des notifications

## 🛠️ Technologies

- **React Native** avec **Expo**
- **JavaScript** (pas de TypeScript)
- **React Navigation** pour la navigation
- **Expo Camera** pour le scanner QR
- **Expo Location** pour le GPS
- **React Native Maps** pour la carte
- **Socket.IO** pour les WebSockets
- **AsyncStorage** pour le stockage local

## 📦 Installation

1. **Cloner le projet**
```bash
git clone <repository-url>
cd Transport_Driver
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Démarrer l'application**
```bash
# Pour Android
npm run android

# Pour iOS
npm run ios

# Pour le web
npm run web
```

## 🔧 Configuration

### Variables d'environnement
L'application se connecte automatiquement au backend via l'IP locale détectée par Expo.

### Permissions
- **Localisation** : Nécessaire pour le tracking GPS
- **Caméra** : Nécessaire pour scanner les QR codes
- **Notifications** : Pour les alertes temps réel

## 📱 Écrans

### Authentification
- `Login.js` - Connexion
- `Register.js` - Inscription
- `PasswordForgot.js` - Mot de passe oublié
- `PasswordReset.js` - Réinitialisation

### Dashboard
- `Home.js` - Tableau de bord principal
- `Notifications.js` - Gestion des notifications

### Tickets
- `TicketList.js` - Liste des tickets validés
- `TicketDetail.js` - Détails d'un ticket
- `TicketScanner.js` - Scanner QR

### Réservations
- `ReservationList.js` - Liste des réservations
- `ReservationDetail.js` - Détails d'une réservation

### Carte
- `MapView.js` - Carte interactive avec véhicules

### Profil
- `GetProfil.js` - Affichage du profil
- `EditProfil.js` - Modification du profil

## 🔄 Services

### API Services
- `auth.js` - Authentification
- `tickets.js` - Gestion des tickets
- `reservations.js` - Gestion des réservations
- `vehicles.js` - Gestion des véhicules
- `dashboard.js` - Données du dashboard
- `notifications.js` - Gestion des notifications

### Services Spécialisés
- `websocket.js` - Connexion WebSocket temps réel
- `gpsTracking.js` - Tracking GPS automatique
- `storage.js` - Stockage local

## 🎯 Contextes

- `AuthContext` - Gestion de l'authentification
- `TicketContext` - Gestion des tickets
- `NotificationContext` - Gestion des notifications
- `GpsContext` - Gestion du GPS

## 🚀 Fonctionnalités Avancées

### Tracking GPS Automatique
- Envoi automatique de la position toutes les 2 secondes
- Activation/Désactivation par véhicule
- Gestion des permissions de localisation

### WebSockets Temps Réel
- Notifications instantanées
- Mise à jour du dashboard
- Communication bidirectionnelle

### Scanner QR
- Scanner de codes QR pour validation des tickets
- Gestion des erreurs de validation
- Interface utilisateur intuitive

## 📱 Navigation

L'application utilise une navigation par onglets avec des stacks pour chaque section :

- **Dashboard** : Accueil + Notifications
- **Tickets** : Liste + Détails + Scanner
- **Réservations** : Liste + Détails
- **Carte** : Vue carte unique
- **Profil** : Affichage + Modification

## 🔒 Sécurité

- Authentification JWT
- Stockage sécurisé des tokens
- Validation des permissions
- Gestion des erreurs

## 📊 Performance

- Optimisation des re-renders
- Gestion intelligente du cache
- Tracking GPS optimisé
- WebSockets efficaces

## 🐛 Débogage

Pour déboguer l'application :

1. **Logs de développement**
```bash
npx expo start --dev-client
```

2. **Inspecteur de réseau**
- Utiliser les outils de développement Expo
- Vérifier les appels API dans la console

3. **GPS Debug**
- Vérifier les permissions de localisation
- Tester sur un appareil physique

## 📝 Notes

- L'application est conçue pour fonctionner avec le backend Transport_Back
- Tous les endpoints sont configurés dans `constants.js`
- Le tracking GPS fonctionne uniquement sur appareil physique
- Les notifications nécessitent une configuration push

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature
3. Commit les changements
4. Push vers la branche
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier LICENSE pour plus de détails.
