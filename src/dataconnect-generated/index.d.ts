import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

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
  updatedById?: string | null;
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
  createdById?: string | null;
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
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
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

export interface CreateDocumentAttacheData {
  query?: {
  };
    documentAttache_insert: DocumentAttache_Key;
}

export interface CreateDocumentAttacheVariables {
  folderId?: UUIDString | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
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
  createdById?: string | null;
  updatedById?: string | null;
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
  authorId?: string | null;
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

export interface DataImportIssue_Key {
  id: UUIDString;
  __typename?: 'DataImportIssue_Key';
}

export interface DataImportRun_Key {
  id: UUIDString;
  __typename?: 'DataImportRun_Key';
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
      email?: string | null;
      telephone?: string | null;
      adresse?: string | null;
      ville?: string | null;
      codePostal?: string | null;
    } & Client_Key;
      chefChantier?: {
        id: string;
        nom: string;
        prenom: string;
        email: string;
        avatar?: string | null;
      } & User_Key;
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
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    ville?: string | null;
    codePostal?: string | null;
    dateCreation: TimestampString;
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

export interface GetCurrentUserData {
  user?: {
    id: string;
    email: string;
    nom: string;
    prenom: string;
    role: string;
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
    email?: string | null;
    telephone?: string | null;
    adresse?: string | null;
    ville?: string | null;
    codePostal?: string | null;
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
      user?: {
        id: string;
        nom: string;
        prenom: string;
        avatar?: string | null;
        role: string;
      } & User_Key;
    } & PlanningAssignment_Key)[];
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
            user?: {
              id: string;
              nom: string;
              prenom: string;
              avatar?: string | null;
              role: string;
            } & User_Key;
          } & PlanningAssignment_Key)[];
  } & PlanningEvent_Key)[];
}

export interface ListPlanningEventsByPeriodVariables {
  startAt: TimestampString;
  endAt: TimestampString;
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
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
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
  updatedById?: string | null;
}

export interface UpdatePlanningEventStatusData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}

export interface UpdatePlanningEventStatusVariables {
  id: UUIDString;
  statut: string;
  updatedById?: string | null;
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

interface CreateClientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateClientVariables): MutationRef<CreateClientData, CreateClientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateClientVariables): MutationRef<CreateClientData, CreateClientVariables>;
  operationName: string;
}
export const createClientRef: CreateClientRef;

export function createClient(vars: CreateClientVariables): MutationPromise<CreateClientData, CreateClientVariables>;
export function createClient(dc: DataConnect, vars: CreateClientVariables): MutationPromise<CreateClientData, CreateClientVariables>;

interface UpdateClientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateClientVariables): MutationRef<UpdateClientData, UpdateClientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateClientVariables): MutationRef<UpdateClientData, UpdateClientVariables>;
  operationName: string;
}
export const updateClientRef: UpdateClientRef;

export function updateClient(vars: UpdateClientVariables): MutationPromise<UpdateClientData, UpdateClientVariables>;
export function updateClient(dc: DataConnect, vars: UpdateClientVariables): MutationPromise<UpdateClientData, UpdateClientVariables>;

interface CreateChantierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateChantierVariables): MutationRef<CreateChantierData, CreateChantierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateChantierVariables): MutationRef<CreateChantierData, CreateChantierVariables>;
  operationName: string;
}
export const createChantierRef: CreateChantierRef;

export function createChantier(vars: CreateChantierVariables): MutationPromise<CreateChantierData, CreateChantierVariables>;
export function createChantier(dc: DataConnect, vars: CreateChantierVariables): MutationPromise<CreateChantierData, CreateChantierVariables>;

interface UpdateChantierStatutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateChantierStatutVariables): MutationRef<UpdateChantierStatutData, UpdateChantierStatutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateChantierStatutVariables): MutationRef<UpdateChantierStatutData, UpdateChantierStatutVariables>;
  operationName: string;
}
export const updateChantierStatutRef: UpdateChantierStatutRef;

export function updateChantierStatut(vars: UpdateChantierStatutVariables): MutationPromise<UpdateChantierStatutData, UpdateChantierStatutVariables>;
export function updateChantierStatut(dc: DataConnect, vars: UpdateChantierStatutVariables): MutationPromise<UpdateChantierStatutData, UpdateChantierStatutVariables>;

interface CreateFactureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFactureVariables): MutationRef<CreateFactureData, CreateFactureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateFactureVariables): MutationRef<CreateFactureData, CreateFactureVariables>;
  operationName: string;
}
export const createFactureRef: CreateFactureRef;

