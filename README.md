# 🚗 RoadAssist Pro Frontend

RoadAssist Pro Frontend est l'interface utilisateur Progressive Web App (PWA) de la plateforme de gestion des missions d'assistance routière, offrant une expérience optimisée sur desktop, tablettes et mobiles.

## 📝 Description

RoadAssist Pro Frontend a été développé avec Angular, suivant les principes de conception modernes et une architecture modulaire robuste. Cette application PWA responsive offre une expérience utilisateur fluide, que ce soit pour les chargés d'assistance sur leur poste de travail ou pour les chauffeurs sur leurs appareils mobiles.

### Caractéristiques principales

- **Progressive Web App (PWA)** : Installation sur l'écran d'accueil, fonctionnalités hors ligne, et expérience proche d'une application native.
- **Interface responsive** : Adaptation automatique aux différentes tailles d'écran (desktop, tablette, mobile).
- **Dashboard interactif** : Tableau de bord avec statistiques et accès rapide aux missions.
- **Gestion complète des missions** : Création, attribution, suivi et archivage des interventions.
- **Capture média** : Fonctionnalités avancées pour la prise de photos géolocalisées.
- **Signatures électroniques** : Système de signatures numériques pour les chauffeurs et clients.
- **Mode hors ligne** : Synchronisation des données lorsque la connexion est rétablie.
- **Cartographie intégrée** : Visualisation des emplacements et calcul d'itinéraires.

## 🛠️ Stack Technique

- **Framework** : Angular 17+
- **PWA** : @angular/pwa pour les fonctionnalités Progressive Web App
- **UI Components** : Angular Material
- **State Management** : NgRx pour la gestion d'état
- **Styling** : SCSS avec une approche BEM (Block Element Modifier)
- **Responsive Design** : Flexbox et CSS Grid
- **Cartographie** : Intégration de Leaflet/OpenStreetMap
- **Tests** : Jasmine et Karma pour les tests unitaires, Cypress pour les tests e2e
- **Internationalisation** : Angular i18n
- **HTTP** : HttpClient avec intercepteurs pour JWT

## 🚀 Objectifs du projet

Le frontend de RoadAssist Pro a été conçu pour atteindre plusieurs objectifs :

- Offrir une interface intuitive et réactive pour les opérateurs et les chauffeurs
- Permettre l'accès aux fonctionnalités clés même en cas de connectivité limitée
- Optimiser les workflows pour réduire le temps de traitement des missions
- Faciliter la documentation des interventions avec un minimum d'effort
- Assurer une expérience utilisateur cohérente sur tous les appareils

## 🌱 Statut du projet

Le frontend RoadAssist Pro suit le même cycle de développement que le backend :

- **MVP 1.0** : Interface de base responsive avec fonctionnalités essentielles
- **Version 2.0** : Amélioration de l'UX, mode hors ligne avancé, optimisation des performances
- **Version 3.0** : Tableaux de bord avancés, rapports et analytics
- **Version 4.0** : Intelligence artificielle pour suggestions et optimisations

## 📋 Prérequis

Pour développer et exécuter ce projet, vous aurez besoin de :

- Node.js 18+ et npm/yarn
- Angular CLI 17+
- Un IDE moderne (VS Code recommandé avec extensions Angular)
- Un navigateur moderne (Chrome, Firefox, Edge)
- Un compte développeur pour les tests sur appareils mobiles (Android/iOS)

## 🏁 Démarrage rapide

```bash
# Cloner le dépôt
git clone https://github.com/votre-organisation/roadassist-pro-frontend.git
cd roadassist-pro-frontend

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm start

# L'application sera disponible sur http://localhost:4200
```

### Configuration de l'environnement

Le projet utilise des fichiers d'environnement pour gérer les différentes configurations :

```typescript
// src/environments/environment.ts (exemple)
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  mapboxToken: 'your_mapbox_token',
  version: '1.0.0-dev',
  enableDebug: true,
};
```

## 🔍 Architecture Frontend

RoadAssist Pro Frontend suit une architecture modulaire basée sur les fonctionnalités :

