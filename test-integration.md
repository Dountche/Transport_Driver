# Test d'intégration - Carte Driver

## Étapes de test

### 1. Installation des dépendances
```bash
cd Transport_Driver
npm install
```

### 2. Configuration des permissions
- Vérifier que les permissions de localisation sont accordées
- Vérifier que les permissions de caméra sont accordées

### 3. Test de la carte
1. Ouvrir l'application
2. Aller dans l'onglet "Carte"
3. Vérifier que la carte s'affiche correctement
4. Vérifier que les contrôles sont visibles (Routes, Actualiser, Véhicules, Ma position)

### 4. Test de sélection de véhicule
1. Cliquer sur "Véhicules" dans les contrôles
2. Vérifier que la liste des véhicules assignés s'affiche
3. Sélectionner un véhicule
4. Vérifier que le bouton GPS apparaît
5. Activer/désactiver le GPS

### 5. Test du tracking GPS
1. Sélectionner un véhicule avec GPS activé
2. Cliquer sur "Démarrer le tracking"
3. Vérifier que le tracking démarre
4. Vérifier que les positions sont envoyées toutes les 10 secondes
5. Vérifier que la position du chauffeur s'affiche sur la carte

### 6. Test de la position en temps réel
1. Cliquer sur "Ma position" dans les contrôles
2. Vérifier que la position actuelle s'affiche
3. Vérifier que le marqueur du chauffeur apparaît sur la carte

## Points à vérifier

- [ ] La carte s'affiche correctement
- [ ] Les véhicules assignés au chauffeur sont récupérés
- [ ] La sélection de véhicule fonctionne
- [ ] Le GPS peut être activé/désactivé
- [ ] Le tracking GPS envoie les positions toutes les 10 secondes
- [ ] La position du chauffeur s'affiche en temps réel
- [ ] Les lignes et arrêts s'affichent sur la carte
- [ ] Les contrôles de la carte fonctionnent

## Problèmes potentiels

1. **Véhicules non affichés** : Vérifier que le chauffeur a des véhicules assignés en base
2. **GPS ne démarre pas** : Vérifier les permissions de localisation
3. **Positions non envoyées** : Vérifier la connexion au backend
4. **Carte ne s'affiche pas** : Vérifier que react-native-maps est correctement installé