export function createFacture(vars: CreateFactureVariables): MutationPromise<CreateFactureData, CreateFactureVariables>;
export function createFacture(dc: DataConnect, vars: CreateFactureVariables): MutationPromise<CreateFactureData, CreateFactureVariables>;

interface SetFactureStatutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetFactureStatutVariables): MutationRef<SetFactureStatutData, SetFactureStatutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SetFactureStatutVariables): MutationRef<SetFactureStatutData, SetFactureStatutVariables>;
  operationName: string;
}
export const setFactureStatutRef: SetFactureStatutRef;

export function setFactureStatut(vars: SetFactureStatutVariables): MutationPromise<SetFactureStatutData, SetFactureStatutVariables>;
export function setFactureStatut(dc: DataConnect, vars: SetFactureStatutVariables): MutationPromise<SetFactureStatutData, SetFactureStatutVariables>;

interface CreateDocumentFolderRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDocumentFolderVariables): MutationRef<CreateDocumentFolderData, CreateDocumentFolderVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDocumentFolderVariables): MutationRef<CreateDocumentFolderData, CreateDocumentFolderVariables>;
  operationName: string;
}
export const createDocumentFolderRef: CreateDocumentFolderRef;

export function createDocumentFolder(vars: CreateDocumentFolderVariables): MutationPromise<CreateDocumentFolderData, CreateDocumentFolderVariables>;
export function createDocumentFolder(dc: DataConnect, vars: CreateDocumentFolderVariables): MutationPromise<CreateDocumentFolderData, CreateDocumentFolderVariables>;

interface CreateDocumentAttacheRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDocumentAttacheVariables): MutationRef<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDocumentAttacheVariables): MutationRef<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;
  operationName: string;
}
export const createDocumentAttacheRef: CreateDocumentAttacheRef;

export function createDocumentAttache(vars: CreateDocumentAttacheVariables): MutationPromise<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;
export function createDocumentAttache(dc: DataConnect, vars: CreateDocumentAttacheVariables): MutationPromise<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;

interface UpdateDocumentAttacheLinksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDocumentAttacheLinksVariables): MutationRef<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateDocumentAttacheLinksVariables): MutationRef<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;
  operationName: string;
}
export const updateDocumentAttacheLinksRef: UpdateDocumentAttacheLinksRef;

export function updateDocumentAttacheLinks(vars: UpdateDocumentAttacheLinksVariables): MutationPromise<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;
export function updateDocumentAttacheLinks(dc: DataConnect, vars: UpdateDocumentAttacheLinksVariables): MutationPromise<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;

interface CreatePrevisionnelImportBatchRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrevisionnelImportBatchVariables): MutationRef<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePrevisionnelImportBatchVariables): MutationRef<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;
  operationName: string;
}
export const createPrevisionnelImportBatchRef: CreatePrevisionnelImportBatchRef;

export function createPrevisionnelImportBatch(vars: CreatePrevisionnelImportBatchVariables): MutationPromise<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;
export function createPrevisionnelImportBatch(dc: DataConnect, vars: CreatePrevisionnelImportBatchVariables): MutationPromise<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;

interface UpdatePrevisionnelMonthlyAmountRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePrevisionnelMonthlyAmountVariables): MutationRef<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePrevisionnelMonthlyAmountVariables): MutationRef<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;
  operationName: string;
}
export const updatePrevisionnelMonthlyAmountRef: UpdatePrevisionnelMonthlyAmountRef;

export function updatePrevisionnelMonthlyAmount(vars: UpdatePrevisionnelMonthlyAmountVariables): MutationPromise<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;
export function updatePrevisionnelMonthlyAmount(dc: DataConnect, vars: UpdatePrevisionnelMonthlyAmountVariables): MutationPromise<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;

interface UpdatePrevisionnelLineAmountsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePrevisionnelLineAmountsVariables): MutationRef<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePrevisionnelLineAmountsVariables): MutationRef<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;
  operationName: string;
}
export const updatePrevisionnelLineAmountsRef: UpdatePrevisionnelLineAmountsRef;

export function updatePrevisionnelLineAmounts(vars: UpdatePrevisionnelLineAmountsVariables): MutationPromise<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;
export function updatePrevisionnelLineAmounts(dc: DataConnect, vars: UpdatePrevisionnelLineAmountsVariables): MutationPromise<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;

interface LinkPrevisionnelLineToChantierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkPrevisionnelLineToChantierVariables): MutationRef<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: LinkPrevisionnelLineToChantierVariables): MutationRef<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;
  operationName: string;
}
export const linkPrevisionnelLineToChantierRef: LinkPrevisionnelLineToChantierRef;

export function linkPrevisionnelLineToChantier(vars: LinkPrevisionnelLineToChantierVariables): MutationPromise<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;
export function linkPrevisionnelLineToChantier(dc: DataConnect, vars: LinkPrevisionnelLineToChantierVariables): MutationPromise<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;

interface UpsertPrevisionnelCellEditRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPrevisionnelCellEditVariables): MutationRef<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertPrevisionnelCellEditVariables): MutationRef<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;
  operationName: string;
}
export const upsertPrevisionnelCellEditRef: UpsertPrevisionnelCellEditRef;

export function upsertPrevisionnelCellEdit(vars: UpsertPrevisionnelCellEditVariables): MutationPromise<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;
export function upsertPrevisionnelCellEdit(dc: DataConnect, vars: UpsertPrevisionnelCellEditVariables): MutationPromise<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;

interface CreateEmailThreadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailThreadVariables): MutationRef<CreateEmailThreadData, CreateEmailThreadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEmailThreadVariables): MutationRef<CreateEmailThreadData, CreateEmailThreadVariables>;
  operationName: string;
}
export const createEmailThreadRef: CreateEmailThreadRef;

export function createEmailThread(vars: CreateEmailThreadVariables): MutationPromise<CreateEmailThreadData, CreateEmailThreadVariables>;
export function createEmailThread(dc: DataConnect, vars: CreateEmailThreadVariables): MutationPromise<CreateEmailThreadData, CreateEmailThreadVariables>;

interface UpdateEmailThreadStatusAndLinksRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateEmailThreadStatusAndLinksVariables): MutationRef<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateEmailThreadStatusAndLinksVariables): MutationRef<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;
  operationName: string;
}
export const updateEmailThreadStatusAndLinksRef: UpdateEmailThreadStatusAndLinksRef;

export function updateEmailThreadStatusAndLinks(vars: UpdateEmailThreadStatusAndLinksVariables): MutationPromise<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;
export function updateEmailThreadStatusAndLinks(dc: DataConnect, vars: UpdateEmailThreadStatusAndLinksVariables): MutationPromise<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;

interface CreateEmailMessageRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailMessageVariables): MutationRef<CreateEmailMessageData, CreateEmailMessageVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEmailMessageVariables): MutationRef<CreateEmailMessageData, CreateEmailMessageVariables>;
  operationName: string;
}
export const createEmailMessageRef: CreateEmailMessageRef;

export function createEmailMessage(vars: CreateEmailMessageVariables): MutationPromise<CreateEmailMessageData, CreateEmailMessageVariables>;
export function createEmailMessage(dc: DataConnect, vars: CreateEmailMessageVariables): MutationPromise<CreateEmailMessageData, CreateEmailMessageVariables>;

interface CreateEmailAttachmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailAttachmentVariables): MutationRef<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEmailAttachmentVariables): MutationRef<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;
  operationName: string;
}
export const createEmailAttachmentRef: CreateEmailAttachmentRef;

export function createEmailAttachment(vars: CreateEmailAttachmentVariables): MutationPromise<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;
export function createEmailAttachment(dc: DataConnect, vars: CreateEmailAttachmentVariables): MutationPromise<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;

interface CreatePlanningEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePlanningEventVariables): MutationRef<CreatePlanningEventData, CreatePlanningEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePlanningEventVariables): MutationRef<CreatePlanningEventData, CreatePlanningEventVariables>;
  operationName: string;
}
export const createPlanningEventRef: CreatePlanningEventRef;

export function createPlanningEvent(vars: CreatePlanningEventVariables): MutationPromise<CreatePlanningEventData, CreatePlanningEventVariables>;
export function createPlanningEvent(dc: DataConnect, vars: CreatePlanningEventVariables): MutationPromise<CreatePlanningEventData, CreatePlanningEventVariables>;

interface UpdatePlanningEventStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePlanningEventStatusVariables): MutationRef<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePlanningEventStatusVariables): MutationRef<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;
  operationName: string;
}
export const updatePlanningEventStatusRef: UpdatePlanningEventStatusRef;

export function updatePlanningEventStatus(vars: UpdatePlanningEventStatusVariables): MutationPromise<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;
export function updatePlanningEventStatus(dc: DataConnect, vars: UpdatePlanningEventStatusVariables): MutationPromise<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;

interface UpdatePlanningEventDetailsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePlanningEventDetailsVariables): MutationRef<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePlanningEventDetailsVariables): MutationRef<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;
  operationName: string;
}
export const updatePlanningEventDetailsRef: UpdatePlanningEventDetailsRef;

export function updatePlanningEventDetails(vars: UpdatePlanningEventDetailsVariables): MutationPromise<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;
export function updatePlanningEventDetails(dc: DataConnect, vars: UpdatePlanningEventDetailsVariables): MutationPromise<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;

interface CancelPlanningEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelPlanningEventVariables): MutationRef<CancelPlanningEventData, CancelPlanningEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CancelPlanningEventVariables): MutationRef<CancelPlanningEventData, CancelPlanningEventVariables>;
  operationName: string;
}
export const cancelPlanningEventRef: CancelPlanningEventRef;

export function cancelPlanningEvent(vars: CancelPlanningEventVariables): MutationPromise<CancelPlanningEventData, CancelPlanningEventVariables>;
export function cancelPlanningEvent(dc: DataConnect, vars: CancelPlanningEventVariables): MutationPromise<CancelPlanningEventData, CancelPlanningEventVariables>;

interface CreatePlanningAssignmentRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePlanningAssignmentVariables): MutationRef<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreatePlanningAssignmentVariables): MutationRef<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;
  operationName: string;
}
export const createPlanningAssignmentRef: CreatePlanningAssignmentRef;

export function createPlanningAssignment(vars: CreatePlanningAssignmentVariables): MutationPromise<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;
export function createPlanningAssignment(dc: DataConnect, vars: CreatePlanningAssignmentVariables): MutationPromise<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;

interface UpdatePlanningAssignmentStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePlanningAssignmentStatusVariables): MutationRef<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdatePlanningAssignmentStatusVariables): MutationRef<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;
  operationName: string;
}
export const updatePlanningAssignmentStatusRef: UpdatePlanningAssignmentStatusRef;

export function updatePlanningAssignmentStatus(vars: UpdatePlanningAssignmentStatusVariables): MutationPromise<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;
export function updatePlanningAssignmentStatus(dc: DataConnect, vars: UpdatePlanningAssignmentStatusVariables): MutationPromise<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;

interface CreateAnalyticsSnapshotRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAnalyticsSnapshotVariables): MutationRef<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAnalyticsSnapshotVariables): MutationRef<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;
  operationName: string;
}
export const createAnalyticsSnapshotRef: CreateAnalyticsSnapshotRef;

export function createAnalyticsSnapshot(vars: CreateAnalyticsSnapshotVariables): MutationPromise<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;
export function createAnalyticsSnapshot(dc: DataConnect, vars: CreateAnalyticsSnapshotVariables): MutationPromise<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;

interface CreateRapportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRapportVariables): MutationRef<CreateRapportData, CreateRapportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateRapportVariables): MutationRef<CreateRapportData, CreateRapportVariables>;
  operationName: string;
}
export const createRapportRef: CreateRapportRef;

export function createRapport(vars: CreateRapportVariables): MutationPromise<CreateRapportData, CreateRapportVariables>;
export function createRapport(dc: DataConnect, vars: CreateRapportVariables): MutationPromise<CreateRapportData, CreateRapportVariables>;

interface MarkRapportGeneratedRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkRapportGeneratedVariables): MutationRef<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: MarkRapportGeneratedVariables): MutationRef<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;
  operationName: string;
}
export const markRapportGeneratedRef: MarkRapportGeneratedRef;

export function markRapportGenerated(vars: MarkRapportGeneratedVariables): MutationPromise<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;
export function markRapportGenerated(dc: DataConnect, vars: MarkRapportGeneratedVariables): MutationPromise<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;

interface CreateAuditEventRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuditEventVariables): MutationRef<CreateAuditEventData, CreateAuditEventVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateAuditEventVariables): MutationRef<CreateAuditEventData, CreateAuditEventVariables>;
  operationName: string;
}
export const createAuditEventRef: CreateAuditEventRef;

export function createAuditEvent(vars: CreateAuditEventVariables): MutationPromise<CreateAuditEventData, CreateAuditEventVariables>;
export function createAuditEvent(dc: DataConnect, vars: CreateAuditEventVariables): MutationPromise<CreateAuditEventData, CreateAuditEventVariables>;

