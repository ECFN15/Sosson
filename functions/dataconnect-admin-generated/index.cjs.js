const { validateAdminArgs } = require('firebase-admin/data-connect');

const connectorConfig = {
  connector: 'sosson',
  serviceId: 'sosson-sandbox-service',
  location: 'europe-west9'
};
exports.connectorConfig = connectorConfig;

function submitCurrentTeamProfile(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('SubmitCurrentTeamProfile', inputVars, inputOpts);
}
exports.submitCurrentTeamProfile = submitCurrentTeamProfile;

function convertTeamProfileSubmission(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('ConvertTeamProfileSubmission', inputVars, inputOpts);
}
exports.convertTeamProfileSubmission = convertTeamProfileSubmission;

function createSossonTeam(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateSossonTeam', inputVars, inputOpts);
}
exports.createSossonTeam = createSossonTeam;

function updateSossonTeam(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateSossonTeam', inputVars, inputOpts);
}
exports.updateSossonTeam = updateSossonTeam;

function createSossonTeamMember(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateSossonTeamMember', inputVars, inputOpts);
}
exports.createSossonTeamMember = createSossonTeamMember;

function updateSossonTeamMember(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateSossonTeamMember', inputVars, inputOpts);
}
exports.updateSossonTeamMember = updateSossonTeamMember;

function createSossonTeamLeavePeriod(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateSossonTeamLeavePeriod', inputVars, inputOpts);
}
exports.createSossonTeamLeavePeriod = createSossonTeamLeavePeriod;

function createSossonWorkTimeEntry(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateSossonWorkTimeEntry', inputVars, inputOpts);
}
exports.createSossonWorkTimeEntry = createSossonWorkTimeEntry;

function createSossonPayrollPeriod(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateSossonPayrollPeriod', inputVars, inputOpts);
}
exports.createSossonPayrollPeriod = createSossonPayrollPeriod;

function createPlanningJobSheet(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreatePlanningJobSheet', inputVars, inputOpts);
}
exports.createPlanningJobSheet = createPlanningJobSheet;

function updatePlanningJobSheetProgress(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdatePlanningJobSheetProgress', inputVars, inputOpts);
}
exports.updatePlanningJobSheetProgress = updatePlanningJobSheetProgress;

function completePlanningJobSheet(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CompletePlanningJobSheet', inputVars, inputOpts);
}
exports.completePlanningJobSheet = completePlanningJobSheet;

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

function createDevis(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateDevis', inputVars, inputOpts);
}
exports.createDevis = createDevis;

function updateDevisStatut(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateDevisStatut', inputVars, inputOpts);
}
exports.updateDevisStatut = updateDevisStatut;

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

function createPrevisionnelWorkbookVersionPending(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreatePrevisionnelWorkbookVersionPending', inputVars, inputOpts);
}
exports.createPrevisionnelWorkbookVersionPending = createPrevisionnelWorkbookVersionPending;

function markPrevisionnelWorkbookVersionGenerating(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('MarkPrevisionnelWorkbookVersionGenerating', inputVars, inputOpts);
}
exports.markPrevisionnelWorkbookVersionGenerating = markPrevisionnelWorkbookVersionGenerating;

function markPrevisionnelWorkbookVersionGenerated(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('MarkPrevisionnelWorkbookVersionGenerated', inputVars, inputOpts);
}
exports.markPrevisionnelWorkbookVersionGenerated = markPrevisionnelWorkbookVersionGenerated;

function markPrevisionnelWorkbookVersionFailed(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('MarkPrevisionnelWorkbookVersionFailed', inputVars, inputOpts);
}
exports.markPrevisionnelWorkbookVersionFailed = markPrevisionnelWorkbookVersionFailed;

function createEmailThread(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateEmailThread', inputVars, inputOpts);
}
exports.createEmailThread = createEmailThread;

function updateEmailThreadStatusAndLinks(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdateEmailThreadStatusAndLinks', inputVars, inputOpts);
}
exports.updateEmailThreadStatusAndLinks = updateEmailThreadStatusAndLinks;