```
frontend/
├── src/
│   ├── app/
│   │   ├── core/                   # Services et fonctionnalités du cœur
│   │   │   ├── auth/               # Authentication et autorisation
│   │   │   ├── http/               # Intercepteurs HTTP
│   │   │   ├── guards/             # Guards pour le routing
│   │   │   └── services/           # Services globaux
│   │   ├── features/               # Modules fonctionnels
│   │   │   ├── missions/           # Gestion des missions
│   │   │   ├── users/              # Gestion des utilisateurs
│   │   │   └── dashboard/          # Tableau de bord
│   │   ├── shared/                 # Composants, directives et pipes partagés
│   │   │   ├── components/         # Composants réutilisables
│   │   │   ├── directives/         # Directives personnalisées
│   │   │   ├── pipes/              # Pipes personnalisés
│   │   │   └── models/             # Interfaces et classes partagées
│   │   ├── layouts/                # Composants de mise en page
│   │   │   ├── main-layout/        # Mise en page principale avec menu
│   │   │   └── auth-layout/        # Mise en page pour l'authentification
│   │   ├── store/                  # Store NgRx global
│   │   │   ├── auth/               # State d'authentification
│   │   │   ├── missions/           # State des missions
│   │   │   └── index.ts            # Export du store global
│   │   ├── app-routing.module.ts   # Configuration des routes
│   │   ├── app.module.ts           # Module principal
│   │   └── app.component.ts        # Composant racine
│   ├── assets/                     # Ressources statiques
│   ├── environments/               # Configuration par environnement
│   └── theme/                      # Styles globaux et thèmes
├── angular.json                    # Configuration Angular CLI
└── package.json                    # Dépendances NPM
```

### Principes architecturaux

- **Modulaire** : Chaque fonctionnalité majeure a son propre module
- **Lazy Loading** : Les modules sont chargés à la demande pour optimiser les performances
- **State Management** : Utilisation de NgRx pour les états complexes
- **Réutilisabilité** : Composants partagés dans le module `shared`
- **Séparation des préoccupations** : Services pour la logique métier, composants pour l'UI
- **Responsive First** : Conception mobile-first pour tous les composants

## 🎨 Guide de style et bonnes pratiques Frontend

### Convention de nommage

- **Fichiers** : kebab-case (ex: `mission-list.component.ts`)
- **Classes** : PascalCase (ex: `MissionListComponent`)
- **Variables/Propriétés** : camelCase (ex: `currentMission`)
- **Constantes** : UPPER_SNAKE_CASE (ex: `MAX_PHOTO_SIZE`)
- **Interfaces** : Préfixe "I" + PascalCase (ex: `IMission`)
- **Enums** : PascalCase (ex: `MissionStatus`)

### Style de code

- Utilisation stricte de TypeScript avec types explicites
- Privilégier l'immutabilité des données
- Utiliser les opérateurs RxJS pour les opérations asynchrones
- Éviter les any, utiliser des types génériques ou inconnus si nécessaire
- Préférer les fonctions pures quand c'est possible

### CSS/SCSS

- Utilisation de la méthodologie BEM (Block Element Modifier)
- Variables SCSS pour les couleurs, espacements, etc.
- Media queries regroupées par composant
- Éviter !important sauf cas exceptionnels

```scss
// Exemple BEM avec SCSS
.mission-card {
  &__header {
    // styles...
    
    &--highlighted {
      // styles variante...
    }
  }
  
  &__content {
    // styles...
  }
}
```

### Composants

- Un composant = une responsabilité unique
- Limiter la taille des templates (extraire en sous-composants si > 100 lignes)
- Utiliser des ChangeDetectionStrategy.OnPush pour optimiser les performances
- Documenter avec des commentaires JSDoc les inputs/outputs complexes

```typescript
/**
 * Affiche les détails d'une mission avec les actions disponibles
 * selon son statut actuel
 */
@Component({
  selector: 'app-mission-detail',
  templateUrl: './mission-detail.component.html',
  styleUrls: ['./mission-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MissionDetailComponent implements OnInit {
  /**
   * Mission à afficher
   * Si non définie, une requête sera faite via l'ID en paramètre de route
   */
  @Input() mission?: IMission;
  
  /**
   * Émis lorsque le statut de la mission change
   */
  @Output() statusChanged = new EventEmitter<IMissionStatusUpdate>();
  
  // ...
}
```

### Gestion d'état

- Utiliser NgRx pour les états partagés entre plusieurs composants
- Utiliser BehaviorSubject/ReplaySubject pour des états simples dans les services
- Suivre le pattern "container/presentational components"
  - Containers: connectés au store, gèrent la logique
  - Presentational: purement UI, reçoivent des inputs et émettent des events

### Tests

- Viser un minimum de 80% de couverture pour les services
- Tester tous les workflows critiques avec des tests e2e
- Utiliser des TestBed.configureTestingModule appropriés
- Créer des stubs pour les dépendances externes

