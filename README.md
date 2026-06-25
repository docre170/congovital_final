# CongoVital - Application Web de Santé

##  Description

CongoVital est une application web complète de sensibilisation, gestion hospitalière et prise de rendez-vous. Elle offre une plateforme intuitive pour les patients et les professionnels de santé.

##  Fonctionnalités

### Pages Publiques
- **Accueil (index.html)** - Page d'accueil avec présentation des services
- **Services (services.html)** - Catalogue complet des services médicaux
- **Prévention (prevention.html)** - Guide de santé et conseils de prévention
- **Contact (contact.html)** - Formulaire de contact et informations

### Pages d'Authentification
- **Inscription (inscription.html)** - Création de compte utilisateur
- **Connexion (abonne.html)** - Espace de connexion

### Pages Utilisateur
- **Tableau de Bord (dashboard.html)** - Espace personnel avec :
  - Aperçu de la santé
  - Gestion des rendez-vous
  - Historique médical
  - Prescriptions
  - Messages
  - Paramètres du compte

- **Prise de Rendez-vous (appointment.html)** - Formulaire multi-étapes pour réserver une consultation

##  Structure du Projet

```
congovital/
├── frontend/
│   ├── html/
│   │   ├── index.html
│   │   ├── services.html
│   │   ├── prevention.html
│   │   ├── contact.html
│   │   ├── inscription.html
│   │   ├── abonne.html
│   │   ├── appointment.html
│   │   
│   ├── css/
│   │   ├── common.css
│   │   ├── index.css
│   │   ├── service.css
│   │   ├── prevention.css
│   │   ├── contact.css
│   │   ├── auth.css
│   │   ├── appointment.css
│   │   └── dashboard.css
│   ├── js/
│   │   ├── appointment.js
│   │   └── dashboard.js
│   └── photos/
│       ├── logo.jpg
│       ├── docteur.jpg
│       ├── consultation.jpg
│       ├── vaccination.jpg
│       ├── maternite.jpg
│       ├── prevention.jpg
│       ├── pediatrie.jpg
│       ├── pharmacie.jpg
│       ├── infirmiere.jpg
│       └── consultation_gen.jpg
├── backend/
│   └── (À compléter selon vos besoins)
└── README.md
└── dashboard.php
```

##  Design et UX

- **Couleurs Principales** :
  - Vert primaire : #639871
  - Vert foncé : #014F31
  - Gris clair : #f8f9fa

- **Typographie** : Segoe UI, Tahoma, Geneva, Verdana, sans-serif

- **Responsive** : Optimisé pour desktop, tablette et mobile

##  Lancer le Projet

### Avec Python
```bash
cd congovital
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans votre navigateur.

### Avec Node.js (http-server)
```bash
cd congovital
npx http-server
```

### Avec VS Code Live Server
1. Ouvrir le dossier `congovital` dans VS Code
2. Clic droit sur `index.html` → "Open with Live Server"

##  Pages Disponibles

| Page | URL | Description |
|------|-----|-------------|
| Accueil | `/index.html` | Page d'accueil principale |
| Services | `/frontend/html/services.html` | Catalogue des services |
| Prévention | `/frontend/html/prevention.html` | Guide de santé |
| Contact | `/frontend/html/contact.html` | Formulaire de contact |
| Inscription | `/frontend/html/inscription.html` | Créer un compte |
| Connexion | `/frontend/html/abonne.html` | Espace abonné |
| Rendez-vous | `/frontend/html/appointment.html` | Réserver une consultation |
| Tableau de Bord | `/frontend/html/dashboard.html` | Espace personnel |

## Intégration Backend

Pour intégrer le backend :

1. **API Endpoints** à créer :
   - `POST /api/auth/register` - Inscription
   - `POST /api/auth/login` - Connexion
   - `GET /api/appointments` - Lister les rendez-vous
   - `POST /api/appointments` - Créer un rendez-vous
   - `PUT /api/appointments/:id` - Modifier un rendez-vous
   - `DELETE /api/appointments/:id` - Annuler un rendez-vous
   - `GET /api/user/profile` - Profil utilisateur
   - `GET /api/medical-history` - Historique médical
   - `GET /api/prescriptions` - Prescriptions

2. **Authentification** :
   - Utiliser JWT (JSON Web Tokens)
   - Stocker le token dans localStorage
   - Vérifier le token avant d'afficher le dashboard

3. **Base de Données** :
   - Utilisateurs
   - Rendez-vous
   - Historique médical
   - Prescriptions
   - Messages

##  Sécurité

- Valider tous les formulaires côté client et serveur
- Utiliser HTTPS en production
- Protéger les données sensibles
- Implémenter une authentification sécurisée
- Respecter la confidentialité des données médicales

##  Responsive Design

L'application est optimisée pour :
- Desktop (1200px+)
- Tablette (768px - 1199px)
- Mobile (< 768px)

##  Technologies Utilisées

- **Frontend** :
  - HTML5
  - CSS3 (avec Grid et Flexbox)
  - JavaScript vanilla
  - Bootstrap 5.3.0 (CDN)

- **Backend**  :
  - php
  - Base de données : MySQL
  - Authentification : JWT

##  Contact

Pour toute question ou support :
- Email : contact@congovital.cd
- Téléphone : +243 831996048

##  Licence

Tous droits réservés © 2026 CongoVital

##  Notes de Développement

- Les formulaires sont prêts pour l'intégration backend
- Les validations JavaScript sont en place
- Les styles sont modulaires et faciles à personnaliser
- Le code est bien commenté et structuré

##  Prochaines Étapes

1. Développer le backend API
2. Intégrer la base de données
3. Implémenter l'authentification
4. Ajouter les fonctionnalités de paiement
5. Déployer en production


