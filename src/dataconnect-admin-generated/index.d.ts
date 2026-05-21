import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface AnalyticsSnapshot_Key {
  id: UUIDString;
  __typename?: 'AnalyticsSnapshot_Key';
}

export interface AuditEvent_Key {
  id: UUIDString;
  __typename?: 'AuditEvent_Key';
}

export interface CancelPlanningEventData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}

export interface CancelPlanningEventVariables {
  id: UUIDString;
  notes?: string | null;
}

export interface Chantier_Key {
  id: UUIDString;
  __typename?: 'Chantier_Key';
}

export interface CheckpointArtifact_Key {
  id: UUIDString;
  __typename?: 'CheckpointArtifact_Key';
}

export interface CheckpointDecision_Key {
  id: UUIDString;
  __typename?: 'CheckpointDecision_Key';
}

export interface CheckpointRun_Key {
  id: UUIDString;
  __typename?: 'CheckpointRun_Key';
}

export interface CheckpointStep_Key {
  id: UUIDString;
  __typename?: 'CheckpointStep_Key';
}

export interface ClientAlias_Key {
  id: UUIDString;
  __typename?: 'ClientAlias_Key';
}

export interface Client_Key {
  id: UUIDString;
  __typename?: 'Client_Key';
}

export interface CompletePlanningJobSheetData {
  query?: {
  };
    planningJobSheet_update?: PlanningJobSheet_Key | null;
}

export interface CompletePlanningJobSheetVariables {
  id: UUIDString;
  actualHours?: number | null;
  completionNotes?: string | null;
  proofStoragePath?: string | null;
  proofSha256?: string | null;
  reportStoragePath?: string | null;
  reportSha256?: string | null;
}

export interface ConvertTeamProfileSubmissionData {
  query?: {
  };
    user_upsert: User_Key;
    teamProfileSubmission_update?: TeamProfileSubmission_Key | null;
}

export interface ConvertTeamProfileSubmissionVariables {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
  equipeTypeSouhaite?: string | null;
  equipeFinaleId?: string | null;
  poste?: string | null;
  telephone?: string | null;
  sourceConnexion?: string | null;
  convertedMemberId?: string | null;
  reviewNote?: string | null;
}

export interface CreateAnalyticsSnapshotData {
  query?: {
  };
    analyticsSnapshot_insert: AnalyticsSnapshot_Key;
}

export interface CreateAnalyticsSnapshotVariables {
  environment: string;
  snapshotType: string;
  scopeType: string;
  scopeId?: string | null;
  periodStart?: DateString | null;
  periodEnd?: DateString | null;
  status: string;
  totalCaPrevision?: number | null;
  totalCaRealise?: number | null;
  totalFacturesTtc?: number | null;
  totalMarge?: number | null;
  payloadPath?: string | null;
  payloadHash?: string | null;
  sourceWatermark?: string | null;
}

export interface CreateAuditEventData {
  query?: {
  };
    auditEvent_insert: AuditEvent_Key;
}

export interface CreateAuditEventVariables {
  environment: string;
  eventType: string;
  severity: string;
  entityType?: string | null;
  entityId?: string | null;
  action: string;
  status: string;
  actorEmail?: string | null;
  source: string;
  message?: string | null;
  evidencePath?: string | null;
  evidenceHash?: string | null;
}

export interface CreateChantierData {
  query?: {
  };
    chantier_insert: Chantier_Key;
}

export interface CreateChantierVariables {
  clientId: UUIDString;
  chefChantierId?: string | null;
  nom: string;
  statut: string;
  dateDebut: DateString;
  dateFinPrevue: DateString;
  budgetPrevisionnel: number;
  description?: string | null;
  adresse?: string | null;
}

export interface CreateCheckpointArtifactData {
  query?: {
  };
    checkpointArtifact_insert: CheckpointArtifact_Key;
}

export interface CreateCheckpointArtifactVariables {
  runId: UUIDString;
  stepId?: UUIDString | null;
  artifactType: string;
  path: string;
  storagePath?: string | null;
  sha256?: string | null;
  sizeBytes?: number | null;
  mimeType?: string | null;
  description?: string | null;
}

export interface CreateCheckpointDecisionData {
  query?: {
  };
    checkpointDecision_insert: CheckpointDecision_Key;
}

export interface CreateCheckpointDecisionVariables {
  runId: UUIDString;
  decisionType: string;
  status: string;
  decidedByEmail?: string | null;
  decisionText: string;
  validationPhraseHash?: string | null;
}

export interface CreateCheckpointRunData {
  query?: {
  };
    checkpointRun_insert: CheckpointRun_Key;
}

export interface CreateCheckpointRunVariables {
  environment: string;
  checkpointKey: string;
  title: string;
  status: string;
  finishedAt?: TimestampString | null;
  commitSha?: string | null;
  sourceBranch?: string | null;
  command?: string | null;
  actorEmail?: string | null;
  summary?: string | null;
}

export interface CreateCheckpointStepData {
  query?: {
  };
    checkpointStep_insert: CheckpointStep_Key;
}

export interface CreateCheckpointStepVariables {
  runId: UUIDString;
  stepKey: string;
  label: string;
  status: string;
  command?: string | null;
  exitCode?: number | null;
  durationMs?: number | null;
  startedAt?: TimestampString | null;
  finishedAt?: TimestampString | null;
  logPath?: string | null;
  logHash?: string | null;
  message?: string | null;
}

export interface CreateClientData {
  query?: {
  };
    client_insert: Client_Key;
}

export interface CreateClientVariables {
  type: string;
  nom: string;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  typeChantierCible?: string | null;
  souhaits?: string | null;
  notes?: string | null;
}

export interface CreateDataImportIssueData {
  query?: {
  };
    dataImportIssue_insert: DataImportIssue_Key;
}

export interface CreateDataImportIssueVariables {
  runId: UUIDString;
  severity: string;
  code: string;
  entityType?: string | null;
  entityKey?: string | null;
  sourceSheet?: string | null;
  sourceRow?: number | null;
  message: string;
  resolutionStatus: string;
}

export interface CreateDataImportRunData {
  query?: {
  };
    dataImportRun_insert: DataImportRun_Key;
}

export interface CreateDataImportRunVariables {
  environment: string;
  importKind: string;
  sourceName: string;
  sourcePath?: string | null;
  sourceHash?: string | null;
  status: string;
  finishedAt?: TimestampString | null;
  rowCount?: number | null;
  insertedCount?: number | null;
  updatedCount?: number | null;
  skippedCount?: number | null;
  artifactPath?: string | null;
  artifactHash?: string | null;
  actorEmail?: string | null;
  notes?: string | null;
  previsionnelBatchId?: UUIDString | null;
}

export interface CreateDevisData {
  query?: {
  };
    devis_insert: Devis_Key;
}

export interface CreateDevisVariables {
  clientId: UUIDString;
  chantierId?: UUIDString | null;
  numeroDevis: string;
  titre: string;
  statut: string;
  montantHT?: number | null;
  tva?: number | null;
  montantTTC?: number | null;
  dateDemande: DateString;
  dateEnvoi?: DateString | null;
  dateSignature?: DateString | null;
  typeChantierCible?: string | null;
  description?: string | null;
}

export interface CreateDocumentAttacheData {
  query?: {
  };
    documentAttache_insert: DocumentAttache_Key;
}

export interface CreateDocumentAttacheVariables {
  folderId?: UUIDString | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  devisId?: UUIDString | null;
  factureId?: UUIDString | null;
  nomFichier: string;
  storagePath: string;
  mimeType?: string | null;
  tailleBytes?: number | null;
  sha256?: string | null;
  typeDocument: string;
  statut: string;
  source: string;
  description?: string | null;
  dateDocument?: DateString | null;
}

export interface CreateDocumentFolderData {
  query?: {
  };
    documentFolder_insert: DocumentFolder_Key;
}

export interface CreateDocumentFolderVariables {
  nom: string;
  slug: string;
  parentId?: UUIDString | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  description?: string | null;
}

export interface CreateEmailAttachmentData {
  query?: {
  };
    emailAttachment_insert: EmailAttachment_Key;
}

export interface CreateEmailAttachmentVariables {
  messageId: UUIDString;
  documentId?: UUIDString | null;
  externalAttachmentId: string;
  nomFichier: string;
  storagePath?: string | null;
  mimeType?: string | null;
  tailleBytes?: number | null;
  sha256?: string | null;
  statut: string;
}

export interface CreateEmailMessageData {
  query?: {
  };
    emailMessage_insert: EmailMessage_Key;
}

export interface CreateEmailMessageVariables {
  threadId: UUIDString;
  externalMessageId: string;
  direction: string;
  fromEmail?: string | null;
  fromName?: string | null;
  toSummary?: string | null;
  ccSummary?: string | null;
  subject?: string | null;
  bodyPreview?: string | null;
  bodyStoragePath?: string | null;
  bodyHash?: string | null;
  sentAt?: TimestampString | null;
  receivedAt: TimestampString;
  isRead: boolean;
  hasAttachments: boolean;
}

export interface CreateEmailThreadData {
  query?: {
  };
    emailThread_insert: EmailThread_Key;
}

export interface CreateEmailThreadVariables {
  provider: string;
  externalThreadId: string;
  subject: string;
  statut: string;
  importance?: string | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  assignedToId?: string | null;
  lastMessageAt: TimestampString;
  participantsSummary?: string | null;
  messageCount: number;
  hasAttachments: boolean;
}

export interface CreateEntityChangeLogData {
  query?: {
  };
    entityChangeLog_insert: EntityChangeLog_Key;
}

export interface CreateEntityChangeLogVariables {
  environment: string;
  entityType: string;
  entityId: string;
  action: string;
  source: string;
  actorEmail?: string | null;
  beforeHash?: string | null;
  afterHash?: string | null;
  reason?: string | null;
  auditEventId?: UUIDString | null;
  checkpointRunId?: UUIDString | null;
  dataImportRunId?: UUIDString | null;
}

export interface CreateFactureData {
  query?: {
  };
    facture_insert: Facture_Key;
}

export interface CreateFactureVariables {
  chantierId: UUIDString;
  fournisseur: string;
  numeroFacture: string;
  montantHT: number;
  tva: number;
  montantTTC: number;
  date: DateString;
  categorie: string;
  statut: string;
  description?: string | null;
}

export interface CreatePlanningAssignmentData {
  query?: {
  };
    planningAssignment_insert: PlanningAssignment_Key;
}

export interface CreatePlanningAssignmentVariables {
  eventId: UUIDString;
  userId?: string | null;
  sossonTeamId?: UUIDString | null;
  assignmentRole?: string | null;
  statut: string;
  notes?: string | null;
}

export interface CreatePlanningEventData {
  query?: {
  };
    planningEvent_insert: PlanningEvent_Key;
}

export interface CreatePlanningEventVariables {
  chantierId?: UUIDString | null;
  titre: string;
  eventType: string;
  statut: string;
  startAt: TimestampString;
  endAt: TimestampString;
  location?: string | null;
  notes?: string | null;
}

export interface CreatePlanningJobSheetData {
  query?: {
  };
    planningJobSheet_insert: PlanningJobSheet_Key;
}

export interface CreatePlanningJobSheetVariables {
  eventId: UUIDString;
  assignmentId?: UUIDString | null;
  chantierId?: UUIDString | null;
  sossonTeamId?: UUIDString | null;
  leadMemberId?: UUIDString | null;
  titre: string;
  statut: string;
  instructions?: string | null;
  plannedHours?: number | null;
  actualHours?: number | null;
  checklist?: string | null;
  materials?: string | null;
  blockers?: string | null;
}

export interface CreatePrevisionnelImportBatchData {
  query?: {
  };
    previsionnelImportBatch_insert: PrevisionnelImportBatch_Key;
}

export interface CreatePrevisionnelImportBatchVariables {
  workbook: string;
  sourcePath: string;
  workbookHash?: string | null;
  notes?: string | null;
}

export interface CreateRapportData {
  query?: {
  };
    rapport_insert: Rapport_Key;
}

export interface CreateRapportVariables {
  snapshotId?: UUIDString | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  titre: string;
  rapportType: string;
  statut: string;
  periodeDebut?: DateString | null;
  periodeFin?: DateString | null;
  format?: string | null;
  storagePath?: string | null;
  sha256?: string | null;
  summary?: string | null;
  generatedAt?: TimestampString | null;
}

export interface CreateSossonPayrollPeriodData {
  query?: {
  };
    sossonPayrollPeriod_insert: SossonPayrollPeriod_Key;
}

export interface CreateSossonPayrollPeriodVariables {
  memberId: UUIDString;
  periodLabel: string;
  year: number;
  month: number;
  baseSalaryGrossMonthly?: number | null;
  overtimeHours?: number | null;
  paidLeaveDays?: number | null;
  absenceDays?: number | null;
  grossEstimate?: number | null;
  status: string;
  notes?: string | null;
}

