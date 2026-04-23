// ============================================================
// deploy/runner.mjs — Execution du build et du deploiement
// ============================================================
// Ce fichier contient les fonctions qui FONT des choses :
// elles lancent des commandes shell (npm, firebase).
//
// Principe cle : stdio: 'inherit'
// Ca veut dire que la sortie des commandes (logs npm, logs firebase)
// s'affiche DIRECTEMENT dans ton terminal, en temps reel.
// L'utilisateur voit exactement ce qui se passe.
// ============================================================

import { spawn, execSync } from 'child_process';
import { ENVIRONMENTS } from './config.mjs';


// ─────────────────────────────────────────────────────────────
// Utilitaire interne : lance une commande et attend qu'elle finisse
// - command : ex. 'npm' ou 'firebase'
// - args    : ex. ['run', 'build'] ou ['deploy', '--only', 'hosting']
// - La sortie s'affiche en direct dans le terminal (stdio: inherit)
// ─────────────────────────────────────────────────────────────
function runLive(command, args) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',   // Sortie affichee directement dans le terminal
      shell: true,        // Necessaire sur Windows pour trouver les commandes npm/firebase
    });

    proc.on('close', (exitCode) => {
      // Code 0 = succès normal.
      // Code 3221226505 = bug connu de libuv sur Windows (UV_HANDLE_CLOSING) :
      // Node.js crashe en se FERMANT après un build réussi. Ce n'est pas une
      // vraie erreur — le dist/ est intact. On l'accepte comme un succès.
      const WINDOWS_LIBUV_BUG = 3221226505;
      if (exitCode === 0 || exitCode === WINDOWS_LIBUV_BUG) {
        resolve();
      } else {
        reject(new Error(`La commande a echoue (code de sortie : ${exitCode})`));
      }
    });

    proc.on('error', (err) => {
      reject(new Error(`Impossible de lancer la commande "${command}" : ${err.message}`));
    });
  });
}


// ─────────────────────────────────────────────────────────────
// Basculer le projet Firebase actif
// → equivaut a "firebase use default" ou "firebase use prod"
// ─────────────────────────────────────────────────────────────
export function switchProject(envName) {
  const env = ENVIRONMENTS[envName];
  try {
    // On essaie d'abord avec l'alias (.firebaserc)
    execSync(`firebase use ${env.alias}`, { stdio: 'pipe' });
    return { ok: true };
  } catch {
    try {
      // Fallback : on essaie avec l'ID direct du projet
      execSync(`firebase use ${env.projectId}`, { stdio: 'pipe' });
      return { ok: true };
    } catch {
      return {
        ok: false,
        error: `Impossible de basculer vers "${env.projectId}". Verifie ton .firebaserc`,
      };
    }
  }
}


// ─────────────────────────────────────────────────────────────
// Lancer le build npm
// → equivaut a "npm run build" ou "npm run build:prod"
// ─────────────────────────────────────────────────────────────
export async function buildProject(envName) {
  const env = ENVIRONMENTS[envName];
  try {
    await runLive('npm', ['run', env.buildScript]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


// ─────────────────────────────────────────────────────────────
// Deployer uniquement le Hosting (le site web)
// → equivaut a "firebase deploy --only hosting --project <id>"
// ─────────────────────────────────────────────────────────────
export async function deployHosting(envName) {
  const env = ENVIRONMENTS[envName];
  try {
    // On passe toujours --project pour ne PAS dependre de "firebase use"
    // C'est la securite supplementaire : meme si firebase use est mauvais,
    // on deploie sur le bon projet.
    await runLive('firebase', ['deploy', '--only', 'hosting', '--project', env.projectId]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


// ─────────────────────────────────────────────────────────────
// Deployer uniquement les Cloud Functions
// → equivaut a "firebase deploy --only functions --project <id>"
// ─────────────────────────────────────────────────────────────
export async function deployFunctions(envName) {
  const env = ENVIRONMENTS[envName];
  try {
    await runLive('firebase', ['deploy', '--only', 'functions', '--project', env.projectId]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


// ─────────────────────────────────────────────────────────────
// Deployer uniquement les regles Firestore + Storage
// → equivaut a "firebase deploy --only firestore:rules,storage --project <id>"
// ─────────────────────────────────────────────────────────────
export async function deployRules(envName) {
  const env = ENVIRONMENTS[envName];
  try {
    await runLive('firebase', [
      'deploy',
      '--only', 'firestore:rules,storage',
      '--project', env.projectId,
    ]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export async function deployDataConnect(envName) {
  const env = ENVIRONMENTS[envName];
  try {
    await runLive('firebase', ['deploy', '--only', 'dataconnect', '--project', env.projectId]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}


// ─────────────────────────────────────────────────────────────
// Deployer TOUT en une seule commande (Hosting + Functions + Rules)
// → firebase deploy --only hosting,functions,firestore:rules,storage
// ─────────────────────────────────────────────────────────────
export async function deployEverything(envName) {
  const env = ENVIRONMENTS[envName];
  try {
    await runLive('firebase', [
      'deploy',
      '--only', 'hosting,functions,firestore:rules,storage,dataconnect',
      '--project', env.projectId,
    ]);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}
