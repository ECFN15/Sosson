#!/usr/bin/env node
// ============================================================
// deploy/dashboard.mjs — Dashboard de deploiement Firebase
// ============================================================
// C'est le fichier d'entree. C'est lui que Node.js execute
// quand tu lances "npm run dashboard".
//
// Il affiche le menu, gere les choix de l'utilisateur,
// et appelle les fonctions des autres fichiers.
//
// Dependances (installees dans node_modules) :
//   - chalk   : pour les couleurs dans le terminal
//   - inquirer: pour les menus interactifs (fleches + entree)
//   - ora     : pour les spinners (animation de chargement)
// ============================================================

import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';

import { PROJECT_NAME, ENVIRONMENTS } from './config.mjs';
import {
  checkFirebaseCLI,
  getFirebaseUser,
  getCurrentProject,
  checkEnvFile,
  checkBuildArtifact,
  checkGitStatus,
} from './checks.mjs';
import {
  switchProject,
  buildProject,
  deployHosting,
  deployFunctions,
  deployRules,
  deployDataConnect,
  deployEverything,
} from './runner.mjs';

const PRODUCTION_DASHBOARD_FLAG = 'ALLOW_PRODUCTION_DASHBOARD';

function isProductionDashboardEnabled() {
  return process.env[PRODUCTION_DASHBOARD_FLAG] === 'true';
}

function blockProductionDashboardAction(scope) {
  console.log('');
  console.log(chalk.bgRed.white.bold('  PRODUCTION BLOQUEE  '));
  console.log(chalk.red(`  ${scope} production est desactive dans ce dashboard.`));
  console.log(chalk.gray(`  Production non prete: definir ${PRODUCTION_DASHBOARD_FLAG}=true seulement apres validation humaine explicite.`));
  console.log('');
}


// ─────────────────────────────────────────────────────────────
// HELPERS D'AFFICHAGE
// Ces 4 fonctions remplacent console.log partout dans ce fichier.
// ok()   → ligne verte avec ✓
// warn() → ligne jaune avec ⚠
// fail() → ligne rouge avec ✗
// step() → titre de section en gras
// ─────────────────────────────────────────────────────────────
const ok   = (msg) => console.log(chalk.green(`  ✓  ${msg}`));
const warn = (msg) => console.log(chalk.yellow(`  ⚠  ${msg}`));
const fail = (msg) => console.log(chalk.red(`  ✗  ${msg}`));
const step = (title) => {
  console.log('');
  console.log(chalk.bold(`  ── ${title}`));
  console.log('');
};


// ─────────────────────────────────────────────────────────────
// HEADER — Affiche l'etat courant en haut du dashboard
// Appele au debut de chaque tour de boucle (apres chaque action)
// ─────────────────────────────────────────────────────────────
function showHeader() {
  console.clear();  // Efface le terminal

  const project = getCurrentProject();
  const git     = checkGitStatus();

  // Etiquette coloree selon l'environnement actif
  const envBadge = project.envName === 'production'
    ? chalk.bgRed.white.bold(' PRODUCTION ')
    : project.envName === 'sandbox'
      ? chalk.bgCyan.black.bold(' SANDBOX ')
      : chalk.bgGray.white.bold(' INCONNU ');

  console.log('');
  console.log(chalk.bold.white(`  🚀  FIREBASE DEPLOY DASHBOARD`));
  console.log(chalk.gray(`       ${PROJECT_NAME}`));
  console.log('');
  console.log(`  Projet actif  →  ${envBadge}  ${chalk.gray(project.projectId ?? '?')}`);

  // Status git
  if (git.ok) {
    const branchLabel = git.clean
      ? chalk.green(`${git.branch}  ✓ clean`)
      : chalk.yellow(`${git.branch}  ⚠ ${git.changes} fichier(s) non commite(s)`);
    console.log(`  Branch git    →  ${branchLabel}`);
  }

  // Liens web.app (Ctrl+clic pour ouvrir dans le navigateur)
  console.log('');
  console.log(chalk.gray('  ' + '─'.repeat(54)));
  console.log(`  ${chalk.cyan('Sandbox')}     ${chalk.underline(ENVIRONMENTS.sandbox.url)}`);
  console.log(`  ${chalk.red('Production')}  ${chalk.underline(ENVIRONMENTS.production.url)}`);
  console.log(chalk.gray('  ' + '─'.repeat(54)));
  console.log('');
}