interface CreateCheckpointRunRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointRunVariables): MutationRef<CreateCheckpointRunData, CreateCheckpointRunVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCheckpointRunVariables): MutationRef<CreateCheckpointRunData, CreateCheckpointRunVariables>;
  operationName: string;
}
export const createCheckpointRunRef: CreateCheckpointRunRef;

export function createCheckpointRun(vars: CreateCheckpointRunVariables): MutationPromise<CreateCheckpointRunData, CreateCheckpointRunVariables>;
export function createCheckpointRun(dc: DataConnect, vars: CreateCheckpointRunVariables): MutationPromise<CreateCheckpointRunData, CreateCheckpointRunVariables>;

interface CreateCheckpointStepRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointStepVariables): MutationRef<CreateCheckpointStepData, CreateCheckpointStepVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCheckpointStepVariables): MutationRef<CreateCheckpointStepData, CreateCheckpointStepVariables>;
  operationName: string;
}
export const createCheckpointStepRef: CreateCheckpointStepRef;

export function createCheckpointStep(vars: CreateCheckpointStepVariables): MutationPromise<CreateCheckpointStepData, CreateCheckpointStepVariables>;
export function createCheckpointStep(dc: DataConnect, vars: CreateCheckpointStepVariables): MutationPromise<CreateCheckpointStepData, CreateCheckpointStepVariables>;

interface CreateCheckpointArtifactRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointArtifactVariables): MutationRef<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCheckpointArtifactVariables): MutationRef<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;
  operationName: string;
}
export const createCheckpointArtifactRef: CreateCheckpointArtifactRef;

export function createCheckpointArtifact(vars: CreateCheckpointArtifactVariables): MutationPromise<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;
export function createCheckpointArtifact(dc: DataConnect, vars: CreateCheckpointArtifactVariables): MutationPromise<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;

interface CreateCheckpointDecisionRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointDecisionVariables): MutationRef<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateCheckpointDecisionVariables): MutationRef<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;
  operationName: string;
}
export const createCheckpointDecisionRef: CreateCheckpointDecisionRef;

export function createCheckpointDecision(vars: CreateCheckpointDecisionVariables): MutationPromise<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;
export function createCheckpointDecision(dc: DataConnect, vars: CreateCheckpointDecisionVariables): MutationPromise<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;

interface CreateDataImportRunRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDataImportRunVariables): MutationRef<CreateDataImportRunData, CreateDataImportRunVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDataImportRunVariables): MutationRef<CreateDataImportRunData, CreateDataImportRunVariables>;
  operationName: string;
}
export const createDataImportRunRef: CreateDataImportRunRef;

export function createDataImportRun(vars: CreateDataImportRunVariables): MutationPromise<CreateDataImportRunData, CreateDataImportRunVariables>;
export function createDataImportRun(dc: DataConnect, vars: CreateDataImportRunVariables): MutationPromise<CreateDataImportRunData, CreateDataImportRunVariables>;

interface CreateDataImportIssueRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDataImportIssueVariables): MutationRef<CreateDataImportIssueData, CreateDataImportIssueVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateDataImportIssueVariables): MutationRef<CreateDataImportIssueData, CreateDataImportIssueVariables>;
  operationName: string;
}
export const createDataImportIssueRef: CreateDataImportIssueRef;

export function createDataImportIssue(vars: CreateDataImportIssueVariables): MutationPromise<CreateDataImportIssueData, CreateDataImportIssueVariables>;
export function createDataImportIssue(dc: DataConnect, vars: CreateDataImportIssueVariables): MutationPromise<CreateDataImportIssueData, CreateDataImportIssueVariables>;

interface CreateEntityChangeLogRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEntityChangeLogVariables): MutationRef<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateEntityChangeLogVariables): MutationRef<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;
  operationName: string;
}
export const createEntityChangeLogRef: CreateEntityChangeLogRef;

export function createEntityChangeLog(vars: CreateEntityChangeLogVariables): MutationPromise<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;
export function createEntityChangeLog(dc: DataConnect, vars: CreateEntityChangeLogVariables): MutationPromise<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;

interface GetCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
  operationName: string;
}
export const getCurrentUserRef: GetCurrentUserRef;

export function getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;
export function getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface ListUsersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
  operationName: string;
}
export const listUsersRef: ListUsersRef;

export function listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;
export function listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListOperationalClientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOperationalClientsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListOperationalClientsData, undefined>;
  operationName: string;
}
export const listOperationalClientsRef: ListOperationalClientsRef;

