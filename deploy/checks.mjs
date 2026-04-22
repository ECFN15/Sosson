// ============================================================
// deploy/checks.mjs — Toutes les verifications de securite
// ============================================================
// Ces fonctions ne font QUE verifier et retourner { ok, error }.
// Elles ne lancent rien, elles ne deploient rien.
// Le dashboard les appelle avant chaque action.
// ============================================================

import { execSync } from 'child_process';  // Module Node.js integre pour executer des commandes shell
import fs from 'fs';                        // Module Node.js integre pour lire des fichiers
import path from 'path';                   // Module Node.js integre pour manipuler les chemins
import { ENVIRONMENTS, FORBIDDEN_IDS } from './config.mjs';


// ─────────────────────────────────────────────────────────────
// Firebase CLI installe sur la machine ?
// ─────────────────────────────────────────────────────────────
export function checkFirebaseCLI() {
  try {
    execSync('firebase --version', { stdio: 'pipe' });
    return { ok: true };
  } catch {
    return {
      ok: false,
      error: 'Firebase CLI non installe. Lance : npm install -g firebase-tools',
    };
  }
}


// ─────────────────────────────────────────────────────────────
// Quel compte Firebase est connecte ?
// ─────────────────────────────────────────────────────────────
export function getFirebaseUser() {
  try {
    const result = execSync('firebase login:list', { stdio: 'pipe' }).toString();
    const match = result.match(/Logged in as (\S+)/);
    if (match) return { ok: true, email: match[1] };
    return { ok: false, error: 'Non connecte a Firebase. Lance : firebase login' };
  } catch {
    return { ok: false, error: 'Impossible de verifier le compte Firebase' };
  }
}


// ─────────────────────────────────────────────────────────────
// Quel est le projet Firebase actif en ce moment ?
// ─────────────────────────────────────────────────────────────
export function getCurrentProject() {
  try {
    // "firebase use" affiche l'ID du projet actif
    const result = execSync('firebase use', { stdio: 'pipe' }).toString().trim();
    const projectId = result.split('\n')[0].trim();

    // On cherche si cet ID correspond a un de nos environnements connus
    const envName = Object.entries(ENVIRONMENTS)
      .find(([, env]) => env.projectId === projectId)?.[0] ?? null;

    return { ok: true, projectId, envName };
  } catch {
    return {
      ok: false,
      error: 'Impossible de lire le projet actif. Verifie ton .firebaserc',
    };
  }
}


// ─────────────────────────────────────────────────────────────
// Le fichier .env de l'environnement existe et est correct ?
// ─────────────────────────────────────────────────────────────
export function checkEnvFile(envName) {
  const env = ENVIRONMENTS[envName];

  // Le fichier existe ?
  if (!fs.existsSync(env.envFile)) {
    return { ok: false, error: `Fichier ${env.envFile} introuvable` };
  }

  // Il contient bien le bon project ID ?
  const content = fs.readFileSync(env.envFile, 'utf8');
  if (!content.includes(`VITE_FIREBASE_PROJECT_ID=${env.projectId}`)) {
    return {
      ok: false,
      error: `${env.envFile} : VITE_FIREBASE_PROJECT_ID ne correspond pas a "${env.projectId}"`,
    };
  }

  return { ok: true };
}


// ─────────────────────────────────────────────────────────────
// Le dossier dist/ contient le bon build pour cet environnement ?
// C'est la verification la plus importante : on scanne les fichiers
// JS generes pour verifier quel project ID est inclu dedans.
// ─────────────────────────────────────────────────────────────
export function checkBuildArtifact(envName) {
  const env = ENVIRONMENTS[envName];

  // dist/index.html existe ?
  if (!fs.existsSync('dist/index.html')) {
    return { ok: false, error: 'Aucun build dans dist/. Lance le build d\'abord.' };
  }

  const assetsDir = 'dist/assets';
  if (!fs.existsSync(assetsDir)) {
    return { ok: false, error: 'Dossier dist/assets introuvable' };
  }

  // On lit tous les fichiers .js du build
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  let foundCorrectId = false;
  const foundForbidden = [];

  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');

    // Est-ce que le bon project ID est present ?
    if (content.includes(env.projectId)) foundCorrectId = true;

    // Est-ce qu'un ID interdit est present (contamination croisee) ?
    for (const forbiddenId of FORBIDDEN_IDS) {
      if (content.includes(forbiddenId) && !foundForbidden.includes(forbiddenId)) {
        foundForbidden.push(forbiddenId);
      }
    }
  }

  // BLOQUANT : IDs d'un autre projet trouves dans le build
  if (foundForbidden.length > 0) {
    return {
      ok: false,
      error: `ALERTE : Le build contient des IDs d'un autre projet : ${foundForbidden.join(', ')}`,
    };
  }

  // BLOQUANT : Le bon project ID est absent du build
  if (!foundCorrectId) {
    return {
      ok: false,
      error: `Le build ne contient pas "${env.projectId}". Mauvais mode de build ?`,
    };
  }

  return { ok: true };
}


// ─────────────────────────────────────────────────────────────
// Etat du depot git (branch + fichiers non commites)
// ─────────────────────────────────────────────────────────────
export function checkGitStatus() {
  try {
    // --porcelain = sortie courte et parsable
    const status = execSync('git status --porcelain', { stdio: 'pipe' }).toString().trim();
    const branch = execSync('git branch --show-current', { stdio: 'pipe' }).toString().trim();

    return {
      ok: true,
      clean: status === '',                                       // Rien de non commite
      branch,
      changes: status.split('\n').filter(Boolean).length,        // Nb de fichiers modifies
    };
  } catch {
    return { ok: false, error: 'Impossible de lire le status git' };
  }
}
