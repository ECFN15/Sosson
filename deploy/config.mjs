// ============================================================
// deploy/config.mjs — Configuration centrale du dashboard
// ============================================================
// C'est ICI que tu definis tes projets Firebase.
// Si un jour tu changes un project ID, tu ne touches QUE ce fichier.
// ============================================================

// Nom du projet affiché dans le dashboard
export const PROJECT_NAME = 'Sosson';

// Les deux environnements : sandbox et production
// Chaque objet contient TOUT ce qu'il faut pour build + deploy
export const ENVIRONMENTS = {

  sandbox: {
    alias: 'default',                           // Alias dans .firebaserc  → firebase use default
    projectId: 'sosson-sandbox',                // ID exact du projet Firebase
    envFile: '.env.sandbox',                    // Fichier .env a charger pour le build
    buildScript: 'build:sandbox',               // Script npm : npm run build:sandbox
    url: 'https://sosson-sandbox.web.app',      // URL du site apres deploy
    label: 'SANDBOX',                           // Etiquette affichee dans le dashboard
  },

  production: {
    alias: 'prod',                              // Alias dans .firebaserc  → firebase use prod
    projectId: 'sosson-prod',                   // ID exact du projet Firebase
    envFile: '.env.production',                 // Fichier .env a charger pour le build
    buildScript: 'build:prod',                  // Script npm : npm run build:prod
    url: 'https://sosson-prod.web.app',         // URL du site apres deploy
    label: 'PRODUCTION',                        // Etiquette affichee dans le dashboard
  },

};

// IDs qui ne doivent JAMAIS apparaitre dans un build Sosson.
// Si le script en trouve un dans dist/, il BLOQUE le deploiement.
export const FORBIDDEN_IDS = [
  'secondeviesandbox',
  'secondevie-a0745',
  'tousatable-client',
  'tatmadeinnormandie',
];