function createEmailMessage(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateEmailMessage', inputVars, inputOpts);
}
exports.createEmailMessage = createEmailMessage;

function createEmailAttachment(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateEmailAttachment', inputVars, inputOpts);
}
exports.createEmailAttachment = createEmailAttachment;

function createPlanningEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreatePlanningEvent', inputVars, inputOpts);
}
exports.createPlanningEvent = createPlanningEvent;

function updatePlanningEventStatus(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdatePlanningEventStatus', inputVars, inputOpts);
}
exports.updatePlanningEventStatus = updatePlanningEventStatus;

function updatePlanningEventDetails(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdatePlanningEventDetails', inputVars, inputOpts);
}
exports.updatePlanningEventDetails = updatePlanningEventDetails;

function cancelPlanningEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CancelPlanningEvent', inputVars, inputOpts);
}
exports.cancelPlanningEvent = cancelPlanningEvent;

function createPlanningAssignment(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreatePlanningAssignment', inputVars, inputOpts);
}
exports.createPlanningAssignment = createPlanningAssignment;

function updatePlanningAssignmentStatus(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdatePlanningAssignmentStatus', inputVars, inputOpts);
}
exports.updatePlanningAssignmentStatus = updatePlanningAssignmentStatus;

function createAnalyticsSnapshot(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateAnalyticsSnapshot', inputVars, inputOpts);
}
exports.createAnalyticsSnapshot = createAnalyticsSnapshot;

function createRapport(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateRapport', inputVars, inputOpts);
}
exports.createRapport = createRapport;

function markRapportGenerated(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('MarkRapportGenerated', inputVars, inputOpts);
}
exports.markRapportGenerated = markRapportGenerated;

function createAuditEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateAuditEvent', inputVars, inputOpts);
}
exports.createAuditEvent = createAuditEvent;

function createCheckpointRun(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateCheckpointRun', inputVars, inputOpts);
}
exports.createCheckpointRun = createCheckpointRun;

function createCheckpointStep(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateCheckpointStep', inputVars, inputOpts);
}
exports.createCheckpointStep = createCheckpointStep;

function createCheckpointArtifact(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateCheckpointArtifact', inputVars, inputOpts);
}
exports.createCheckpointArtifact = createCheckpointArtifact;

function createCheckpointDecision(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateCheckpointDecision', inputVars, inputOpts);
}
exports.createCheckpointDecision = createCheckpointDecision;

function createDataImportRun(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateDataImportRun', inputVars, inputOpts);
}
exports.createDataImportRun = createDataImportRun;

function createDataImportIssue(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateDataImportIssue', inputVars, inputOpts);
}
exports.createDataImportIssue = createDataImportIssue;

function createEntityChangeLog(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreateEntityChangeLog', inputVars, inputOpts);
}
exports.createEntityChangeLog = createEntityChangeLog;

function getCurrentUser(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetCurrentUser', undefined, inputOpts);
}
exports.getCurrentUser = getCurrentUser;

function listUsers(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListUsers', undefined, inputOpts);
}
exports.listUsers = listUsers;

function getCurrentTeamProfileSubmission(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetCurrentTeamProfileSubmission', undefined, inputOpts);
}
exports.getCurrentTeamProfileSubmission = getCurrentTeamProfileSubmission;

function listTeamProfileSubmissions(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListTeamProfileSubmissions', undefined, inputOpts);
}
exports.listTeamProfileSubmissions = listTeamProfileSubmissions;

function listSossonTeams(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSossonTeams', undefined, inputOpts);
}
exports.listSossonTeams = listSossonTeams;

function listSossonWorkTimeEntries(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSossonWorkTimeEntries', inputVars, inputOpts);
}
exports.listSossonWorkTimeEntries = listSossonWorkTimeEntries;

function listSossonPayrollPeriods(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListSossonPayrollPeriods', inputVars, inputOpts);
}
exports.listSossonPayrollPeriods = listSossonPayrollPeriods;

function listOperationalClients(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListOperationalClients', undefined, inputOpts);
}
exports.listOperationalClients = listOperationalClients;