export interface CreateSossonTeamData {
  query?: {
  };
    sossonTeam_insert: SossonTeam_Key;
}

export interface CreateSossonTeamLeavePeriodData {
  query?: {
  };
    sossonTeamLeavePeriod_insert: SossonTeamLeavePeriod_Key;
}

export interface CreateSossonTeamLeavePeriodVariables {
  memberId: UUIDString;
  type: string;
  month: string;
  startDay: number;
  endDay: number;
  status: string;
  note?: string | null;
}

export interface CreateSossonTeamMemberData {
  query?: {
  };
    sossonTeamMember_insert: SossonTeamMember_Key;
}

export interface CreateSossonTeamMemberVariables {
  teamId: UUIDString;
  userId?: string | null;
  firstName: string;
  lastName: string;
  title: string;
  qualification?: string | null;
  level?: string | null;
  salaryGrossMonthly?: number | null;
  contract?: string | null;
  coefficient?: string | null;
  email?: string | null;
  phone?: string | null;
  status: string;
  site?: string | null;
  activeSites?: string | null;
  responsibilities?: string | null;
  permissions?: string | null;
}

export interface CreateSossonTeamVariables {
  code: string;
  name: string;
  type: string;
  statut: string;
  theme?: string | null;
  leadName?: string | null;
  description?: string | null;
  activeSites?: string | null;
  ordre?: number | null;
}

export interface CreateSossonWorkTimeEntryData {
  query?: {
  };
    sossonWorkTimeEntry_insert: SossonWorkTimeEntry_Key;
}

export interface CreateSossonWorkTimeEntryVariables {
  memberId: UUIDString;
  chantierId?: UUIDString | null;
  planningEventId?: UUIDString | null;
  planningAssignmentId?: UUIDString | null;
  jobSheetId?: UUIDString | null;
  workDate: DateString;
  hours: number;
  kind: string;
  status: string;
  notes?: string | null;
}

export interface DataImportIssue_Key {
  id: UUIDString;
  __typename?: 'DataImportIssue_Key';
}

export interface DataImportRun_Key {
  id: UUIDString;
  __typename?: 'DataImportRun_Key';
}

export interface Devis_Key {
  id: UUIDString;
  __typename?: 'Devis_Key';
}

export interface DocumentAttache_Key {
  id: UUIDString;
  __typename?: 'DocumentAttache_Key';
}

export interface DocumentFolder_Key {
  id: UUIDString;
  __typename?: 'DocumentFolder_Key';
}

export interface EmailAttachment_Key {
  id: UUIDString;
  __typename?: 'EmailAttachment_Key';
}

export interface EmailMessage_Key {
  id: UUIDString;
  __typename?: 'EmailMessage_Key';
}

export interface EmailThread_Key {
  id: UUIDString;
  __typename?: 'EmailThread_Key';
}

export interface EntityChangeLog_Key {
  id: UUIDString;
  __typename?: 'EntityChangeLog_Key';
}

export interface Facture_Key {
  id: UUIDString;
  __typename?: 'Facture_Key';
}

export interface GetAnalyticsSnapshotData {
  analyticsSnapshot?: {
    id: UUIDString;
    environment: string;
    snapshotType: string;
    scopeType: string;
    scopeId?: string | null;
    periodStart?: DateString | null;
    periodEnd?: DateString | null;
    status: string;
    totalCaPrevision?: number | null;
    totalCaRealise?: number | null;
    totalFacturesTtc?: number | null;
    totalMarge?: number | null;
    payloadPath?: string | null;
    payloadHash?: string | null;
    sourceWatermark?: string | null;
    createdBy?: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
      avatar?: string | null;
    } & User_Key;
      rapports: ({
        id: UUIDString;
        titre: string;
        rapportType: string;
        statut: string;
        format?: string | null;
        storagePath?: string | null;
        sha256?: string | null;
        generatedAt?: TimestampString | null;
      } & Rapport_Key)[];
        dateCreation: TimestampString;
  } & AnalyticsSnapshot_Key;
}

export interface GetAnalyticsSnapshotVariables {
  id: UUIDString;
}

export interface GetChantierData {
  chantier?: {
    id: UUIDString;
    nom: string;
    statut: string;
    dateDebut: DateString;
    dateFinPrevue: DateString;
    dateFin?: DateString | null;
    budgetPrevisionnel: number;
    description?: string | null;
    adresse?: string | null;
    client: {
      id: UUIDString;
      nom: string;
      type: string;
      prenom?: string | null;
      email?: string | null;
      telephone?: string | null;
      adresse?: string | null;
      ville?: string | null;
      codePostal?: string | null;
      typeChantierCible?: string | null;
      souhaits?: string | null;
      notes?: string | null;
    } & Client_Key;
      chefChantier?: {
        id: string;
        nom: string;
        prenom: string;
        email: string;
        avatar?: string | null;
      } & User_Key;
        devis: ({
          id: UUIDString;
          numeroDevis: string;
          titre: string;
          statut: string;
          montantHT?: number | null;
          tva?: number | null;
          montantTTC?: number | null;
          dateDemande: DateString;
          dateEnvoi?: DateString | null;
          dateSignature?: DateString | null;
          client: {
            id: UUIDString;
            nom: string;
            type: string;
          } & Client_Key;
        } & Devis_Key)[];
          factures: ({
            id: UUIDString;
            fournisseur: string;
            numeroFacture: string;
            montantHT: number;
            tva: number;
            montantTTC: number;
            date: DateString;
            categorie: string;
            statut: string;
            description?: string | null;
          } & Facture_Key)[];
  } & Chantier_Key;
}

export interface GetChantierVariables {
  id: UUIDString;
}

export interface GetCheckpointRunData {
  checkpointRun?: {
    id: UUIDString;
    environment: string;
    checkpointKey: string;
    title: string;
    status: string;
    startedAt: TimestampString;
    finishedAt?: TimestampString | null;
    commitSha?: string | null;
    sourceBranch?: string | null;
    command?: string | null;
    actorUid: string;
    actorEmail?: string | null;
    summary?: string | null;
    dateCreation: TimestampString;
    steps: ({
      id: UUIDString;
      stepKey: string;
      label: string;
      status: string;
      command?: string | null;
      exitCode?: number | null;
      durationMs?: number | null;
      startedAt?: TimestampString | null;
      finishedAt?: TimestampString | null;
      logPath?: string | null;
      logHash?: string | null;
      message?: string | null;
      dateCreation: TimestampString;
    } & CheckpointStep_Key)[];
      artifacts: ({
        id: UUIDString;
        artifactType: string;
        path: string;
        storagePath?: string | null;
        sha256?: string | null;
        sizeBytes?: number | null;
        mimeType?: string | null;
        description?: string | null;
        step?: {
          id: UUIDString;
          stepKey: string;
          label: string;
          status: string;
        } & CheckpointStep_Key;
          dateCreation: TimestampString;
      } & CheckpointArtifact_Key)[];
        decisions: ({
          id: UUIDString;
          decisionType: string;
          status: string;
          decidedByUid: string;
          decidedByEmail?: string | null;
          decisionText: string;
          validationPhraseHash?: string | null;
          dateCreation: TimestampString;
        } & CheckpointDecision_Key)[];
  } & CheckpointRun_Key;
}

export interface GetCheckpointRunVariables {
  id: UUIDString;
}

export interface GetClientData {
  client?: {
    id: UUIDString;
    type: string;
    nom: string;
    prenom?: string | null;
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    ville?: string | null;
    codePostal?: string | null;
    typeChantierCible?: string | null;
    souhaits?: string | null;
    notes?: string | null;
    dateCreation: TimestampString;
    devis: ({
      id: UUIDString;
      numeroDevis: string;
      titre: string;
      statut: string;
      montantTTC?: number | null;
      dateDemande: DateString;
      dateEnvoi?: DateString | null;
      dateSignature?: DateString | null;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
      } & Chantier_Key;
    } & Devis_Key)[];
      chantiers: ({
        id: UUIDString;
        nom: string;
        statut: string;
        dateDebut: DateString;
        dateFinPrevue: DateString;
        budgetPrevisionnel: number;
      } & Chantier_Key)[];
  } & Client_Key;
}

export interface GetClientVariables {
  id: UUIDString;
}

export interface GetCurrentTeamProfileSubmissionData {
  teamProfileSubmission?: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    requestedTeamType: string;
    status: string;
    sourceConnexion?: string | null;
    convertedTeamId?: string | null;
    convertedMemberId?: string | null;
    reviewNote?: string | null;
    reviewedAt?: TimestampString | null;
    reviewedBy?: {
      id: string;
      nom: string;
      prenom: string;
      avatar?: string | null;
    } & User_Key;
      dateModification: TimestampString;
      dateCreation: TimestampString;
  } & TeamProfileSubmission_Key;
}

export interface GetCurrentUserData {
  user?: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
    profilStatut?: string | null;
    equipeTypeSouhaite?: string | null;
    equipeFinaleId?: string | null;
    poste?: string | null;
    telephone?: string | null;
    sourceConnexion?: string | null;
    avatar?: string | null;
  } & User_Key;
}

export interface GetDataImportRunData {
  dataImportRun?: {
    id: UUIDString;
    environment: string;
    importKind: string;
    sourceName: string;
    sourcePath?: string | null;
    sourceHash?: string | null;
    status: string;
    startedAt: TimestampString;
    finishedAt?: TimestampString | null;
    rowCount?: number | null;
    insertedCount?: number | null;
    updatedCount?: number | null;
    skippedCount?: number | null;
    artifactPath?: string | null;
    artifactHash?: string | null;
    actorUid: string;
    actorEmail?: string | null;
    notes?: string | null;
    previsionnelBatch?: {
      id: UUIDString;
      workbook: string;
      sourcePath: string;
      workbookHash?: string | null;
      importedAt: TimestampString;
    } & PrevisionnelImportBatch_Key;
      issues: ({
        id: UUIDString;
        severity: string;
        code: string;
        entityType?: string | null;
        entityKey?: string | null;
        sourceSheet?: string | null;
        sourceRow?: number | null;
        message: string;
        resolutionStatus: string;
        dateCreation: TimestampString;
      } & DataImportIssue_Key)[];
        dateCreation: TimestampString;
  } & DataImportRun_Key;
}

export interface GetDataImportRunVariables {
  id: UUIDString;
}

export interface GetEmailThreadData {
  emailThread?: {
    id: UUIDString;
    provider: string;
    externalThreadId: string;
    subject: string;
    statut: string;
    importance?: string | null;
    lastMessageAt: TimestampString;
    participantsSummary?: string | null;
    messageCount: number;
    hasAttachments: boolean;
    dateCreation: TimestampString;
    dateModification: TimestampString;
    client?: {
      id: UUIDString;
      nom: string;
      type: string;
      email?: string | null;
      telephone?: string | null;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
        client: {
          id: UUIDString;
          nom: string;
          type: string;
        } & Client_Key;
      } & Chantier_Key;
        assignedTo?: {
          id: string;
          nom: string;
          prenom: string;
          email: string;
          avatar?: string | null;
        } & User_Key;
          messages: ({
            id: UUIDString;
            externalMessageId: string;
            direction: string;
            fromEmail?: string | null;
            fromName?: string | null;
            toSummary?: string | null;
            ccSummary?: string | null;
            subject?: string | null;
            bodyPreview?: string | null;
            bodyStoragePath?: string | null;
            bodyHash?: string | null;
            sentAt?: TimestampString | null;
            receivedAt: TimestampString;
            isRead: boolean;
            hasAttachments: boolean;
            attachments: ({
              id: UUIDString;
              externalAttachmentId: string;
              nomFichier: string;
              storagePath?: string | null;
              mimeType?: string | null;
              tailleBytes?: number | null;
              sha256?: string | null;
              statut: string;
              document?: {
                id: UUIDString;
                nomFichier: string;
                storagePath: string;
                statut: string;
                typeDocument: string;
              } & DocumentAttache_Key;
            } & EmailAttachment_Key)[];
          } & EmailMessage_Key)[];
  } & EmailThread_Key;
}

export interface GetEmailThreadVariables {
  id: UUIDString;
}

export interface GetRapportData {
  rapport?: {
    id: UUIDString;
    titre: string;
    rapportType: string;
    statut: string;
    periodeDebut?: DateString | null;
    periodeFin?: DateString | null;
    format?: string | null;
    storagePath?: string | null;
    sha256?: string | null;
    summary?: string | null;
    generatedAt?: TimestampString | null;
    author?: {
      id: string;
      nom: string;
      prenom: string;
      email: string;
      avatar?: string | null;
    } & User_Key;
      client?: {
        id: UUIDString;
        nom: string;
        type: string;
        email?: string | null;
        telephone?: string | null;
      } & Client_Key;
        chantier?: {
          id: UUIDString;
          nom: string;
          statut: string;
          client: {
            id: UUIDString;
            nom: string;
            type: string;
          } & Client_Key;
        } & Chantier_Key;
          snapshot?: {
            id: UUIDString;
            environment: string;
            snapshotType: string;
            scopeType: string;
            scopeId?: string | null;
            periodStart?: DateString | null;
            periodEnd?: DateString | null;
            status: string;
            payloadPath?: string | null;
            payloadHash?: string | null;
            sourceWatermark?: string | null;
          } & AnalyticsSnapshot_Key;
            dateCreation: TimestampString;
  } & Rapport_Key;
}

