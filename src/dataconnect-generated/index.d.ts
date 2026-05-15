import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise, DataConnectSettings } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;
export const dataConnectSettings: DataConnectSettings;

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

interface UpsertCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
  operationName: string;
}
export const upsertCurrentUserRef: UpsertCurrentUserRef;

export function upsertCurrentUser(vars: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;
export function upsertCurrentUser(dc: DataConnect, vars: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;

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

interface ListClientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListClientsData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListClientsData, undefined>;
  operationName: string;
}
export const listClientsRef: ListClientsRef;

export function listClients(options?: ExecuteQueryOptions): QueryPromise<ListClientsData, undefined>;
export function listClients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListClientsData, undefined>;

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

interface ListChantiersRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListChantiersData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListChantiersData, undefined>;
  operationName: string;
}
export const listChantiersRef: ListChantiersRef;

export function listChantiers(options?: ExecuteQueryOptions): QueryPromise<ListChantiersData, undefined>;
export function listChantiers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListChantiersData, undefined>;

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

