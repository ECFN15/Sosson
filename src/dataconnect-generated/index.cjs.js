const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } = require('firebase/data-connect');

const connectorConfig = {
  connector: 'sosson',
  service: 'sosson-sandbox-service',
  location: 'europe-west9'
};
exports.connectorConfig = connectorConfig;
const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
exports.dataConnectSettings = dataConnectSettings;

const upsertCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertCurrentUser', inputVars);
}
upsertCurrentUserRef.operationName = 'UpsertCurrentUser';
exports.upsertCurrentUserRef = upsertCurrentUserRef;

exports.upsertCurrentUser = function upsertCurrentUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertCurrentUserRef(dcInstance, inputVars));
}
;

const createClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateClient', inputVars);
}
createClientRef.operationName = 'CreateClient';
exports.createClientRef = createClientRef;

exports.createClient = function createClient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createClientRef(dcInstance, inputVars));
}
;

const updateClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateClient', inputVars);
}
updateClientRef.operationName = 'UpdateClient';
exports.updateClientRef = updateClientRef;

exports.updateClient = function updateClient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateClientRef(dcInstance, inputVars));
}
;

const createChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChantier', inputVars);
}
createChantierRef.operationName = 'CreateChantier';
exports.createChantierRef = createChantierRef;

exports.createChantier = function createChantier(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createChantierRef(dcInstance, inputVars));
}
;

const updateChantierStatutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateChantierStatut', inputVars);
}
updateChantierStatutRef.operationName = 'UpdateChantierStatut';
exports.updateChantierStatutRef = updateChantierStatutRef;

exports.updateChantierStatut = function updateChantierStatut(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateChantierStatutRef(dcInstance, inputVars));
}
;

const createFactureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFacture', inputVars);
}
createFactureRef.operationName = 'CreateFacture';
exports.createFactureRef = createFactureRef;

exports.createFacture = function createFacture(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFactureRef(dcInstance, inputVars));
}
;

const setFactureStatutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetFactureStatut', inputVars);
}
setFactureStatutRef.operationName = 'SetFactureStatut';
exports.setFactureStatutRef = setFactureStatutRef;

exports.setFactureStatut = function setFactureStatut(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setFactureStatutRef(dcInstance, inputVars));
}
;

const getCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser');
}
getCurrentUserRef.operationName = 'GetCurrentUser';
exports.getCurrentUserRef = getCurrentUserRef;

exports.getCurrentUser = function getCurrentUser(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getCurrentUserRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listClientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListClients');
}
listClientsRef.operationName = 'ListClients';
exports.listClientsRef = listClientsRef;

exports.listClients = function listClients(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listClientsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClient', inputVars);
}
getClientRef.operationName = 'GetClient';
exports.getClientRef = getClientRef;

exports.getClient = function getClient(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClientRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listChantiersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListChantiers');
}
listChantiersRef.operationName = 'ListChantiers';
exports.listChantiersRef = listChantiersRef;

exports.listChantiers = function listChantiers(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listChantiersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChantier', inputVars);
}
getChantierRef.operationName = 'GetChantier';
exports.getChantierRef = getChantierRef;

exports.getChantier = function getChantier(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getChantierRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listFacturesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFactures');
}
listFacturesRef.operationName = 'ListFactures';
exports.listFacturesRef = listFacturesRef;

exports.listFactures = function listFactures(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listFacturesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listFacturesByStatutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFacturesByStatut', inputVars);
}
listFacturesByStatutRef.operationName = 'ListFacturesByStatut';
exports.listFacturesByStatutRef = listFacturesByStatutRef;

exports.listFacturesByStatut = function listFacturesByStatut(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listFacturesByStatutRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