export interface GetRapportVariables {
  id: UUIDString;
}

export interface LinkPrevisionnelLineToChantierData {
  query?: {
  };
    previsionnelLine_update?: PrevisionnelLine_Key | null;
}

export interface LinkPrevisionnelLineToChantierVariables {
  id: UUIDString;
  chantierId?: UUIDString | null;
}

export interface ListAnalyticsSnapshotsData {
  analyticsSnapshots: ({
    id: UUIDString;
    environment: string;
    snapshotType: string;
    scopeType: string;
    scopeId?: string | null;
    periodStart?: DateString | null;
    periodEnd?: DateString | null;
    status: string;
    totalCaPrevision?: number | null;
    totalCaRealise?: number | null;
    totalFacturesTtc?: number | null;
    totalMarge?: number | null;
    payloadPath?: string | null;
    payloadHash?: string | null;
    sourceWatermark?: string | null;
    createdBy?: {
      id: string;
      nom: string;
      prenom: string;
      avatar?: string | null;
    } & User_Key;
      dateCreation: TimestampString;
  } & AnalyticsSnapshot_Key)[];
}

export interface ListAnalyticsSnapshotsVariables {
  environment: string;
}

export interface ListCheckpointRunsData {
  checkpointRuns: ({
    id: UUIDString;
    environment: string;
    checkpointKey: string;
    title: string;
    status: string;
    startedAt: TimestampString;
    finishedAt?: TimestampString | null;
    commitSha?: string | null;
    sourceBranch?: string | null;
    command?: string | null;
    actorUid: string;
    actorEmail?: string | null;
    summary?: string | null;
    dateCreation: TimestampString;
  } & CheckpointRun_Key)[];
}

export interface ListCheckpointRunsVariables {
  environment: string;
}

export interface ListDataImportRunsData {
  dataImportRuns: ({
    id: UUIDString;
    environment: string;
    importKind: string;
    sourceName: string;
    sourcePath?: string | null;
    sourceHash?: string | null;
    status: string;
    startedAt: TimestampString;
    finishedAt?: TimestampString | null;
    rowCount?: number | null;
    insertedCount?: number | null;
    updatedCount?: number | null;
    skippedCount?: number | null;
    artifactPath?: string | null;
    artifactHash?: string | null;
    actorUid: string;
    actorEmail?: string | null;
    notes?: string | null;
    previsionnelBatch?: {
      id: UUIDString;
      workbook: string;
      workbookHash?: string | null;
      importedAt: TimestampString;
    } & PrevisionnelImportBatch_Key;
      dateCreation: TimestampString;
  } & DataImportRun_Key)[];
}

export interface ListDataImportRunsVariables {
  environment: string;
}

export interface ListDevisByChantierData {
  deviss: ({
    id: UUIDString;
    numeroDevis: string;
    titre: string;
    statut: string;
    montantHT?: number | null;
    tva?: number | null;
    montantTTC?: number | null;
    dateDemande: DateString;
    dateEnvoi?: DateString | null;
    dateSignature?: DateString | null;
    typeChantierCible?: string | null;
    description?: string | null;
    client: {
      id: UUIDString;
      nom: string;
      prenom?: string | null;
      type: string;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
      } & Chantier_Key;
  } & Devis_Key)[];
}

export interface ListDevisByChantierVariables {
  chantierId: UUIDString;
}

export interface ListDevisByClientData {
  deviss: ({
    id: UUIDString;
    numeroDevis: string;
    titre: string;
    statut: string;
    montantHT?: number | null;
    tva?: number | null;
    montantTTC?: number | null;
    dateDemande: DateString;
    dateEnvoi?: DateString | null;
    dateSignature?: DateString | null;
    typeChantierCible?: string | null;
    description?: string | null;
    client: {
      id: UUIDString;
      nom: string;
      prenom?: string | null;
      type: string;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
      } & Chantier_Key;
  } & Devis_Key)[];
}

export interface ListDevisByClientVariables {
  clientId: UUIDString;
}

export interface ListDevisData {
  deviss: ({
    id: UUIDString;
    numeroDevis: string;
    titre: string;
    statut: string;
    montantHT?: number | null;
    tva?: number | null;
    montantTTC?: number | null;
    dateDemande: DateString;
    dateEnvoi?: DateString | null;
    dateSignature?: DateString | null;
    typeChantierCible?: string | null;
    description?: string | null;
    dateCreation: TimestampString;
    dateModification: TimestampString;
    client: {
      id: UUIDString;
      nom: string;
      prenom?: string | null;
      type: string;
      ville?: string | null;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
        client: {
          id: UUIDString;
          nom: string;
          type: string;
        } & Client_Key;
      } & Chantier_Key;
  } & Devis_Key)[];
}

export interface ListDocumentFoldersData {
  documentFolders: ({
    id: UUIDString;
    nom: string;
    slug: string;
    description?: string | null;
    dateCreation: TimestampString;
    parent?: {
      id: UUIDString;
      nom: string;
      slug: string;
    } & DocumentFolder_Key;
      client?: {
        id: UUIDString;
        nom: string;
        type: string;
      } & Client_Key;
        chantier?: {
          id: UUIDString;
          nom: string;
          statut: string;
          client: {
            id: UUIDString;
            nom: string;
            type: string;
          } & Client_Key;
        } & Chantier_Key;
  } & DocumentFolder_Key)[];
}

export interface ListDocumentsAttachesData {
  documentAttaches: ({
    id: UUIDString;
    nomFichier: string;
    storagePath: string;
    mimeType?: string | null;
    tailleBytes?: number | null;
    sha256?: string | null;
    typeDocument: string;
    statut: string;
    source: string;
    description?: string | null;
    dateDocument?: DateString | null;
    dateCreation: TimestampString;
    folder?: {
      id: UUIDString;
      nom: string;
      slug: string;
    } & DocumentFolder_Key;
      client?: {
        id: UUIDString;
        nom: string;
        type: string;
      } & Client_Key;
        chantier?: {
          id: UUIDString;
          nom: string;
          statut: string;
          client: {
            id: UUIDString;
            nom: string;
            type: string;
          } & Client_Key;
        } & Chantier_Key;
          devis?: {
            id: UUIDString;
            numeroDevis: string;
            titre: string;
            statut: string;
            client: {
              id: UUIDString;
              nom: string;
              type: string;
            } & Client_Key;
              chantier?: {
                id: UUIDString;
                nom: string;
                statut: string;
              } & Chantier_Key;
          } & Devis_Key;
            facture?: {
              id: UUIDString;
              fournisseur: string;
              numeroFacture: string;
              montantTTC: number;
              date: DateString;
              statut: string;
              chantier: {
                id: UUIDString;
                nom: string;
                client: {
                  id: UUIDString;
                  nom: string;
                  type: string;
                } & Client_Key;
              } & Chantier_Key;
            } & Facture_Key;
  } & DocumentAttache_Key)[];
}

export interface ListDocumentsByChantierData {
  documentAttaches: ({
    id: UUIDString;
    nomFichier: string;
    storagePath: string;
    mimeType?: string | null;
    tailleBytes?: number | null;
    sha256?: string | null;
    typeDocument: string;
    statut: string;
    source: string;
    description?: string | null;
    dateDocument?: DateString | null;
    dateCreation: TimestampString;
    folder?: {
      id: UUIDString;
      nom: string;
      slug: string;
    } & DocumentFolder_Key;
      client?: {
        id: UUIDString;
        nom: string;
        type: string;
      } & Client_Key;
        chantier?: {
          id: UUIDString;
          nom: string;
          statut: string;
          client: {
            id: UUIDString;
            nom: string;
            type: string;
          } & Client_Key;
        } & Chantier_Key;
          devis?: {
            id: UUIDString;
            numeroDevis: string;
            titre: string;
            statut: string;
            client: {
              id: UUIDString;
              nom: string;
              type: string;
            } & Client_Key;
              chantier?: {
                id: UUIDString;
                nom: string;
                statut: string;
              } & Chantier_Key;
          } & Devis_Key;
            facture?: {
              id: UUIDString;
              fournisseur: string;
              numeroFacture: string;
              montantTTC: number;
              date: DateString;
              statut: string;
            } & Facture_Key;
  } & DocumentAttache_Key)[];
}

export interface ListDocumentsByChantierVariables {
  chantierId: UUIDString;
}

export interface ListEmailThreadsByChantierData {
  emailThreads: ({
    id: UUIDString;
    provider: string;
    externalThreadId: string;
    subject: string;
    statut: string;
    importance?: string | null;
    lastMessageAt: TimestampString;
    participantsSummary?: string | null;
    messageCount: number;
    hasAttachments: boolean;
    dateModification: TimestampString;
    client?: {
      id: UUIDString;
      nom: string;
      type: string;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
        client: {
          id: UUIDString;
          nom: string;
        } & Client_Key;
      } & Chantier_Key;
        assignedTo?: {
          id: string;
          nom: string;
          prenom: string;
          avatar?: string | null;
        } & User_Key;
  } & EmailThread_Key)[];
}

export interface ListEmailThreadsByChantierVariables {
  chantierId: UUIDString;
}

export interface ListEmailThreadsData {
  emailThreads: ({
    id: UUIDString;
    provider: string;
    externalThreadId: string;
    subject: string;
    statut: string;
    importance?: string | null;
    lastMessageAt: TimestampString;
    participantsSummary?: string | null;
    messageCount: number;
    hasAttachments: boolean;
    dateModification: TimestampString;
    client?: {
      id: UUIDString;
      nom: string;
      type: string;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
        client: {
          id: UUIDString;
          nom: string;
        } & Client_Key;
      } & Chantier_Key;
        assignedTo?: {
          id: string;
          nom: string;
          prenom: string;
          avatar?: string | null;
        } & User_Key;
  } & EmailThread_Key)[];
}

export interface ListEntityChangeLogsData {
  entityChangeLogs: ({
    id: UUIDString;
    environment: string;
    entityType: string;
    entityId: string;
    action: string;
    source: string;
    actorUid: string;
    actorEmail?: string | null;
    beforeHash?: string | null;
    afterHash?: string | null;
    reason?: string | null;
    dateCreation: TimestampString;
    auditEvent?: {
      id: UUIDString;
      eventType: string;
      action: string;
      status: string;
      evidencePath?: string | null;
      evidenceHash?: string | null;
    } & AuditEvent_Key;
      checkpointRun?: {
        id: UUIDString;
        checkpointKey: string;
        status: string;
      } & CheckpointRun_Key;
        dataImportRun?: {
          id: UUIDString;
          importKind: string;
          sourceName: string;
          status: string;
        } & DataImportRun_Key;
  } & EntityChangeLog_Key)[];
}

export interface ListEntityChangeLogsVariables {
  environment: string;
  entityType: string;
  entityId: string;
}

export interface ListFacturesByStatutData {
  factures: ({
    id: UUIDString;
    fournisseur: string;
    numeroFacture: string;
    montantTTC: number;
    date: DateString;
    categorie: string;
    statut: string;
    chantier: {
      id: UUIDString;
      nom: string;
    } & Chantier_Key;
  } & Facture_Key)[];
}

export interface ListFacturesByStatutVariables {
  statut: string;
}

export interface ListFacturesData {
  factures: ({
    id: UUIDString;
    fournisseur: string;
    numeroFacture: string;
    montantHT: number;
    tva: number;
    montantTTC: number;
    date: DateString;
    categorie: string;
    statut: string;
    description?: string | null;
    chantier: {
      id: UUIDString;
      nom: string;
      client: {
        id: UUIDString;
        nom: string;
      } & Client_Key;
    } & Chantier_Key;
  } & Facture_Key)[];
}

export interface ListOperationalChantiersData {
  chantiers: ({
    id: UUIDString;
    nom: string;
    statut: string;
    dateDebut: DateString;
    dateFinPrevue: DateString;
    dateFin?: DateString | null;
    budgetPrevisionnel: number;
    adresse?: string | null;
    client: {
      id: UUIDString;
      nom: string;
      type: string;
      ville?: string | null;
    } & Client_Key;
      chefChantier?: {
        id: string;
        nom: string;
        prenom: string;
        avatar?: string | null;
      } & User_Key;
  } & Chantier_Key)[];
}