function getClient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetClient', inputVars, inputOpts);
}
exports.getClient = getClient;

function listOperationalChantiers(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListOperationalChantiers', undefined, inputOpts);
}
exports.listOperationalChantiers = listOperationalChantiers;

function getChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetChantier', inputVars, inputOpts);
}
exports.getChantier = getChantier;

function listDevis(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListDevis', undefined, inputOpts);
}
exports.listDevis = listDevis;

function listDevisByClient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListDevisByClient', inputVars, inputOpts);
}
exports.listDevisByClient = listDevisByClient;

function listDevisByChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListDevisByChantier', inputVars, inputOpts);
}
exports.listDevisByChantier = listDevisByChantier;

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

function getPrevisionnelWorkbookVersion(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetPrevisionnelWorkbookVersion', inputVars, inputOpts);
}
exports.getPrevisionnelWorkbookVersion = getPrevisionnelWorkbookVersion;

function listPrevisionnelWorkbookVersions(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPrevisionnelWorkbookVersions', inputVars, inputOpts);
}
exports.listPrevisionnelWorkbookVersions = listPrevisionnelWorkbookVersions;

function getLatestGeneratedPrevisionnelWorkbookVersion(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetLatestGeneratedPrevisionnelWorkbookVersion', inputVars, inputOpts);
}
exports.getLatestGeneratedPrevisionnelWorkbookVersion = getLatestGeneratedPrevisionnelWorkbookVersion;

function listEmailThreads(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListEmailThreads', undefined, inputOpts);
}
exports.listEmailThreads = listEmailThreads;

function listEmailThreadsByChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListEmailThreadsByChantier', inputVars, inputOpts);
}
exports.listEmailThreadsByChantier = listEmailThreadsByChantier;

function listUnreadEmailThreads(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListUnreadEmailThreads', undefined, inputOpts);
}
exports.listUnreadEmailThreads = listUnreadEmailThreads;

function getEmailThread(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetEmailThread', inputVars, inputOpts);
}
exports.getEmailThread = getEmailThread;

function listPlanningEventsByPeriod(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPlanningEventsByPeriod', inputVars, inputOpts);
}
exports.listPlanningEventsByPeriod = listPlanningEventsByPeriod;

function listPlanningEventsByChantier(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPlanningEventsByChantier', inputVars, inputOpts);
}
exports.listPlanningEventsByChantier = listPlanningEventsByChantier;

function listPlanningJobSheetsByEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPlanningJobSheetsByEvent', inputVars, inputOpts);
}
exports.listPlanningJobSheetsByEvent = listPlanningJobSheetsByEvent;

function listAnalyticsSnapshots(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListAnalyticsSnapshots', inputVars, inputOpts);
}
exports.listAnalyticsSnapshots = listAnalyticsSnapshots;

function getAnalyticsSnapshot(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetAnalyticsSnapshot', inputVars, inputOpts);
}
exports.getAnalyticsSnapshot = getAnalyticsSnapshot;

function listRapports(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListRapports', undefined, inputOpts);
}
exports.listRapports = listRapports;

function getRapport(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetRapport', inputVars, inputOpts);
}
exports.getRapport = getRapport;

function listRecentAuditEvents(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListRecentAuditEvents', inputVars, inputOpts);
}
exports.listRecentAuditEvents = listRecentAuditEvents;

function listEntityChangeLogs(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListEntityChangeLogs', inputVars, inputOpts);
}
exports.listEntityChangeLogs = listEntityChangeLogs;

function listCheckpointRuns(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListCheckpointRuns', inputVars, inputOpts);
}
exports.listCheckpointRuns = listCheckpointRuns;

function getCheckpointRun(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetCheckpointRun', inputVars, inputOpts);
}
exports.getCheckpointRun = getCheckpointRun;

function listDataImportRuns(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListDataImportRuns', inputVars, inputOpts);
}
exports.listDataImportRuns = listDataImportRuns;

function getDataImportRun(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetDataImportRun', inputVars, inputOpts);
}
exports.getDataImportRun = getDataImportRun;

