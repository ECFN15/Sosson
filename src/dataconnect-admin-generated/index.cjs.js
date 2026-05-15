const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'sosson',
  serviceId: 'sosson-sandbox-service',
  location: 'europe-west9'
};
exports.connectorConfig = connectorConfig;

function upsertCurrentUser(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertCurrentUser', inputVars, inputOpts);
}
exports.upsertCurrentUser = upsertCurrentUser;

function createClient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateClient', inputVars, inputOpts);
}
exports.createClient = createClient;

function updateClient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateClient', inputVars, inputOpts);
}
exports.updateClient = updateClient;

function createChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateChantier', inputVars, inputOpts);
}
exports.createChantier = createChantier;

function updateChantierStatut(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateChantierStatut', inputVars, inputOpts);
}
exports.updateChantierStatut = updateChantierStatut;

function createFacture(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateFacture', inputVars, inputOpts);
}
exports.createFacture = createFacture;

function setFactureStatut(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('SetFactureStatut', inputVars, inputOpts);
}
exports.setFactureStatut = setFactureStatut;

function createDocumentFolder(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateDocumentFolder', inputVars, inputOpts);
}
exports.createDocumentFolder = createDocumentFolder;

function createDocumentAttache(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateDocumentAttache', inputVars, inputOpts);
}
exports.createDocumentAttache = createDocumentAttache;

function updateDocumentAttacheLinks(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateDocumentAttacheLinks', inputVars, inputOpts);
}
exports.updateDocumentAttacheLinks = updateDocumentAttacheLinks;

function createPrevisionnelImportBatch(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreatePrevisionnelImportBatch', inputVars, inputOpts);
}
exports.createPrevisionnelImportBatch = createPrevisionnelImportBatch;

function updatePrevisionnelMonthlyAmount(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdatePrevisionnelMonthlyAmount', inputVars, inputOpts);
}
exports.updatePrevisionnelMonthlyAmount = updatePrevisionnelMonthlyAmount;

function updatePrevisionnelLineAmounts(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdatePrevisionnelLineAmounts', inputVars, inputOpts);
}
exports.updatePrevisionnelLineAmounts = updatePrevisionnelLineAmounts;

function linkPrevisionnelLineToChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('LinkPrevisionnelLineToChantier', inputVars, inputOpts);
}
exports.linkPrevisionnelLineToChantier = linkPrevisionnelLineToChantier;

function upsertPrevisionnelCellEdit(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertPrevisionnelCellEdit', inputVars, inputOpts);
}
exports.upsertPrevisionnelCellEdit = upsertPrevisionnelCellEdit;

function getCurrentUser(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetCurrentUser', undefined, inputOpts);
}
exports.getCurrentUser = getCurrentUser;

function listClients(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListClients', undefined, inputOpts);
}
exports.listClients = listClients;

function getClient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetClient', inputVars, inputOpts);
}
exports.getClient = getClient;

function listChantiers(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListChantiers', undefined, inputOpts);
}
exports.listChantiers = listChantiers;

function getChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetChantier', inputVars, inputOpts);
}
exports.getChantier = getChantier;

function listFactures(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListFactures', undefined, inputOpts);
}
exports.listFactures = listFactures;

function listFacturesByStatut(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListFacturesByStatut', inputVars, inputOpts);
}
exports.listFacturesByStatut = listFacturesByStatut;

function listDocumentFolders(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListDocumentFolders', undefined, inputOpts);
}
exports.listDocumentFolders = listDocumentFolders;

function listDocumentsAttaches(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListDocumentsAttaches', undefined, inputOpts);
}
exports.listDocumentsAttaches = listDocumentsAttaches;

function listDocumentsByChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListDocumentsByChantier', inputVars, inputOpts);
}
exports.listDocumentsByChantier = listDocumentsByChantier;

function listPrevisionnelExercises(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPrevisionnelExercises', undefined, inputOpts);
}
exports.listPrevisionnelExercises = listPrevisionnelExercises;

function listPrevisionnelLinesByExercise(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPrevisionnelLinesByExercise', inputVars, inputOpts);
}
exports.listPrevisionnelLinesByExercise = listPrevisionnelLinesByExercise;

function searchClientAliases(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('SearchClientAliases', inputVars, inputOpts);
}
exports.searchClientAliases = searchClientAliases;

function listPrevisionnelCellEdits(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPrevisionnelCellEdits', inputVars, inputOpts);
}
exports.listPrevisionnelCellEdits = listPrevisionnelCellEdits;