export interface ListOperationalClientsData {
  clients: ({
    id: UUIDString;
    type: string;
    nom: string;
    prenom?: string | null;
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    ville?: string | null;
    codePostal?: string | null;
    typeChantierCible?: string | null;
    souhaits?: string | null;
    notes?: string | null;
    dateCreation: TimestampString;
  } & Client_Key)[];
}

export interface ListPlanningEventsByChantierData {
  planningEvents: ({
    id: UUIDString;
    titre: string;
    eventType: string;
    statut: string;
    startAt: TimestampString;
    endAt: TimestampString;
    location?: string | null;
    notes?: string | null;
    assignmentsByChantier: ({
      id: UUIDString;
      assignmentRole?: string | null;
      statut: string;
      sossonTeam?: {
        id: UUIDString;
        code: string;
        name: string;
        type: string;
        theme?: string | null;
      } & SossonTeam_Key;
        user?: {
          id: string;
          nom: string;
          prenom: string;
          avatar?: string | null;
          role: string;
        } & User_Key;
    } & PlanningAssignment_Key)[];
      jobSheetsByChantier: ({
        id: UUIDString;
        titre: string;
        statut: string;
        instructions?: string | null;
        plannedHours?: number | null;
        actualHours?: number | null;
        completionNotes?: string | null;
        chantier?: {
          id: UUIDString;
          nom: string;
          statut: string;
        } & Chantier_Key;
          sossonTeam?: {
            id: UUIDString;
            code: string;
            name: string;
            type: string;
            theme?: string | null;
          } & SossonTeam_Key;
            leadMember?: {
              id: UUIDString;
              firstName: string;
              lastName: string;
              title: string;
            } & SossonTeamMember_Key;
      } & PlanningJobSheet_Key)[];
  } & PlanningEvent_Key)[];
}

export interface ListPlanningEventsByChantierVariables {
  chantierId: UUIDString;
}

export interface ListPlanningEventsByPeriodData {
  planningEvents: ({
    id: UUIDString;
    titre: string;
    eventType: string;
    statut: string;
    startAt: TimestampString;
    endAt: TimestampString;
    location?: string | null;
    notes?: string | null;
    chantier?: {
      id: UUIDString;
      nom: string;
      statut: string;
      client: {
        id: UUIDString;
        nom: string;
      } & Client_Key;
    } & Chantier_Key;
      createdBy?: {
        id: string;
        nom: string;
        prenom: string;
        avatar?: string | null;
      } & User_Key;
        updatedBy?: {
          id: string;
          nom: string;
          prenom: string;
          avatar?: string | null;
        } & User_Key;
          assignmentsByPeriod: ({
            id: UUIDString;
            assignmentRole?: string | null;
            statut: string;
            notes?: string | null;
            sossonTeam?: {
              id: UUIDString;
              code: string;
              name: string;
              type: string;
              theme?: string | null;
            } & SossonTeam_Key;
              user?: {
                id: string;
                nom: string;
                prenom: string;
                avatar?: string | null;
                role: string;
              } & User_Key;
          } & PlanningAssignment_Key)[];
            jobSheetsByPeriod: ({
              id: UUIDString;
              titre: string;
              statut: string;
              instructions?: string | null;
              plannedHours?: number | null;
              actualHours?: number | null;
              checklist?: string | null;
              materials?: string | null;
              blockers?: string | null;
              completionNotes?: string | null;
              proofStoragePath?: string | null;
              proofSha256?: string | null;
              reportStoragePath?: string | null;
              reportSha256?: string | null;
              completedAt?: TimestampString | null;
              validatedAt?: TimestampString | null;
              dateModification: TimestampString;
              dateCreation: TimestampString;
              assignment?: {
                id: UUIDString;
                statut: string;
                assignmentRole?: string | null;
              } & PlanningAssignment_Key;
                chantier?: {
                  id: UUIDString;
                  nom: string;
                  statut: string;
                } & Chantier_Key;
                  sossonTeam?: {
                    id: UUIDString;
                    code: string;
                    name: string;
                    type: string;
                    theme?: string | null;
                  } & SossonTeam_Key;
                    leadMember?: {
                      id: UUIDString;
                      firstName: string;
                      lastName: string;
                      title: string;
                    } & SossonTeamMember_Key;
                      preparedBy?: {
                        id: string;
                        nom: string;
                        prenom: string;
                        avatar?: string | null;
                      } & User_Key;
                        updatedBy?: {
                          id: string;
                          nom: string;
                          prenom: string;
                          avatar?: string | null;
                        } & User_Key;
                          completedBy?: {
                            id: string;
                            nom: string;
                            prenom: string;
                            avatar?: string | null;
                          } & User_Key;
                            validatedBy?: {
                              id: string;
                              nom: string;
                              prenom: string;
                              avatar?: string | null;
                            } & User_Key;
                              workTimesByPeriodJobSheet: ({
                                id: UUIDString;
                                workDate: DateString;
                                hours: number;
                                kind: string;
                                status: string;
                                notes?: string | null;
                                member: {
                                  id: UUIDString;
                                  firstName: string;
                                  lastName: string;
                                  title: string;
                                } & SossonTeamMember_Key;
                              } & SossonWorkTimeEntry_Key)[];
            } & PlanningJobSheet_Key)[];
  } & PlanningEvent_Key)[];
}

export interface ListPlanningEventsByPeriodVariables {
  startAt: TimestampString;
  endAt: TimestampString;
}

export interface ListPlanningJobSheetsByEventData {
  planningJobSheets: ({
    id: UUIDString;
    titre: string;
    statut: string;
    instructions?: string | null;
    plannedHours?: number | null;
    actualHours?: number | null;
    checklist?: string | null;
    materials?: string | null;
    blockers?: string | null;
    completionNotes?: string | null;
    proofStoragePath?: string | null;
    proofSha256?: string | null;
    reportStoragePath?: string | null;
    reportSha256?: string | null;
    completedAt?: TimestampString | null;
    validatedAt?: TimestampString | null;
    dateModification: TimestampString;
    dateCreation: TimestampString;
    event: {
      id: UUIDString;
      titre: string;
      startAt: TimestampString;
      endAt: TimestampString;
      statut: string;
    } & PlanningEvent_Key;
      assignment?: {
        id: UUIDString;
        statut: string;
        assignmentRole?: string | null;
      } & PlanningAssignment_Key;
        chantier?: {
          id: UUIDString;
          nom: string;
          statut: string;
        } & Chantier_Key;
          sossonTeam?: {
            id: UUIDString;
            code: string;
            name: string;
            type: string;
            theme?: string | null;
          } & SossonTeam_Key;
            leadMember?: {
              id: UUIDString;
              firstName: string;
              lastName: string;
              title: string;
            } & SossonTeamMember_Key;
              preparedBy?: {
                id: string;
                nom: string;
                prenom: string;
                avatar?: string | null;
              } & User_Key;
                updatedBy?: {
                  id: string;
                  nom: string;
                  prenom: string;
                  avatar?: string | null;
                } & User_Key;
                  completedBy?: {
                    id: string;
                    nom: string;
                    prenom: string;
                    avatar?: string | null;
                  } & User_Key;
                    validatedBy?: {
                      id: string;
                      nom: string;
                      prenom: string;
                      avatar?: string | null;
                    } & User_Key;
                      workTimesByEventJobSheet: ({
                        id: UUIDString;
                        workDate: DateString;
                        hours: number;
                        kind: string;
                        status: string;
                        notes?: string | null;
                        member: {
                          id: UUIDString;
                          firstName: string;
                          lastName: string;
                          title: string;
                        } & SossonTeamMember_Key;
                      } & SossonWorkTimeEntry_Key)[];
  } & PlanningJobSheet_Key)[];
}

export interface ListPlanningJobSheetsByEventVariables {
  eventId: UUIDString;
}

export interface ListPrevisionnelCellEditsData {
  previsionnelCellEdits: ({
    id: string;
    sourceSheet: string;
    cellRef: string;
    valueText?: string | null;
    numericValue?: number | null;
    dateModification: TimestampString;
  } & PrevisionnelCellEdit_Key)[];
}

export interface ListPrevisionnelCellEditsVariables {
  sourceSheet: string;
}

export interface ListPrevisionnelExercisesData {
  previsionnelExercises: ({
    id: UUIDString;
    sheet: string;
    exercise: string;
    startYear: number;
    endYear: number;
    lineCount: number;
    chantierCount: number;
    caPrevision: number;
    caContrat: number;
    plannedTotal: number;
    realizedTotal: number;
    invoicedTotal: number;
    batch: {
      id: UUIDString;
      workbook: string;
      sourcePath: string;
      workbookHash?: string | null;
      importedAt: TimestampString;
    } & PrevisionnelImportBatch_Key;
  } & PrevisionnelExercise_Key)[];
}

export interface ListPrevisionnelLinesByExerciseData {
  previsionnelLines: ({
    id: UUIDString;
    sourceSheet: string;
    sourceRow: number;
    rawName: string;
    clientKey: string;
    clientName: string;
    category: string;
    lineType: string;
    caTce: number;
    caPrevision: number;
    caContrat: number;
    plannedTotal: number;
    realizedTotal: number;
    invoicedTotal: number;
    invoiceSentTotal: number;
    client: {
      id: UUIDString;
      nom: string;
      type: string;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
        dateDebut: DateString;
        dateFinPrevue: DateString;
        budgetPrevisionnel: number;
      } & Chantier_Key;
        monthly: ({
          id: UUIDString;
          month: string;
          label: string;
          monthOrder: number;
          planned: number;
          realized: number;
          invoiceSent: boolean;
        } & PrevisionnelMonthlyAmount_Key)[];
          lots: ({
            id: UUIDString;
            lotKey: string;
            label: string;
            amount: number;
          } & PrevisionnelLotAmount_Key)[];
  } & PrevisionnelLine_Key)[];
}

export interface ListPrevisionnelLinesByExerciseVariables {
  exerciseId: UUIDString;
}

export interface ListRapportsData {
  rapports: ({
    id: UUIDString;
    titre: string;
    rapportType: string;
    statut: string;
    periodeDebut?: DateString | null;
    periodeFin?: DateString | null;
    format?: string | null;
    storagePath?: string | null;
    sha256?: string | null;
    generatedAt?: TimestampString | null;
    author?: {
      id: string;
      nom: string;
      prenom: string;
      avatar?: string | null;
    } & User_Key;
      client?: {
        id: UUIDString;
        nom: string;
        type: string;
      } & Client_Key;
        chantier?: {
          id: UUIDString;
          nom: string;
          statut: string;
          client: {
            id: UUIDString;
            nom: string;
          } & Client_Key;
        } & Chantier_Key;
          snapshot?: {
            id: UUIDString;
            environment: string;
            snapshotType: string;
            status: string;
            payloadHash?: string | null;
          } & AnalyticsSnapshot_Key;
            dateCreation: TimestampString;
  } & Rapport_Key)[];
}

export interface ListRecentAuditEventsData {
  auditEvents: ({
    id: UUIDString;
    environment: string;
    eventType: string;
    severity: string;
    entityType?: string | null;
    entityId?: string | null;
    action: string;
    status: string;
    actorUid: string;
    actorEmail?: string | null;
    source: string;
    message?: string | null;
    evidencePath?: string | null;
    evidenceHash?: string | null;
    dateCreation: TimestampString;
  } & AuditEvent_Key)[];
}

export interface ListRecentAuditEventsVariables {
  environment: string;
}

export interface ListSossonPayrollPeriodsData {
  sossonPayrollPeriods: ({
    id: UUIDString;
    periodLabel: string;
    year: number;
    month: number;
    baseSalaryGrossMonthly?: number | null;
    overtimeHours?: number | null;
    paidLeaveDays?: number | null;
    absenceDays?: number | null;
    grossEstimate?: number | null;
    status: string;
    notes?: string | null;
    dateModification: TimestampString;
    dateCreation: TimestampString;
    member: {
      id: UUIDString;
      firstName: string;
      lastName: string;
      title: string;
      team: {
        id: UUIDString;
        name: string;
        code: string;
        type: string;
      } & SossonTeam_Key;
    } & SossonTeamMember_Key;
  } & SossonPayrollPeriod_Key)[];
}

export interface ListSossonPayrollPeriodsVariables {
  year: number;
}

export interface ListSossonTeamsData {
  sossonTeams: ({
    id: UUIDString;
    code: string;
    name: string;
    type: string;
    statut: string;
    theme?: string | null;
    leadName?: string | null;
    description?: string | null;
    activeSites?: string | null;
    ordre?: number | null;
    dateModification: TimestampString;
    dateCreation: TimestampString;
    members: ({
      id: UUIDString;
      firstName: string;
      lastName: string;
      title: string;
      qualification?: string | null;
      level?: string | null;
      salaryGrossMonthly?: number | null;
      contract?: string | null;
      coefficient?: string | null;
      email?: string | null;
      phone?: string | null;
      status: string;
      site?: string | null;
      activeSites?: string | null;
      responsibilities?: string | null;
      permissions?: string | null;
      dateModification: TimestampString;
      dateCreation: TimestampString;
      user?: {
        id: string;
        nom: string;
        prenom: string;
        email: string;
        role: string;
        avatar?: string | null;
      } & User_Key;
        leaves: ({
          id: UUIDString;
          type: string;
          month: string;
          startDay: number;
          endDay: number;
          status: string;
          note?: string | null;
          dateCreation: TimestampString;
        } & SossonTeamLeavePeriod_Key)[];
    } & SossonTeamMember_Key)[];
  } & SossonTeam_Key)[];
}

