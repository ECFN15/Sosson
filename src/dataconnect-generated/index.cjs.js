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

const createDevisRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDevis', inputVars);
}
createDevisRef.operationName = 'CreateDevis';
exports.createDevisRef = createDevisRef;

exports.createDevis = function createDevis(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDevisRef(dcInstance, inputVars));
}
;

const updateDevisStatutRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDevisStatut', inputVars);
}
updateDevisStatutRef.operationName = 'UpdateDevisStatut';
exports.updateDevisStatutRef = updateDevisStatutRef;

exports.updateDevisStatut = function updateDevisStatut(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateDevisStatutRef(dcInstance, inputVars));
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

const createDocumentFolderRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDocumentFolder', inputVars);
}
createDocumentFolderRef.operationName = 'CreateDocumentFolder';
exports.createDocumentFolderRef = createDocumentFolderRef;

exports.createDocumentFolder = function createDocumentFolder(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDocumentFolderRef(dcInstance, inputVars));
}
;

const createDocumentAttacheRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDocumentAttache', inputVars);
}
createDocumentAttacheRef.operationName = 'CreateDocumentAttache';
exports.createDocumentAttacheRef = createDocumentAttacheRef;

exports.createDocumentAttache = function createDocumentAttache(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDocumentAttacheRef(dcInstance, inputVars));
}
;

const updateDocumentAttacheLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateDocumentAttacheLinks', inputVars);
}
updateDocumentAttacheLinksRef.operationName = 'UpdateDocumentAttacheLinks';
exports.updateDocumentAttacheLinksRef = updateDocumentAttacheLinksRef;

exports.updateDocumentAttacheLinks = function updateDocumentAttacheLinks(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateDocumentAttacheLinksRef(dcInstance, inputVars));
}
;

const createPrevisionnelImportBatchRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePrevisionnelImportBatch', inputVars);
}
createPrevisionnelImportBatchRef.operationName = 'CreatePrevisionnelImportBatch';
exports.createPrevisionnelImportBatchRef = createPrevisionnelImportBatchRef;

exports.createPrevisionnelImportBatch = function createPrevisionnelImportBatch(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPrevisionnelImportBatchRef(dcInstance, inputVars));
}
;

const updatePrevisionnelMonthlyAmountRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePrevisionnelMonthlyAmount', inputVars);
}
updatePrevisionnelMonthlyAmountRef.operationName = 'UpdatePrevisionnelMonthlyAmount';
exports.updatePrevisionnelMonthlyAmountRef = updatePrevisionnelMonthlyAmountRef;

exports.updatePrevisionnelMonthlyAmount = function updatePrevisionnelMonthlyAmount(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePrevisionnelMonthlyAmountRef(dcInstance, inputVars));
}
;

const updatePrevisionnelLineAmountsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePrevisionnelLineAmounts', inputVars);
}
updatePrevisionnelLineAmountsRef.operationName = 'UpdatePrevisionnelLineAmounts';
exports.updatePrevisionnelLineAmountsRef = updatePrevisionnelLineAmountsRef;

exports.updatePrevisionnelLineAmounts = function updatePrevisionnelLineAmounts(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePrevisionnelLineAmountsRef(dcInstance, inputVars));
}
;

const linkPrevisionnelLineToChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'LinkPrevisionnelLineToChantier', inputVars);
}
linkPrevisionnelLineToChantierRef.operationName = 'LinkPrevisionnelLineToChantier';
exports.linkPrevisionnelLineToChantierRef = linkPrevisionnelLineToChantierRef;

exports.linkPrevisionnelLineToChantier = function linkPrevisionnelLineToChantier(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(linkPrevisionnelLineToChantierRef(dcInstance, inputVars));
}
;

const upsertPrevisionnelCellEditRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpsertPrevisionnelCellEdit', inputVars);
}
upsertPrevisionnelCellEditRef.operationName = 'UpsertPrevisionnelCellEdit';
exports.upsertPrevisionnelCellEditRef = upsertPrevisionnelCellEditRef;

