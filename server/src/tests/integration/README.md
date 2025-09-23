# Tests d'Intégration - Pentabell Maps

## Vue d'ensemble

Les tests d'intégration vérifient le bon fonctionnement des différents composants de l'API lorsqu'ils travaillent ensemble. Contrairement aux tests unitaires qui testent des composants isolés, les tests d'intégration valident les interactions entre les contrôleurs, services, middlewares et la base de données.

## Structure des Tests

```
tests/integration/
├── README.md                     # Ce fichier
├── setup.integration.ts          # Configuration globale des tests d'intégration
├── api.integration.test.ts       # Tests généraux de l'API
├── auth.integration.test.ts      # Tests d'authentification
├── opportunity.integration.test.ts # Tests des opportunités
├── application.integration.test.ts # Tests des candidatures
├── files.integration.test.ts     # Tests de gestion des fichiers
├── user.integration.test.ts      # Tests des utilisateurs
├── interviews.integration.test.ts # Tests des entretiens
├── dashboard.integration.test.ts # Tests du tableau de bord
└── e2e.integration.test.ts       # Tests end-to-end complets
```

## Types de Tests

### 1. Tests d'API Générale (`api.integration.test.ts`)
- Validation des endpoints de base
- Gestion des erreurs globales
- Headers de sécurité
- Performance basique

### 2. Tests d'Authentification (`auth.integration.test.ts`)
- Connexion/Déconnexion
- Inscription
- Récupération de mot de passe
- Validation des tokens

### 3. Tests des Modules Métier
- **Opportunités** : CRUD, recherche, filtrage
- **Candidatures** : Création, suivi, statuts
- **Utilisateurs** : Gestion des profils, permissions
- **Entretiens** : Planification, reprogrammation
- **Fichiers** : Upload, téléchargement, validation

### 4. Tests End-to-End (`e2e.integration.test.ts`)
- Flux complets d'utilisation
- Scénarios utilisateur réels
- Tests de performance
- Gestion des cas limites

## Commandes de Test

```bash
# Tous les tests d'intégration
npm run test:integration

# Tests d'intégration en mode watch
npm run test:integration:watch

# Tests unitaires seulement
npm run test:unit

# Tous les tests (unitaires + intégration)
npm run test:all

# Tests avec couverture
npm run test:coverage
```

## Configuration

### Variables d'Environnement
Les tests d'intégration utilisent des variables d'environnement spécifiques :

```env
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/pentabell_test
JWT_SECRET=test-jwt-secret
SESSION_SECRET=test-session-secret
LOG_LEVEL=error
```

### Mocks et Stubs
- Services externes (email, stockage)
- Base de données (utilisation d'une DB de test)
- Jobs et schedulers
- Authentification (tokens simulés)

## Bonnes Pratiques

### 1. Isolation des Tests
- Chaque test doit être indépendant
- Nettoyage après chaque test
- Utilisation de données de test dédiées

### 2. Assertions Robustes
```typescript
// ✅ Bon : Accepter plusieurs codes de statut valides
expect([200, 401]).toContain(res.status);

// ❌ Éviter : Assertions trop strictes
expect(res.status).toBe(200);
```

### 3. Gestion des Timeouts
- Tests d'intégration : 30 secondes max
- Tests unitaires : 10 secondes max
- Tests E2E : 60 secondes max

### 4. Données de Test
```typescript
// Utiliser les helpers fournis
const userData = createMockUserData({ role: 'client' });
const opportunityId = createValidUUID();
const authToken = createMockAuthToken('user-123', 'candidate');
```

## Helpers Disponibles

### Création de Données
- `createMockUserData(overrides)`
- `createMockOpportunityData(overrides)`
- `createMockApplicationData(overrides)`
- `createMockInterviewData(overrides)`

### Utilitaires
- `createValidUUID()` - Génère un UUID valide
- `createInvalidUUID()` - Génère un UUID invalide
- `createMockAuthToken(userId, role)` - Crée un token d'auth simulé

### Assertions
- `expectValidationError(response)` - Vérifie une erreur 400
- `expectAuthenticationError(response)` - Vérifie une erreur 401
- `expectNotFoundError(response)` - Vérifie une erreur 404
- `expectSuccessResponse(response)` - Vérifie un succès 200/201

## Stratégie de Test

### 1. Tests de Validation
- Vérifier les validations d'entrée
- Tester les formats de données
- Valider les contraintes métier

### 2. Tests d'Autorisation
- Accès sans authentification
- Permissions par rôle
- Propriété des ressources

### 3. Tests de Performance
- Temps de réponse acceptable
- Gestion de la charge
- Limites de pagination

### 4. Tests de Sécurité
- Injection SQL/XSS
- Headers de sécurité
- Validation des tokens

## Maintenance

### Ajout de Nouveaux Tests
1. Créer le fichier dans `/integration/`
2. Importer les helpers nécessaires
3. Suivre la structure existante
4. Ajouter la documentation

### Debugging
```bash
# Lancer un test spécifique
npm run test:integration -- --testNamePattern="Auth"

# Mode verbose
npm run test:integration -- --verbose

# Avec logs détaillés
LOG_LEVEL=debug npm run test:integration
```

## Métriques et Couverture

✅ **28 tests d'intégration** réussis :
- **12 tests** de base (API, validation, authentification, erreurs, performance)
- **16 tests** de contrôleurs (auth, opportunités, candidatures, flux E2E)

### Couverture des Tests
- Tests d'API générale : validation des endpoints, gestion des erreurs, headers de sécurité
- Tests d'authentification : connexion, inscription, récupération de mot de passe
- Tests des opportunités : CRUD, pagination, validation UUID
- Tests des candidatures : création, validation, autorisation
- Tests E2E : flux complet utilisateur

### Performance
- Temps d'exécution : ~3.6 secondes
- Tous les tests passent avec succès
- Aucune fuite de mémoire détectée

## Troubleshooting

### Problèmes Courants

1. **Timeouts** : Augmenter `testTimeout` dans Jest
2. **Ports occupés** : Utiliser des ports différents par test
3. **Mémoire** : Simplifier les mocks complexes
4. **Base de données** : Vérifier la configuration de test

### Logs de Debug
```typescript
console.log('Response:', res.status, res.body);
```

## Contribution

Lors de l'ajout de nouvelles fonctionnalités :
1. Ajouter les tests d'intégration correspondants
2. Mettre à jour cette documentation
3. Vérifier que tous les tests passent
4. Maintenir la couverture de code