export interface ListSossonWorkTimeEntriesData {
  sossonWorkTimeEntries: ({
    id: UUIDString;
    workDate: DateString;
    hours: number;
    kind: string;
    status: string;
    notes?: string | null;
    dateCreation: TimestampString;
    member: {
      id: UUIDString;
      firstName: string;
      lastName: string;
      title: string;
      team: {
        id: UUIDString;
        name: string;
        code: string;
        type: string;
      } & SossonTeam_Key;
    } & SossonTeamMember_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
        client: {
          id: UUIDString;
          nom: string;
        } & Client_Key;
      } & Chantier_Key;
        planningEvent?: {
          id: UUIDString;
          titre: string;
          startAt: TimestampString;
          endAt: TimestampString;
          statut: string;
        } & PlanningEvent_Key;
          planningAssignment?: {
            id: UUIDString;
            statut: string;
            assignmentRole?: string | null;
          } & PlanningAssignment_Key;
            jobSheet?: {
              id: UUIDString;
              titre: string;
              statut: string;
            } & PlanningJobSheet_Key;
              approvedBy?: {
                id: string;
                nom: string;
                prenom: string;
                avatar?: string | null;
              } & User_Key;
  } & SossonWorkTimeEntry_Key)[];
}

export interface ListSossonWorkTimeEntriesVariables {
  startDate: DateString;
  endDate: DateString;
}

export interface ListTeamProfileSubmissionsData {
  teamProfileSubmissions: ({
    id: string;
    email: string;
    nom: string;
    prenom: string;
    requestedTeamType: string;
    status: string;
    sourceConnexion?: string | null;
    convertedTeamId?: string | null;
    convertedMemberId?: string | null;
    reviewNote?: string | null;
    reviewedAt?: TimestampString | null;
    reviewedBy?: {
      id: string;
      nom: string;
      prenom: string;
      avatar?: string | null;
    } & User_Key;
      dateModification: TimestampString;
      dateCreation: TimestampString;
  } & TeamProfileSubmission_Key)[];
}

export interface ListUnreadEmailThreadsData {
  emailThreads: ({
    id: UUIDString;
    provider: string;
    externalThreadId: string;
    subject: string;
    statut: string;
    importance?: string | null;
    lastMessageAt: TimestampString;
    participantsSummary?: string | null;
    messageCount: number;
    hasAttachments: boolean;
    client?: {
      id: UUIDString;
      nom: string;
      type: string;
    } & Client_Key;
      chantier?: {
        id: UUIDString;
        nom: string;
        statut: string;
      } & Chantier_Key;
        assignedTo?: {
          id: string;
          nom: string;
          prenom: string;
          avatar?: string | null;
        } & User_Key;
  } & EmailThread_Key)[];
}

export interface ListUsersData {
  users: ({
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
    profilStatut?: string | null;
    equipeTypeSouhaite?: string | null;
    equipeFinaleId?: string | null;
    poste?: string | null;
    telephone?: string | null;
    sourceConnexion?: string | null;
    avatar?: string | null;
    dateCreation: TimestampString;
  } & User_Key)[];
}

export interface MarkRapportGeneratedData {
  query?: {
  };
    rapport_update?: Rapport_Key | null;
}

export interface MarkRapportGeneratedVariables {
  id: UUIDString;
  statut: string;
  format?: string | null;
  storagePath?: string | null;
  sha256?: string | null;
  generatedAt?: TimestampString | null;
  summary?: string | null;
}

export interface PlanningAssignment_Key {
  id: UUIDString;
  __typename?: 'PlanningAssignment_Key';
}

export interface PlanningEvent_Key {
  id: UUIDString;
  __typename?: 'PlanningEvent_Key';
}

export interface PlanningJobSheet_Key {
  id: UUIDString;
  __typename?: 'PlanningJobSheet_Key';
}

export interface PrevisionnelCellEdit_Key {
  id: string;
  __typename?: 'PrevisionnelCellEdit_Key';
}

export interface PrevisionnelExercise_Key {
  id: UUIDString;
  __typename?: 'PrevisionnelExercise_Key';
}

export interface PrevisionnelImportBatch_Key {
  id: UUIDString;
  __typename?: 'PrevisionnelImportBatch_Key';
}

export interface PrevisionnelLine_Key {
  id: UUIDString;
  __typename?: 'PrevisionnelLine_Key';
}

export interface PrevisionnelLotAmount_Key {
  id: UUIDString;
  __typename?: 'PrevisionnelLotAmount_Key';
}

export interface PrevisionnelMonthlyAmount_Key {
  id: UUIDString;
  __typename?: 'PrevisionnelMonthlyAmount_Key';
}

export interface Rapport_Key {
  id: UUIDString;
  __typename?: 'Rapport_Key';
}

export interface SearchClientAliasesData {
  clientAliases: ({
    id: UUIDString;
    alias: string;
    normalizedKey: string;
    source: string;
    client: {
      id: UUIDString;
      nom: string;
      type: string;
    } & Client_Key;
  } & ClientAlias_Key)[];
}

export interface SearchClientAliasesVariables {
  normalizedKey: string;
}

export interface SetFactureStatutData {
  query?: {
  };
    facture_update?: Facture_Key | null;
}

export interface SetFactureStatutVariables {
  id: UUIDString;
  statut: string;
}

export interface SossonPayrollPeriod_Key {
  id: UUIDString;
  __typename?: 'SossonPayrollPeriod_Key';
}

export interface SossonTeamLeavePeriod_Key {
  id: UUIDString;
  __typename?: 'SossonTeamLeavePeriod_Key';
}

export interface SossonTeamMember_Key {
  id: UUIDString;
  __typename?: 'SossonTeamMember_Key';
}

export interface SossonTeam_Key {
  id: UUIDString;
  __typename?: 'SossonTeam_Key';
}

export interface SossonWorkTimeEntry_Key {
  id: UUIDString;
  __typename?: 'SossonWorkTimeEntry_Key';
}

export interface SubmitCurrentTeamProfileData {
  teamProfileSubmission_upsert: TeamProfileSubmission_Key;
}

export interface SubmitCurrentTeamProfileVariables {
  email: string;
  nom: string;
  prenom: string;
  requestedTeamType: string;
  sourceConnexion?: string | null;
}

export interface TeamProfileSubmission_Key {
  id: string;
  __typename?: 'TeamProfileSubmission_Key';
}

export interface UpdateChantierStatutData {
  query?: {
  };
    chantier_update?: Chantier_Key | null;
}

export interface UpdateChantierStatutVariables {
  id: UUIDString;
  statut: string;
  dateFin?: DateString | null;
}

export interface UpdateClientData {
  query?: {
  };
    client_update?: Client_Key | null;
}

export interface UpdateClientVariables {
  id: UUIDString;
  type?: string | null;
  nom?: string | null;
  prenom?: string | null;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
  typeChantierCible?: string | null;
  souhaits?: string | null;
  notes?: string | null;
}

export interface UpdateDevisStatutData {
  query?: {
  };
    devis_update?: Devis_Key | null;
}

export interface UpdateDevisStatutVariables {
  id: UUIDString;
  statut: string;
  dateEnvoi?: DateString | null;
  dateSignature?: DateString | null;
}

export interface UpdateDocumentAttacheLinksData {
  query?: {
  };
    documentAttache_update?: DocumentAttache_Key | null;
}

export interface UpdateDocumentAttacheLinksVariables {
  id: UUIDString;
  folderId?: UUIDString | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  devisId?: UUIDString | null;
  factureId?: UUIDString | null;
  statut?: string | null;
  typeDocument?: string | null;
}

export interface UpdateEmailThreadStatusAndLinksData {
  query?: {
  };
    emailThread_update?: EmailThread_Key | null;
}

export interface UpdateEmailThreadStatusAndLinksVariables {
  id: UUIDString;
  statut?: string | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  assignedToId?: string | null;
}

export interface UpdatePlanningAssignmentStatusData {
  query?: {
  };
    planningAssignment_update?: PlanningAssignment_Key | null;
}

export interface UpdatePlanningAssignmentStatusVariables {
  id: UUIDString;
  statut: string;
  notes?: string | null;
}

export interface UpdatePlanningEventDetailsData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}

export interface UpdatePlanningEventDetailsVariables {
  id: UUIDString;
  chantierId?: UUIDString | null;
  titre: string;
  eventType: string;
  statut: string;
  startAt: TimestampString;
  endAt: TimestampString;
  location?: string | null;
  notes?: string | null;
}

export interface UpdatePlanningEventStatusData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}

export interface UpdatePlanningEventStatusVariables {
  id: UUIDString;
  statut: string;
}

export interface UpdatePlanningJobSheetProgressData {
  query?: {
  };
    planningJobSheet_update?: PlanningJobSheet_Key | null;
}

export interface UpdatePlanningJobSheetProgressVariables {
  id: UUIDString;
  statut: string;
  instructions?: string | null;
  plannedHours?: number | null;
  actualHours?: number | null;
  checklist?: string | null;
  materials?: string | null;
  blockers?: string | null;
  completionNotes?: string | null;
  proofStoragePath?: string | null;
  proofSha256?: string | null;
  reportStoragePath?: string | null;
  reportSha256?: string | null;
}

export interface UpdatePrevisionnelLineAmountsData {
  query?: {
  };
    previsionnelLine_update?: PrevisionnelLine_Key | null;
}

export interface UpdatePrevisionnelLineAmountsVariables {
  id: UUIDString;
  rawName?: string | null;
  clientName?: string | null;
  caTce?: number | null;
  caPrevision?: number | null;
  caContrat?: number | null;
  plannedTotal?: number | null;
  realizedTotal?: number | null;
  invoicedTotal?: number | null;
  invoiceSentTotal?: number | null;
}

export interface UpdatePrevisionnelMonthlyAmountData {
  query?: {
  };
    previsionnelMonthlyAmount_update?: PrevisionnelMonthlyAmount_Key | null;
}

export interface UpdatePrevisionnelMonthlyAmountVariables {
  id: UUIDString;
  planned?: number | null;
  realized?: number | null;
  invoiceSent?: boolean | null;
}

export interface UpdateSossonTeamData {
  query?: {
  };
    sossonTeam_update?: SossonTeam_Key | null;
}

export interface UpdateSossonTeamMemberData {
  query?: {
  };
    sossonTeamMember_update?: SossonTeamMember_Key | null;
}

export interface UpdateSossonTeamMemberVariables {
  id: UUIDString;
  teamId?: UUIDString | null;
  userId?: string | null;
  title?: string | null;
  qualification?: string | null;
  level?: string | null;
  salaryGrossMonthly?: number | null;
  contract?: string | null;
  coefficient?: string | null;
  phone?: string | null;
  status?: string | null;
  site?: string | null;
  activeSites?: string | null;
  responsibilities?: string | null;
  permissions?: string | null;
}

export interface UpdateSossonTeamVariables {
  id: UUIDString;
  name?: string | null;
  type?: string | null;
  statut?: string | null;
  theme?: string | null;
  leadName?: string | null;
  description?: string | null;
  activeSites?: string | null;
  ordre?: number | null;
}

export interface UpsertPrevisionnelCellEditData {
  query?: {
  };
    previsionnelCellEdit_upsert: PrevisionnelCellEdit_Key;
}

