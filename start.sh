#!/bin/bash

echo "========================================"
echo "  Transport Driver - Application Chauffeur"
echo "========================================"
echo ""
echo "Démarrage de l'application..."
echo ""

# Vérifier si Node.js est installé
if ! command -v node &> /dev/null; then
    echo "ERREUR: Node.js n'est pas installé!"
    echo "Veuillez installer Node.js depuis https://nodejs.org/"
    exit 1
fi

# Vérifier si npm est installé
if ! command -v npm &> /dev/null; then
    echo "ERREUR: npm n'est pas installé!"
    exit 1
fi

# Installer les dépendances si nécessaire
if [ ! -d "node_modules" ]; then
    echo "Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERREUR: Échec de l'installation des dépendances!"
        exit 1
    fi
fi

echo ""
echo "Démarrage de l'application Expo..."
echo ""
echo "Options disponibles:"
echo "1. Android"
echo "2. iOS (nécessite macOS)"
echo "3. Web"
echo "4. Tunnel (pour test sur appareil physique)"
echo ""

read -p "Choisissez une option (1-4): " choice

case $choice in
    1)
        echo "Démarrage pour Android..."
        npm run android
        ;;
    2)
        echo "Démarrage pour iOS..."
        npm run ios
        ;;
    3)
        echo "Démarrage pour Web..."
        npm run web
        ;;
    4)
        echo "Démarrage en mode tunnel..."
        npx expo start --tunnel
        ;;
    *)
        echo "Option invalide!"
        exit 1
        ;;
esac

echo ""
echo "Application démarrée!"
echo ""