export function listOperationalClients(options?: ExecuteQueryOptions): QueryPromise<ListOperationalClientsData, undefined>;
export function listOperationalClients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListOperationalClientsData, undefined>;

interface GetClientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClientVariables): QueryRef<GetClientData, GetClientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetClientVariables): QueryRef<GetClientData, GetClientVariables>;
  operationName: string;
}
export const getClientRef: GetClientRef;

export function getClient(vars: GetClientVariables, options?: ExecuteQueryOptions): QueryPromise<GetClientData, GetClientVariables>;
export function getClient(dc: DataConnect, vars: GetClientVariables, options?: ExecuteQueryOptions): QueryPromise<GetClientData, GetClientVariables>;

interface ListOperationalChantiersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOperationalChantiersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListOperationalChantiersData, undefined>;
  operationName: string;
}
export const listOperationalChantiersRef: ListOperationalChantiersRef;

export function listOperationalChantiers(options?: ExecuteQueryOptions): QueryPromise<ListOperationalChantiersData, undefined>;
export function listOperationalChantiers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListOperationalChantiersData, undefined>;

interface GetChantierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChantierVariables): QueryRef<GetChantierData, GetChantierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetChantierVariables): QueryRef<GetChantierData, GetChantierVariables>;
  operationName: string;
}
export const getChantierRef: GetChantierRef;

export function getChantier(vars: GetChantierVariables, options?: ExecuteQueryOptions): QueryPromise<GetChantierData, GetChantierVariables>;
export function getChantier(dc: DataConnect, vars: GetChantierVariables, options?: ExecuteQueryOptions): QueryPromise<GetChantierData, GetChantierVariables>;

interface ListFacturesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListFacturesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListFacturesData, undefined>;
  operationName: string;
}
export const listFacturesRef: ListFacturesRef;

export function listFactures(options?: ExecuteQueryOptions): QueryPromise<ListFacturesData, undefined>;
export function listFactures(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListFacturesData, undefined>;

interface ListFacturesByStatutRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListFacturesByStatutVariables): QueryRef<ListFacturesByStatutData, ListFacturesByStatutVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListFacturesByStatutVariables): QueryRef<ListFacturesByStatutData, ListFacturesByStatutVariables>;
  operationName: string;
}
export const listFacturesByStatutRef: ListFacturesByStatutRef;

export function listFacturesByStatut(vars: ListFacturesByStatutVariables, options?: ExecuteQueryOptions): QueryPromise<ListFacturesByStatutData, ListFacturesByStatutVariables>;
export function listFacturesByStatut(dc: DataConnect, vars: ListFacturesByStatutVariables, options?: ExecuteQueryOptions): QueryPromise<ListFacturesByStatutData, ListFacturesByStatutVariables>;

interface ListDocumentFoldersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDocumentFoldersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListDocumentFoldersData, undefined>;
  operationName: string;
}
export const listDocumentFoldersRef: ListDocumentFoldersRef;

export function listDocumentFolders(options?: ExecuteQueryOptions): QueryPromise<ListDocumentFoldersData, undefined>;
export function listDocumentFolders(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListDocumentFoldersData, undefined>;

interface ListDocumentsAttachesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDocumentsAttachesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListDocumentsAttachesData, undefined>;
  operationName: string;
}
export const listDocumentsAttachesRef: ListDocumentsAttachesRef;

export function listDocumentsAttaches(options?: ExecuteQueryOptions): QueryPromise<ListDocumentsAttachesData, undefined>;
export function listDocumentsAttaches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListDocumentsAttachesData, undefined>;

interface ListDocumentsByChantierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDocumentsByChantierVariables): QueryRef<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListDocumentsByChantierVariables): QueryRef<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;
  operationName: string;
}
export const listDocumentsByChantierRef: ListDocumentsByChantierRef;

export function listDocumentsByChantier(vars: ListDocumentsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;
export function listDocumentsByChantier(dc: DataConnect, vars: ListDocumentsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;

interface ListPrevisionnelExercisesRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPrevisionnelExercisesData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListPrevisionnelExercisesData, undefined>;
  operationName: string;
}
export const listPrevisionnelExercisesRef: ListPrevisionnelExercisesRef;

export function listPrevisionnelExercises(options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelExercisesData, undefined>;
export function listPrevisionnelExercises(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelExercisesData, undefined>;

interface ListPrevisionnelLinesByExerciseRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPrevisionnelLinesByExerciseVariables): QueryRef<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPrevisionnelLinesByExerciseVariables): QueryRef<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;
  operationName: string;
}
export const listPrevisionnelLinesByExerciseRef: ListPrevisionnelLinesByExerciseRef;

