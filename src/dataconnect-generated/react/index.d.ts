import { UpsertCurrentUserData, UpsertCurrentUserVariables, CreateClientData, CreateClientVariables, UpdateClientData, UpdateClientVariables, CreateChantierData, CreateChantierVariables, UpdateChantierStatutData, UpdateChantierStatutVariables, CreateFactureData, CreateFactureVariables, SetFactureStatutData, SetFactureStatutVariables, GetCurrentUserData, ListClientsData, GetClientData, GetClientVariables, ListChantiersData, GetChantierData, GetChantierVariables, ListFacturesData, ListFacturesByStatutData, ListFacturesByStatutVariables } from '../';
import { UseDataConnectQueryResult, useDataConnectQueryOptions, UseDataConnectMutationResult, useDataConnectMutationOptions} from '@tanstack-query-firebase/react/data-connect';
import { UseQueryResult, UseMutationResult} from '@tanstack/react-query';
import { DataConnect } from 'firebase/data-connect';
import { FirebaseError } from 'firebase/app';


export function useUpsertCurrentUser(options?: useDataConnectMutationOptions<UpsertCurrentUserData, FirebaseError, UpsertCurrentUserVariables>): UseDataConnectMutationResult<UpsertCurrentUserData, UpsertCurrentUserVariables>;
export function useUpsertCurrentUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertCurrentUserData, FirebaseError, UpsertCurrentUserVariables>): UseDataConnectMutationResult<UpsertCurrentUserData, UpsertCurrentUserVariables>;

export function useCreateClient(options?: useDataConnectMutationOptions<CreateClientData, FirebaseError, CreateClientVariables>): UseDataConnectMutationResult<CreateClientData, CreateClientVariables>;
export function useCreateClient(dc: DataConnect, options?: useDataConnectMutationOptions<CreateClientData, FirebaseError, CreateClientVariables>): UseDataConnectMutationResult<CreateClientData, CreateClientVariables>;

export function useUpdateClient(options?: useDataConnectMutationOptions<UpdateClientData, FirebaseError, UpdateClientVariables>): UseDataConnectMutationResult<UpdateClientData, UpdateClientVariables>;
export function useUpdateClient(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateClientData, FirebaseError, UpdateClientVariables>): UseDataConnectMutationResult<UpdateClientData, UpdateClientVariables>;

export function useCreateChantier(options?: useDataConnectMutationOptions<CreateChantierData, FirebaseError, CreateChantierVariables>): UseDataConnectMutationResult<CreateChantierData, CreateChantierVariables>;
export function useCreateChantier(dc: DataConnect, options?: useDataConnectMutationOptions<CreateChantierData, FirebaseError, CreateChantierVariables>): UseDataConnectMutationResult<CreateChantierData, CreateChantierVariables>;

export function useUpdateChantierStatut(options?: useDataConnectMutationOptions<UpdateChantierStatutData, FirebaseError, UpdateChantierStatutVariables>): UseDataConnectMutationResult<UpdateChantierStatutData, UpdateChantierStatutVariables>;
export function useUpdateChantierStatut(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateChantierStatutData, FirebaseError, UpdateChantierStatutVariables>): UseDataConnectMutationResult<UpdateChantierStatutData, UpdateChantierStatutVariables>;

export function useCreateFacture(options?: useDataConnectMutationOptions<CreateFactureData, FirebaseError, CreateFactureVariables>): UseDataConnectMutationResult<CreateFactureData, CreateFactureVariables>;
export function useCreateFacture(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFactureData, FirebaseError, CreateFactureVariables>): UseDataConnectMutationResult<CreateFactureData, CreateFactureVariables>;

export function useSetFactureStatut(options?: useDataConnectMutationOptions<SetFactureStatutData, FirebaseError, SetFactureStatutVariables>): UseDataConnectMutationResult<SetFactureStatutData, SetFactureStatutVariables>;
export function useSetFactureStatut(dc: DataConnect, options?: useDataConnectMutationOptions<SetFactureStatutData, FirebaseError, SetFactureStatutVariables>): UseDataConnectMutationResult<SetFactureStatutData, SetFactureStatutVariables>;

export function useGetCurrentUser(options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;
export function useGetCurrentUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;

export function useListClients(options?: useDataConnectQueryOptions<ListClientsData>): UseDataConnectQueryResult<ListClientsData, undefined>;
export function useListClients(dc: DataConnect, options?: useDataConnectQueryOptions<ListClientsData>): UseDataConnectQueryResult<ListClientsData, undefined>;

export function useGetClient(vars: GetClientVariables, options?: useDataConnectQueryOptions<GetClientData>): UseDataConnectQueryResult<GetClientData, GetClientVariables>;
export function useGetClient(dc: DataConnect, vars: GetClientVariables, options?: useDataConnectQueryOptions<GetClientData>): UseDataConnectQueryResult<GetClientData, GetClientVariables>;

export function useListChantiers(options?: useDataConnectQueryOptions<ListChantiersData>): UseDataConnectQueryResult<ListChantiersData, undefined>;
export function useListChantiers(dc: DataConnect, options?: useDataConnectQueryOptions<ListChantiersData>): UseDataConnectQueryResult<ListChantiersData, undefined>;

export function useGetChantier(vars: GetChantierVariables, options?: useDataConnectQueryOptions<GetChantierData>): UseDataConnectQueryResult<GetChantierData, GetChantierVariables>;
export function useGetChantier(dc: DataConnect, vars: GetChantierVariables, options?: useDataConnectQueryOptions<GetChantierData>): UseDataConnectQueryResult<GetChantierData, GetChantierVariables>;

export function useListFactures(options?: useDataConnectQueryOptions<ListFacturesData>): UseDataConnectQueryResult<ListFacturesData, undefined>;
export function useListFactures(dc: DataConnect, options?: useDataConnectQueryOptions<ListFacturesData>): UseDataConnectQueryResult<ListFacturesData, undefined>;

export function useListFacturesByStatut(vars: ListFacturesByStatutVariables, options?: useDataConnectQueryOptions<ListFacturesByStatutData>): UseDataConnectQueryResult<ListFacturesByStatutData, ListFacturesByStatutVariables>;
export function useListFacturesByStatut(dc: DataConnect, vars: ListFacturesByStatutVariables, options?: useDataConnectQueryOptions<ListFacturesByStatutData>): UseDataConnectQueryResult<ListFacturesByStatutData, ListFacturesByStatutVariables>;
