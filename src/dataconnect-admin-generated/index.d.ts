import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export interface Chantier_Key {
  id: UUIDString;
  __typename?: 'Chantier_Key';
}

export interface ClientAlias_Key {
  id: UUIDString;
  __typename?: 'ClientAlias_Key';
}

export interface Client_Key {
  id: UUIDString;
  __typename?: 'Client_Key';
}

export interface CreateChantierData {
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

export interface CreateClientData {
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

export interface CreateDocumentAttacheData {
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
  typeDocument: string;
  statut: string;
  source: string;
  description?: string | null;
  dateDocument?: DateString | null;
}

export interface CreateDocumentFolderData {
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

export interface CreateFactureData {
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

export interface CreatePrevisionnelImportBatchData {
  previsionnelImportBatch_insert: PrevisionnelImportBatch_Key;
}

export interface CreatePrevisionnelImportBatchVariables {
  workbook: string;
  sourcePath: string;
  workbookHash?: string | null;
  notes?: string | null;
}

export interface DocumentAttache_Key {
  id: UUIDString;
  __typename?: 'DocumentAttache_Key';
}

export interface DocumentFolder_Key {
  id: UUIDString;
  __typename?: 'DocumentFolder_Key';
}

export interface Facture_Key {
  id: UUIDString;
  __typename?: 'Facture_Key';
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

export interface LinkPrevisionnelLineToChantierData {
  previsionnelLine_update?: PrevisionnelLine_Key | null;
}

export interface LinkPrevisionnelLineToChantierVariables {
  id: UUIDString;
  chantierId?: UUIDString | null;
}

export interface ListChantiersData {
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

export interface ListClientsData {
  clients: ({
    id: UUIDString;
    type: string;
    nom: string;
    email?: string | null;
    telephone?: string | null;
    ville?: string | null;
    codePostal?: string | null;
    dateCreation: TimestampString;
  } & Client_Key)[];
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
  facture_update?: Facture_Key | null;
}

export interface SetFactureStatutVariables {
  id: UUIDString;
  statut: string;
}

export interface UpdateChantierStatutData {
  chantier_update?: Chantier_Key | null;
}

export interface UpdateChantierStatutVariables {
  id: UUIDString;
  statut: string;
  dateFin?: DateString | null;
}

export interface UpdateClientData {
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

export interface UpdatePrevisionnelLineAmountsData {
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
  previsionnelMonthlyAmount_update?: PrevisionnelMonthlyAmount_Key | null;
}

export interface UpdatePrevisionnelMonthlyAmountVariables {
  id: UUIDString;
  planned?: number | null;
  realized?: number | null;
  invoiceSent?: boolean | null;
}

export interface UpsertCurrentUserData {
  user_upsert: User_Key;
}

export interface UpsertCurrentUserVariables {
  email: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
}

export interface UpsertPrevisionnelCellEditData {
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

/** Generated Node Admin SDK operation action function for the 'UpsertCurrentUser' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertCurrentUser(dc: DataConnect, vars: UpsertCurrentUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertCurrentUserData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertCurrentUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertCurrentUser(vars: UpsertCurrentUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertCurrentUserData>>;

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

/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to execute without passing in DataConnect. */
export function getCurrentUser(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;
/** Generated Node Admin SDK operation action function for the 'GetCurrentUser' Query. Allow users to pass in custom DataConnect instances. */
export function getCurrentUser(options?: OperationOptions): Promise<ExecuteOperationResponse<GetCurrentUserData>>;

/** Generated Node Admin SDK operation action function for the 'ListClients' Query. Allow users to execute without passing in DataConnect. */
export function listClients(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListClientsData>>;
/** Generated Node Admin SDK operation action function for the 'ListClients' Query. Allow users to pass in custom DataConnect instances. */
export function listClients(options?: OperationOptions): Promise<ExecuteOperationResponse<ListClientsData>>;

/** Generated Node Admin SDK operation action function for the 'GetClient' Query. Allow users to execute without passing in DataConnect. */
export function getClient(dc: DataConnect, vars: GetClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetClientData>>;
/** Generated Node Admin SDK operation action function for the 'GetClient' Query. Allow users to pass in custom DataConnect instances. */
export function getClient(vars: GetClientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetClientData>>;

/** Generated Node Admin SDK operation action function for the 'ListChantiers' Query. Allow users to execute without passing in DataConnect. */
export function listChantiers(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<ListChantiersData>>;
/** Generated Node Admin SDK operation action function for the 'ListChantiers' Query. Allow users to pass in custom DataConnect instances. */
export function listChantiers(options?: OperationOptions): Promise<ExecuteOperationResponse<ListChantiersData>>;

/** Generated Node Admin SDK operation action function for the 'GetChantier' Query. Allow users to execute without passing in DataConnect. */
export function getChantier(dc: DataConnect, vars: GetChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetChantierData>>;
/** Generated Node Admin SDK operation action function for the 'GetChantier' Query. Allow users to pass in custom DataConnect instances. */
export function getChantier(vars: GetChantierVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetChantierData>>;

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