export interface UpsertPrevisionnelCellEditVariables {
  id: string;
  sourceSheet: string;
  cellRef: string;
  valueText?: string | null;
  numericValue?: number | null;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'SubmitCurrentTeamProfile' Mutation. Allow users to execute without passing in DataConnect. */
export function submitCurrentTeamProfile(dc: DataConnect, vars: SubmitCurrentTeamProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SubmitCurrentTeamProfileData>>;
/** Generated Node Admin SDK operation action function for the 'SubmitCurrentTeamProfile' Mutation. Allow users to pass in custom DataConnect instances. */
export function submitCurrentTeamProfile(vars: SubmitCurrentTeamProfileVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SubmitCurrentTeamProfileData>>;

/** Generated Node Admin SDK operation action function for the 'ConvertTeamProfileSubmission' Mutation. Allow users to execute without passing in DataConnect. */
export function convertTeamProfileSubmission(dc: DataConnect, vars: ConvertTeamProfileSubmissionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ConvertTeamProfileSubmissionData>>;
/** Generated Node Admin SDK operation action function for the 'ConvertTeamProfileSubmission' Mutation. Allow users to pass in custom DataConnect instances. */
export function convertTeamProfileSubmission(vars: ConvertTeamProfileSubmissionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ConvertTeamProfileSubmissionData>>;

/** Generated Node Admin SDK operation action function for the 'CreateSossonTeam' Mutation. Allow users to execute without passing in DataConnect. */
export function createSossonTeam(dc: DataConnect, vars: CreateSossonTeamVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonTeamData>>;
/** Generated Node Admin SDK operation action function for the 'CreateSossonTeam' Mutation. Allow users to pass in custom DataConnect instances. */
export function createSossonTeam(vars: CreateSossonTeamVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonTeamData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateSossonTeam' Mutation. Allow users to execute without passing in DataConnect. */
export function updateSossonTeam(dc: DataConnect, vars: UpdateSossonTeamVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSossonTeamData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateSossonTeam' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateSossonTeam(vars: UpdateSossonTeamVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSossonTeamData>>;

/** Generated Node Admin SDK operation action function for the 'CreateSossonTeamMember' Mutation. Allow users to execute without passing in DataConnect. */
export function createSossonTeamMember(dc: DataConnect, vars: CreateSossonTeamMemberVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonTeamMemberData>>;
/** Generated Node Admin SDK operation action function for the 'CreateSossonTeamMember' Mutation. Allow users to pass in custom DataConnect instances. */
export function createSossonTeamMember(vars: CreateSossonTeamMemberVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonTeamMemberData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateSossonTeamMember' Mutation. Allow users to execute without passing in DataConnect. */
export function updateSossonTeamMember(dc: DataConnect, vars: UpdateSossonTeamMemberVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSossonTeamMemberData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateSossonTeamMember' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateSossonTeamMember(vars: UpdateSossonTeamMemberVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateSossonTeamMemberData>>;

/** Generated Node Admin SDK operation action function for the 'CreateSossonTeamLeavePeriod' Mutation. Allow users to execute without passing in DataConnect. */
export function createSossonTeamLeavePeriod(dc: DataConnect, vars: CreateSossonTeamLeavePeriodVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonTeamLeavePeriodData>>;
/** Generated Node Admin SDK operation action function for the 'CreateSossonTeamLeavePeriod' Mutation. Allow users to pass in custom DataConnect instances. */
export function createSossonTeamLeavePeriod(vars: CreateSossonTeamLeavePeriodVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonTeamLeavePeriodData>>;

/** Generated Node Admin SDK operation action function for the 'CreateSossonWorkTimeEntry' Mutation. Allow users to execute without passing in DataConnect. */
export function createSossonWorkTimeEntry(dc: DataConnect, vars: CreateSossonWorkTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonWorkTimeEntryData>>;
/** Generated Node Admin SDK operation action function for the 'CreateSossonWorkTimeEntry' Mutation. Allow users to pass in custom DataConnect instances. */
export function createSossonWorkTimeEntry(vars: CreateSossonWorkTimeEntryVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonWorkTimeEntryData>>;

/** Generated Node Admin SDK operation action function for the 'CreateSossonPayrollPeriod' Mutation. Allow users to execute without passing in DataConnect. */
export function createSossonPayrollPeriod(dc: DataConnect, vars: CreateSossonPayrollPeriodVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonPayrollPeriodData>>;
/** Generated Node Admin SDK operation action function for the 'CreateSossonPayrollPeriod' Mutation. Allow users to pass in custom DataConnect instances. */
export function createSossonPayrollPeriod(vars: CreateSossonPayrollPeriodVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateSossonPayrollPeriodData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePlanningJobSheet' Mutation. Allow users to execute without passing in DataConnect. */
export function createPlanningJobSheet(dc: DataConnect, vars: CreatePlanningJobSheetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePlanningJobSheetData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePlanningJobSheet' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPlanningJobSheet(vars: CreatePlanningJobSheetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePlanningJobSheetData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePlanningJobSheetProgress' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePlanningJobSheetProgress(dc: DataConnect, vars: UpdatePlanningJobSheetProgressVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningJobSheetProgressData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePlanningJobSheetProgress' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePlanningJobSheetProgress(vars: UpdatePlanningJobSheetProgressVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningJobSheetProgressData>>;

/** Generated Node Admin SDK operation action function for the 'CompletePlanningJobSheet' Mutation. Allow users to execute without passing in DataConnect. */
export function completePlanningJobSheet(dc: DataConnect, vars: CompletePlanningJobSheetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CompletePlanningJobSheetData>>;
/** Generated Node Admin SDK operation action function for the 'CompletePlanningJobSheet' Mutation. Allow users to pass in custom DataConnect instances. */
export function completePlanningJobSheet(vars: CompletePlanningJobSheetVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CompletePlanningJobSheetData>>;

/** Generated Node Admin SDK operation action function for the 'CreateClient' Mutation. Allow users to execute without passing in DataConnect. */
export function createClient(dc: DataConnect, vars: CreateClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateClientData>>;
/** Generated Node Admin SDK operation action function for the 'CreateClient' Mutation. Allow users to pass in custom DataConnect instances. */
export function createClient(vars: CreateClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateClientData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateClient' Mutation. Allow users to execute without passing in DataConnect. */
export function updateClient(dc: DataConnect, vars: UpdateClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateClientData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateClient' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateClient(vars: UpdateClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateClientData>>;

/** Generated Node Admin SDK operation action function for the 'CreateChantier' Mutation. Allow users to execute without passing in DataConnect. */
export function createChantier(dc: DataConnect, vars: CreateChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateChantierData>>;
/** Generated Node Admin SDK operation action function for the 'CreateChantier' Mutation. Allow users to pass in custom DataConnect instances. */
export function createChantier(vars: CreateChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateChantierData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateChantierStatut' Mutation. Allow users to execute without passing in DataConnect. */
export function updateChantierStatut(dc: DataConnect, vars: UpdateChantierStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateChantierStatutData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateChantierStatut' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateChantierStatut(vars: UpdateChantierStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateChantierStatutData>>;

/** Generated Node Admin SDK operation action function for the 'CreateDevis' Mutation. Allow users to execute without passing in DataConnect. */
export function createDevis(dc: DataConnect, vars: CreateDevisVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDevisData>>;
/** Generated Node Admin SDK operation action function for the 'CreateDevis' Mutation. Allow users to pass in custom DataConnect instances. */
export function createDevis(vars: CreateDevisVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDevisData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateDevisStatut' Mutation. Allow users to execute without passing in DataConnect. */
export function updateDevisStatut(dc: DataConnect, vars: UpdateDevisStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateDevisStatutData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateDevisStatut' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateDevisStatut(vars: UpdateDevisStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateDevisStatutData>>;

/** Generated Node Admin SDK operation action function for the 'CreateFacture' Mutation. Allow users to execute without passing in DataConnect. */
export function createFacture(dc: DataConnect, vars: CreateFactureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateFactureData>>;
/** Generated Node Admin SDK operation action function for the 'CreateFacture' Mutation. Allow users to pass in custom DataConnect instances. */
export function createFacture(vars: CreateFactureVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateFactureData>>;

/** Generated Node Admin SDK operation action function for the 'SetFactureStatut' Mutation. Allow users to execute without passing in DataConnect. */
export function setFactureStatut(dc: DataConnect, vars: SetFactureStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetFactureStatutData>>;
/** Generated Node Admin SDK operation action function for the 'SetFactureStatut' Mutation. Allow users to pass in custom DataConnect instances. */
export function setFactureStatut(vars: SetFactureStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SetFactureStatutData>>;

/** Generated Node Admin SDK operation action function for the 'CreateDocumentFolder' Mutation. Allow users to execute without passing in DataConnect. */
export function createDocumentFolder(dc: DataConnect, vars: CreateDocumentFolderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDocumentFolderData>>;
/** Generated Node Admin SDK operation action function for the 'CreateDocumentFolder' Mutation. Allow users to pass in custom DataConnect instances. */
export function createDocumentFolder(vars: CreateDocumentFolderVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDocumentFolderData>>;

/** Generated Node Admin SDK operation action function for the 'CreateDocumentAttache' Mutation. Allow users to execute without passing in DataConnect. */
export function createDocumentAttache(dc: DataConnect, vars: CreateDocumentAttacheVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDocumentAttacheData>>;
/** Generated Node Admin SDK operation action function for the 'CreateDocumentAttache' Mutation. Allow users to pass in custom DataConnect instances. */
export function createDocumentAttache(vars: CreateDocumentAttacheVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDocumentAttacheData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateDocumentAttacheLinks' Mutation. Allow users to execute without passing in DataConnect. */
export function updateDocumentAttacheLinks(dc: DataConnect, vars: UpdateDocumentAttacheLinksVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateDocumentAttacheLinksData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateDocumentAttacheLinks' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateDocumentAttacheLinks(vars: UpdateDocumentAttacheLinksVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateDocumentAttacheLinksData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePrevisionnelImportBatch' Mutation. Allow users to execute without passing in DataConnect. */
export function createPrevisionnelImportBatch(dc: DataConnect, vars: CreatePrevisionnelImportBatchVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePrevisionnelImportBatchData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePrevisionnelImportBatch' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPrevisionnelImportBatch(vars: CreatePrevisionnelImportBatchVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePrevisionnelImportBatchData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePrevisionnelMonthlyAmount' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePrevisionnelMonthlyAmount(dc: DataConnect, vars: UpdatePrevisionnelMonthlyAmountVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePrevisionnelMonthlyAmountData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePrevisionnelMonthlyAmount' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePrevisionnelMonthlyAmount(vars: UpdatePrevisionnelMonthlyAmountVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePrevisionnelMonthlyAmountData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePrevisionnelLineAmounts' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePrevisionnelLineAmounts(dc: DataConnect, vars: UpdatePrevisionnelLineAmountsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePrevisionnelLineAmountsData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePrevisionnelLineAmounts' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePrevisionnelLineAmounts(vars: UpdatePrevisionnelLineAmountsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePrevisionnelLineAmountsData>>;

/** Generated Node Admin SDK operation action function for the 'LinkPrevisionnelLineToChantier' Mutation. Allow users to execute without passing in DataConnect. */
export function linkPrevisionnelLineToChantier(dc: DataConnect, vars: LinkPrevisionnelLineToChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<LinkPrevisionnelLineToChantierData>>;
/** Generated Node Admin SDK operation action function for the 'LinkPrevisionnelLineToChantier' Mutation. Allow users to pass in custom DataConnect instances. */
export function linkPrevisionnelLineToChantier(vars: LinkPrevisionnelLineToChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<LinkPrevisionnelLineToChantierData>>;

/** Generated Node Admin SDK operation action function for the 'UpsertPrevisionnelCellEdit' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertPrevisionnelCellEdit(dc: DataConnect, vars: UpsertPrevisionnelCellEditVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertPrevisionnelCellEditData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertPrevisionnelCellEdit' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertPrevisionnelCellEdit(vars: UpsertPrevisionnelCellEditVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertPrevisionnelCellEditData>>;

/** Generated Node Admin SDK operation action function for the 'CreateEmailThread' Mutation. Allow users to execute without passing in DataConnect. */
export function createEmailThread(dc: DataConnect, vars: CreateEmailThreadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEmailThreadData>>;
/** Generated Node Admin SDK operation action function for the 'CreateEmailThread' Mutation. Allow users to pass in custom DataConnect instances. */
export function createEmailThread(vars: CreateEmailThreadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEmailThreadData>>;

/** Generated Node Admin SDK operation action function for the 'UpdateEmailThreadStatusAndLinks' Mutation. Allow users to execute without passing in DataConnect. */
export function updateEmailThreadStatusAndLinks(dc: DataConnect, vars: UpdateEmailThreadStatusAndLinksVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateEmailThreadStatusAndLinksData>>;
/** Generated Node Admin SDK operation action function for the 'UpdateEmailThreadStatusAndLinks' Mutation. Allow users to pass in custom DataConnect instances. */
export function updateEmailThreadStatusAndLinks(vars: UpdateEmailThreadStatusAndLinksVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdateEmailThreadStatusAndLinksData>>;

/** Generated Node Admin SDK operation action function for the 'CreateEmailMessage' Mutation. Allow users to execute without passing in DataConnect. */
export function createEmailMessage(dc: DataConnect, vars: CreateEmailMessageVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEmailMessageData>>;
/** Generated Node Admin SDK operation action function for the 'CreateEmailMessage' Mutation. Allow users to pass in custom DataConnect instances. */
export function createEmailMessage(vars: CreateEmailMessageVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEmailMessageData>>;

/** Generated Node Admin SDK operation action function for the 'CreateEmailAttachment' Mutation. Allow users to execute without passing in DataConnect. */
export function createEmailAttachment(dc: DataConnect, vars: CreateEmailAttachmentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEmailAttachmentData>>;
/** Generated Node Admin SDK operation action function for the 'CreateEmailAttachment' Mutation. Allow users to pass in custom DataConnect instances. */
export function createEmailAttachment(vars: CreateEmailAttachmentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEmailAttachmentData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePlanningEvent' Mutation. Allow users to execute without passing in DataConnect. */
export function createPlanningEvent(dc: DataConnect, vars: CreatePlanningEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePlanningEventData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePlanningEvent' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPlanningEvent(vars: CreatePlanningEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePlanningEventData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePlanningEventStatus' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePlanningEventStatus(dc: DataConnect, vars: UpdatePlanningEventStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningEventStatusData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePlanningEventStatus' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePlanningEventStatus(vars: UpdatePlanningEventStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningEventStatusData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePlanningEventDetails' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePlanningEventDetails(dc: DataConnect, vars: UpdatePlanningEventDetailsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningEventDetailsData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePlanningEventDetails' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePlanningEventDetails(vars: UpdatePlanningEventDetailsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningEventDetailsData>>;

/** Generated Node Admin SDK operation action function for the 'CancelPlanningEvent' Mutation. Allow users to execute without passing in DataConnect. */
export function cancelPlanningEvent(dc: DataConnect, vars: CancelPlanningEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CancelPlanningEventData>>;
/** Generated Node Admin SDK operation action function for the 'CancelPlanningEvent' Mutation. Allow users to pass in custom DataConnect instances. */
export function cancelPlanningEvent(vars: CancelPlanningEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CancelPlanningEventData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePlanningAssignment' Mutation. Allow users to execute without passing in DataConnect. */
export function createPlanningAssignment(dc: DataConnect, vars: CreatePlanningAssignmentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePlanningAssignmentData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePlanningAssignment' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPlanningAssignment(vars: CreatePlanningAssignmentVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePlanningAssignmentData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePlanningAssignmentStatus' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePlanningAssignmentStatus(dc: DataConnect, vars: UpdatePlanningAssignmentStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningAssignmentStatusData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePlanningAssignmentStatus' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePlanningAssignmentStatus(vars: UpdatePlanningAssignmentStatusVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePlanningAssignmentStatusData>>;

/** Generated Node Admin SDK operation action function for the 'CreateAnalyticsSnapshot' Mutation. Allow users to execute without passing in DataConnect. */
export function createAnalyticsSnapshot(dc: DataConnect, vars: CreateAnalyticsSnapshotVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAnalyticsSnapshotData>>;
/** Generated Node Admin SDK operation action function for the 'CreateAnalyticsSnapshot' Mutation. Allow users to pass in custom DataConnect instances. */
export function createAnalyticsSnapshot(vars: CreateAnalyticsSnapshotVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAnalyticsSnapshotData>>;

/** Generated Node Admin SDK operation action function for the 'CreateRapport' Mutation. Allow users to execute without passing in DataConnect. */
export function createRapport(dc: DataConnect, vars: CreateRapportVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateRapportData>>;
/** Generated Node Admin SDK operation action function for the 'CreateRapport' Mutation. Allow users to pass in custom DataConnect instances. */
export function createRapport(vars: CreateRapportVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateRapportData>>;

/** Generated Node Admin SDK operation action function for the 'MarkRapportGenerated' Mutation. Allow users to execute without passing in DataConnect. */
export function markRapportGenerated(dc: DataConnect, vars: MarkRapportGeneratedVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<MarkRapportGeneratedData>>;
/** Generated Node Admin SDK operation action function for the 'MarkRapportGenerated' Mutation. Allow users to pass in custom DataConnect instances. */
export function markRapportGenerated(vars: MarkRapportGeneratedVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<MarkRapportGeneratedData>>;

/** Generated Node Admin SDK operation action function for the 'CreateAuditEvent' Mutation. Allow users to execute without passing in DataConnect. */
export function createAuditEvent(dc: DataConnect, vars: CreateAuditEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAuditEventData>>;
/** Generated Node Admin SDK operation action function for the 'CreateAuditEvent' Mutation. Allow users to pass in custom DataConnect instances. */
export function createAuditEvent(vars: CreateAuditEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateAuditEventData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCheckpointRun' Mutation. Allow users to execute without passing in DataConnect. */
export function createCheckpointRun(dc: DataConnect, vars: CreateCheckpointRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointRunData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCheckpointRun' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCheckpointRun(vars: CreateCheckpointRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointRunData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCheckpointStep' Mutation. Allow users to execute without passing in DataConnect. */
export function createCheckpointStep(dc: DataConnect, vars: CreateCheckpointStepVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointStepData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCheckpointStep' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCheckpointStep(vars: CreateCheckpointStepVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointStepData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCheckpointArtifact' Mutation. Allow users to execute without passing in DataConnect. */
export function createCheckpointArtifact(dc: DataConnect, vars: CreateCheckpointArtifactVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointArtifactData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCheckpointArtifact' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCheckpointArtifact(vars: CreateCheckpointArtifactVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointArtifactData>>;

/** Generated Node Admin SDK operation action function for the 'CreateCheckpointDecision' Mutation. Allow users to execute without passing in DataConnect. */
export function createCheckpointDecision(dc: DataConnect, vars: CreateCheckpointDecisionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointDecisionData>>;
/** Generated Node Admin SDK operation action function for the 'CreateCheckpointDecision' Mutation. Allow users to pass in custom DataConnect instances. */
export function createCheckpointDecision(vars: CreateCheckpointDecisionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateCheckpointDecisionData>>;

/** Generated Node Admin SDK operation action function for the 'CreateDataImportRun' Mutation. Allow users to execute without passing in DataConnect. */
export function createDataImportRun(dc: DataConnect, vars: CreateDataImportRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDataImportRunData>>;
/** Generated Node Admin SDK operation action function for the 'CreateDataImportRun' Mutation. Allow users to pass in custom DataConnect instances. */
export function createDataImportRun(vars: CreateDataImportRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDataImportRunData>>;

/** Generated Node Admin SDK operation action function for the 'CreateDataImportIssue' Mutation. Allow users to execute without passing in DataConnect. */
export function createDataImportIssue(dc: DataConnect, vars: CreateDataImportIssueVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDataImportIssueData>>;
/** Generated Node Admin SDK operation action function for the 'CreateDataImportIssue' Mutation. Allow users to pass in custom DataConnect instances. */
export function createDataImportIssue(vars: CreateDataImportIssueVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateDataImportIssueData>>;

/** Generated Node Admin SDK operation action function for the 'CreateEntityChangeLog' Mutation. Allow users to execute without passing in DataConnect. */
export function createEntityChangeLog(dc: DataConnect, vars: CreateEntityChangeLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEntityChangeLogData>>;
/** Generated Node Admin SDK operation action function for the 'CreateEntityChangeLog' Mutation. Allow users to pass in custom DataConnect instances. */
export function createEntityChangeLog(vars: CreateEntityChangeLogVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreateEntityChangeLogData>>;

/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to execute without passing in DataConnect. */
export function getCurrentUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;
/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to pass in custom DataConnect instances. */
export function getCurrentUser(options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to execute without passing in DataConnect. */
export function listUsers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;
/** Generated Node Admin SDK operation action function for the 'ListUsers' Query. Allow users to pass in custom DataConnect instances. */
export function listUsers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUsersData>>;

/** Generated Node Admin SDK operation action function for the 'GetCurrentTeamProfileSubmission' Query. Allow users to execute without passing in DataConnect. */
export function getCurrentTeamProfileSubmission(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentTeamProfileSubmissionData>>;
/** Generated Node Admin SDK operation action function for the 'GetCurrentTeamProfileSubmission' Query. Allow users to pass in custom DataConnect instances. */
export function getCurrentTeamProfileSubmission(options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentTeamProfileSubmissionData>>;

/** Generated Node Admin SDK operation action function for the 'ListTeamProfileSubmissions' Query. Allow users to execute without passing in DataConnect. */
export function listTeamProfileSubmissions(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTeamProfileSubmissionsData>>;
/** Generated Node Admin SDK operation action function for the 'ListTeamProfileSubmissions' Query. Allow users to pass in custom DataConnect instances. */
export function listTeamProfileSubmissions(options?: OperationOptions): Promise<ExecuteOperationResponse<ListTeamProfileSubmissionsData>>;

/** Generated Node Admin SDK operation action function for the 'ListSossonTeams' Query. Allow users to execute without passing in DataConnect. */
export function listSossonTeams(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSossonTeamsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSossonTeams' Query. Allow users to pass in custom DataConnect instances. */
export function listSossonTeams(options?: OperationOptions): Promise<ExecuteOperationResponse<ListSossonTeamsData>>;

/** Generated Node Admin SDK operation action function for the 'ListSossonWorkTimeEntries' Query. Allow users to execute without passing in DataConnect. */
export function listSossonWorkTimeEntries(dc: DataConnect, vars: ListSossonWorkTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSossonWorkTimeEntriesData>>;
/** Generated Node Admin SDK operation action function for the 'ListSossonWorkTimeEntries' Query. Allow users to pass in custom DataConnect instances. */
export function listSossonWorkTimeEntries(vars: ListSossonWorkTimeEntriesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSossonWorkTimeEntriesData>>;

/** Generated Node Admin SDK operation action function for the 'ListSossonPayrollPeriods' Query. Allow users to execute without passing in DataConnect. */
export function listSossonPayrollPeriods(dc: DataConnect, vars: ListSossonPayrollPeriodsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSossonPayrollPeriodsData>>;
/** Generated Node Admin SDK operation action function for the 'ListSossonPayrollPeriods' Query. Allow users to pass in custom DataConnect instances. */
export function listSossonPayrollPeriods(vars: ListSossonPayrollPeriodsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListSossonPayrollPeriodsData>>;

/** Generated Node Admin SDK operation action function for the 'ListOperationalClients' Query. Allow users to execute without passing in DataConnect. */
export function listOperationalClients(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListOperationalClientsData>>;
/** Generated Node Admin SDK operation action function for the 'ListOperationalClients' Query. Allow users to pass in custom DataConnect instances. */
export function listOperationalClients(options?: OperationOptions): Promise<ExecuteOperationResponse<ListOperationalClientsData>>;

/** Generated Node Admin SDK operation action function for the 'GetClient' Query. Allow users to execute without passing in DataConnect. */
export function getClient(dc: DataConnect, vars: GetClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetClientData>>;
/** Generated Node Admin SDK operation action function for the 'GetClient' Query. Allow users to pass in custom DataConnect instances. */
export function getClient(vars: GetClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetClientData>>;

/** Generated Node Admin SDK operation action function for the 'ListOperationalChantiers' Query. Allow users to execute without passing in DataConnect. */
export function listOperationalChantiers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListOperationalChantiersData>>;
/** Generated Node Admin SDK operation action function for the 'ListOperationalChantiers' Query. Allow users to pass in custom DataConnect instances. */
export function listOperationalChantiers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListOperationalChantiersData>>;

/** Generated Node Admin SDK operation action function for the 'GetChantier' Query. Allow users to execute without passing in DataConnect. */
export function getChantier(dc: DataConnect, vars: GetChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetChantierData>>;
/** Generated Node Admin SDK operation action function for the 'GetChantier' Query. Allow users to pass in custom DataConnect instances. */
export function getChantier(vars: GetChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetChantierData>>;

/** Generated Node Admin SDK operation action function for the 'ListDevis' Query. Allow users to execute without passing in DataConnect. */
export function listDevis(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDevisData>>;
/** Generated Node Admin SDK operation action function for the 'ListDevis' Query. Allow users to pass in custom DataConnect instances. */
export function listDevis(options?: OperationOptions): Promise<ExecuteOperationResponse<ListDevisData>>;

/** Generated Node Admin SDK operation action function for the 'ListDevisByClient' Query. Allow users to execute without passing in DataConnect. */
export function listDevisByClient(dc: DataConnect, vars: ListDevisByClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDevisByClientData>>;
/** Generated Node Admin SDK operation action function for the 'ListDevisByClient' Query. Allow users to pass in custom DataConnect instances. */
export function listDevisByClient(vars: ListDevisByClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDevisByClientData>>;

/** Generated Node Admin SDK operation action function for the 'ListDevisByChantier' Query. Allow users to execute without passing in DataConnect. */
export function listDevisByChantier(dc: DataConnect, vars: ListDevisByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDevisByChantierData>>;
/** Generated Node Admin SDK operation action function for the 'ListDevisByChantier' Query. Allow users to pass in custom DataConnect instances. */
export function listDevisByChantier(vars: ListDevisByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDevisByChantierData>>;

/** Generated Node Admin SDK operation action function for the 'ListFactures' Query. Allow users to execute without passing in DataConnect. */
export function listFactures(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListFacturesData>>;
/** Generated Node Admin SDK operation action function for the 'ListFactures' Query. Allow users to pass in custom DataConnect instances. */
export function listFactures(options?: OperationOptions): Promise<ExecuteOperationResponse<ListFacturesData>>;

/** Generated Node Admin SDK operation action function for the 'ListFacturesByStatut' Query. Allow users to execute without passing in DataConnect. */
export function listFacturesByStatut(dc: DataConnect, vars: ListFacturesByStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListFacturesByStatutData>>;
/** Generated Node Admin SDK operation action function for the 'ListFacturesByStatut' Query. Allow users to pass in custom DataConnect instances. */
export function listFacturesByStatut(vars: ListFacturesByStatutVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListFacturesByStatutData>>;

/** Generated Node Admin SDK operation action function for the 'ListDocumentFolders' Query. Allow users to execute without passing in DataConnect. */
export function listDocumentFolders(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDocumentFoldersData>>;
/** Generated Node Admin SDK operation action function for the 'ListDocumentFolders' Query. Allow users to pass in custom DataConnect instances. */
export function listDocumentFolders(options?: OperationOptions): Promise<ExecuteOperationResponse<ListDocumentFoldersData>>;

/** Generated Node Admin SDK operation action function for the 'ListDocumentsAttaches' Query. Allow users to execute without passing in DataConnect. */
export function listDocumentsAttaches(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDocumentsAttachesData>>;
/** Generated Node Admin SDK operation action function for the 'ListDocumentsAttaches' Query. Allow users to pass in custom DataConnect instances. */
export function listDocumentsAttaches(options?: OperationOptions): Promise<ExecuteOperationResponse<ListDocumentsAttachesData>>;

/** Generated Node Admin SDK operation action function for the 'ListDocumentsByChantier' Query. Allow users to execute without passing in DataConnect. */
export function listDocumentsByChantier(dc: DataConnect, vars: ListDocumentsByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDocumentsByChantierData>>;
/** Generated Node Admin SDK operation action function for the 'ListDocumentsByChantier' Query. Allow users to pass in custom DataConnect instances. */
export function listDocumentsByChantier(vars: ListDocumentsByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDocumentsByChantierData>>;

/** Generated Node Admin SDK operation action function for the 'ListPrevisionnelExercises' Query. Allow users to execute without passing in DataConnect. */
export function listPrevisionnelExercises(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPrevisionnelExercisesData>>;
/** Generated Node Admin SDK operation action function for the 'ListPrevisionnelExercises' Query. Allow users to pass in custom DataConnect instances. */
export function listPrevisionnelExercises(options?: OperationOptions): Promise<ExecuteOperationResponse<ListPrevisionnelExercisesData>>;

/** Generated Node Admin SDK operation action function for the 'ListPrevisionnelLinesByExercise' Query. Allow users to execute without passing in DataConnect. */
export function listPrevisionnelLinesByExercise(dc: DataConnect, vars: ListPrevisionnelLinesByExerciseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPrevisionnelLinesByExerciseData>>;
/** Generated Node Admin SDK operation action function for the 'ListPrevisionnelLinesByExercise' Query. Allow users to pass in custom DataConnect instances. */
export function listPrevisionnelLinesByExercise(vars: ListPrevisionnelLinesByExerciseVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPrevisionnelLinesByExerciseData>>;

/** Generated Node Admin SDK operation action function for the 'SearchClientAliases' Query. Allow users to execute without passing in DataConnect. */
export function searchClientAliases(dc: DataConnect, vars: SearchClientAliasesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SearchClientAliasesData>>;
/** Generated Node Admin SDK operation action function for the 'SearchClientAliases' Query. Allow users to pass in custom DataConnect instances. */
export function searchClientAliases(vars: SearchClientAliasesVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<SearchClientAliasesData>>;

/** Generated Node Admin SDK operation action function for the 'ListPrevisionnelCellEdits' Query. Allow users to execute without passing in DataConnect. */
export function listPrevisionnelCellEdits(dc: DataConnect, vars: ListPrevisionnelCellEditsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPrevisionnelCellEditsData>>;
/** Generated Node Admin SDK operation action function for the 'ListPrevisionnelCellEdits' Query. Allow users to pass in custom DataConnect instances. */
export function listPrevisionnelCellEdits(vars: ListPrevisionnelCellEditsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPrevisionnelCellEditsData>>;

/** Generated Node Admin SDK operation action function for the 'ListEmailThreads' Query. Allow users to execute without passing in DataConnect. */
export function listEmailThreads(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEmailThreadsData>>;
/** Generated Node Admin SDK operation action function for the 'ListEmailThreads' Query. Allow users to pass in custom DataConnect instances. */
export function listEmailThreads(options?: OperationOptions): Promise<ExecuteOperationResponse<ListEmailThreadsData>>;

/** Generated Node Admin SDK operation action function for the 'ListEmailThreadsByChantier' Query. Allow users to execute without passing in DataConnect. */
export function listEmailThreadsByChantier(dc: DataConnect, vars: ListEmailThreadsByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEmailThreadsByChantierData>>;
/** Generated Node Admin SDK operation action function for the 'ListEmailThreadsByChantier' Query. Allow users to pass in custom DataConnect instances. */
export function listEmailThreadsByChantier(vars: ListEmailThreadsByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEmailThreadsByChantierData>>;

/** Generated Node Admin SDK operation action function for the 'ListUnreadEmailThreads' Query. Allow users to execute without passing in DataConnect. */
export function listUnreadEmailThreads(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListUnreadEmailThreadsData>>;
/** Generated Node Admin SDK operation action function for the 'ListUnreadEmailThreads' Query. Allow users to pass in custom DataConnect instances. */
export function listUnreadEmailThreads(options?: OperationOptions): Promise<ExecuteOperationResponse<ListUnreadEmailThreadsData>>;

/** Generated Node Admin SDK operation action function for the 'GetEmailThread' Query. Allow users to execute without passing in DataConnect. */
export function getEmailThread(dc: DataConnect, vars: GetEmailThreadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetEmailThreadData>>;
/** Generated Node Admin SDK operation action function for the 'GetEmailThread' Query. Allow users to pass in custom DataConnect instances. */
export function getEmailThread(vars: GetEmailThreadVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetEmailThreadData>>;

/** Generated Node Admin SDK operation action function for the 'ListPlanningEventsByPeriod' Query. Allow users to execute without passing in DataConnect. */
export function listPlanningEventsByPeriod(dc: DataConnect, vars: ListPlanningEventsByPeriodVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPlanningEventsByPeriodData>>;
/** Generated Node Admin SDK operation action function for the 'ListPlanningEventsByPeriod' Query. Allow users to pass in custom DataConnect instances. */
export function listPlanningEventsByPeriod(vars: ListPlanningEventsByPeriodVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPlanningEventsByPeriodData>>;

/** Generated Node Admin SDK operation action function for the 'ListPlanningEventsByChantier' Query. Allow users to execute without passing in DataConnect. */
export function listPlanningEventsByChantier(dc: DataConnect, vars: ListPlanningEventsByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPlanningEventsByChantierData>>;
/** Generated Node Admin SDK operation action function for the 'ListPlanningEventsByChantier' Query. Allow users to pass in custom DataConnect instances. */
export function listPlanningEventsByChantier(vars: ListPlanningEventsByChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPlanningEventsByChantierData>>;

/** Generated Node Admin SDK operation action function for the 'ListPlanningJobSheetsByEvent' Query. Allow users to execute without passing in DataConnect. */
export function listPlanningJobSheetsByEvent(dc: DataConnect, vars: ListPlanningJobSheetsByEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPlanningJobSheetsByEventData>>;
/** Generated Node Admin SDK operation action function for the 'ListPlanningJobSheetsByEvent' Query. Allow users to pass in custom DataConnect instances. */
export function listPlanningJobSheetsByEvent(vars: ListPlanningJobSheetsByEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPlanningJobSheetsByEventData>>;

/** Generated Node Admin SDK operation action function for the 'ListAnalyticsSnapshots' Query. Allow users to execute without passing in DataConnect. */
export function listAnalyticsSnapshots(dc: DataConnect, vars: ListAnalyticsSnapshotsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAnalyticsSnapshotsData>>;
/** Generated Node Admin SDK operation action function for the 'ListAnalyticsSnapshots' Query. Allow users to pass in custom DataConnect instances. */
export function listAnalyticsSnapshots(vars: ListAnalyticsSnapshotsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListAnalyticsSnapshotsData>>;

/** Generated Node Admin SDK operation action function for the 'GetAnalyticsSnapshot' Query. Allow users to execute without passing in DataConnect. */
export function getAnalyticsSnapshot(dc: DataConnect, vars: GetAnalyticsSnapshotVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetAnalyticsSnapshotData>>;
/** Generated Node Admin SDK operation action function for the 'GetAnalyticsSnapshot' Query. Allow users to pass in custom DataConnect instances. */
export function getAnalyticsSnapshot(vars: GetAnalyticsSnapshotVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetAnalyticsSnapshotData>>;

/** Generated Node Admin SDK operation action function for the 'ListRapports' Query. Allow users to execute without passing in DataConnect. */
export function listRapports(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListRapportsData>>;
/** Generated Node Admin SDK operation action function for the 'ListRapports' Query. Allow users to pass in custom DataConnect instances. */
export function listRapports(options?: OperationOptions): Promise<ExecuteOperationResponse<ListRapportsData>>;

/** Generated Node Admin SDK operation action function for the 'GetRapport' Query. Allow users to execute without passing in DataConnect. */
export function getRapport(dc: DataConnect, vars: GetRapportVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetRapportData>>;
/** Generated Node Admin SDK operation action function for the 'GetRapport' Query. Allow users to pass in custom DataConnect instances. */
export function getRapport(vars: GetRapportVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetRapportData>>;

/** Generated Node Admin SDK operation action function for the 'ListRecentAuditEvents' Query. Allow users to execute without passing in DataConnect. */
export function listRecentAuditEvents(dc: DataConnect, vars: ListRecentAuditEventsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListRecentAuditEventsData>>;
/** Generated Node Admin SDK operation action function for the 'ListRecentAuditEvents' Query. Allow users to pass in custom DataConnect instances. */
export function listRecentAuditEvents(vars: ListRecentAuditEventsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListRecentAuditEventsData>>;

/** Generated Node Admin SDK operation action function for the 'ListEntityChangeLogs' Query. Allow users to execute without passing in DataConnect. */
export function listEntityChangeLogs(dc: DataConnect, vars: ListEntityChangeLogsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEntityChangeLogsData>>;
/** Generated Node Admin SDK operation action function for the 'ListEntityChangeLogs' Query. Allow users to pass in custom DataConnect instances. */
export function listEntityChangeLogs(vars: ListEntityChangeLogsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListEntityChangeLogsData>>;

/** Generated Node Admin SDK operation action function for the 'ListCheckpointRuns' Query. Allow users to execute without passing in DataConnect. */
export function listCheckpointRuns(dc: DataConnect, vars: ListCheckpointRunsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCheckpointRunsData>>;
/** Generated Node Admin SDK operation action function for the 'ListCheckpointRuns' Query. Allow users to pass in custom DataConnect instances. */
export function listCheckpointRuns(vars: ListCheckpointRunsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListCheckpointRunsData>>;

/** Generated Node Admin SDK operation action function for the 'GetCheckpointRun' Query. Allow users to execute without passing in DataConnect. */
export function getCheckpointRun(dc: DataConnect, vars: GetCheckpointRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCheckpointRunData>>;
/** Generated Node Admin SDK operation action function for the 'GetCheckpointRun' Query. Allow users to pass in custom DataConnect instances. */
export function getCheckpointRun(vars: GetCheckpointRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCheckpointRunData>>;

/** Generated Node Admin SDK operation action function for the 'ListDataImportRuns' Query. Allow users to execute without passing in DataConnect. */
export function listDataImportRuns(dc: DataConnect, vars: ListDataImportRunsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDataImportRunsData>>;
/** Generated Node Admin SDK operation action function for the 'ListDataImportRuns' Query. Allow users to pass in custom DataConnect instances. */
export function listDataImportRuns(vars: ListDataImportRunsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListDataImportRunsData>>;

/** Generated Node Admin SDK operation action function for the 'GetDataImportRun' Query. Allow users to execute without passing in DataConnect. */
export function getDataImportRun(dc: DataConnect, vars: GetDataImportRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetDataImportRunData>>;
/** Generated Node Admin SDK operation action function for the 'GetDataImportRun' Query. Allow users to pass in custom DataConnect instances. */
export function getDataImportRun(vars: GetDataImportRunVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetDataImportRunData>>;

