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