exports.upsertPrevisionnelCellEdit = function upsertPrevisionnelCellEdit(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(upsertPrevisionnelCellEditRef(dcInstance, inputVars));
}
;

const createEmailThreadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailThread', inputVars);
}
createEmailThreadRef.operationName = 'CreateEmailThread';
exports.createEmailThreadRef = createEmailThreadRef;

exports.createEmailThread = function createEmailThread(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEmailThreadRef(dcInstance, inputVars));
}
;

const updateEmailThreadStatusAndLinksRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateEmailThreadStatusAndLinks', inputVars);
}
updateEmailThreadStatusAndLinksRef.operationName = 'UpdateEmailThreadStatusAndLinks';
exports.updateEmailThreadStatusAndLinksRef = updateEmailThreadStatusAndLinksRef;

exports.updateEmailThreadStatusAndLinks = function updateEmailThreadStatusAndLinks(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateEmailThreadStatusAndLinksRef(dcInstance, inputVars));
}
;

const createEmailMessageRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailMessage', inputVars);
}
createEmailMessageRef.operationName = 'CreateEmailMessage';
exports.createEmailMessageRef = createEmailMessageRef;

exports.createEmailMessage = function createEmailMessage(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEmailMessageRef(dcInstance, inputVars));
}
;

const createEmailAttachmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEmailAttachment', inputVars);
}
createEmailAttachmentRef.operationName = 'CreateEmailAttachment';
exports.createEmailAttachmentRef = createEmailAttachmentRef;

exports.createEmailAttachment = function createEmailAttachment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEmailAttachmentRef(dcInstance, inputVars));
}
;

const createPlanningEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePlanningEvent', inputVars);
}
createPlanningEventRef.operationName = 'CreatePlanningEvent';
exports.createPlanningEventRef = createPlanningEventRef;

exports.createPlanningEvent = function createPlanningEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPlanningEventRef(dcInstance, inputVars));
}
;

const updatePlanningEventStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePlanningEventStatus', inputVars);
}
updatePlanningEventStatusRef.operationName = 'UpdatePlanningEventStatus';
exports.updatePlanningEventStatusRef = updatePlanningEventStatusRef;

exports.updatePlanningEventStatus = function updatePlanningEventStatus(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePlanningEventStatusRef(dcInstance, inputVars));
}
;

const updatePlanningEventDetailsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePlanningEventDetails', inputVars);
}
updatePlanningEventDetailsRef.operationName = 'UpdatePlanningEventDetails';
exports.updatePlanningEventDetailsRef = updatePlanningEventDetailsRef;

exports.updatePlanningEventDetails = function updatePlanningEventDetails(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePlanningEventDetailsRef(dcInstance, inputVars));
}
;

const cancelPlanningEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CancelPlanningEvent', inputVars);
}
cancelPlanningEventRef.operationName = 'CancelPlanningEvent';
exports.cancelPlanningEventRef = cancelPlanningEventRef;

exports.cancelPlanningEvent = function cancelPlanningEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(cancelPlanningEventRef(dcInstance, inputVars));
}
;

const createPlanningAssignmentRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreatePlanningAssignment', inputVars);
}
createPlanningAssignmentRef.operationName = 'CreatePlanningAssignment';
exports.createPlanningAssignmentRef = createPlanningAssignmentRef;

exports.createPlanningAssignment = function createPlanningAssignment(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createPlanningAssignmentRef(dcInstance, inputVars));
}
;

const updatePlanningAssignmentStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdatePlanningAssignmentStatus', inputVars);
}
updatePlanningAssignmentStatusRef.operationName = 'UpdatePlanningAssignmentStatus';
exports.updatePlanningAssignmentStatusRef = updatePlanningAssignmentStatusRef;

exports.updatePlanningAssignmentStatus = function updatePlanningAssignmentStatus(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updatePlanningAssignmentStatusRef(dcInstance, inputVars));
}
;

const createAnalyticsSnapshotRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAnalyticsSnapshot', inputVars);
}
createAnalyticsSnapshotRef.operationName = 'CreateAnalyticsSnapshot';
exports.createAnalyticsSnapshotRef = createAnalyticsSnapshotRef;

exports.createAnalyticsSnapshot = function createAnalyticsSnapshot(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAnalyticsSnapshotRef(dcInstance, inputVars));
}
;

const createRapportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateRapport', inputVars);
}
createRapportRef.operationName = 'CreateRapport';
exports.createRapportRef = createRapportRef;

exports.createRapport = function createRapport(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createRapportRef(dcInstance, inputVars));
}
;

const markRapportGeneratedRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'MarkRapportGenerated', inputVars);
}
markRapportGeneratedRef.operationName = 'MarkRapportGenerated';
exports.markRapportGeneratedRef = markRapportGeneratedRef;

exports.markRapportGenerated = function markRapportGenerated(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(markRapportGeneratedRef(dcInstance, inputVars));
}
;

const createAuditEventRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateAuditEvent', inputVars);
}
createAuditEventRef.operationName = 'CreateAuditEvent';
exports.createAuditEventRef = createAuditEventRef;

exports.createAuditEvent = function createAuditEvent(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createAuditEventRef(dcInstance, inputVars));
}
;

const createCheckpointRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointRun', inputVars);
}
createCheckpointRunRef.operationName = 'CreateCheckpointRun';
exports.createCheckpointRunRef = createCheckpointRunRef;

exports.createCheckpointRun = function createCheckpointRun(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointRunRef(dcInstance, inputVars));
}
;

const createCheckpointStepRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointStep', inputVars);
}
createCheckpointStepRef.operationName = 'CreateCheckpointStep';
exports.createCheckpointStepRef = createCheckpointStepRef;

exports.createCheckpointStep = function createCheckpointStep(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointStepRef(dcInstance, inputVars));
}
;

const createCheckpointArtifactRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointArtifact', inputVars);
}
createCheckpointArtifactRef.operationName = 'CreateCheckpointArtifact';
exports.createCheckpointArtifactRef = createCheckpointArtifactRef;

exports.createCheckpointArtifact = function createCheckpointArtifact(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointArtifactRef(dcInstance, inputVars));
}
;

const createCheckpointDecisionRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateCheckpointDecision', inputVars);
}
createCheckpointDecisionRef.operationName = 'CreateCheckpointDecision';
exports.createCheckpointDecisionRef = createCheckpointDecisionRef;

exports.createCheckpointDecision = function createCheckpointDecision(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createCheckpointDecisionRef(dcInstance, inputVars));
}
;

const createDataImportRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDataImportRun', inputVars);
}
createDataImportRunRef.operationName = 'CreateDataImportRun';
exports.createDataImportRunRef = createDataImportRunRef;

exports.createDataImportRun = function createDataImportRun(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDataImportRunRef(dcInstance, inputVars));
}
;

const createDataImportIssueRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateDataImportIssue', inputVars);
}
createDataImportIssueRef.operationName = 'CreateDataImportIssue';
exports.createDataImportIssueRef = createDataImportIssueRef;

exports.createDataImportIssue = function createDataImportIssue(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createDataImportIssueRef(dcInstance, inputVars));
}
;

const createEntityChangeLogRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateEntityChangeLog', inputVars);
}
createEntityChangeLogRef.operationName = 'CreateEntityChangeLog';
exports.createEntityChangeLogRef = createEntityChangeLogRef;

exports.createEntityChangeLog = function createEntityChangeLog(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createEntityChangeLogRef(dcInstance, inputVars));
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

const listUsersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUsers');
}
listUsersRef.operationName = 'ListUsers';
exports.listUsersRef = listUsersRef;

exports.listUsers = function listUsers(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listUsersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listOperationalClientsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOperationalClients');
}
listOperationalClientsRef.operationName = 'ListOperationalClients';
exports.listOperationalClientsRef = listOperationalClientsRef;