export function listPrevisionnelLinesByExercise(vars: ListPrevisionnelLinesByExerciseVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;
export function listPrevisionnelLinesByExercise(dc: DataConnect, vars: ListPrevisionnelLinesByExerciseVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;

interface SearchClientAliasesRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchClientAliasesVariables): QueryRef<SearchClientAliasesData, SearchClientAliasesVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: SearchClientAliasesVariables): QueryRef<SearchClientAliasesData, SearchClientAliasesVariables>;
  operationName: string;
}
export const searchClientAliasesRef: SearchClientAliasesRef;

export function searchClientAliases(vars: SearchClientAliasesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchClientAliasesData, SearchClientAliasesVariables>;
export function searchClientAliases(dc: DataConnect, vars: SearchClientAliasesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchClientAliasesData, SearchClientAliasesVariables>;

interface ListPrevisionnelCellEditsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPrevisionnelCellEditsVariables): QueryRef<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPrevisionnelCellEditsVariables): QueryRef<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;
  operationName: string;
}
export const listPrevisionnelCellEditsRef: ListPrevisionnelCellEditsRef;

export function listPrevisionnelCellEdits(vars: ListPrevisionnelCellEditsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;
export function listPrevisionnelCellEdits(dc: DataConnect, vars: ListPrevisionnelCellEditsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;

interface ListEmailThreadsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEmailThreadsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListEmailThreadsData, undefined>;
  operationName: string;
}
export const listEmailThreadsRef: ListEmailThreadsRef;

export function listEmailThreads(options?: ExecuteQueryOptions): QueryPromise<ListEmailThreadsData, undefined>;
export function listEmailThreads(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListEmailThreadsData, undefined>;

interface ListUnreadEmailThreadsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUnreadEmailThreadsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListUnreadEmailThreadsData, undefined>;
  operationName: string;
}
export const listUnreadEmailThreadsRef: ListUnreadEmailThreadsRef;

export function listUnreadEmailThreads(options?: ExecuteQueryOptions): QueryPromise<ListUnreadEmailThreadsData, undefined>;
export function listUnreadEmailThreads(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUnreadEmailThreadsData, undefined>;

interface GetEmailThreadRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEmailThreadVariables): QueryRef<GetEmailThreadData, GetEmailThreadVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetEmailThreadVariables): QueryRef<GetEmailThreadData, GetEmailThreadVariables>;
  operationName: string;
}
export const getEmailThreadRef: GetEmailThreadRef;

export function getEmailThread(vars: GetEmailThreadVariables, options?: ExecuteQueryOptions): QueryPromise<GetEmailThreadData, GetEmailThreadVariables>;
export function getEmailThread(dc: DataConnect, vars: GetEmailThreadVariables, options?: ExecuteQueryOptions): QueryPromise<GetEmailThreadData, GetEmailThreadVariables>;

interface ListPlanningEventsByPeriodRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPlanningEventsByPeriodVariables): QueryRef<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPlanningEventsByPeriodVariables): QueryRef<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;
  operationName: string;
}
export const listPlanningEventsByPeriodRef: ListPlanningEventsByPeriodRef;

export function listPlanningEventsByPeriod(vars: ListPlanningEventsByPeriodVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;
export function listPlanningEventsByPeriod(dc: DataConnect, vars: ListPlanningEventsByPeriodVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;

interface ListPlanningEventsByChantierRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPlanningEventsByChantierVariables): QueryRef<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListPlanningEventsByChantierVariables): QueryRef<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;
  operationName: string;
}
export const listPlanningEventsByChantierRef: ListPlanningEventsByChantierRef;

export function listPlanningEventsByChantier(vars: ListPlanningEventsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;
export function listPlanningEventsByChantier(dc: DataConnect, vars: ListPlanningEventsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;

interface ListAnalyticsSnapshotsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAnalyticsSnapshotsVariables): QueryRef<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListAnalyticsSnapshotsVariables): QueryRef<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;
  operationName: string;
}
export const listAnalyticsSnapshotsRef: ListAnalyticsSnapshotsRef;

export function listAnalyticsSnapshots(vars: ListAnalyticsSnapshotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;
export function listAnalyticsSnapshots(dc: DataConnect, vars: ListAnalyticsSnapshotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;

interface GetAnalyticsSnapshotRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAnalyticsSnapshotVariables): QueryRef<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetAnalyticsSnapshotVariables): QueryRef<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;
  operationName: string;
}
export const getAnalyticsSnapshotRef: GetAnalyticsSnapshotRef;

