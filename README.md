# Antiquités Marketplace

Un site web de marketplace d'antiquités avec système de validation administrative et un design moderne et élégant.

## 🎨 Design & Interface

### Thème visuel
- **Palette de couleurs** : Tons chauds inspirés du bois ancien (marron #8B4513, orange #D2691E)
- **Typographie** : Georgia et Playfair Display pour une élégance classique
- **Style** : Design moderne avec des éléments vintage, cartes avec ombres, animations fluides

### Fonctionnalités visuelles
- ✨ **Animations** : Effets de fade-in, hover, et transitions fluides
- 📱 **Responsive** : Adaptation parfaite mobile, tablette et desktop
- 🖼️ **Prévisualisation** : Aperçu des images avant upload
- 🎯 **UX/UI** : Interface intuitive avec iconographie Font Awesome
- 🔔 **Notifications** : Système de toasts pour les messages

## 🎯 Fonctionnalités

### Pour les utilisateurs :
- ✅ Inscription et connexion sécurisées
- ✅ Création d'annonces avec titre, description et photo
- ✅ Tableau de bord personnel avec statistiques
- ✅ Visualisation des antiquités validées sur l'accueil
- ✅ Interface moderne et intuitive

### Pour l'administrateur :
- ✅ Panel d'administration élégant
- ✅ Validation ou refus des annonces
- ✅ Définition des prix lors de la validation
- ✅ Statistiques en temps réel
- ✅ Gestion complète du contenu

## 🚀 Installation

1. **Cloner ou télécharger le projet**
```bash
cd Antiquités-marketplace
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Initialiser la base de données**
```bash
npm run init-db
```

4. **Démarrer le serveur**
```bash
npm start
```

5. **Accéder au site**
Ouvrez votre navigateur et allez à : `http://localhost:3001`

## 👤 Comptes de test

### Administrateur
- **Email :** admin@antiquites.com
- **Mot de passe :** Admin2024!SecurePass

### Utilisateur normal
Créez un compte via la page d'inscription

## 📁 Structure du projet

```
Antiquités-marketplace/
├── database/           # Base de données SQLite
├── public/            # Fichiers statiques
│   ├── css/           # Styles CSS personnalisés
│   ├── js/            # JavaScript interactif
│   └── uploads/       # Images uploadées
├── views/             # Templates EJS avec design moderne
├── scripts/           # Scripts utilitaires
├── server.js          # Serveur principal
└── package.json       # Configuration Node.js
```

## 🎨 Éléments de design

### Couleurs
- **Primaire** : #8B4513 (Saddle Brown)
- **Secondaire** : #D2691E (Chocolate)
- **Succès** : #28A745
- **Warning** : #FFC107
- **Danger** : #DC3545

### Composants stylisés
- **Hero Section** : Bannière avec gradient et effets visuels
- **Cards** : Cartes d'annonces avec ombres et animations hover
- **Formulaires** : Inputs stylisés avec validation visuelle
- **Boutons** : Effets ripple et animations
- **Navigation** : Menu responsive avec transitions

## 🔄 Workflow d'une annonce

1. **Création :** L'utilisateur crée une annonce avec titre, description et photo optionnelle
2. **Soumission :** L'annonce passe en statut "En attente" 
3. **Validation admin :** L'administrateur examine l'annonce et :
   - ✅ **Valide** avec un prix → L'annonce apparaît sur l'accueil
   - ❌ **Refuse** → L'annonce est rejetée
4. **Publication :** Les annonces validées sont visibles par tous avec design attractif

## 🛠️ Technologies utilisées

### Backend
- **Node.js** + **Express** - Serveur web
- **SQLite3** - Base de données
- **EJS** - Moteur de templates
- **Multer** - Upload de fichiers
- **bcryptjs** - Sécurité des mots de passe
- **express-session** - Gestion des sessions

### Frontend
- **CSS3** - Design personnalisé moderne
- **JavaScript ES6** - Interactivité et animations
- **Font Awesome 6** - Iconographie
- **Google Fonts** - Typographie élégante
- **Responsive Design** - Compatible tous appareils

## 📝 Scripts disponibles

- `npm start` - Démarrer le serveur
- `npm run dev` - Démarrer en mode développement (avec nodemon)
- `npm run init-db` - Initialiser la base de données

## 🎨 Fonctionnalités avancées de design

### Animations et Effets
- Transition smooth entre les pages
- Effet parallax sur la hero section
- Animation des cartes au scroll
- Effet ripple sur les boutons
- Hover effects sur les éléments interactifs

### Responsive Design
- Grid system flexible
- Adaptation mobile-first
- Menu burger responsive
- Images optimisées selon la taille d'écran

### Accessibilité
- Contraste de couleurs optimisé
- Navigation au clavier
- Labels ARIA appropriés
- Focus states visibles

---

**Développé avec passion pour créer une expérience utilisateur exceptionnelle dans le domaine des antiquités** 🏺✨