exports.listOperationalClients = function listOperationalClients(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listOperationalClientsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
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

const listOperationalChantiersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListOperationalChantiers');
}
listOperationalChantiersRef.operationName = 'ListOperationalChantiers';
exports.listOperationalChantiersRef = listOperationalChantiersRef;

exports.listOperationalChantiers = function listOperationalChantiers(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listOperationalChantiersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
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

const listDevisRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDevis');
}
listDevisRef.operationName = 'ListDevis';
exports.listDevisRef = listDevisRef;

exports.listDevis = function listDevis(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listDevisRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listDevisByClientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDevisByClient', inputVars);
}
listDevisByClientRef.operationName = 'ListDevisByClient';
exports.listDevisByClientRef = listDevisByClientRef;

exports.listDevisByClient = function listDevisByClient(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listDevisByClientRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listDevisByChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDevisByChantier', inputVars);
}
listDevisByChantierRef.operationName = 'ListDevisByChantier';
exports.listDevisByChantierRef = listDevisByChantierRef;

exports.listDevisByChantier = function listDevisByChantier(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listDevisByChantierRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
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

const listDocumentFoldersRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDocumentFolders');
}
listDocumentFoldersRef.operationName = 'ListDocumentFolders';
exports.listDocumentFoldersRef = listDocumentFoldersRef;

exports.listDocumentFolders = function listDocumentFolders(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listDocumentFoldersRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listDocumentsAttachesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDocumentsAttaches');
}
listDocumentsAttachesRef.operationName = 'ListDocumentsAttaches';
exports.listDocumentsAttachesRef = listDocumentsAttachesRef;

exports.listDocumentsAttaches = function listDocumentsAttaches(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listDocumentsAttachesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listDocumentsByChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDocumentsByChantier', inputVars);
}
listDocumentsByChantierRef.operationName = 'ListDocumentsByChantier';
exports.listDocumentsByChantierRef = listDocumentsByChantierRef;

exports.listDocumentsByChantier = function listDocumentsByChantier(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listDocumentsByChantierRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listPrevisionnelExercisesRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPrevisionnelExercises');
}
listPrevisionnelExercisesRef.operationName = 'ListPrevisionnelExercises';
exports.listPrevisionnelExercisesRef = listPrevisionnelExercisesRef;

exports.listPrevisionnelExercises = function listPrevisionnelExercises(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listPrevisionnelExercisesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listPrevisionnelLinesByExerciseRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPrevisionnelLinesByExercise', inputVars);
}
listPrevisionnelLinesByExerciseRef.operationName = 'ListPrevisionnelLinesByExercise';
exports.listPrevisionnelLinesByExerciseRef = listPrevisionnelLinesByExerciseRef;

exports.listPrevisionnelLinesByExercise = function listPrevisionnelLinesByExercise(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPrevisionnelLinesByExerciseRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const searchClientAliasesRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'SearchClientAliases', inputVars);
}
searchClientAliasesRef.operationName = 'SearchClientAliases';
exports.searchClientAliasesRef = searchClientAliasesRef;

