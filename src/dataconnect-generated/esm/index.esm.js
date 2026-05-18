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

export const createEmailThreadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailThread', inputVars);
}
createEmailThreadRef.operationName = 'CreateEmailThread';

export function createEmailThread(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEmailThreadRef(dcInstance, inputVars));
}

export const updateEmailThreadStatusAndLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateEmailThreadStatusAndLinks', inputVars);
}
updateEmailThreadStatusAndLinksRef.operationName = 'UpdateEmailThreadStatusAndLinks';

export function updateEmailThreadStatusAndLinks(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateEmailThreadStatusAndLinksRef(dcInstance, inputVars));
}

export const createEmailMessageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailMessage', inputVars);
}
createEmailMessageRef.operationName = 'CreateEmailMessage';

export function createEmailMessage(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEmailMessageRef(dcInstance, inputVars));
}

export const createEmailAttachmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailAttachment', inputVars);
}
createEmailAttachmentRef.operationName = 'CreateEmailAttachment';

export function createEmailAttachment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEmailAttachmentRef(dcInstance, inputVars));
}

export const createPlanningEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePlanningEvent', inputVars);
}
createPlanningEventRef.operationName = 'CreatePlanningEvent';

export function createPlanningEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPlanningEventRef(dcInstance, inputVars));
}

export const updatePlanningEventStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePlanningEventStatus', inputVars);
}
updatePlanningEventStatusRef.operationName = 'UpdatePlanningEventStatus';

export function updatePlanningEventStatus(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePlanningEventStatusRef(dcInstance, inputVars));
}

export const updatePlanningEventDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePlanningEventDetails', inputVars);
}
updatePlanningEventDetailsRef.operationName = 'UpdatePlanningEventDetails';

export function updatePlanningEventDetails(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePlanningEventDetailsRef(dcInstance, inputVars));
}

export const cancelPlanningEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CancelPlanningEvent', inputVars);
}
cancelPlanningEventRef.operationName = 'CancelPlanningEvent';

export function cancelPlanningEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(cancelPlanningEventRef(dcInstance, inputVars));
}

export const createPlanningAssignmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePlanningAssignment', inputVars);
}
createPlanningAssignmentRef.operationName = 'CreatePlanningAssignment';

export function createPlanningAssignment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPlanningAssignmentRef(dcInstance, inputVars));
}

export const updatePlanningAssignmentStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePlanningAssignmentStatus', inputVars);
}
updatePlanningAssignmentStatusRef.operationName = 'UpdatePlanningAssignmentStatus';

export function updatePlanningAssignmentStatus(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePlanningAssignmentStatusRef(dcInstance, inputVars));
}

export const createAnalyticsSnapshotRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAnalyticsSnapshot', inputVars);
}
createAnalyticsSnapshotRef.operationName = 'CreateAnalyticsSnapshot';

export function createAnalyticsSnapshot(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAnalyticsSnapshotRef(dcInstance, inputVars));
}

export const createRapportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRapport', inputVars);
}
createRapportRef.operationName = 'CreateRapport';

export function createRapport(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createRapportRef(dcInstance, inputVars));
}

export const markRapportGeneratedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkRapportGenerated', inputVars);
}
markRapportGeneratedRef.operationName = 'MarkRapportGenerated';

export function markRapportGenerated(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(markRapportGeneratedRef(dcInstance, inputVars));
}

export const createAuditEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuditEvent', inputVars);
}
createAuditEventRef.operationName = 'CreateAuditEvent';

export function createAuditEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAuditEventRef(dcInstance, inputVars));
}

export const createCheckpointRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointRun', inputVars);
}
createCheckpointRunRef.operationName = 'CreateCheckpointRun';

export function createCheckpointRun(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointRunRef(dcInstance, inputVars));
}

export const createCheckpointStepRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointStep', inputVars);
}
createCheckpointStepRef.operationName = 'CreateCheckpointStep';

export function createCheckpointStep(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointStepRef(dcInstance, inputVars));
}

export const createCheckpointArtifactRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointArtifact', inputVars);
}
createCheckpointArtifactRef.operationName = 'CreateCheckpointArtifact';

export function createCheckpointArtifact(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointArtifactRef(dcInstance, inputVars));
}