// ─────────────────────────────────────────────────────────────
// FLOW PRINCIPAL : Build complet + Deploy Hosting
// Appele pour les options "Deployer en SANDBOX" et "Deployer en PRODUCTION"
// ─────────────────────────────────────────────────────────────
async function runFullDeploy(envName) {
  const env      = ENVIRONMENTS[envName];
  const isProd   = envName === 'production';
  const start    = Date.now();

  // ── Double confirmation obligatoire pour la PRODUCTION ──
  if (isProd) {
    if (!isProductionDashboardEnabled()) {
      blockProductionDashboardAction('Le deploiement');
      return;
    }

    console.log('');
    console.log(chalk.bgRed.white.bold('  ⚠   DEPLOIEMENT PRODUCTION   ⚠  '));
    console.log('');

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Deployer sur PRODUCTION (${env.projectId}) ?`,
      default: false,
    }]);
    if (!confirm) {
      console.log(chalk.yellow('\n  Annule.\n'));
      return;
    }

    // Seconde verification : frappe manuelle
    const { typed } = await inquirer.prompt([{
      type: 'input',
      name: 'typed',
      message: chalk.red('Tape exactement  DEPLOY PROD  pour confirmer :'),
    }]);
    if (typed.trim() !== 'DEPLOY PROD') {
      console.log(chalk.yellow('\n  Confirmation incorrecte. Annule.\n'));
      return;
    }
  }

  // ── ETAPE 1 : PRE-CHECKS ──────────────────────────────────
  step('ETAPE 1 — PRE-CHECKS');

  // Verifier le fichier .env
  const envFileResult = checkEnvFile(envName);
  if (!envFileResult.ok) { fail(envFileResult.error); return; }
  ok(`Fichier ${env.envFile} present et valide`);

  // Verifier le status git (avertissement seulement, pas bloquant)
  const git = checkGitStatus();
  if (git.ok && !git.clean) {
    warn(`Git : ${git.changes} fichier(s) non commite(s) sur "${git.branch}" — on continue quand meme`);
  } else if (git.ok) {
    ok(`Git : branch "${git.branch}" clean`);
  }

  // Basculer vers le bon projet Firebase
  const spinner1 = ora(`  Bascule vers ${env.projectId}...`).start();
  const switchResult = switchProject(envName);
  if (!switchResult.ok) {
    spinner1.fail(chalk.red(`  ✗  ${switchResult.error}`));
    return;
  }
  spinner1.succeed(chalk.green(`  ✓  Projet Firebase actif → ${env.projectId}`));

  // ── ETAPE 2 : BUILD ───────────────────────────────────────
  step(`ETAPE 2 — BUILD ${env.label}  (npm run ${env.buildScript})`);
  // La sortie du build s'affiche directement (voir runner.mjs : stdio: inherit)

  const buildResult = await buildProject(envName);
  if (!buildResult.ok) {
    console.log('');
    fail(`Build echoue : ${buildResult.error}`);
    return;
  }

  // ── ETAPE 3 : VERIFICATION POST-BUILD ────────────────────
  step('ETAPE 3 — VERIFICATION POST-BUILD');

  const artifactResult = checkBuildArtifact(envName);
  if (!artifactResult.ok) {
    fail(artifactResult.error);
    console.log('');
    console.log(chalk.red.bold('  → DEPLOIEMENT BLOQUE : le build ne correspond pas au projet cible.'));
    console.log(chalk.red('  → Lance le bon build avant de deployer.'));
    console.log('');
    return;
  }
  ok(`Project ID "${env.projectId}" trouve dans dist/`);
  ok('Aucun ID d\'un autre projet detecte dans le build');

  // ── ETAPE 4 : DEPLOIEMENT HOSTING ─────────────────────────
  step(`ETAPE 4 — DEPLOIEMENT HOSTING → ${env.label}`);
  console.log(chalk.gray(`  firebase deploy --only hosting --project ${env.projectId}`));
  console.log('');

  const deployResult = await deployHosting(envName);
  if (!deployResult.ok) {
    fail(`Deploiement echoue : ${deployResult.error}`);
    return;
  }

  // ── SUCCES ────────────────────────────────────────────────
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log('');
  console.log(chalk.green.bold(`  ┌──────────────────────────────────────────────────────┐`));
  console.log(chalk.green.bold(`  │                                                      │`));
  console.log(chalk.green.bold(`  │   ✓  Deploiement ${env.label} reussi en ${duration}s`.padEnd(56) + `│`));
  console.log(chalk.green.bold(`  │   URL : ${env.url}`.padEnd(56) + `│`));
  console.log(chalk.green.bold(`  │                                                      │`));
  console.log(chalk.green.bold(`  └──────────────────────────────────────────────────────┘`));
  console.log('');
}


// ─────────────────────────────────────────────────────────────
// FLOW : Deployer les Cloud Functions uniquement
// ─────────────────────────────────────────────────────────────
async function runFunctionsDeploy() {
  console.log('');

  // Choisir l'environnement cible
  const { envName } = await inquirer.prompt([{
    type: 'list',
    name: 'envName',
    message: 'Deployer les Functions sur quel environnement ?',
    choices: [
      {
        name: `${chalk.cyan('SANDBOX')}      ${chalk.gray(ENVIRONMENTS.sandbox.projectId)}`,
        value: 'sandbox',
      },
      {
        name: `${chalk.red('PRODUCTION')}  ${chalk.gray(ENVIRONMENTS.production.projectId)}`,
        value: 'production',
      },
    ],
  }]);

  const env = ENVIRONMENTS[envName];

  // Confirmation supplementaire pour la production
  if (envName === 'production') {
    if (!isProductionDashboardEnabled()) {
      blockProductionDashboardAction('Le deploiement Functions');
      return;
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.red(`Deployer les FUNCTIONS en PRODUCTION (${env.projectId}) ?`),
      default: false,
    }]);
    if (!confirm) { console.log(chalk.yellow('\n  Annule.\n')); return; }
  }

  step(`DEPLOY FUNCTIONS → ${env.label}`);

  const spinner = ora(`  Bascule vers ${env.projectId}...`).start();
  const sw = switchProject(envName);
  if (!sw.ok) { spinner.fail(chalk.red(`  ✗  ${sw.error}`)); return; }
  spinner.succeed(chalk.green(`  ✓  Projet → ${env.projectId}`));

  console.log(chalk.gray(`\n  firebase deploy --only functions --project ${env.projectId}\n`));

  const result = await deployFunctions(envName);
  if (!result.ok) { fail(result.error); return; }

  ok('Cloud Functions deployees avec succes !');
  console.log('');
}


// ─────────────────────────────────────────────────────────────
// FLOW : Deployer les regles Firestore + Storage uniquement
// ─────────────────────────────────────────────────────────────
async function runRulesDeploy() {
  console.log('');

  const { envName } = await inquirer.prompt([{
    type: 'list',
    name: 'envName',
    message: 'Deployer les Rules sur quel environnement ?',
    choices: [
      {
        name: `${chalk.cyan('SANDBOX')}      ${chalk.gray(ENVIRONMENTS.sandbox.projectId)}`,
        value: 'sandbox',
      },
      {
        name: `${chalk.red('PRODUCTION')}  ${chalk.gray(ENVIRONMENTS.production.projectId)}`,
        value: 'production',
      },
    ],
  }]);

  const env = ENVIRONMENTS[envName];

  if (envName === 'production') {
    if (!isProductionDashboardEnabled()) {
      blockProductionDashboardAction('Le deploiement Rules');
      return;
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.red(`Deployer les RULES en PRODUCTION (${env.projectId}) ?`),
      default: false,
    }]);
    if (!confirm) { console.log(chalk.yellow('\n  Annule.\n')); return; }
  }

  step(`DEPLOY RULES (Firestore + Storage) → ${env.label}`);

  const spinner = ora(`  Bascule vers ${env.projectId}...`).start();
  const sw = switchProject(envName);
  if (!sw.ok) { spinner.fail(chalk.red(`  ✗  ${sw.error}`)); return; }
  spinner.succeed(chalk.green(`  ✓  Projet → ${env.projectId}`));

  console.log(chalk.gray(`\n  firebase deploy --only firestore:rules,storage --project ${env.projectId}\n`));

  const result = await deployRules(envName);
  if (!result.ok) { fail(result.error); return; }

  ok('Rules Firestore + Storage deployees avec succes !');
  console.log('');
}

async function runDataConnectDeploy() {
  console.log('');

  const { envName } = await inquirer.prompt([{
    type: 'list',
    name: 'envName',
    message: 'Deployer SQL Connect sur quel environnement ?',
    choices: [
      {
        name: `${chalk.cyan('SANDBOX')}      ${chalk.gray(ENVIRONMENTS.sandbox.projectId)}`,
        value: 'sandbox',
      },
      {
        name: `${chalk.red('PRODUCTION')}  ${chalk.gray(ENVIRONMENTS.production.projectId)}`,
        value: 'production',
      },
    ],
  }]);

  const env = ENVIRONMENTS[envName];

  if (envName === 'production') {
    if (!isProductionDashboardEnabled()) {
      blockProductionDashboardAction('Le deploiement SQL Connect');
      return;
    }

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: chalk.red(`Deployer SQL CONNECT en PRODUCTION (${env.projectId}) ?`),
      default: false,
    }]);
    if (!confirm) { console.log(chalk.yellow('\n  Annule.\n')); return; }
  }

  step(`DEPLOY SQL CONNECT → ${env.label}`);

  const spinner = ora(`  Bascule vers ${env.projectId}...`).start();
  const sw = switchProject(envName);
  if (!sw.ok) { spinner.fail(chalk.red(`  ✗  ${sw.error}`)); return; }
  spinner.succeed(chalk.green(`  ✓  Projet → ${env.projectId}`));

  console.log(chalk.gray(`\n  firebase deploy --only dataconnect --project ${env.projectId}\n`));

  const result = await deployDataConnect(envName);
  if (!result.ok) { fail(result.error); return; }

  ok('SQL Connect deploye avec succes !');
  console.log('');
}


// ─────────────────────────────────────────────────────────────
// FLOW : TOUT deployer (build + hosting + functions + rules + SQL Connect)
// L'option ultra-safe : en 1 clic, site + backend + regles + SQL Connect partent ensemble.
// ─────────────────────────────────────────────────────────────
async function runEverythingDeploy() {
  console.log('');

  // Choisir l'environnement cible
  const { envName } = await inquirer.prompt([{
    type: 'list',
    name: 'envName',
    message: 'Tout deployer sur quel environnement ?',
    choices: [
      {
        name: `${chalk.cyan('SANDBOX')}      ${chalk.gray(ENVIRONMENTS.sandbox.projectId)}`,
        value: 'sandbox',
      },
      {
        name: `${chalk.red('PRODUCTION')}  ${chalk.gray(ENVIRONMENTS.production.projectId)}`,
        value: 'production',
      },
    ],
  }]);

  const env    = ENVIRONMENTS[envName];
  const isProd = envName === 'production';
  const start  = Date.now();

  // ── Double confirmation obligatoire pour la PRODUCTION ──
  if (isProd) {
    if (!isProductionDashboardEnabled()) {
      blockProductionDashboardAction('Le deploiement complet');
      return;
    }

    console.log('');
    console.log(chalk.bgRed.white.bold('  ⚠   DEPLOIEMENT COMPLET PRODUCTION   ⚠  '));
    console.log(chalk.red('  → Site + Functions + Rules Firestore/Storage vont partir en prod.'));
    console.log('');

    const { confirm } = await inquirer.prompt([{
      type: 'confirm',
      name: 'confirm',
      message: `Tout deployer sur PRODUCTION (${env.projectId}) ?`,
      default: false,
    }]);
    if (!confirm) { console.log(chalk.yellow('\n  Annule.\n')); return; }

    const { typed } = await inquirer.prompt([{
      type: 'input',
      name: 'typed',
      message: chalk.red('Tape exactement  DEPLOY ALL PROD  pour confirmer :'),
    }]);
    if (typed.trim() !== 'DEPLOY ALL PROD') {
      console.log(chalk.yellow('\n  Confirmation incorrecte. Annule.\n'));
      return;
    }
  }

  // ── ETAPE 1 : PRE-CHECKS ──────────────────────────────────
  step('ETAPE 1 — PRE-CHECKS');

  const envFileResult = checkEnvFile(envName);
  if (!envFileResult.ok) { fail(envFileResult.error); return; }
  ok(`Fichier ${env.envFile} present et valide`);

  const git = checkGitStatus();
  if (git.ok && !git.clean) {
    warn(`Git : ${git.changes} fichier(s) non commite(s) sur "${git.branch}" — on continue quand meme`);
  } else if (git.ok) {
    ok(`Git : branch "${git.branch}" clean`);
  }

  const spinner1 = ora(`  Bascule vers ${env.projectId}...`).start();
  const switchResult = switchProject(envName);
  if (!switchResult.ok) {
    spinner1.fail(chalk.red(`  ✗  ${switchResult.error}`));
    return;
  }
  spinner1.succeed(chalk.green(`  ✓  Projet Firebase actif → ${env.projectId}`));

  // ── ETAPE 2 : BUILD ───────────────────────────────────────
  step(`ETAPE 2 — BUILD ${env.label}  (npm run ${env.buildScript})`);

  const buildResult = await buildProject(envName);
  if (!buildResult.ok) {
    console.log('');
    fail(`Build echoue : ${buildResult.error}`);
    return;
  }

  // ── ETAPE 3 : VERIFICATION POST-BUILD ────────────────────
  step('ETAPE 3 — VERIFICATION POST-BUILD');

  const artifactResult = checkBuildArtifact(envName);
  if (!artifactResult.ok) {
    fail(artifactResult.error);
    console.log('');
    console.log(chalk.red.bold('  → DEPLOIEMENT BLOQUE : le build ne correspond pas au projet cible.'));
    console.log('');
    return;
  }
  ok(`Project ID "${env.projectId}" trouve dans dist/`);
  ok('Aucun ID d\'un autre projet detecte dans le build');

  // ── ETAPE 4 : DEPLOIEMENT COMPLET ─────────────────────────
  step(`ETAPE 4 — DEPLOIEMENT COMPLET → ${env.label}`);
  console.log(chalk.gray(`  firebase deploy --only hosting,functions,firestore:rules,storage,dataconnect --project ${env.projectId}`));
  console.log(chalk.gray('  (Site + Cloud Functions + Rules Firestore/Storage + SQL Connect)'));
  console.log('');

  const deployResult = await deployEverything(envName);
  if (!deployResult.ok) {
    fail(`Deploiement echoue : ${deployResult.error}`);
    return;
  }

  // ── SUCCES ────────────────────────────────────────────────
  const duration = ((Date.now() - start) / 1000).toFixed(1);
  console.log('');
  console.log(chalk.green.bold(`  ┌──────────────────────────────────────────────────────┐`));
  console.log(chalk.green.bold(`  │                                                      │`));
  console.log(chalk.green.bold(`  │   ✓  TOUT deploye ${env.label} en ${duration}s`.padEnd(56) + `│`));
  console.log(chalk.green.bold(`  │      Site + Functions + Rules`.padEnd(56) + `│`));
  console.log(chalk.green.bold(`  │   URL : ${env.url}`.padEnd(56) + `│`));
  console.log(chalk.green.bold(`  │                                                      │`));
  console.log(chalk.green.bold(`  └──────────────────────────────────────────────────────┘`));
  console.log('');
}


// ─────────────────────────────────────────────────────────────
// PAGE : Etat complet du systeme
// Recapitule tout : CLI, compte, projets, .env, build, git
// ─────────────────────────────────────────────────────────────
async function showStatus() {
  step('ETAT COMPLET DU SYSTEME');

  // Firebase CLI
  const cli = checkFirebaseCLI();
  cli.ok ? ok('Firebase CLI installe') : fail(cli.error);

  // Compte connecte
  const user = getFirebaseUser();
  user.ok ? ok(`Compte connecte : ${chalk.bold(user.email)}`) : fail(user.error);

  // Projet actif
  const project = getCurrentProject();
  if (project.ok) {
    const badge = project.envName === 'production'
      ? chalk.bgRed.white(' PRODUCTION ')
      : chalk.bgCyan.black(' SANDBOX ');
    ok(`Projet actif : ${badge}  ${chalk.gray(project.projectId)}`);
  } else {
    fail(project.error);
  }

  console.log('');

  // Fichiers .env
  for (const [envName, env] of Object.entries(ENVIRONMENTS)) {
    const check = checkEnvFile(envName);
    const label = envName === 'production'
      ? chalk.red('PRODUCTION')
      : chalk.cyan('SANDBOX');
    check.ok
      ? ok(`${env.envFile}  →  ${label}  valide`)
      : fail(check.error);
  }

  console.log('');

  // Build artifact dans dist/
  if (project.ok && project.envName) {
    const buildCheck = checkBuildArtifact(project.envName);
    buildCheck.ok
      ? ok(`dist/  →  build ${project.envName} verifie et propre`)
      : warn(`dist/  →  ${buildCheck.error}`);
  } else {
    warn('Impossible de verifier dist/ (projet actif inconnu)');
  }

  // Git
  const git = checkGitStatus();
  if (git.ok) {
    git.clean
      ? ok(`Git : branch "${git.branch}" — clean`)
      : warn(`Git : branch "${git.branch}" — ${git.changes} fichier(s) non commite(s)`);
  }

  console.log('');
}


// ─────────────────────────────────────────────────────────────
// BOUCLE PRINCIPALE
// C'est le coeur du dashboard.
// Elle s'execute en boucle jusqu'a ce que l'utilisateur quitte.
// ─────────────────────────────────────────────────────────────
async function main() {

  // Verification de base avant tout : Firebase CLI est installe ?
  const cliCheck = checkFirebaseCLI();
  if (!cliCheck.ok) {
    console.log(chalk.red(`\n  ERREUR : ${cliCheck.error}\n`));
    process.exit(1);
  }

  let running = true;

  while (running) {

    showHeader();  // Efface le terminal et affiche l'etat courant

    // Menu principal — navigation avec les fleches, validation avec Entree
    const { action } = await inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Que veux-tu faire ?',
      pageSize: 13,  // Nb de lignes visibles dans le menu
      choices: [
        {
          name: `${chalk.cyan.bold('Deployer en SANDBOX')}      ${chalk.gray('build + hosting → ' + ENVIRONMENTS.sandbox.projectId)}`,
          value: 'sandbox',
        },
        {
          name: `${chalk.red.bold('Deployer en PRODUCTION')}  ${chalk.gray('build + hosting → ' + ENVIRONMENTS.production.projectId)}`,
          value: 'production',
        },
        new inquirer.Separator(chalk.gray('  ─────────────────────────────────────────')),
        {
          name: `Functions uniquement    ${chalk.gray('(sans rebuild du site)')}`,
          value: 'functions',
        },
        {
          name: `Rules uniquement        ${chalk.gray('(Firestore + Storage)')}`,
          value: 'rules',
        },
        {
          name: `SQL Connect uniquement  ${chalk.gray('(schema + connecteurs)')}`,
          value: 'dataconnect',
        },
        new inquirer.Separator(chalk.gray('  ─────────────────────────────────────────')),
        {
          name: `${chalk.magenta.bold('TOUT deployer')}            ${chalk.gray('build + hosting + functions + rules + SQL Connect')}`,
          value: 'everything',
        },
        new inquirer.Separator(chalk.gray('  ─────────────────────────────────────────')),
        {
          name: `Voir l'etat complet`,
          value: 'status',
        },
        {
          name: chalk.gray('Quitter'),
          value: 'quit',
        },
      ],
    }]);

    // Dispatcher vers la bonne fonction selon le choix
    switch (action) {
      case 'sandbox':
      case 'production':
        await runFullDeploy(action);
        break;
      case 'functions':
        await runFunctionsDeploy();
        break;
      case 'rules':
        await runRulesDeploy();
        break;
      case 'dataconnect':
        await runDataConnectDeploy();
        break;
      case 'everything':
        await runEverythingDeploy();
        break;
      case 'status':
        await showStatus();
        break;
      case 'quit':
        running = false;
        console.log(chalk.gray('\n  Au revoir !\n'));
        break;
    }

    // Pause avant de retourner au menu (sauf si on quitte)
    if (running) {
      await inquirer.prompt([{
        type: 'input',
        name: '_',
        message: chalk.gray('Appuie sur Entree pour revenir au menu...'),
      }]);
    }
  }
}

// Lancer le dashboard — et attraper toute erreur inattendue
main().catch((err) => {
  console.error(chalk.red(`\n  ERREUR FATALE : ${err.message}\n`));
  process.exit(1);
});