exports.searchClientAliases = function searchClientAliases(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(searchClientAliasesRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listPrevisionnelCellEditsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPrevisionnelCellEdits', inputVars);
}
listPrevisionnelCellEditsRef.operationName = 'ListPrevisionnelCellEdits';
exports.listPrevisionnelCellEditsRef = listPrevisionnelCellEditsRef;

exports.listPrevisionnelCellEdits = function listPrevisionnelCellEdits(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPrevisionnelCellEditsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listEmailThreadsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEmailThreads');
}
listEmailThreadsRef.operationName = 'ListEmailThreads';
exports.listEmailThreadsRef = listEmailThreadsRef;

exports.listEmailThreads = function listEmailThreads(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listEmailThreadsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listUnreadEmailThreadsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListUnreadEmailThreads');
}
listUnreadEmailThreadsRef.operationName = 'ListUnreadEmailThreads';
exports.listUnreadEmailThreadsRef = listUnreadEmailThreadsRef;

exports.listUnreadEmailThreads = function listUnreadEmailThreads(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listUnreadEmailThreadsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getEmailThreadRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetEmailThread', inputVars);
}
getEmailThreadRef.operationName = 'GetEmailThread';
exports.getEmailThreadRef = getEmailThreadRef;

exports.getEmailThread = function getEmailThread(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getEmailThreadRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listPlanningEventsByPeriodRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlanningEventsByPeriod', inputVars);
}
listPlanningEventsByPeriodRef.operationName = 'ListPlanningEventsByPeriod';
exports.listPlanningEventsByPeriodRef = listPlanningEventsByPeriodRef;

exports.listPlanningEventsByPeriod = function listPlanningEventsByPeriod(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPlanningEventsByPeriodRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listPlanningEventsByChantierRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListPlanningEventsByChantier', inputVars);
}
listPlanningEventsByChantierRef.operationName = 'ListPlanningEventsByChantier';
exports.listPlanningEventsByChantierRef = listPlanningEventsByChantierRef;

exports.listPlanningEventsByChantier = function listPlanningEventsByChantier(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listPlanningEventsByChantierRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listAnalyticsSnapshotsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAnalyticsSnapshots', inputVars);
}
listAnalyticsSnapshotsRef.operationName = 'ListAnalyticsSnapshots';
exports.listAnalyticsSnapshotsRef = listAnalyticsSnapshotsRef;

exports.listAnalyticsSnapshots = function listAnalyticsSnapshots(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listAnalyticsSnapshotsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getAnalyticsSnapshotRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetAnalyticsSnapshot', inputVars);
}
getAnalyticsSnapshotRef.operationName = 'GetAnalyticsSnapshot';
exports.getAnalyticsSnapshotRef = getAnalyticsSnapshotRef;

exports.getAnalyticsSnapshot = function getAnalyticsSnapshot(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getAnalyticsSnapshotRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listRapportsRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRapports');
}
listRapportsRef.operationName = 'ListRapports';
exports.listRapportsRef = listRapportsRef;

exports.listRapports = function listRapports(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(listRapportsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getRapportRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetRapport', inputVars);
}
getRapportRef.operationName = 'GetRapport';
exports.getRapportRef = getRapportRef;

exports.getRapport = function getRapport(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getRapportRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listRecentAuditEventsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListRecentAuditEvents', inputVars);
}
listRecentAuditEventsRef.operationName = 'ListRecentAuditEvents';
exports.listRecentAuditEventsRef = listRecentAuditEventsRef;

exports.listRecentAuditEvents = function listRecentAuditEvents(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listRecentAuditEventsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listEntityChangeLogsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListEntityChangeLogs', inputVars);
}
listEntityChangeLogsRef.operationName = 'ListEntityChangeLogs';
exports.listEntityChangeLogsRef = listEntityChangeLogsRef;

exports.listEntityChangeLogs = function listEntityChangeLogs(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listEntityChangeLogsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listCheckpointRunsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListCheckpointRuns', inputVars);
}
listCheckpointRunsRef.operationName = 'ListCheckpointRuns';
exports.listCheckpointRunsRef = listCheckpointRunsRef;

exports.listCheckpointRuns = function listCheckpointRuns(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listCheckpointRunsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getCheckpointRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCheckpointRun', inputVars);
}
getCheckpointRunRef.operationName = 'GetCheckpointRun';
exports.getCheckpointRunRef = getCheckpointRunRef;

exports.getCheckpointRun = function getCheckpointRun(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getCheckpointRunRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const listDataImportRunsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListDataImportRuns', inputVars);
}
listDataImportRunsRef.operationName = 'ListDataImportRuns';
exports.listDataImportRunsRef = listDataImportRunsRef;

exports.listDataImportRuns = function listDataImportRuns(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listDataImportRunsRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;

const getDataImportRunRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetDataImportRun', inputVars);
}
getDataImportRunRef.operationName = 'GetDataImportRun';
exports.getDataImportRunRef = getDataImportRunRef;

exports.getDataImportRun = function getDataImportRun(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(getDataImportRunRef(dcInstance, inputVars), inputOpts && inputOpts.fetchPolicy);
}
;