```typescript
describe('MissionService', () => {
  let service: MissionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MissionService]
    });
    service = TestBed.inject(MissionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should retrieve missions', () => {
    // Test logic...
  });
});
```

## 🔄 Méthodologie de Développement et GitFlow

Le frontend RoadAssist Pro suit la même méthodologie GitFlow que le backend, avec quelques spécificités pour le développement frontend.

### Convention de nommage des branches

Nous suivons les mêmes conventions que le backend :

- `feature/FE-[numéro-ticket]-[description-courte]` - Pour les nouvelles fonctionnalités
- `bugfix/FE-[numéro-ticket]-[description-courte]` - Pour les corrections de bugs
- `hotfix/FE-[numéro-ticket]-[description-courte]` - Pour les corrections urgentes en production
- `release/[version]` - Pour les préparations de release

Exemples :
- `feature/FE-12-mission-list-component`
- `bugfix/FE-18-fix-photo-upload-on-ios`

### Convention de messages de commit

```
[TYPE]([scope]): Description courte

Description détaillée (optionnelle)

Références: #numéro-ticket
```

Types de commit :
- `feat` : Nouvelle fonctionnalité
- `fix` : Correction de bug
- `refactor` : Modification du code sans changement fonctionnel
- `style` : Changements de style CSS/SCSS
- `perf` : Améliorations de performance
- `test` : Ajout ou modification de tests
- `docs` : Changements de documentation
- `chore` : Tâches de maintenance (configuration, dépendances, etc.)

Exemples :

```
feat(missions): Implémentation du composant de liste des missions

- Ajout du composant MissionListComponent
- Intégration avec le service MissionService
- Ajout de la pagination et des filtres

Références: #FE-12
```

```
fix(photo): Correction du bug d'orientation des photos sur iOS

Les photos prises sur iOS s'affichaient avec une rotation incorrecte
en raison des métadonnées EXIF mal interprétées.

Références: #FE-18
```

### Bonnes pratiques spécifiques au frontend

- **Design System** : Tous les composants doivent respecter le design system défini
- **Performances** : Surveiller régulièrement les métriques de performance (Lighthouse)
- **Accessibilité** : Maintenir un score d'accessibilité minimum de 90%
- **Bundle Size** : Surveiller la taille des bundles et optimiser régulièrement
- **Compatibilité navigateurs** : Tester sur les navigateurs cibles (Chrome, Firefox, Safari, Edge)

## 📱 Spécificités PWA

RoadAssist Pro implémente les fonctionnalités PWA suivantes :

### Service Worker

- Mise en cache des assets statiques
- Stratégie de cache pour les API (stale-while-revalidate)
- Gestion des mises à jour de l'application

### Manifest

```json
{
  "name": "RoadAssist Pro",
  "short_name": "RoadAssist",
  "theme_color": "#1e6396",
  "background_color": "#ffffff",
  "display": "standalone",
  "scope": "./",
  "start_url": "./",
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    // Autres tailles d'icônes...
  ]
}
```

### Fonctionnalités hors ligne

- Détection automatique de l'état de connexion
- Stockage des données essentielles dans IndexedDB
- File d'attente pour les actions à synchroniser
- Interface utilisateur adaptée au mode hors ligne

## 👥 Contribution

Les contributions au frontend sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/FE-XX-amazing-feature`)
3. Commit vos changements (`git commit -m 'feat(scope): Add some amazing feature'`)
4. Push sur la branche (`git push origin feature/FE-XX-amazing-feature`)
5. Ouvrir une Pull Request

### Checklist de validation des Pull Requests

- [ ] Le code est conforme aux conventions de style
- [ ] Les tests unitaires passent
- [ ] De nouveaux tests ont été ajoutés si nécessaire
- [ ] La documentation a été mise à jour si nécessaire
- [ ] Le design est conforme aux maquettes/design system
- [ ] L'application fonctionne en responsive
- [ ] Les performances ne sont pas dégradées
- [ ] Les fonctionnalités PWA sont maintenues

## 📄 Licence

Ce projet est sous licence [MIT](LICENSE).

## 📞 Contact

Pour toute question ou suggestion concernant le frontend, n'hésitez pas à nous contacter :

- Email : allouanehatimfr@gmail.com

---

RoadAssist Pro Frontend - Une interface moderne et responsive pour la gestion de vos missions d'assistance routière 🚗💻📱