export const createCheckpointDecisionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointDecision', inputVars);
}
createCheckpointDecisionRef.operationName = 'CreateCheckpointDecision';

export function createCheckpointDecision(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointDecisionRef(dcInstance, inputVars));
}

export const createDataImportRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDataImportRun', inputVars);
}
createDataImportRunRef.operationName = 'CreateDataImportRun';

export function createDataImportRun(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDataImportRunRef(dcInstance, inputVars));
}

export const createDataImportIssueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDataImportIssue', inputVars);
}
createDataImportIssueRef.operationName = 'CreateDataImportIssue';

export function createDataImportIssue(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDataImportIssueRef(dcInstance, inputVars));
}

export const createEntityChangeLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEntityChangeLog', inputVars);
}
createEntityChangeLogRef.operationName = 'CreateEntityChangeLog';

export function createEntityChangeLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEntityChangeLogRef(dcInstance, inputVars));
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

export const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';

export function listUsers(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listUsersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listOperationalClientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOperationalClients');
}
listOperationalClientsRef.operationName = 'ListOperationalClients';

export function listOperationalClients(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listOperationalClientsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
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

export const listOperationalChantiersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOperationalChantiers');
}
listOperationalChantiersRef.operationName = 'ListOperationalChantiers';

export function listOperationalChantiers(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listOperationalChantiersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
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

export const listEmailThreadsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEmailThreads');
}
listEmailThreadsRef.operationName = 'ListEmailThreads';

export function listEmailThreads(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listEmailThreadsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listUnreadEmailThreadsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUnreadEmailThreads');
}
listUnreadEmailThreadsRef.operationName = 'ListUnreadEmailThreads';

export function listUnreadEmailThreads(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listUnreadEmailThreadsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getEmailThreadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEmailThread', inputVars);
}
getEmailThreadRef.operationName = 'GetEmailThread';

export function getEmailThread(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getEmailThreadRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listPlanningEventsByPeriodRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlanningEventsByPeriod', inputVars);
}
listPlanningEventsByPeriodRef.operationName = 'ListPlanningEventsByPeriod';

export function listPlanningEventsByPeriod(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPlanningEventsByPeriodRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listPlanningEventsByChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlanningEventsByChantier', inputVars);
}
listPlanningEventsByChantierRef.operationName = 'ListPlanningEventsByChantier';

export function listPlanningEventsByChantier(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPlanningEventsByChantierRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listAnalyticsSnapshotsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAnalyticsSnapshots', inputVars);
}
listAnalyticsSnapshotsRef.operationName = 'ListAnalyticsSnapshots';

export function listAnalyticsSnapshots(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAnalyticsSnapshotsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getAnalyticsSnapshotRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAnalyticsSnapshot', inputVars);
}
getAnalyticsSnapshotRef.operationName = 'GetAnalyticsSnapshot';

export function getAnalyticsSnapshot(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAnalyticsSnapshotRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listRapportsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRapports');
}
listRapportsRef.operationName = 'ListRapports';

export function listRapports(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listRapportsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getRapportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRapport', inputVars);
}
getRapportRef.operationName = 'GetRapport';

export function getRapport(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getRapportRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listRecentAuditEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRecentAuditEvents', inputVars);
}
listRecentAuditEventsRef.operationName = 'ListRecentAuditEvents';

export function listRecentAuditEvents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listRecentAuditEventsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listEntityChangeLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEntityChangeLogs', inputVars);
}
listEntityChangeLogsRef.operationName = 'ListEntityChangeLogs';

export function listEntityChangeLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listEntityChangeLogsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listCheckpointRunsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCheckpointRuns', inputVars);
}
listCheckpointRunsRef.operationName = 'ListCheckpointRuns';

export function listCheckpointRuns(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listCheckpointRunsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getCheckpointRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCheckpointRun', inputVars);
}
getCheckpointRunRef.operationName = 'GetCheckpointRun';

export function getCheckpointRun(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCheckpointRunRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const listDataImportRunsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDataImportRuns', inputVars);
}
listDataImportRunsRef.operationName = 'ListDataImportRuns';

export function listDataImportRuns(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listDataImportRunsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

export const getDataImportRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDataImportRun', inputVars);
}
getDataImportRunRef.operationName = 'GetDataImportRun';

export function getDataImportRun(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getDataImportRunRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}