export function getAnalyticsSnapshot(vars: GetAnalyticsSnapshotVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;
export function getAnalyticsSnapshot(dc: DataConnect, vars: GetAnalyticsSnapshotVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;

interface ListRapportsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRapportsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListRapportsData, undefined>;
  operationName: string;
}
export const listRapportsRef: ListRapportsRef;

export function listRapports(options?: ExecuteQueryOptions): QueryPromise<ListRapportsData, undefined>;
export function listRapports(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRapportsData, undefined>;

interface GetRapportRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRapportVariables): QueryRef<GetRapportData, GetRapportVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetRapportVariables): QueryRef<GetRapportData, GetRapportVariables>;
  operationName: string;
}
export const getRapportRef: GetRapportRef;

export function getRapport(vars: GetRapportVariables, options?: ExecuteQueryOptions): QueryPromise<GetRapportData, GetRapportVariables>;
export function getRapport(dc: DataConnect, vars: GetRapportVariables, options?: ExecuteQueryOptions): QueryPromise<GetRapportData, GetRapportVariables>;

interface ListRecentAuditEventsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListRecentAuditEventsVariables): QueryRef<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListRecentAuditEventsVariables): QueryRef<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;
  operationName: string;
}
export const listRecentAuditEventsRef: ListRecentAuditEventsRef;

export function listRecentAuditEvents(vars: ListRecentAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;
export function listRecentAuditEvents(dc: DataConnect, vars: ListRecentAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;

interface ListEntityChangeLogsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListEntityChangeLogsVariables): QueryRef<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListEntityChangeLogsVariables): QueryRef<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;
  operationName: string;
}
export const listEntityChangeLogsRef: ListEntityChangeLogsRef;

export function listEntityChangeLogs(vars: ListEntityChangeLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;
export function listEntityChangeLogs(dc: DataConnect, vars: ListEntityChangeLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;

interface ListCheckpointRunsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCheckpointRunsVariables): QueryRef<ListCheckpointRunsData, ListCheckpointRunsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListCheckpointRunsVariables): QueryRef<ListCheckpointRunsData, ListCheckpointRunsVariables>;
  operationName: string;
}
export const listCheckpointRunsRef: ListCheckpointRunsRef;

export function listCheckpointRuns(vars: ListCheckpointRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListCheckpointRunsData, ListCheckpointRunsVariables>;
export function listCheckpointRuns(dc: DataConnect, vars: ListCheckpointRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListCheckpointRunsData, ListCheckpointRunsVariables>;

interface GetCheckpointRunRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCheckpointRunVariables): QueryRef<GetCheckpointRunData, GetCheckpointRunVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetCheckpointRunVariables): QueryRef<GetCheckpointRunData, GetCheckpointRunVariables>;
  operationName: string;
}
export const getCheckpointRunRef: GetCheckpointRunRef;

export function getCheckpointRun(vars: GetCheckpointRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetCheckpointRunData, GetCheckpointRunVariables>;
export function getCheckpointRun(dc: DataConnect, vars: GetCheckpointRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetCheckpointRunData, GetCheckpointRunVariables>;

interface ListDataImportRunsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDataImportRunsVariables): QueryRef<ListDataImportRunsData, ListDataImportRunsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListDataImportRunsVariables): QueryRef<ListDataImportRunsData, ListDataImportRunsVariables>;
  operationName: string;
}
export const listDataImportRunsRef: ListDataImportRunsRef;

export function listDataImportRuns(vars: ListDataImportRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDataImportRunsData, ListDataImportRunsVariables>;
export function listDataImportRuns(dc: DataConnect, vars: ListDataImportRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDataImportRunsData, ListDataImportRunsVariables>;

interface GetDataImportRunRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDataImportRunVariables): QueryRef<GetDataImportRunData, GetDataImportRunVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: GetDataImportRunVariables): QueryRef<GetDataImportRunData, GetDataImportRunVariables>;
  operationName: string;
}
export const getDataImportRunRef: GetDataImportRunRef;

export function getDataImportRun(vars: GetDataImportRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetDataImportRunData, GetDataImportRunVariables>;
export function getDataImportRun(dc: DataConnect, vars: GetDataImportRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetDataImportRunData, GetDataImportRunVariables>;

