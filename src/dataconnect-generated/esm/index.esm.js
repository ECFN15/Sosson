import { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs, makeMemoryCacheProvider } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'sosson',
  service: 'sosson-sandbox-service',
  location: 'europe-west9'
};
export const dataConnectSettings = {
  cacheSettings: {
    cacheProvider: makeMemoryCacheProvider()
  }
};
export const upsertCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertCurrentUser', inputVars);
}
upsertCurrentUserRef.operationName = 'UpsertCurrentUser';

export function upsertCurrentUser(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertCurrentUserRef(dcInstance, inputVars));
}

export const createClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateClient', inputVars);
}
createClientRef.operationName = 'CreateClient';

export function createClient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createClientRef(dcInstance, inputVars));
}

export const updateClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateClient', inputVars);
}
updateClientRef.operationName = 'UpdateClient';

export function updateClient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateClientRef(dcInstance, inputVars));
}

export const createChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateChantier', inputVars);
}
createChantierRef.operationName = 'CreateChantier';

export function createChantier(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createChantierRef(dcInstance, inputVars));
}

export const updateChantierStatutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateChantierStatut', inputVars);
}
updateChantierStatutRef.operationName = 'UpdateChantierStatut';

export function updateChantierStatut(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateChantierStatutRef(dcInstance, inputVars));
}

export const createFactureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateFacture', inputVars);
}
createFactureRef.operationName = 'CreateFacture';

export function createFacture(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createFactureRef(dcInstance, inputVars));
}

export const setFactureStatutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'SetFactureStatut', inputVars);
}
setFactureStatutRef.operationName = 'SetFactureStatut';

export function setFactureStatut(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(setFactureStatutRef(dcInstance, inputVars));
}

export const createDocumentFolderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDocumentFolder', inputVars);
}
createDocumentFolderRef.operationName = 'CreateDocumentFolder';

export function createDocumentFolder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDocumentFolderRef(dcInstance, inputVars));
}

export const createDocumentAttacheRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDocumentAttache', inputVars);
}
createDocumentAttacheRef.operationName = 'CreateDocumentAttache';

export function createDocumentAttache(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDocumentAttacheRef(dcInstance, inputVars));
}

export const updateDocumentAttacheLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDocumentAttacheLinks', inputVars);
}
updateDocumentAttacheLinksRef.operationName = 'UpdateDocumentAttacheLinks';

export function updateDocumentAttacheLinks(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateDocumentAttacheLinksRef(dcInstance, inputVars));
}

export const createPrevisionnelImportBatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrevisionnelImportBatch', inputVars);
}
createPrevisionnelImportBatchRef.operationName = 'CreatePrevisionnelImportBatch';

export function createPrevisionnelImportBatch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPrevisionnelImportBatchRef(dcInstance, inputVars));
}

export const updatePrevisionnelMonthlyAmountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePrevisionnelMonthlyAmount', inputVars);
}
updatePrevisionnelMonthlyAmountRef.operationName = 'UpdatePrevisionnelMonthlyAmount';

export function updatePrevisionnelMonthlyAmount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePrevisionnelMonthlyAmountRef(dcInstance, inputVars));
}

export const updatePrevisionnelLineAmountsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePrevisionnelLineAmounts', inputVars);
}
updatePrevisionnelLineAmountsRef.operationName = 'UpdatePrevisionnelLineAmounts';

export function updatePrevisionnelLineAmounts(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePrevisionnelLineAmountsRef(dcInstance, inputVars));
}

export const linkPrevisionnelLineToChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkPrevisionnelLineToChantier', inputVars);
}
linkPrevisionnelLineToChantierRef.operationName = 'LinkPrevisionnelLineToChantier';

export function linkPrevisionnelLineToChantier(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(linkPrevisionnelLineToChantierRef(dcInstance, inputVars));
}

export const upsertPrevisionnelCellEditRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertPrevisionnelCellEdit', inputVars);
}
upsertPrevisionnelCellEditRef.operationName = 'UpsertPrevisionnelCellEdit';

export function upsertPrevisionnelCellEdit(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertPrevisionnelCellEditRef(dcInstance, inputVars));
}

export const getCurrentUserRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUser');
}
getCurrentUserRef.operationName = 'GetCurrentUser';

export function getCurrentUser(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getCurrentUserRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listClientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListClients');
}
listClientsRef.operationName = 'ListClients';

export function listClients(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listClientsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetClient', inputVars);
}
getClientRef.operationName = 'GetClient';

export function getClient(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getClientRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listChantiersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListChantiers');
}
listChantiersRef.operationName = 'ListChantiers';

export function listChantiers(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listChantiersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetChantier', inputVars);
}
getChantierRef.operationName = 'GetChantier';

export function getChantier(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getChantierRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listFacturesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFactures');
}
listFacturesRef.operationName = 'ListFactures';

export function listFactures(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listFacturesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listFacturesByStatutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListFacturesByStatut', inputVars);
}
listFacturesByStatutRef.operationName = 'ListFacturesByStatut';

export function listFacturesByStatut(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listFacturesByStatutRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listDocumentFoldersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDocumentFolders');
}
listDocumentFoldersRef.operationName = 'ListDocumentFolders';

export function listDocumentFolders(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listDocumentFoldersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listDocumentsAttachesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDocumentsAttaches');
}
listDocumentsAttachesRef.operationName = 'ListDocumentsAttaches';

export function listDocumentsAttaches(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listDocumentsAttachesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listDocumentsByChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDocumentsByChantier', inputVars);
}
listDocumentsByChantierRef.operationName = 'ListDocumentsByChantier';

export function listDocumentsByChantier(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listDocumentsByChantierRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listPrevisionnelExercisesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPrevisionnelExercises');
}
listPrevisionnelExercisesRef.operationName = 'ListPrevisionnelExercises';

export function listPrevisionnelExercises(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listPrevisionnelExercisesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listPrevisionnelLinesByExerciseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPrevisionnelLinesByExercise', inputVars);
}
listPrevisionnelLinesByExerciseRef.operationName = 'ListPrevisionnelLinesByExercise';

export function listPrevisionnelLinesByExercise(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPrevisionnelLinesByExerciseRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const searchClientAliasesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchClientAliases', inputVars);
}
searchClientAliasesRef.operationName = 'SearchClientAliases';

export function searchClientAliases(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(searchClientAliasesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listPrevisionnelCellEditsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPrevisionnelCellEdits', inputVars);
}
listPrevisionnelCellEditsRef.operationName = 'ListPrevisionnelCellEdits';

export function listPrevisionnelCellEdits(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPrevisionnelCellEditsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

