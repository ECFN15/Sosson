# Generated React README
This README will guide you through the process of using the generated React SDK package for the connector `sosson`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `JavaScript README`, you can find it at [`dataconnect-generated/README.md`](../README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

You can use this generated SDK by importing from the package `@dataconnect/generated/react` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#react).

# Table of Contents
- [**Overview**](#generated-react-readme)
- [**TanStack Query Firebase & TanStack React Query**](#tanstack-query-firebase-tanstack-react-query)
  - [*Package Installation*](#installing-tanstack-query-firebase-and-tanstack-react-query-packages)
  - [*Configuring TanStack Query*](#configuring-tanstack-query)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetCurrentUser*](#getcurrentuser)
  - [*ListUsers*](#listusers)
  - [*ListOperationalClients*](#listoperationalclients)
  - [*GetClient*](#getclient)
  - [*ListOperationalChantiers*](#listoperationalchantiers)
  - [*GetChantier*](#getchantier)
  - [*ListFactures*](#listfactures)
  - [*ListFacturesByStatut*](#listfacturesbystatut)
  - [*ListDocumentFolders*](#listdocumentfolders)
  - [*ListDocumentsAttaches*](#listdocumentsattaches)
  - [*ListDocumentsByChantier*](#listdocumentsbychantier)
  - [*ListPrevisionnelExercises*](#listprevisionnelexercises)
  - [*ListPrevisionnelLinesByExercise*](#listprevisionnellinesbyexercise)
  - [*SearchClientAliases*](#searchclientaliases)
  - [*ListPrevisionnelCellEdits*](#listprevisionnelcelledits)
  - [*ListEmailThreads*](#listemailthreads)
  - [*ListUnreadEmailThreads*](#listunreademailthreads)
  - [*GetEmailThread*](#getemailthread)
  - [*ListPlanningEventsByPeriod*](#listplanningeventsbyperiod)
  - [*ListPlanningEventsByChantier*](#listplanningeventsbychantier)
  - [*ListAnalyticsSnapshots*](#listanalyticssnapshots)
  - [*GetAnalyticsSnapshot*](#getanalyticssnapshot)
  - [*ListRapports*](#listrapports)
  - [*GetRapport*](#getrapport)
  - [*ListRecentAuditEvents*](#listrecentauditevents)
  - [*ListEntityChangeLogs*](#listentitychangelogs)
  - [*ListCheckpointRuns*](#listcheckpointruns)
  - [*GetCheckpointRun*](#getcheckpointrun)
  - [*ListDataImportRuns*](#listdataimportruns)
  - [*GetDataImportRun*](#getdataimportrun)
- [**Mutations**](#mutations)
  - [*CreateClient*](#createclient)
  - [*UpdateClient*](#updateclient)
  - [*CreateChantier*](#createchantier)
  - [*UpdateChantierStatut*](#updatechantierstatut)
  - [*CreateFacture*](#createfacture)
  - [*SetFactureStatut*](#setfacturestatut)
  - [*CreateDocumentFolder*](#createdocumentfolder)
  - [*CreateDocumentAttache*](#createdocumentattache)
  - [*UpdateDocumentAttacheLinks*](#updatedocumentattachelinks)
  - [*CreatePrevisionnelImportBatch*](#createprevisionnelimportbatch)
  - [*UpdatePrevisionnelMonthlyAmount*](#updateprevisionnelmonthlyamount)
  - [*UpdatePrevisionnelLineAmounts*](#updateprevisionnellineamounts)
  - [*LinkPrevisionnelLineToChantier*](#linkprevisionnellinetochantier)
  - [*UpsertPrevisionnelCellEdit*](#upsertprevisionnelcelledit)
  - [*CreateEmailThread*](#createemailthread)
  - [*UpdateEmailThreadStatusAndLinks*](#updateemailthreadstatusandlinks)
  - [*CreateEmailMessage*](#createemailmessage)
  - [*CreateEmailAttachment*](#createemailattachment)
  - [*CreatePlanningEvent*](#createplanningevent)
  - [*UpdatePlanningEventStatus*](#updateplanningeventstatus)
  - [*UpdatePlanningEventDetails*](#updateplanningeventdetails)
  - [*CancelPlanningEvent*](#cancelplanningevent)
  - [*CreatePlanningAssignment*](#createplanningassignment)
  - [*UpdatePlanningAssignmentStatus*](#updateplanningassignmentstatus)
  - [*CreateAnalyticsSnapshot*](#createanalyticssnapshot)
  - [*CreateRapport*](#createrapport)
  - [*MarkRapportGenerated*](#markrapportgenerated)
  - [*CreateAuditEvent*](#createauditevent)
  - [*CreateCheckpointRun*](#createcheckpointrun)
  - [*CreateCheckpointStep*](#createcheckpointstep)
  - [*CreateCheckpointArtifact*](#createcheckpointartifact)
  - [*CreateCheckpointDecision*](#createcheckpointdecision)
  - [*CreateDataImportRun*](#createdataimportrun)
  - [*CreateDataImportIssue*](#createdataimportissue)
  - [*CreateEntityChangeLog*](#createentitychangelog)

# TanStack Query Firebase & TanStack React Query
This SDK provides [React](https://react.dev/) hooks generated specific to your application, for the operations found in the connector `sosson`. These hooks are generated using [TanStack Query Firebase](https://react-query-firebase.invertase.dev/) by our partners at Invertase, a library built on top of [TanStack React Query v5](https://tanstack.com/query/v5/docs/framework/react/overview).

***You do not need to be familiar with Tanstack Query or Tanstack Query Firebase to use this SDK.*** However, you may find it useful to learn more about them, as they will empower you as a user of this Generated React SDK.

## Installing TanStack Query Firebase and TanStack React Query Packages
In order to use the React generated SDK, you must install the `TanStack React Query` and `TanStack Query Firebase` packages.
```bash
npm i --save @tanstack/react-query @tanstack-query-firebase/react
```
```bash
npm i --save firebase@latest # Note: React has a peer dependency on ^11.3.0
```

You can also follow the installation instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#tanstack-install), or the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react) and [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/installation).

## Configuring TanStack Query
In order to use the React generated SDK in your application, you must wrap your application's component tree in a `QueryClientProvider` component from TanStack React Query. None of your generated React SDK hooks will work without this provider.

```javascript
import { QueryClientProvider } from '@tanstack/react-query';

// Create a TanStack Query client instance
const queryClient = new QueryClient()

function App() {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <MyApplication />
    </QueryClientProvider>
  )
}
```

To learn more about `QueryClientProvider`, see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/quick-start) and the [TanStack Query Firebase documentation](https://invertase.docs.page/tanstack-query-firebase/react#usage).

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `sosson`.

You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#emulator-react-angular).

```javascript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) using the hooks provided from your generated React SDK.

# Queries

The React generated SDK provides Query hook functions that call and return [`useDataConnectQuery`](https://react-query-firebase.invertase.dev/react/data-connect/querying) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and the most recent data returned by the Query, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/querying).

TanStack React Query caches the results of your Queries, so using the same Query hook function in multiple places in your application allows the entire application to automatically see updates to that Query's data.

Query hooks execute their Queries automatically when called, and periodically refresh, unless you change the `queryOptions` for the Query. To learn how to stop a Query from automatically executing, including how to make a query "lazy", see the [TanStack React Query documentation](https://tanstack.com/query/latest/docs/framework/react/guides/disabling-queries).

To learn more about TanStack React Query's Queries, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/queries).

## Using Query Hooks
Here's a general overview of how to use the generated Query hooks in your code:

- If the Query has no variables, the Query hook function does not require arguments.
- If the Query has any required variables, the Query hook function will require at least one argument: an object that contains all the required variables for the Query.
- If the Query has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Query's variables are optional, the Query hook function does not require any arguments.
- Query hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Query hooks functions can be called with or without passing in an `options` argument of type `useDataConnectQueryOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/query-options).
  - ***Special case:***  If the Query has all optional variables and you would like to provide an `options` argument to the Query hook function without providing any variables, you must pass `undefined` where you would normally pass the Query's variables, and then may provide the `options` argument.

Below are examples of how to use the `sosson` connector's generated Query hook functions to execute each Query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## GetCurrentUser
You can execute the `GetCurrentUser` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetCurrentUser(dc: DataConnect, options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetCurrentUser(options?: useDataConnectQueryOptions<GetCurrentUserData>): UseDataConnectQueryResult<GetCurrentUserData, undefined>;
```

### Variables
The `GetCurrentUser` Query has no variables.
### Return Type
Recall that calling the `GetCurrentUser` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetCurrentUser` Query is of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetCurrentUser`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useGetCurrentUser } from '@dataconnect/generated/react'

export default function GetCurrentUserComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetCurrentUser();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetCurrentUser(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetCurrentUser(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetCurrentUser(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.user);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListUsers
You can execute the `ListUsers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListUsers(dc: DataConnect, options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListUsers(options?: useDataConnectQueryOptions<ListUsersData>): UseDataConnectQueryResult<ListUsersData, undefined>;
```

### Variables
The `ListUsers` Query has no variables.
### Return Type
Recall that calling the `ListUsers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListUsers` Query is of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListUsers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListUsers } from '@dataconnect/generated/react'

export default function ListUsersComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListUsers();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListUsers(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListUsers(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListUsers(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.users);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListOperationalClients
You can execute the `ListOperationalClients` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListOperationalClients(dc: DataConnect, options?: useDataConnectQueryOptions<ListOperationalClientsData>): UseDataConnectQueryResult<ListOperationalClientsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListOperationalClients(options?: useDataConnectQueryOptions<ListOperationalClientsData>): UseDataConnectQueryResult<ListOperationalClientsData, undefined>;
```

### Variables
The `ListOperationalClients` Query has no variables.
### Return Type
Recall that calling the `ListOperationalClients` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListOperationalClients` Query is of type `ListOperationalClientsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListOperationalClients`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListOperationalClients } from '@dataconnect/generated/react'

export default function ListOperationalClientsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListOperationalClients();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListOperationalClients(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListOperationalClients(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListOperationalClients(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.clients);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetClient
You can execute the `GetClient` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetClient(dc: DataConnect, vars: GetClientVariables, options?: useDataConnectQueryOptions<GetClientData>): UseDataConnectQueryResult<GetClientData, GetClientVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetClient(vars: GetClientVariables, options?: useDataConnectQueryOptions<GetClientData>): UseDataConnectQueryResult<GetClientData, GetClientVariables>;
```

### Variables
The `GetClient` Query requires an argument of type `GetClientVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetClientVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetClient` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetClient` Query is of type `GetClientData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetClient`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetClientVariables } from '@dataconnect/generated';
import { useGetClient } from '@dataconnect/generated/react'

export default function GetClientComponent() {
  // The `useGetClient` Query hook requires an argument of type `GetClientVariables`:
  const getClientVars: GetClientVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetClient(getClientVars);
  // Variables can be defined inline as well.
  const query = useGetClient({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetClient(dataConnect, getClientVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetClient(getClientVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetClient(dataConnect, getClientVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.client);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListOperationalChantiers
You can execute the `ListOperationalChantiers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListOperationalChantiers(dc: DataConnect, options?: useDataConnectQueryOptions<ListOperationalChantiersData>): UseDataConnectQueryResult<ListOperationalChantiersData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListOperationalChantiers(options?: useDataConnectQueryOptions<ListOperationalChantiersData>): UseDataConnectQueryResult<ListOperationalChantiersData, undefined>;
```

### Variables
The `ListOperationalChantiers` Query has no variables.
### Return Type
Recall that calling the `ListOperationalChantiers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListOperationalChantiers` Query is of type `ListOperationalChantiersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListOperationalChantiers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListOperationalChantiers } from '@dataconnect/generated/react'

export default function ListOperationalChantiersComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListOperationalChantiers();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListOperationalChantiers(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListOperationalChantiers(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListOperationalChantiers(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.chantiers);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetChantier
You can execute the `GetChantier` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetChantier(dc: DataConnect, vars: GetChantierVariables, options?: useDataConnectQueryOptions<GetChantierData>): UseDataConnectQueryResult<GetChantierData, GetChantierVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetChantier(vars: GetChantierVariables, options?: useDataConnectQueryOptions<GetChantierData>): UseDataConnectQueryResult<GetChantierData, GetChantierVariables>;
```

### Variables
The `GetChantier` Query requires an argument of type `GetChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetChantierVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetChantier` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetChantier` Query is of type `GetChantierData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetChantier`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetChantierVariables } from '@dataconnect/generated';
import { useGetChantier } from '@dataconnect/generated/react'

export default function GetChantierComponent() {
  // The `useGetChantier` Query hook requires an argument of type `GetChantierVariables`:
  const getChantierVars: GetChantierVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetChantier(getChantierVars);
  // Variables can be defined inline as well.
  const query = useGetChantier({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetChantier(dataConnect, getChantierVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetChantier(getChantierVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetChantier(dataConnect, getChantierVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.chantier);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListFactures
You can execute the `ListFactures` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListFactures(dc: DataConnect, options?: useDataConnectQueryOptions<ListFacturesData>): UseDataConnectQueryResult<ListFacturesData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListFactures(options?: useDataConnectQueryOptions<ListFacturesData>): UseDataConnectQueryResult<ListFacturesData, undefined>;
```

### Variables
The `ListFactures` Query has no variables.
### Return Type
Recall that calling the `ListFactures` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListFactures` Query is of type `ListFacturesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListFactures`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListFactures } from '@dataconnect/generated/react'

export default function ListFacturesComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListFactures();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListFactures(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListFactures(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListFactures(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.factures);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListFacturesByStatut
You can execute the `ListFacturesByStatut` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListFacturesByStatut(dc: DataConnect, vars: ListFacturesByStatutVariables, options?: useDataConnectQueryOptions<ListFacturesByStatutData>): UseDataConnectQueryResult<ListFacturesByStatutData, ListFacturesByStatutVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListFacturesByStatut(vars: ListFacturesByStatutVariables, options?: useDataConnectQueryOptions<ListFacturesByStatutData>): UseDataConnectQueryResult<ListFacturesByStatutData, ListFacturesByStatutVariables>;
```

### Variables
The `ListFacturesByStatut` Query requires an argument of type `ListFacturesByStatutVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListFacturesByStatutVariables {
  statut: string;
}
```
### Return Type
Recall that calling the `ListFacturesByStatut` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListFacturesByStatut` Query is of type `ListFacturesByStatutData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListFacturesByStatut`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListFacturesByStatutVariables } from '@dataconnect/generated';
import { useListFacturesByStatut } from '@dataconnect/generated/react'

export default function ListFacturesByStatutComponent() {
  // The `useListFacturesByStatut` Query hook requires an argument of type `ListFacturesByStatutVariables`:
  const listFacturesByStatutVars: ListFacturesByStatutVariables = {
    statut: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListFacturesByStatut(listFacturesByStatutVars);
  // Variables can be defined inline as well.
  const query = useListFacturesByStatut({ statut: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListFacturesByStatut(dataConnect, listFacturesByStatutVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListFacturesByStatut(listFacturesByStatutVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListFacturesByStatut(dataConnect, listFacturesByStatutVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.factures);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListDocumentFolders
You can execute the `ListDocumentFolders` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListDocumentFolders(dc: DataConnect, options?: useDataConnectQueryOptions<ListDocumentFoldersData>): UseDataConnectQueryResult<ListDocumentFoldersData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListDocumentFolders(options?: useDataConnectQueryOptions<ListDocumentFoldersData>): UseDataConnectQueryResult<ListDocumentFoldersData, undefined>;
```

### Variables
The `ListDocumentFolders` Query has no variables.
### Return Type
Recall that calling the `ListDocumentFolders` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListDocumentFolders` Query is of type `ListDocumentFoldersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListDocumentFolders`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListDocumentFolders } from '@dataconnect/generated/react'

export default function ListDocumentFoldersComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListDocumentFolders();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListDocumentFolders(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListDocumentFolders(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListDocumentFolders(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.documentFolders);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListDocumentsAttaches
You can execute the `ListDocumentsAttaches` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListDocumentsAttaches(dc: DataConnect, options?: useDataConnectQueryOptions<ListDocumentsAttachesData>): UseDataConnectQueryResult<ListDocumentsAttachesData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListDocumentsAttaches(options?: useDataConnectQueryOptions<ListDocumentsAttachesData>): UseDataConnectQueryResult<ListDocumentsAttachesData, undefined>;
```

### Variables
The `ListDocumentsAttaches` Query has no variables.
### Return Type
Recall that calling the `ListDocumentsAttaches` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListDocumentsAttaches` Query is of type `ListDocumentsAttachesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListDocumentsAttaches`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListDocumentsAttaches } from '@dataconnect/generated/react'

export default function ListDocumentsAttachesComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListDocumentsAttaches();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListDocumentsAttaches(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListDocumentsAttaches(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListDocumentsAttaches(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.documentAttaches);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListDocumentsByChantier
You can execute the `ListDocumentsByChantier` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListDocumentsByChantier(dc: DataConnect, vars: ListDocumentsByChantierVariables, options?: useDataConnectQueryOptions<ListDocumentsByChantierData>): UseDataConnectQueryResult<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListDocumentsByChantier(vars: ListDocumentsByChantierVariables, options?: useDataConnectQueryOptions<ListDocumentsByChantierData>): UseDataConnectQueryResult<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;
```

### Variables
The `ListDocumentsByChantier` Query requires an argument of type `ListDocumentsByChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListDocumentsByChantierVariables {
  chantierId: UUIDString;
}
```
### Return Type
Recall that calling the `ListDocumentsByChantier` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListDocumentsByChantier` Query is of type `ListDocumentsByChantierData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListDocumentsByChantier`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListDocumentsByChantierVariables } from '@dataconnect/generated';
import { useListDocumentsByChantier } from '@dataconnect/generated/react'

export default function ListDocumentsByChantierComponent() {
  // The `useListDocumentsByChantier` Query hook requires an argument of type `ListDocumentsByChantierVariables`:
  const listDocumentsByChantierVars: ListDocumentsByChantierVariables = {
    chantierId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListDocumentsByChantier(listDocumentsByChantierVars);
  // Variables can be defined inline as well.
  const query = useListDocumentsByChantier({ chantierId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListDocumentsByChantier(dataConnect, listDocumentsByChantierVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListDocumentsByChantier(listDocumentsByChantierVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListDocumentsByChantier(dataConnect, listDocumentsByChantierVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.documentAttaches);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListPrevisionnelExercises
You can execute the `ListPrevisionnelExercises` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListPrevisionnelExercises(dc: DataConnect, options?: useDataConnectQueryOptions<ListPrevisionnelExercisesData>): UseDataConnectQueryResult<ListPrevisionnelExercisesData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListPrevisionnelExercises(options?: useDataConnectQueryOptions<ListPrevisionnelExercisesData>): UseDataConnectQueryResult<ListPrevisionnelExercisesData, undefined>;
```

### Variables
The `ListPrevisionnelExercises` Query has no variables.
### Return Type
Recall that calling the `ListPrevisionnelExercises` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListPrevisionnelExercises` Query is of type `ListPrevisionnelExercisesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListPrevisionnelExercises`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListPrevisionnelExercises } from '@dataconnect/generated/react'

export default function ListPrevisionnelExercisesComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListPrevisionnelExercises();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListPrevisionnelExercises(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListPrevisionnelExercises(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListPrevisionnelExercises(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.previsionnelExercises);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListPrevisionnelLinesByExercise
You can execute the `ListPrevisionnelLinesByExercise` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListPrevisionnelLinesByExercise(dc: DataConnect, vars: ListPrevisionnelLinesByExerciseVariables, options?: useDataConnectQueryOptions<ListPrevisionnelLinesByExerciseData>): UseDataConnectQueryResult<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListPrevisionnelLinesByExercise(vars: ListPrevisionnelLinesByExerciseVariables, options?: useDataConnectQueryOptions<ListPrevisionnelLinesByExerciseData>): UseDataConnectQueryResult<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;
```

### Variables
The `ListPrevisionnelLinesByExercise` Query requires an argument of type `ListPrevisionnelLinesByExerciseVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListPrevisionnelLinesByExerciseVariables {
  exerciseId: UUIDString;
}
```
### Return Type
Recall that calling the `ListPrevisionnelLinesByExercise` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListPrevisionnelLinesByExercise` Query is of type `ListPrevisionnelLinesByExerciseData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListPrevisionnelLinesByExercise`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListPrevisionnelLinesByExerciseVariables } from '@dataconnect/generated';
import { useListPrevisionnelLinesByExercise } from '@dataconnect/generated/react'

export default function ListPrevisionnelLinesByExerciseComponent() {
  // The `useListPrevisionnelLinesByExercise` Query hook requires an argument of type `ListPrevisionnelLinesByExerciseVariables`:
  const listPrevisionnelLinesByExerciseVars: ListPrevisionnelLinesByExerciseVariables = {
    exerciseId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListPrevisionnelLinesByExercise(listPrevisionnelLinesByExerciseVars);
  // Variables can be defined inline as well.
  const query = useListPrevisionnelLinesByExercise({ exerciseId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListPrevisionnelLinesByExercise(dataConnect, listPrevisionnelLinesByExerciseVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListPrevisionnelLinesByExercise(listPrevisionnelLinesByExerciseVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListPrevisionnelLinesByExercise(dataConnect, listPrevisionnelLinesByExerciseVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.previsionnelLines);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## SearchClientAliases
You can execute the `SearchClientAliases` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useSearchClientAliases(dc: DataConnect, vars: SearchClientAliasesVariables, options?: useDataConnectQueryOptions<SearchClientAliasesData>): UseDataConnectQueryResult<SearchClientAliasesData, SearchClientAliasesVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useSearchClientAliases(vars: SearchClientAliasesVariables, options?: useDataConnectQueryOptions<SearchClientAliasesData>): UseDataConnectQueryResult<SearchClientAliasesData, SearchClientAliasesVariables>;
```

### Variables
The `SearchClientAliases` Query requires an argument of type `SearchClientAliasesVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface SearchClientAliasesVariables {
  normalizedKey: string;
}
```
### Return Type
Recall that calling the `SearchClientAliases` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `SearchClientAliases` Query is of type `SearchClientAliasesData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `SearchClientAliases`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, SearchClientAliasesVariables } from '@dataconnect/generated';
import { useSearchClientAliases } from '@dataconnect/generated/react'

export default function SearchClientAliasesComponent() {
  // The `useSearchClientAliases` Query hook requires an argument of type `SearchClientAliasesVariables`:
  const searchClientAliasesVars: SearchClientAliasesVariables = {
    normalizedKey: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useSearchClientAliases(searchClientAliasesVars);
  // Variables can be defined inline as well.
  const query = useSearchClientAliases({ normalizedKey: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useSearchClientAliases(dataConnect, searchClientAliasesVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useSearchClientAliases(searchClientAliasesVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useSearchClientAliases(dataConnect, searchClientAliasesVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.clientAliases);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListPrevisionnelCellEdits
You can execute the `ListPrevisionnelCellEdits` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListPrevisionnelCellEdits(dc: DataConnect, vars: ListPrevisionnelCellEditsVariables, options?: useDataConnectQueryOptions<ListPrevisionnelCellEditsData>): UseDataConnectQueryResult<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListPrevisionnelCellEdits(vars: ListPrevisionnelCellEditsVariables, options?: useDataConnectQueryOptions<ListPrevisionnelCellEditsData>): UseDataConnectQueryResult<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;
```

### Variables
The `ListPrevisionnelCellEdits` Query requires an argument of type `ListPrevisionnelCellEditsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListPrevisionnelCellEditsVariables {
  sourceSheet: string;
}
```
### Return Type
Recall that calling the `ListPrevisionnelCellEdits` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListPrevisionnelCellEdits` Query is of type `ListPrevisionnelCellEditsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListPrevisionnelCellEdits`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListPrevisionnelCellEditsVariables } from '@dataconnect/generated';
import { useListPrevisionnelCellEdits } from '@dataconnect/generated/react'

export default function ListPrevisionnelCellEditsComponent() {
  // The `useListPrevisionnelCellEdits` Query hook requires an argument of type `ListPrevisionnelCellEditsVariables`:
  const listPrevisionnelCellEditsVars: ListPrevisionnelCellEditsVariables = {
    sourceSheet: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListPrevisionnelCellEdits(listPrevisionnelCellEditsVars);
  // Variables can be defined inline as well.
  const query = useListPrevisionnelCellEdits({ sourceSheet: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListPrevisionnelCellEdits(dataConnect, listPrevisionnelCellEditsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListPrevisionnelCellEdits(listPrevisionnelCellEditsVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListPrevisionnelCellEdits(dataConnect, listPrevisionnelCellEditsVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.previsionnelCellEdits);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListEmailThreads
You can execute the `ListEmailThreads` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListEmailThreads(dc: DataConnect, options?: useDataConnectQueryOptions<ListEmailThreadsData>): UseDataConnectQueryResult<ListEmailThreadsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListEmailThreads(options?: useDataConnectQueryOptions<ListEmailThreadsData>): UseDataConnectQueryResult<ListEmailThreadsData, undefined>;
```

### Variables
The `ListEmailThreads` Query has no variables.
### Return Type
Recall that calling the `ListEmailThreads` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListEmailThreads` Query is of type `ListEmailThreadsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListEmailThreads`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListEmailThreads } from '@dataconnect/generated/react'

export default function ListEmailThreadsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListEmailThreads();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListEmailThreads(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListEmailThreads(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListEmailThreads(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.emailThreads);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListUnreadEmailThreads
You can execute the `ListUnreadEmailThreads` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListUnreadEmailThreads(dc: DataConnect, options?: useDataConnectQueryOptions<ListUnreadEmailThreadsData>): UseDataConnectQueryResult<ListUnreadEmailThreadsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListUnreadEmailThreads(options?: useDataConnectQueryOptions<ListUnreadEmailThreadsData>): UseDataConnectQueryResult<ListUnreadEmailThreadsData, undefined>;
```

### Variables
The `ListUnreadEmailThreads` Query has no variables.
### Return Type
Recall that calling the `ListUnreadEmailThreads` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListUnreadEmailThreads` Query is of type `ListUnreadEmailThreadsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListUnreadEmailThreads`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListUnreadEmailThreads } from '@dataconnect/generated/react'

export default function ListUnreadEmailThreadsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListUnreadEmailThreads();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListUnreadEmailThreads(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListUnreadEmailThreads(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListUnreadEmailThreads(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.emailThreads);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetEmailThread
You can execute the `GetEmailThread` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetEmailThread(dc: DataConnect, vars: GetEmailThreadVariables, options?: useDataConnectQueryOptions<GetEmailThreadData>): UseDataConnectQueryResult<GetEmailThreadData, GetEmailThreadVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetEmailThread(vars: GetEmailThreadVariables, options?: useDataConnectQueryOptions<GetEmailThreadData>): UseDataConnectQueryResult<GetEmailThreadData, GetEmailThreadVariables>;
```

### Variables
The `GetEmailThread` Query requires an argument of type `GetEmailThreadVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetEmailThreadVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetEmailThread` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetEmailThread` Query is of type `GetEmailThreadData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetEmailThread`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetEmailThreadVariables } from '@dataconnect/generated';
import { useGetEmailThread } from '@dataconnect/generated/react'

export default function GetEmailThreadComponent() {
  // The `useGetEmailThread` Query hook requires an argument of type `GetEmailThreadVariables`:
  const getEmailThreadVars: GetEmailThreadVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetEmailThread(getEmailThreadVars);
  // Variables can be defined inline as well.
  const query = useGetEmailThread({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetEmailThread(dataConnect, getEmailThreadVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetEmailThread(getEmailThreadVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetEmailThread(dataConnect, getEmailThreadVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.emailThread);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListPlanningEventsByPeriod
You can execute the `ListPlanningEventsByPeriod` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListPlanningEventsByPeriod(dc: DataConnect, vars: ListPlanningEventsByPeriodVariables, options?: useDataConnectQueryOptions<ListPlanningEventsByPeriodData>): UseDataConnectQueryResult<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListPlanningEventsByPeriod(vars: ListPlanningEventsByPeriodVariables, options?: useDataConnectQueryOptions<ListPlanningEventsByPeriodData>): UseDataConnectQueryResult<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;
```

### Variables
The `ListPlanningEventsByPeriod` Query requires an argument of type `ListPlanningEventsByPeriodVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListPlanningEventsByPeriodVariables {
  startAt: TimestampString;
  endAt: TimestampString;
}
```
### Return Type
Recall that calling the `ListPlanningEventsByPeriod` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListPlanningEventsByPeriod` Query is of type `ListPlanningEventsByPeriodData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListPlanningEventsByPeriod`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListPlanningEventsByPeriodVariables } from '@dataconnect/generated';
import { useListPlanningEventsByPeriod } from '@dataconnect/generated/react'

export default function ListPlanningEventsByPeriodComponent() {
  // The `useListPlanningEventsByPeriod` Query hook requires an argument of type `ListPlanningEventsByPeriodVariables`:
  const listPlanningEventsByPeriodVars: ListPlanningEventsByPeriodVariables = {
    startAt: ..., 
    endAt: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListPlanningEventsByPeriod(listPlanningEventsByPeriodVars);
  // Variables can be defined inline as well.
  const query = useListPlanningEventsByPeriod({ startAt: ..., endAt: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListPlanningEventsByPeriod(dataConnect, listPlanningEventsByPeriodVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListPlanningEventsByPeriod(listPlanningEventsByPeriodVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListPlanningEventsByPeriod(dataConnect, listPlanningEventsByPeriodVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.planningEvents);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListPlanningEventsByChantier
You can execute the `ListPlanningEventsByChantier` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListPlanningEventsByChantier(dc: DataConnect, vars: ListPlanningEventsByChantierVariables, options?: useDataConnectQueryOptions<ListPlanningEventsByChantierData>): UseDataConnectQueryResult<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListPlanningEventsByChantier(vars: ListPlanningEventsByChantierVariables, options?: useDataConnectQueryOptions<ListPlanningEventsByChantierData>): UseDataConnectQueryResult<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;
```

### Variables
The `ListPlanningEventsByChantier` Query requires an argument of type `ListPlanningEventsByChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListPlanningEventsByChantierVariables {
  chantierId: UUIDString;
}
```
### Return Type
Recall that calling the `ListPlanningEventsByChantier` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListPlanningEventsByChantier` Query is of type `ListPlanningEventsByChantierData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListPlanningEventsByChantier`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListPlanningEventsByChantierVariables } from '@dataconnect/generated';
import { useListPlanningEventsByChantier } from '@dataconnect/generated/react'

export default function ListPlanningEventsByChantierComponent() {
  // The `useListPlanningEventsByChantier` Query hook requires an argument of type `ListPlanningEventsByChantierVariables`:
  const listPlanningEventsByChantierVars: ListPlanningEventsByChantierVariables = {
    chantierId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListPlanningEventsByChantier(listPlanningEventsByChantierVars);
  // Variables can be defined inline as well.
  const query = useListPlanningEventsByChantier({ chantierId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListPlanningEventsByChantier(dataConnect, listPlanningEventsByChantierVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListPlanningEventsByChantier(listPlanningEventsByChantierVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListPlanningEventsByChantier(dataConnect, listPlanningEventsByChantierVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.planningEvents);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListAnalyticsSnapshots
You can execute the `ListAnalyticsSnapshots` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListAnalyticsSnapshots(dc: DataConnect, vars: ListAnalyticsSnapshotsVariables, options?: useDataConnectQueryOptions<ListAnalyticsSnapshotsData>): UseDataConnectQueryResult<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListAnalyticsSnapshots(vars: ListAnalyticsSnapshotsVariables, options?: useDataConnectQueryOptions<ListAnalyticsSnapshotsData>): UseDataConnectQueryResult<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;
```

### Variables
The `ListAnalyticsSnapshots` Query requires an argument of type `ListAnalyticsSnapshotsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListAnalyticsSnapshotsVariables {
  environment: string;
}
```
### Return Type
Recall that calling the `ListAnalyticsSnapshots` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListAnalyticsSnapshots` Query is of type `ListAnalyticsSnapshotsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListAnalyticsSnapshots`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListAnalyticsSnapshotsVariables } from '@dataconnect/generated';
import { useListAnalyticsSnapshots } from '@dataconnect/generated/react'

export default function ListAnalyticsSnapshotsComponent() {
  // The `useListAnalyticsSnapshots` Query hook requires an argument of type `ListAnalyticsSnapshotsVariables`:
  const listAnalyticsSnapshotsVars: ListAnalyticsSnapshotsVariables = {
    environment: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListAnalyticsSnapshots(listAnalyticsSnapshotsVars);
  // Variables can be defined inline as well.
  const query = useListAnalyticsSnapshots({ environment: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListAnalyticsSnapshots(dataConnect, listAnalyticsSnapshotsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListAnalyticsSnapshots(listAnalyticsSnapshotsVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListAnalyticsSnapshots(dataConnect, listAnalyticsSnapshotsVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.analyticsSnapshots);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetAnalyticsSnapshot
You can execute the `GetAnalyticsSnapshot` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetAnalyticsSnapshot(dc: DataConnect, vars: GetAnalyticsSnapshotVariables, options?: useDataConnectQueryOptions<GetAnalyticsSnapshotData>): UseDataConnectQueryResult<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetAnalyticsSnapshot(vars: GetAnalyticsSnapshotVariables, options?: useDataConnectQueryOptions<GetAnalyticsSnapshotData>): UseDataConnectQueryResult<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;
```

### Variables
The `GetAnalyticsSnapshot` Query requires an argument of type `GetAnalyticsSnapshotVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetAnalyticsSnapshotVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetAnalyticsSnapshot` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetAnalyticsSnapshot` Query is of type `GetAnalyticsSnapshotData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetAnalyticsSnapshot`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetAnalyticsSnapshotVariables } from '@dataconnect/generated';
import { useGetAnalyticsSnapshot } from '@dataconnect/generated/react'

export default function GetAnalyticsSnapshotComponent() {
  // The `useGetAnalyticsSnapshot` Query hook requires an argument of type `GetAnalyticsSnapshotVariables`:
  const getAnalyticsSnapshotVars: GetAnalyticsSnapshotVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetAnalyticsSnapshot(getAnalyticsSnapshotVars);
  // Variables can be defined inline as well.
  const query = useGetAnalyticsSnapshot({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetAnalyticsSnapshot(dataConnect, getAnalyticsSnapshotVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetAnalyticsSnapshot(getAnalyticsSnapshotVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetAnalyticsSnapshot(dataConnect, getAnalyticsSnapshotVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.analyticsSnapshot);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListRapports
You can execute the `ListRapports` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListRapports(dc: DataConnect, options?: useDataConnectQueryOptions<ListRapportsData>): UseDataConnectQueryResult<ListRapportsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListRapports(options?: useDataConnectQueryOptions<ListRapportsData>): UseDataConnectQueryResult<ListRapportsData, undefined>;
```

### Variables
The `ListRapports` Query has no variables.
### Return Type
Recall that calling the `ListRapports` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListRapports` Query is of type `ListRapportsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListRapports`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListRapports } from '@dataconnect/generated/react'

export default function ListRapportsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListRapports();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListRapports(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListRapports(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListRapports(dataConnect, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.rapports);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetRapport
You can execute the `GetRapport` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetRapport(dc: DataConnect, vars: GetRapportVariables, options?: useDataConnectQueryOptions<GetRapportData>): UseDataConnectQueryResult<GetRapportData, GetRapportVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetRapport(vars: GetRapportVariables, options?: useDataConnectQueryOptions<GetRapportData>): UseDataConnectQueryResult<GetRapportData, GetRapportVariables>;
```

### Variables
The `GetRapport` Query requires an argument of type `GetRapportVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetRapportVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetRapport` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetRapport` Query is of type `GetRapportData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetRapport`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetRapportVariables } from '@dataconnect/generated';
import { useGetRapport } from '@dataconnect/generated/react'

export default function GetRapportComponent() {
  // The `useGetRapport` Query hook requires an argument of type `GetRapportVariables`:
  const getRapportVars: GetRapportVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetRapport(getRapportVars);
  // Variables can be defined inline as well.
  const query = useGetRapport({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetRapport(dataConnect, getRapportVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetRapport(getRapportVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetRapport(dataConnect, getRapportVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.rapport);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListRecentAuditEvents
You can execute the `ListRecentAuditEvents` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListRecentAuditEvents(dc: DataConnect, vars: ListRecentAuditEventsVariables, options?: useDataConnectQueryOptions<ListRecentAuditEventsData>): UseDataConnectQueryResult<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListRecentAuditEvents(vars: ListRecentAuditEventsVariables, options?: useDataConnectQueryOptions<ListRecentAuditEventsData>): UseDataConnectQueryResult<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;
```

### Variables
The `ListRecentAuditEvents` Query requires an argument of type `ListRecentAuditEventsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListRecentAuditEventsVariables {
  environment: string;
}
```
### Return Type
Recall that calling the `ListRecentAuditEvents` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListRecentAuditEvents` Query is of type `ListRecentAuditEventsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListRecentAuditEvents`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListRecentAuditEventsVariables } from '@dataconnect/generated';
import { useListRecentAuditEvents } from '@dataconnect/generated/react'

export default function ListRecentAuditEventsComponent() {
  // The `useListRecentAuditEvents` Query hook requires an argument of type `ListRecentAuditEventsVariables`:
  const listRecentAuditEventsVars: ListRecentAuditEventsVariables = {
    environment: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListRecentAuditEvents(listRecentAuditEventsVars);
  // Variables can be defined inline as well.
  const query = useListRecentAuditEvents({ environment: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListRecentAuditEvents(dataConnect, listRecentAuditEventsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListRecentAuditEvents(listRecentAuditEventsVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListRecentAuditEvents(dataConnect, listRecentAuditEventsVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.auditEvents);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListEntityChangeLogs
You can execute the `ListEntityChangeLogs` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListEntityChangeLogs(dc: DataConnect, vars: ListEntityChangeLogsVariables, options?: useDataConnectQueryOptions<ListEntityChangeLogsData>): UseDataConnectQueryResult<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListEntityChangeLogs(vars: ListEntityChangeLogsVariables, options?: useDataConnectQueryOptions<ListEntityChangeLogsData>): UseDataConnectQueryResult<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;
```

### Variables
The `ListEntityChangeLogs` Query requires an argument of type `ListEntityChangeLogsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListEntityChangeLogsVariables {
  environment: string;
  entityType: string;
  entityId: string;
}
```
### Return Type
Recall that calling the `ListEntityChangeLogs` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListEntityChangeLogs` Query is of type `ListEntityChangeLogsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListEntityChangeLogs`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListEntityChangeLogsVariables } from '@dataconnect/generated';
import { useListEntityChangeLogs } from '@dataconnect/generated/react'

export default function ListEntityChangeLogsComponent() {
  // The `useListEntityChangeLogs` Query hook requires an argument of type `ListEntityChangeLogsVariables`:
  const listEntityChangeLogsVars: ListEntityChangeLogsVariables = {
    environment: ..., 
    entityType: ..., 
    entityId: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListEntityChangeLogs(listEntityChangeLogsVars);
  // Variables can be defined inline as well.
  const query = useListEntityChangeLogs({ environment: ..., entityType: ..., entityId: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListEntityChangeLogs(dataConnect, listEntityChangeLogsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListEntityChangeLogs(listEntityChangeLogsVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListEntityChangeLogs(dataConnect, listEntityChangeLogsVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.entityChangeLogs);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListCheckpointRuns
You can execute the `ListCheckpointRuns` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListCheckpointRuns(dc: DataConnect, vars: ListCheckpointRunsVariables, options?: useDataConnectQueryOptions<ListCheckpointRunsData>): UseDataConnectQueryResult<ListCheckpointRunsData, ListCheckpointRunsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListCheckpointRuns(vars: ListCheckpointRunsVariables, options?: useDataConnectQueryOptions<ListCheckpointRunsData>): UseDataConnectQueryResult<ListCheckpointRunsData, ListCheckpointRunsVariables>;
```

### Variables
The `ListCheckpointRuns` Query requires an argument of type `ListCheckpointRunsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListCheckpointRunsVariables {
  environment: string;
}
```
### Return Type
Recall that calling the `ListCheckpointRuns` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListCheckpointRuns` Query is of type `ListCheckpointRunsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListCheckpointRuns`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListCheckpointRunsVariables } from '@dataconnect/generated';
import { useListCheckpointRuns } from '@dataconnect/generated/react'

export default function ListCheckpointRunsComponent() {
  // The `useListCheckpointRuns` Query hook requires an argument of type `ListCheckpointRunsVariables`:
  const listCheckpointRunsVars: ListCheckpointRunsVariables = {
    environment: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListCheckpointRuns(listCheckpointRunsVars);
  // Variables can be defined inline as well.
  const query = useListCheckpointRuns({ environment: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListCheckpointRuns(dataConnect, listCheckpointRunsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListCheckpointRuns(listCheckpointRunsVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListCheckpointRuns(dataConnect, listCheckpointRunsVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.checkpointRuns);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetCheckpointRun
You can execute the `GetCheckpointRun` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetCheckpointRun(dc: DataConnect, vars: GetCheckpointRunVariables, options?: useDataConnectQueryOptions<GetCheckpointRunData>): UseDataConnectQueryResult<GetCheckpointRunData, GetCheckpointRunVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetCheckpointRun(vars: GetCheckpointRunVariables, options?: useDataConnectQueryOptions<GetCheckpointRunData>): UseDataConnectQueryResult<GetCheckpointRunData, GetCheckpointRunVariables>;
```

### Variables
The `GetCheckpointRun` Query requires an argument of type `GetCheckpointRunVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetCheckpointRunVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetCheckpointRun` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetCheckpointRun` Query is of type `GetCheckpointRunData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetCheckpointRun`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetCheckpointRunVariables } from '@dataconnect/generated';
import { useGetCheckpointRun } from '@dataconnect/generated/react'

export default function GetCheckpointRunComponent() {
  // The `useGetCheckpointRun` Query hook requires an argument of type `GetCheckpointRunVariables`:
  const getCheckpointRunVars: GetCheckpointRunVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetCheckpointRun(getCheckpointRunVars);
  // Variables can be defined inline as well.
  const query = useGetCheckpointRun({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetCheckpointRun(dataConnect, getCheckpointRunVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetCheckpointRun(getCheckpointRunVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetCheckpointRun(dataConnect, getCheckpointRunVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.checkpointRun);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## ListDataImportRuns
You can execute the `ListDataImportRuns` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListDataImportRuns(dc: DataConnect, vars: ListDataImportRunsVariables, options?: useDataConnectQueryOptions<ListDataImportRunsData>): UseDataConnectQueryResult<ListDataImportRunsData, ListDataImportRunsVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListDataImportRuns(vars: ListDataImportRunsVariables, options?: useDataConnectQueryOptions<ListDataImportRunsData>): UseDataConnectQueryResult<ListDataImportRunsData, ListDataImportRunsVariables>;
```

### Variables
The `ListDataImportRuns` Query requires an argument of type `ListDataImportRunsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface ListDataImportRunsVariables {
  environment: string;
}
```
### Return Type
Recall that calling the `ListDataImportRuns` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListDataImportRuns` Query is of type `ListDataImportRunsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListDataImportRuns`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, ListDataImportRunsVariables } from '@dataconnect/generated';
import { useListDataImportRuns } from '@dataconnect/generated/react'

export default function ListDataImportRunsComponent() {
  // The `useListDataImportRuns` Query hook requires an argument of type `ListDataImportRunsVariables`:
  const listDataImportRunsVars: ListDataImportRunsVariables = {
    environment: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListDataImportRuns(listDataImportRunsVars);
  // Variables can be defined inline as well.
  const query = useListDataImportRuns({ environment: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListDataImportRuns(dataConnect, listDataImportRunsVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListDataImportRuns(listDataImportRunsVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListDataImportRuns(dataConnect, listDataImportRunsVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.dataImportRuns);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## GetDataImportRun
You can execute the `GetDataImportRun` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useGetDataImportRun(dc: DataConnect, vars: GetDataImportRunVariables, options?: useDataConnectQueryOptions<GetDataImportRunData>): UseDataConnectQueryResult<GetDataImportRunData, GetDataImportRunVariables>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useGetDataImportRun(vars: GetDataImportRunVariables, options?: useDataConnectQueryOptions<GetDataImportRunData>): UseDataConnectQueryResult<GetDataImportRunData, GetDataImportRunVariables>;
```

### Variables
The `GetDataImportRun` Query requires an argument of type `GetDataImportRunVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface GetDataImportRunVariables {
  id: UUIDString;
}
```
### Return Type
Recall that calling the `GetDataImportRun` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `GetDataImportRun` Query is of type `GetDataImportRunData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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
```

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `GetDataImportRun`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, GetDataImportRunVariables } from '@dataconnect/generated';
import { useGetDataImportRun } from '@dataconnect/generated/react'

export default function GetDataImportRunComponent() {
  // The `useGetDataImportRun` Query hook requires an argument of type `GetDataImportRunVariables`:
  const getDataImportRunVars: GetDataImportRunVariables = {
    id: ..., 
  };

  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useGetDataImportRun(getDataImportRunVars);
  // Variables can be defined inline as well.
  const query = useGetDataImportRun({ id: ..., });

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useGetDataImportRun(dataConnect, getDataImportRunVars);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useGetDataImportRun(getDataImportRunVars, options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useGetDataImportRun(dataConnect, getDataImportRunVars, options);

  // Then, you can render your component dynamically based on the status of the Query.
  if (query.isPending) {
    return <div>Loading...</div>;
  }

  if (query.isError) {
    return <div>Error: {query.error.message}</div>;
  }

  // If the Query is successful, you can access the data returned using the `UseQueryResult.data` field.
  if (query.isSuccess) {
    console.log(query.data.dataImportRun);
  }
  return <div>Query execution {query.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

# Mutations

The React generated SDK provides Mutations hook functions that call and return [`useDataConnectMutation`](https://react-query-firebase.invertase.dev/react/data-connect/mutations) hooks from TanStack Query Firebase.

Calling these hook functions will return a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, and the most recent data returned by the Mutation, among other things. To learn more about these hooks and how to use them, see the [TanStack Query Firebase documentation](https://react-query-firebase.invertase.dev/react/data-connect/mutations).

Mutation hooks do not execute their Mutations automatically when called. Rather, after calling the Mutation hook function and getting a `UseMutationResult` object, you must call the `UseMutationResult.mutate()` function to execute the Mutation.

To learn more about TanStack React Query's Mutations, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations).

## Using Mutation Hooks
Here's a general overview of how to use the generated Mutation hooks in your code:

- Mutation hook functions are not called with the arguments to the Mutation. Instead, arguments are passed to `UseMutationResult.mutate()`.
- If the Mutation has no variables, the `mutate()` function does not require arguments.
- If the Mutation has any required variables, the `mutate()` function will require at least one argument: an object that contains all the required variables for the Mutation.
- If the Mutation has some required and some optional variables, only required variables are necessary in the variables argument object, and optional variables may be provided as well.
- If all of the Mutation's variables are optional, the Mutation hook function does not require any arguments.
- Mutation hook functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.
- Mutation hooks also accept an `options` argument of type `useDataConnectMutationOptions`. To learn more about the `options` argument, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-side-effects).
  - `UseMutationResult.mutate()` also accepts an `options` argument of type `useDataConnectMutationOptions`.
  - ***Special case:*** If the Mutation has no arguments (or all optional arguments and you wish to provide none), and you want to pass `options` to `UseMutationResult.mutate()`, you must pass `undefined` where you would normally pass the Mutation's arguments, and then may provide the options argument.

Below are examples of how to use the `sosson` connector's generated Mutation hook functions to execute each Mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#operations-react-angular).

## CreateClient
You can execute the `CreateClient` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateClient(options?: useDataConnectMutationOptions<CreateClientData, FirebaseError, CreateClientVariables>): UseDataConnectMutationResult<CreateClientData, CreateClientVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateClient(dc: DataConnect, options?: useDataConnectMutationOptions<CreateClientData, FirebaseError, CreateClientVariables>): UseDataConnectMutationResult<CreateClientData, CreateClientVariables>;
```

### Variables
The `CreateClient` Mutation requires an argument of type `CreateClientVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateClientVariables {
  type: string;
  nom: string;
  email?: string | null;
  telephone?: string | null;
  adresse?: string | null;
  ville?: string | null;
  codePostal?: string | null;
}
```
### Return Type
Recall that calling the `CreateClient` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateClient` Mutation is of type `CreateClientData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateClientData {
  query?: {
  };
    client_insert: Client_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateClient`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateClientVariables } from '@dataconnect/generated';
import { useCreateClient } from '@dataconnect/generated/react'

export default function CreateClientComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateClient();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateClient(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateClient(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateClient(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateClient` Mutation requires an argument of type `CreateClientVariables`:
  const createClientVars: CreateClientVariables = {
    type: ..., 
    nom: ..., 
    email: ..., // optional
    telephone: ..., // optional
    adresse: ..., // optional
    ville: ..., // optional
    codePostal: ..., // optional
  };
  mutation.mutate(createClientVars);
  // Variables can be defined inline as well.
  mutation.mutate({ type: ..., nom: ..., email: ..., telephone: ..., adresse: ..., ville: ..., codePostal: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createClientVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.client_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateClient
You can execute the `UpdateClient` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateClient(options?: useDataConnectMutationOptions<UpdateClientData, FirebaseError, UpdateClientVariables>): UseDataConnectMutationResult<UpdateClientData, UpdateClientVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateClient(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateClientData, FirebaseError, UpdateClientVariables>): UseDataConnectMutationResult<UpdateClientData, UpdateClientVariables>;
```

### Variables
The `UpdateClient` Mutation requires an argument of type `UpdateClientVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `UpdateClient` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateClient` Mutation is of type `UpdateClientData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateClientData {
  query?: {
  };
    client_update?: Client_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateClient`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateClientVariables } from '@dataconnect/generated';
import { useUpdateClient } from '@dataconnect/generated/react'

export default function UpdateClientComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateClient();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateClient(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateClient(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateClient(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateClient` Mutation requires an argument of type `UpdateClientVariables`:
  const updateClientVars: UpdateClientVariables = {
    id: ..., 
    type: ..., // optional
    nom: ..., // optional
    email: ..., // optional
    telephone: ..., // optional
    adresse: ..., // optional
    ville: ..., // optional
    codePostal: ..., // optional
  };
  mutation.mutate(updateClientVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., type: ..., nom: ..., email: ..., telephone: ..., adresse: ..., ville: ..., codePostal: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateClientVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.client_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateChantier
You can execute the `CreateChantier` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateChantier(options?: useDataConnectMutationOptions<CreateChantierData, FirebaseError, CreateChantierVariables>): UseDataConnectMutationResult<CreateChantierData, CreateChantierVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateChantier(dc: DataConnect, options?: useDataConnectMutationOptions<CreateChantierData, FirebaseError, CreateChantierVariables>): UseDataConnectMutationResult<CreateChantierData, CreateChantierVariables>;
```

### Variables
The `CreateChantier` Mutation requires an argument of type `CreateChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateChantier` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateChantier` Mutation is of type `CreateChantierData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateChantierData {
  query?: {
  };
    chantier_insert: Chantier_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateChantier`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateChantierVariables } from '@dataconnect/generated';
import { useCreateChantier } from '@dataconnect/generated/react'

export default function CreateChantierComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateChantier();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateChantier(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateChantier(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateChantier(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateChantier` Mutation requires an argument of type `CreateChantierVariables`:
  const createChantierVars: CreateChantierVariables = {
    clientId: ..., 
    chefChantierId: ..., // optional
    nom: ..., 
    statut: ..., 
    dateDebut: ..., 
    dateFinPrevue: ..., 
    budgetPrevisionnel: ..., 
    description: ..., // optional
    adresse: ..., // optional
  };
  mutation.mutate(createChantierVars);
  // Variables can be defined inline as well.
  mutation.mutate({ clientId: ..., chefChantierId: ..., nom: ..., statut: ..., dateDebut: ..., dateFinPrevue: ..., budgetPrevisionnel: ..., description: ..., adresse: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createChantierVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.chantier_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateChantierStatut
You can execute the `UpdateChantierStatut` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateChantierStatut(options?: useDataConnectMutationOptions<UpdateChantierStatutData, FirebaseError, UpdateChantierStatutVariables>): UseDataConnectMutationResult<UpdateChantierStatutData, UpdateChantierStatutVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateChantierStatut(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateChantierStatutData, FirebaseError, UpdateChantierStatutVariables>): UseDataConnectMutationResult<UpdateChantierStatutData, UpdateChantierStatutVariables>;
```

### Variables
The `UpdateChantierStatut` Mutation requires an argument of type `UpdateChantierStatutVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateChantierStatutVariables {
  id: UUIDString;
  statut: string;
  dateFin?: DateString | null;
}
```
### Return Type
Recall that calling the `UpdateChantierStatut` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateChantierStatut` Mutation is of type `UpdateChantierStatutData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateChantierStatutData {
  query?: {
  };
    chantier_update?: Chantier_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateChantierStatut`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateChantierStatutVariables } from '@dataconnect/generated';
import { useUpdateChantierStatut } from '@dataconnect/generated/react'

export default function UpdateChantierStatutComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateChantierStatut();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateChantierStatut(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateChantierStatut(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateChantierStatut(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateChantierStatut` Mutation requires an argument of type `UpdateChantierStatutVariables`:
  const updateChantierStatutVars: UpdateChantierStatutVariables = {
    id: ..., 
    statut: ..., 
    dateFin: ..., // optional
  };
  mutation.mutate(updateChantierStatutVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., statut: ..., dateFin: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateChantierStatutVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.chantier_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateFacture
You can execute the `CreateFacture` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateFacture(options?: useDataConnectMutationOptions<CreateFactureData, FirebaseError, CreateFactureVariables>): UseDataConnectMutationResult<CreateFactureData, CreateFactureVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateFacture(dc: DataConnect, options?: useDataConnectMutationOptions<CreateFactureData, FirebaseError, CreateFactureVariables>): UseDataConnectMutationResult<CreateFactureData, CreateFactureVariables>;
```

### Variables
The `CreateFacture` Mutation requires an argument of type `CreateFactureVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateFacture` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateFacture` Mutation is of type `CreateFactureData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateFactureData {
  query?: {
  };
    facture_insert: Facture_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateFacture`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateFactureVariables } from '@dataconnect/generated';
import { useCreateFacture } from '@dataconnect/generated/react'

export default function CreateFactureComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateFacture();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateFacture(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateFacture(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateFacture(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateFacture` Mutation requires an argument of type `CreateFactureVariables`:
  const createFactureVars: CreateFactureVariables = {
    chantierId: ..., 
    fournisseur: ..., 
    numeroFacture: ..., 
    montantHT: ..., 
    tva: ..., 
    montantTTC: ..., 
    date: ..., 
    categorie: ..., 
    statut: ..., 
    description: ..., // optional
  };
  mutation.mutate(createFactureVars);
  // Variables can be defined inline as well.
  mutation.mutate({ chantierId: ..., fournisseur: ..., numeroFacture: ..., montantHT: ..., tva: ..., montantTTC: ..., date: ..., categorie: ..., statut: ..., description: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createFactureVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.facture_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## SetFactureStatut
You can execute the `SetFactureStatut` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useSetFactureStatut(options?: useDataConnectMutationOptions<SetFactureStatutData, FirebaseError, SetFactureStatutVariables>): UseDataConnectMutationResult<SetFactureStatutData, SetFactureStatutVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useSetFactureStatut(dc: DataConnect, options?: useDataConnectMutationOptions<SetFactureStatutData, FirebaseError, SetFactureStatutVariables>): UseDataConnectMutationResult<SetFactureStatutData, SetFactureStatutVariables>;
```

### Variables
The `SetFactureStatut` Mutation requires an argument of type `SetFactureStatutVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface SetFactureStatutVariables {
  id: UUIDString;
  statut: string;
}
```
### Return Type
Recall that calling the `SetFactureStatut` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `SetFactureStatut` Mutation is of type `SetFactureStatutData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface SetFactureStatutData {
  query?: {
  };
    facture_update?: Facture_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `SetFactureStatut`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, SetFactureStatutVariables } from '@dataconnect/generated';
import { useSetFactureStatut } from '@dataconnect/generated/react'

export default function SetFactureStatutComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useSetFactureStatut();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useSetFactureStatut(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useSetFactureStatut(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useSetFactureStatut(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useSetFactureStatut` Mutation requires an argument of type `SetFactureStatutVariables`:
  const setFactureStatutVars: SetFactureStatutVariables = {
    id: ..., 
    statut: ..., 
  };
  mutation.mutate(setFactureStatutVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., statut: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(setFactureStatutVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.facture_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateDocumentFolder
You can execute the `CreateDocumentFolder` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateDocumentFolder(options?: useDataConnectMutationOptions<CreateDocumentFolderData, FirebaseError, CreateDocumentFolderVariables>): UseDataConnectMutationResult<CreateDocumentFolderData, CreateDocumentFolderVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateDocumentFolder(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDocumentFolderData, FirebaseError, CreateDocumentFolderVariables>): UseDataConnectMutationResult<CreateDocumentFolderData, CreateDocumentFolderVariables>;
```

### Variables
The `CreateDocumentFolder` Mutation requires an argument of type `CreateDocumentFolderVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateDocumentFolderVariables {
  nom: string;
  slug: string;
  parentId?: UUIDString | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  description?: string | null;
}
```
### Return Type
Recall that calling the `CreateDocumentFolder` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateDocumentFolder` Mutation is of type `CreateDocumentFolderData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateDocumentFolderData {
  query?: {
  };
    documentFolder_insert: DocumentFolder_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateDocumentFolder`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateDocumentFolderVariables } from '@dataconnect/generated';
import { useCreateDocumentFolder } from '@dataconnect/generated/react'

export default function CreateDocumentFolderComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateDocumentFolder();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateDocumentFolder(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDocumentFolder(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDocumentFolder(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateDocumentFolder` Mutation requires an argument of type `CreateDocumentFolderVariables`:
  const createDocumentFolderVars: CreateDocumentFolderVariables = {
    nom: ..., 
    slug: ..., 
    parentId: ..., // optional
    clientId: ..., // optional
    chantierId: ..., // optional
    description: ..., // optional
  };
  mutation.mutate(createDocumentFolderVars);
  // Variables can be defined inline as well.
  mutation.mutate({ nom: ..., slug: ..., parentId: ..., clientId: ..., chantierId: ..., description: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createDocumentFolderVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.documentFolder_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateDocumentAttache
You can execute the `CreateDocumentAttache` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateDocumentAttache(options?: useDataConnectMutationOptions<CreateDocumentAttacheData, FirebaseError, CreateDocumentAttacheVariables>): UseDataConnectMutationResult<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateDocumentAttache(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDocumentAttacheData, FirebaseError, CreateDocumentAttacheVariables>): UseDataConnectMutationResult<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;
```

### Variables
The `CreateDocumentAttache` Mutation requires an argument of type `CreateDocumentAttacheVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateDocumentAttache` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateDocumentAttache` Mutation is of type `CreateDocumentAttacheData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateDocumentAttacheData {
  query?: {
  };
    documentAttache_insert: DocumentAttache_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateDocumentAttache`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateDocumentAttacheVariables } from '@dataconnect/generated';
import { useCreateDocumentAttache } from '@dataconnect/generated/react'

export default function CreateDocumentAttacheComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateDocumentAttache();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateDocumentAttache(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDocumentAttache(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDocumentAttache(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateDocumentAttache` Mutation requires an argument of type `CreateDocumentAttacheVariables`:
  const createDocumentAttacheVars: CreateDocumentAttacheVariables = {
    folderId: ..., // optional
    clientId: ..., // optional
    chantierId: ..., // optional
    factureId: ..., // optional
    nomFichier: ..., 
    storagePath: ..., 
    mimeType: ..., // optional
    tailleBytes: ..., // optional
    sha256: ..., // optional
    typeDocument: ..., 
    statut: ..., 
    source: ..., 
    description: ..., // optional
    dateDocument: ..., // optional
  };
  mutation.mutate(createDocumentAttacheVars);
  // Variables can be defined inline as well.
  mutation.mutate({ folderId: ..., clientId: ..., chantierId: ..., factureId: ..., nomFichier: ..., storagePath: ..., mimeType: ..., tailleBytes: ..., sha256: ..., typeDocument: ..., statut: ..., source: ..., description: ..., dateDocument: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createDocumentAttacheVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.documentAttache_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateDocumentAttacheLinks
You can execute the `UpdateDocumentAttacheLinks` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateDocumentAttacheLinks(options?: useDataConnectMutationOptions<UpdateDocumentAttacheLinksData, FirebaseError, UpdateDocumentAttacheLinksVariables>): UseDataConnectMutationResult<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateDocumentAttacheLinks(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateDocumentAttacheLinksData, FirebaseError, UpdateDocumentAttacheLinksVariables>): UseDataConnectMutationResult<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;
```

### Variables
The `UpdateDocumentAttacheLinks` Mutation requires an argument of type `UpdateDocumentAttacheLinksVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateDocumentAttacheLinksVariables {
  id: UUIDString;
  folderId?: UUIDString | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  factureId?: UUIDString | null;
  statut?: string | null;
  typeDocument?: string | null;
}
```
### Return Type
Recall that calling the `UpdateDocumentAttacheLinks` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateDocumentAttacheLinks` Mutation is of type `UpdateDocumentAttacheLinksData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateDocumentAttacheLinksData {
  query?: {
  };
    documentAttache_update?: DocumentAttache_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateDocumentAttacheLinks`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateDocumentAttacheLinksVariables } from '@dataconnect/generated';
import { useUpdateDocumentAttacheLinks } from '@dataconnect/generated/react'

export default function UpdateDocumentAttacheLinksComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateDocumentAttacheLinks();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateDocumentAttacheLinks(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateDocumentAttacheLinks(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateDocumentAttacheLinks(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateDocumentAttacheLinks` Mutation requires an argument of type `UpdateDocumentAttacheLinksVariables`:
  const updateDocumentAttacheLinksVars: UpdateDocumentAttacheLinksVariables = {
    id: ..., 
    folderId: ..., // optional
    clientId: ..., // optional
    chantierId: ..., // optional
    factureId: ..., // optional
    statut: ..., // optional
    typeDocument: ..., // optional
  };
  mutation.mutate(updateDocumentAttacheLinksVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., folderId: ..., clientId: ..., chantierId: ..., factureId: ..., statut: ..., typeDocument: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateDocumentAttacheLinksVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.documentAttache_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreatePrevisionnelImportBatch
You can execute the `CreatePrevisionnelImportBatch` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreatePrevisionnelImportBatch(options?: useDataConnectMutationOptions<CreatePrevisionnelImportBatchData, FirebaseError, CreatePrevisionnelImportBatchVariables>): UseDataConnectMutationResult<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreatePrevisionnelImportBatch(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePrevisionnelImportBatchData, FirebaseError, CreatePrevisionnelImportBatchVariables>): UseDataConnectMutationResult<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;
```

### Variables
The `CreatePrevisionnelImportBatch` Mutation requires an argument of type `CreatePrevisionnelImportBatchVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreatePrevisionnelImportBatchVariables {
  workbook: string;
  sourcePath: string;
  workbookHash?: string | null;
  notes?: string | null;
}
```
### Return Type
Recall that calling the `CreatePrevisionnelImportBatch` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreatePrevisionnelImportBatch` Mutation is of type `CreatePrevisionnelImportBatchData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreatePrevisionnelImportBatchData {
  query?: {
  };
    previsionnelImportBatch_insert: PrevisionnelImportBatch_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreatePrevisionnelImportBatch`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreatePrevisionnelImportBatchVariables } from '@dataconnect/generated';
import { useCreatePrevisionnelImportBatch } from '@dataconnect/generated/react'

export default function CreatePrevisionnelImportBatchComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreatePrevisionnelImportBatch();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreatePrevisionnelImportBatch(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreatePrevisionnelImportBatch(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreatePrevisionnelImportBatch(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreatePrevisionnelImportBatch` Mutation requires an argument of type `CreatePrevisionnelImportBatchVariables`:
  const createPrevisionnelImportBatchVars: CreatePrevisionnelImportBatchVariables = {
    workbook: ..., 
    sourcePath: ..., 
    workbookHash: ..., // optional
    notes: ..., // optional
  };
  mutation.mutate(createPrevisionnelImportBatchVars);
  // Variables can be defined inline as well.
  mutation.mutate({ workbook: ..., sourcePath: ..., workbookHash: ..., notes: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createPrevisionnelImportBatchVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.previsionnelImportBatch_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdatePrevisionnelMonthlyAmount
You can execute the `UpdatePrevisionnelMonthlyAmount` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdatePrevisionnelMonthlyAmount(options?: useDataConnectMutationOptions<UpdatePrevisionnelMonthlyAmountData, FirebaseError, UpdatePrevisionnelMonthlyAmountVariables>): UseDataConnectMutationResult<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdatePrevisionnelMonthlyAmount(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePrevisionnelMonthlyAmountData, FirebaseError, UpdatePrevisionnelMonthlyAmountVariables>): UseDataConnectMutationResult<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;
```

### Variables
The `UpdatePrevisionnelMonthlyAmount` Mutation requires an argument of type `UpdatePrevisionnelMonthlyAmountVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdatePrevisionnelMonthlyAmountVariables {
  id: UUIDString;
  planned?: number | null;
  realized?: number | null;
  invoiceSent?: boolean | null;
}
```
### Return Type
Recall that calling the `UpdatePrevisionnelMonthlyAmount` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdatePrevisionnelMonthlyAmount` Mutation is of type `UpdatePrevisionnelMonthlyAmountData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdatePrevisionnelMonthlyAmountData {
  query?: {
  };
    previsionnelMonthlyAmount_update?: PrevisionnelMonthlyAmount_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdatePrevisionnelMonthlyAmount`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdatePrevisionnelMonthlyAmountVariables } from '@dataconnect/generated';
import { useUpdatePrevisionnelMonthlyAmount } from '@dataconnect/generated/react'

export default function UpdatePrevisionnelMonthlyAmountComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdatePrevisionnelMonthlyAmount();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdatePrevisionnelMonthlyAmount(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePrevisionnelMonthlyAmount(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePrevisionnelMonthlyAmount(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdatePrevisionnelMonthlyAmount` Mutation requires an argument of type `UpdatePrevisionnelMonthlyAmountVariables`:
  const updatePrevisionnelMonthlyAmountVars: UpdatePrevisionnelMonthlyAmountVariables = {
    id: ..., 
    planned: ..., // optional
    realized: ..., // optional
    invoiceSent: ..., // optional
  };
  mutation.mutate(updatePrevisionnelMonthlyAmountVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., planned: ..., realized: ..., invoiceSent: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updatePrevisionnelMonthlyAmountVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.previsionnelMonthlyAmount_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdatePrevisionnelLineAmounts
You can execute the `UpdatePrevisionnelLineAmounts` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdatePrevisionnelLineAmounts(options?: useDataConnectMutationOptions<UpdatePrevisionnelLineAmountsData, FirebaseError, UpdatePrevisionnelLineAmountsVariables>): UseDataConnectMutationResult<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdatePrevisionnelLineAmounts(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePrevisionnelLineAmountsData, FirebaseError, UpdatePrevisionnelLineAmountsVariables>): UseDataConnectMutationResult<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;
```

### Variables
The `UpdatePrevisionnelLineAmounts` Mutation requires an argument of type `UpdatePrevisionnelLineAmountsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `UpdatePrevisionnelLineAmounts` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdatePrevisionnelLineAmounts` Mutation is of type `UpdatePrevisionnelLineAmountsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdatePrevisionnelLineAmountsData {
  query?: {
  };
    previsionnelLine_update?: PrevisionnelLine_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdatePrevisionnelLineAmounts`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdatePrevisionnelLineAmountsVariables } from '@dataconnect/generated';
import { useUpdatePrevisionnelLineAmounts } from '@dataconnect/generated/react'

export default function UpdatePrevisionnelLineAmountsComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdatePrevisionnelLineAmounts();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdatePrevisionnelLineAmounts(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePrevisionnelLineAmounts(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePrevisionnelLineAmounts(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdatePrevisionnelLineAmounts` Mutation requires an argument of type `UpdatePrevisionnelLineAmountsVariables`:
  const updatePrevisionnelLineAmountsVars: UpdatePrevisionnelLineAmountsVariables = {
    id: ..., 
    rawName: ..., // optional
    clientName: ..., // optional
    caTce: ..., // optional
    caPrevision: ..., // optional
    caContrat: ..., // optional
    plannedTotal: ..., // optional
    realizedTotal: ..., // optional
    invoicedTotal: ..., // optional
    invoiceSentTotal: ..., // optional
  };
  mutation.mutate(updatePrevisionnelLineAmountsVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., rawName: ..., clientName: ..., caTce: ..., caPrevision: ..., caContrat: ..., plannedTotal: ..., realizedTotal: ..., invoicedTotal: ..., invoiceSentTotal: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updatePrevisionnelLineAmountsVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.previsionnelLine_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## LinkPrevisionnelLineToChantier
You can execute the `LinkPrevisionnelLineToChantier` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useLinkPrevisionnelLineToChantier(options?: useDataConnectMutationOptions<LinkPrevisionnelLineToChantierData, FirebaseError, LinkPrevisionnelLineToChantierVariables>): UseDataConnectMutationResult<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useLinkPrevisionnelLineToChantier(dc: DataConnect, options?: useDataConnectMutationOptions<LinkPrevisionnelLineToChantierData, FirebaseError, LinkPrevisionnelLineToChantierVariables>): UseDataConnectMutationResult<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;
```

### Variables
The `LinkPrevisionnelLineToChantier` Mutation requires an argument of type `LinkPrevisionnelLineToChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface LinkPrevisionnelLineToChantierVariables {
  id: UUIDString;
  chantierId?: UUIDString | null;
}
```
### Return Type
Recall that calling the `LinkPrevisionnelLineToChantier` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `LinkPrevisionnelLineToChantier` Mutation is of type `LinkPrevisionnelLineToChantierData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface LinkPrevisionnelLineToChantierData {
  query?: {
  };
    previsionnelLine_update?: PrevisionnelLine_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `LinkPrevisionnelLineToChantier`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, LinkPrevisionnelLineToChantierVariables } from '@dataconnect/generated';
import { useLinkPrevisionnelLineToChantier } from '@dataconnect/generated/react'

export default function LinkPrevisionnelLineToChantierComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useLinkPrevisionnelLineToChantier();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useLinkPrevisionnelLineToChantier(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useLinkPrevisionnelLineToChantier(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useLinkPrevisionnelLineToChantier(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useLinkPrevisionnelLineToChantier` Mutation requires an argument of type `LinkPrevisionnelLineToChantierVariables`:
  const linkPrevisionnelLineToChantierVars: LinkPrevisionnelLineToChantierVariables = {
    id: ..., 
    chantierId: ..., // optional
  };
  mutation.mutate(linkPrevisionnelLineToChantierVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., chantierId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(linkPrevisionnelLineToChantierVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.previsionnelLine_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpsertPrevisionnelCellEdit
You can execute the `UpsertPrevisionnelCellEdit` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpsertPrevisionnelCellEdit(options?: useDataConnectMutationOptions<UpsertPrevisionnelCellEditData, FirebaseError, UpsertPrevisionnelCellEditVariables>): UseDataConnectMutationResult<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpsertPrevisionnelCellEdit(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertPrevisionnelCellEditData, FirebaseError, UpsertPrevisionnelCellEditVariables>): UseDataConnectMutationResult<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;
```

### Variables
The `UpsertPrevisionnelCellEdit` Mutation requires an argument of type `UpsertPrevisionnelCellEditVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpsertPrevisionnelCellEditVariables {
  id: string;
  sourceSheet: string;
  cellRef: string;
  valueText?: string | null;
  numericValue?: number | null;
}
```
### Return Type
Recall that calling the `UpsertPrevisionnelCellEdit` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpsertPrevisionnelCellEdit` Mutation is of type `UpsertPrevisionnelCellEditData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpsertPrevisionnelCellEditData {
  query?: {
  };
    previsionnelCellEdit_upsert: PrevisionnelCellEdit_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpsertPrevisionnelCellEdit`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpsertPrevisionnelCellEditVariables } from '@dataconnect/generated';
import { useUpsertPrevisionnelCellEdit } from '@dataconnect/generated/react'

export default function UpsertPrevisionnelCellEditComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpsertPrevisionnelCellEdit();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpsertPrevisionnelCellEdit(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertPrevisionnelCellEdit(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertPrevisionnelCellEdit(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpsertPrevisionnelCellEdit` Mutation requires an argument of type `UpsertPrevisionnelCellEditVariables`:
  const upsertPrevisionnelCellEditVars: UpsertPrevisionnelCellEditVariables = {
    id: ..., 
    sourceSheet: ..., 
    cellRef: ..., 
    valueText: ..., // optional
    numericValue: ..., // optional
  };
  mutation.mutate(upsertPrevisionnelCellEditVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., sourceSheet: ..., cellRef: ..., valueText: ..., numericValue: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(upsertPrevisionnelCellEditVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.previsionnelCellEdit_upsert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateEmailThread
You can execute the `CreateEmailThread` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateEmailThread(options?: useDataConnectMutationOptions<CreateEmailThreadData, FirebaseError, CreateEmailThreadVariables>): UseDataConnectMutationResult<CreateEmailThreadData, CreateEmailThreadVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateEmailThread(dc: DataConnect, options?: useDataConnectMutationOptions<CreateEmailThreadData, FirebaseError, CreateEmailThreadVariables>): UseDataConnectMutationResult<CreateEmailThreadData, CreateEmailThreadVariables>;
```

### Variables
The `CreateEmailThread` Mutation requires an argument of type `CreateEmailThreadVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateEmailThread` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateEmailThread` Mutation is of type `CreateEmailThreadData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateEmailThreadData {
  query?: {
  };
    emailThread_insert: EmailThread_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateEmailThread`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateEmailThreadVariables } from '@dataconnect/generated';
import { useCreateEmailThread } from '@dataconnect/generated/react'

export default function CreateEmailThreadComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateEmailThread();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateEmailThread(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEmailThread(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEmailThread(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateEmailThread` Mutation requires an argument of type `CreateEmailThreadVariables`:
  const createEmailThreadVars: CreateEmailThreadVariables = {
    provider: ..., 
    externalThreadId: ..., 
    subject: ..., 
    statut: ..., 
    importance: ..., // optional
    clientId: ..., // optional
    chantierId: ..., // optional
    assignedToId: ..., // optional
    lastMessageAt: ..., 
    participantsSummary: ..., // optional
    messageCount: ..., 
    hasAttachments: ..., 
  };
  mutation.mutate(createEmailThreadVars);
  // Variables can be defined inline as well.
  mutation.mutate({ provider: ..., externalThreadId: ..., subject: ..., statut: ..., importance: ..., clientId: ..., chantierId: ..., assignedToId: ..., lastMessageAt: ..., participantsSummary: ..., messageCount: ..., hasAttachments: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createEmailThreadVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.emailThread_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdateEmailThreadStatusAndLinks
You can execute the `UpdateEmailThreadStatusAndLinks` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdateEmailThreadStatusAndLinks(options?: useDataConnectMutationOptions<UpdateEmailThreadStatusAndLinksData, FirebaseError, UpdateEmailThreadStatusAndLinksVariables>): UseDataConnectMutationResult<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdateEmailThreadStatusAndLinks(dc: DataConnect, options?: useDataConnectMutationOptions<UpdateEmailThreadStatusAndLinksData, FirebaseError, UpdateEmailThreadStatusAndLinksVariables>): UseDataConnectMutationResult<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;
```

### Variables
The `UpdateEmailThreadStatusAndLinks` Mutation requires an argument of type `UpdateEmailThreadStatusAndLinksVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdateEmailThreadStatusAndLinksVariables {
  id: UUIDString;
  statut?: string | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  assignedToId?: string | null;
}
```
### Return Type
Recall that calling the `UpdateEmailThreadStatusAndLinks` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdateEmailThreadStatusAndLinks` Mutation is of type `UpdateEmailThreadStatusAndLinksData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdateEmailThreadStatusAndLinksData {
  query?: {
  };
    emailThread_update?: EmailThread_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdateEmailThreadStatusAndLinks`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdateEmailThreadStatusAndLinksVariables } from '@dataconnect/generated';
import { useUpdateEmailThreadStatusAndLinks } from '@dataconnect/generated/react'

export default function UpdateEmailThreadStatusAndLinksComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdateEmailThreadStatusAndLinks();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdateEmailThreadStatusAndLinks(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateEmailThreadStatusAndLinks(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdateEmailThreadStatusAndLinks(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdateEmailThreadStatusAndLinks` Mutation requires an argument of type `UpdateEmailThreadStatusAndLinksVariables`:
  const updateEmailThreadStatusAndLinksVars: UpdateEmailThreadStatusAndLinksVariables = {
    id: ..., 
    statut: ..., // optional
    clientId: ..., // optional
    chantierId: ..., // optional
    assignedToId: ..., // optional
  };
  mutation.mutate(updateEmailThreadStatusAndLinksVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., statut: ..., clientId: ..., chantierId: ..., assignedToId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updateEmailThreadStatusAndLinksVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.emailThread_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateEmailMessage
You can execute the `CreateEmailMessage` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateEmailMessage(options?: useDataConnectMutationOptions<CreateEmailMessageData, FirebaseError, CreateEmailMessageVariables>): UseDataConnectMutationResult<CreateEmailMessageData, CreateEmailMessageVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateEmailMessage(dc: DataConnect, options?: useDataConnectMutationOptions<CreateEmailMessageData, FirebaseError, CreateEmailMessageVariables>): UseDataConnectMutationResult<CreateEmailMessageData, CreateEmailMessageVariables>;
```

### Variables
The `CreateEmailMessage` Mutation requires an argument of type `CreateEmailMessageVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateEmailMessage` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateEmailMessage` Mutation is of type `CreateEmailMessageData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateEmailMessageData {
  query?: {
  };
    emailMessage_insert: EmailMessage_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateEmailMessage`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateEmailMessageVariables } from '@dataconnect/generated';
import { useCreateEmailMessage } from '@dataconnect/generated/react'

export default function CreateEmailMessageComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateEmailMessage();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateEmailMessage(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEmailMessage(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEmailMessage(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateEmailMessage` Mutation requires an argument of type `CreateEmailMessageVariables`:
  const createEmailMessageVars: CreateEmailMessageVariables = {
    threadId: ..., 
    externalMessageId: ..., 
    direction: ..., 
    fromEmail: ..., // optional
    fromName: ..., // optional
    toSummary: ..., // optional
    ccSummary: ..., // optional
    subject: ..., // optional
    bodyPreview: ..., // optional
    bodyStoragePath: ..., // optional
    bodyHash: ..., // optional
    sentAt: ..., // optional
    receivedAt: ..., 
    isRead: ..., 
    hasAttachments: ..., 
  };
  mutation.mutate(createEmailMessageVars);
  // Variables can be defined inline as well.
  mutation.mutate({ threadId: ..., externalMessageId: ..., direction: ..., fromEmail: ..., fromName: ..., toSummary: ..., ccSummary: ..., subject: ..., bodyPreview: ..., bodyStoragePath: ..., bodyHash: ..., sentAt: ..., receivedAt: ..., isRead: ..., hasAttachments: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createEmailMessageVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.emailMessage_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateEmailAttachment
You can execute the `CreateEmailAttachment` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateEmailAttachment(options?: useDataConnectMutationOptions<CreateEmailAttachmentData, FirebaseError, CreateEmailAttachmentVariables>): UseDataConnectMutationResult<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateEmailAttachment(dc: DataConnect, options?: useDataConnectMutationOptions<CreateEmailAttachmentData, FirebaseError, CreateEmailAttachmentVariables>): UseDataConnectMutationResult<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;
```

### Variables
The `CreateEmailAttachment` Mutation requires an argument of type `CreateEmailAttachmentVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateEmailAttachment` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateEmailAttachment` Mutation is of type `CreateEmailAttachmentData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateEmailAttachmentData {
  query?: {
  };
    emailAttachment_insert: EmailAttachment_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateEmailAttachment`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateEmailAttachmentVariables } from '@dataconnect/generated';
import { useCreateEmailAttachment } from '@dataconnect/generated/react'

export default function CreateEmailAttachmentComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateEmailAttachment();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateEmailAttachment(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEmailAttachment(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEmailAttachment(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateEmailAttachment` Mutation requires an argument of type `CreateEmailAttachmentVariables`:
  const createEmailAttachmentVars: CreateEmailAttachmentVariables = {
    messageId: ..., 
    documentId: ..., // optional
    externalAttachmentId: ..., 
    nomFichier: ..., 
    storagePath: ..., // optional
    mimeType: ..., // optional
    tailleBytes: ..., // optional
    sha256: ..., // optional
    statut: ..., 
  };
  mutation.mutate(createEmailAttachmentVars);
  // Variables can be defined inline as well.
  mutation.mutate({ messageId: ..., documentId: ..., externalAttachmentId: ..., nomFichier: ..., storagePath: ..., mimeType: ..., tailleBytes: ..., sha256: ..., statut: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createEmailAttachmentVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.emailAttachment_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreatePlanningEvent
You can execute the `CreatePlanningEvent` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreatePlanningEvent(options?: useDataConnectMutationOptions<CreatePlanningEventData, FirebaseError, CreatePlanningEventVariables>): UseDataConnectMutationResult<CreatePlanningEventData, CreatePlanningEventVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreatePlanningEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePlanningEventData, FirebaseError, CreatePlanningEventVariables>): UseDataConnectMutationResult<CreatePlanningEventData, CreatePlanningEventVariables>;
```

### Variables
The `CreatePlanningEvent` Mutation requires an argument of type `CreatePlanningEventVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreatePlanningEvent` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreatePlanningEvent` Mutation is of type `CreatePlanningEventData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreatePlanningEventData {
  query?: {
  };
    planningEvent_insert: PlanningEvent_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreatePlanningEvent`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreatePlanningEventVariables } from '@dataconnect/generated';
import { useCreatePlanningEvent } from '@dataconnect/generated/react'

export default function CreatePlanningEventComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreatePlanningEvent();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreatePlanningEvent(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreatePlanningEvent(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreatePlanningEvent(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreatePlanningEvent` Mutation requires an argument of type `CreatePlanningEventVariables`:
  const createPlanningEventVars: CreatePlanningEventVariables = {
    chantierId: ..., // optional
    titre: ..., 
    eventType: ..., 
    statut: ..., 
    startAt: ..., 
    endAt: ..., 
    location: ..., // optional
    notes: ..., // optional
    createdById: ..., // optional
    updatedById: ..., // optional
  };
  mutation.mutate(createPlanningEventVars);
  // Variables can be defined inline as well.
  mutation.mutate({ chantierId: ..., titre: ..., eventType: ..., statut: ..., startAt: ..., endAt: ..., location: ..., notes: ..., createdById: ..., updatedById: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createPlanningEventVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.planningEvent_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdatePlanningEventStatus
You can execute the `UpdatePlanningEventStatus` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdatePlanningEventStatus(options?: useDataConnectMutationOptions<UpdatePlanningEventStatusData, FirebaseError, UpdatePlanningEventStatusVariables>): UseDataConnectMutationResult<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdatePlanningEventStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePlanningEventStatusData, FirebaseError, UpdatePlanningEventStatusVariables>): UseDataConnectMutationResult<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;
```

### Variables
The `UpdatePlanningEventStatus` Mutation requires an argument of type `UpdatePlanningEventStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdatePlanningEventStatusVariables {
  id: UUIDString;
  statut: string;
  updatedById?: string | null;
}
```
### Return Type
Recall that calling the `UpdatePlanningEventStatus` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdatePlanningEventStatus` Mutation is of type `UpdatePlanningEventStatusData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdatePlanningEventStatusData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdatePlanningEventStatus`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdatePlanningEventStatusVariables } from '@dataconnect/generated';
import { useUpdatePlanningEventStatus } from '@dataconnect/generated/react'

export default function UpdatePlanningEventStatusComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdatePlanningEventStatus();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdatePlanningEventStatus(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePlanningEventStatus(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePlanningEventStatus(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdatePlanningEventStatus` Mutation requires an argument of type `UpdatePlanningEventStatusVariables`:
  const updatePlanningEventStatusVars: UpdatePlanningEventStatusVariables = {
    id: ..., 
    statut: ..., 
    updatedById: ..., // optional
  };
  mutation.mutate(updatePlanningEventStatusVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., statut: ..., updatedById: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updatePlanningEventStatusVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.planningEvent_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdatePlanningEventDetails
You can execute the `UpdatePlanningEventDetails` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdatePlanningEventDetails(options?: useDataConnectMutationOptions<UpdatePlanningEventDetailsData, FirebaseError, UpdatePlanningEventDetailsVariables>): UseDataConnectMutationResult<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdatePlanningEventDetails(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePlanningEventDetailsData, FirebaseError, UpdatePlanningEventDetailsVariables>): UseDataConnectMutationResult<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;
```

### Variables
The `UpdatePlanningEventDetails` Mutation requires an argument of type `UpdatePlanningEventDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `UpdatePlanningEventDetails` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdatePlanningEventDetails` Mutation is of type `UpdatePlanningEventDetailsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdatePlanningEventDetailsData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdatePlanningEventDetails`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdatePlanningEventDetailsVariables } from '@dataconnect/generated';
import { useUpdatePlanningEventDetails } from '@dataconnect/generated/react'

export default function UpdatePlanningEventDetailsComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdatePlanningEventDetails();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdatePlanningEventDetails(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePlanningEventDetails(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePlanningEventDetails(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdatePlanningEventDetails` Mutation requires an argument of type `UpdatePlanningEventDetailsVariables`:
  const updatePlanningEventDetailsVars: UpdatePlanningEventDetailsVariables = {
    id: ..., 
    chantierId: ..., // optional
    titre: ..., 
    eventType: ..., 
    statut: ..., 
    startAt: ..., 
    endAt: ..., 
    location: ..., // optional
    notes: ..., // optional
    updatedById: ..., // optional
  };
  mutation.mutate(updatePlanningEventDetailsVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., chantierId: ..., titre: ..., eventType: ..., statut: ..., startAt: ..., endAt: ..., location: ..., notes: ..., updatedById: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updatePlanningEventDetailsVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.planningEvent_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CancelPlanningEvent
You can execute the `CancelPlanningEvent` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCancelPlanningEvent(options?: useDataConnectMutationOptions<CancelPlanningEventData, FirebaseError, CancelPlanningEventVariables>): UseDataConnectMutationResult<CancelPlanningEventData, CancelPlanningEventVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCancelPlanningEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CancelPlanningEventData, FirebaseError, CancelPlanningEventVariables>): UseDataConnectMutationResult<CancelPlanningEventData, CancelPlanningEventVariables>;
```

### Variables
The `CancelPlanningEvent` Mutation requires an argument of type `CancelPlanningEventVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CancelPlanningEventVariables {
  id: UUIDString;
  notes?: string | null;
  updatedById?: string | null;
}
```
### Return Type
Recall that calling the `CancelPlanningEvent` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CancelPlanningEvent` Mutation is of type `CancelPlanningEventData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CancelPlanningEventData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CancelPlanningEvent`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CancelPlanningEventVariables } from '@dataconnect/generated';
import { useCancelPlanningEvent } from '@dataconnect/generated/react'

export default function CancelPlanningEventComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCancelPlanningEvent();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCancelPlanningEvent(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCancelPlanningEvent(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCancelPlanningEvent(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCancelPlanningEvent` Mutation requires an argument of type `CancelPlanningEventVariables`:
  const cancelPlanningEventVars: CancelPlanningEventVariables = {
    id: ..., 
    notes: ..., // optional
    updatedById: ..., // optional
  };
  mutation.mutate(cancelPlanningEventVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., notes: ..., updatedById: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(cancelPlanningEventVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.planningEvent_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreatePlanningAssignment
You can execute the `CreatePlanningAssignment` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreatePlanningAssignment(options?: useDataConnectMutationOptions<CreatePlanningAssignmentData, FirebaseError, CreatePlanningAssignmentVariables>): UseDataConnectMutationResult<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreatePlanningAssignment(dc: DataConnect, options?: useDataConnectMutationOptions<CreatePlanningAssignmentData, FirebaseError, CreatePlanningAssignmentVariables>): UseDataConnectMutationResult<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;
```

### Variables
The `CreatePlanningAssignment` Mutation requires an argument of type `CreatePlanningAssignmentVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreatePlanningAssignmentVariables {
  eventId: UUIDString;
  userId?: string | null;
  assignmentRole?: string | null;
  statut: string;
  notes?: string | null;
}
```
### Return Type
Recall that calling the `CreatePlanningAssignment` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreatePlanningAssignment` Mutation is of type `CreatePlanningAssignmentData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreatePlanningAssignmentData {
  query?: {
  };
    planningAssignment_insert: PlanningAssignment_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreatePlanningAssignment`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreatePlanningAssignmentVariables } from '@dataconnect/generated';
import { useCreatePlanningAssignment } from '@dataconnect/generated/react'

export default function CreatePlanningAssignmentComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreatePlanningAssignment();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreatePlanningAssignment(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreatePlanningAssignment(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreatePlanningAssignment(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreatePlanningAssignment` Mutation requires an argument of type `CreatePlanningAssignmentVariables`:
  const createPlanningAssignmentVars: CreatePlanningAssignmentVariables = {
    eventId: ..., 
    userId: ..., // optional
    assignmentRole: ..., // optional
    statut: ..., 
    notes: ..., // optional
  };
  mutation.mutate(createPlanningAssignmentVars);
  // Variables can be defined inline as well.
  mutation.mutate({ eventId: ..., userId: ..., assignmentRole: ..., statut: ..., notes: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createPlanningAssignmentVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.planningAssignment_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## UpdatePlanningAssignmentStatus
You can execute the `UpdatePlanningAssignmentStatus` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpdatePlanningAssignmentStatus(options?: useDataConnectMutationOptions<UpdatePlanningAssignmentStatusData, FirebaseError, UpdatePlanningAssignmentStatusVariables>): UseDataConnectMutationResult<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpdatePlanningAssignmentStatus(dc: DataConnect, options?: useDataConnectMutationOptions<UpdatePlanningAssignmentStatusData, FirebaseError, UpdatePlanningAssignmentStatusVariables>): UseDataConnectMutationResult<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;
```

### Variables
The `UpdatePlanningAssignmentStatus` Mutation requires an argument of type `UpdatePlanningAssignmentStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpdatePlanningAssignmentStatusVariables {
  id: UUIDString;
  statut: string;
  notes?: string | null;
}
```
### Return Type
Recall that calling the `UpdatePlanningAssignmentStatus` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpdatePlanningAssignmentStatus` Mutation is of type `UpdatePlanningAssignmentStatusData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpdatePlanningAssignmentStatusData {
  query?: {
  };
    planningAssignment_update?: PlanningAssignment_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpdatePlanningAssignmentStatus`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpdatePlanningAssignmentStatusVariables } from '@dataconnect/generated';
import { useUpdatePlanningAssignmentStatus } from '@dataconnect/generated/react'

export default function UpdatePlanningAssignmentStatusComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpdatePlanningAssignmentStatus();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpdatePlanningAssignmentStatus(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePlanningAssignmentStatus(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpdatePlanningAssignmentStatus(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpdatePlanningAssignmentStatus` Mutation requires an argument of type `UpdatePlanningAssignmentStatusVariables`:
  const updatePlanningAssignmentStatusVars: UpdatePlanningAssignmentStatusVariables = {
    id: ..., 
    statut: ..., 
    notes: ..., // optional
  };
  mutation.mutate(updatePlanningAssignmentStatusVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., statut: ..., notes: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(updatePlanningAssignmentStatusVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.planningAssignment_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateAnalyticsSnapshot
You can execute the `CreateAnalyticsSnapshot` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateAnalyticsSnapshot(options?: useDataConnectMutationOptions<CreateAnalyticsSnapshotData, FirebaseError, CreateAnalyticsSnapshotVariables>): UseDataConnectMutationResult<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateAnalyticsSnapshot(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAnalyticsSnapshotData, FirebaseError, CreateAnalyticsSnapshotVariables>): UseDataConnectMutationResult<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;
```

### Variables
The `CreateAnalyticsSnapshot` Mutation requires an argument of type `CreateAnalyticsSnapshotVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateAnalyticsSnapshot` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateAnalyticsSnapshot` Mutation is of type `CreateAnalyticsSnapshotData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateAnalyticsSnapshotData {
  query?: {
  };
    analyticsSnapshot_insert: AnalyticsSnapshot_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateAnalyticsSnapshot`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateAnalyticsSnapshotVariables } from '@dataconnect/generated';
import { useCreateAnalyticsSnapshot } from '@dataconnect/generated/react'

export default function CreateAnalyticsSnapshotComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateAnalyticsSnapshot();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateAnalyticsSnapshot(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateAnalyticsSnapshot(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateAnalyticsSnapshot(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateAnalyticsSnapshot` Mutation requires an argument of type `CreateAnalyticsSnapshotVariables`:
  const createAnalyticsSnapshotVars: CreateAnalyticsSnapshotVariables = {
    environment: ..., 
    snapshotType: ..., 
    scopeType: ..., 
    scopeId: ..., // optional
    periodStart: ..., // optional
    periodEnd: ..., // optional
    status: ..., 
    totalCaPrevision: ..., // optional
    totalCaRealise: ..., // optional
    totalFacturesTtc: ..., // optional
    totalMarge: ..., // optional
    payloadPath: ..., // optional
    payloadHash: ..., // optional
    sourceWatermark: ..., // optional
    createdById: ..., // optional
  };
  mutation.mutate(createAnalyticsSnapshotVars);
  // Variables can be defined inline as well.
  mutation.mutate({ environment: ..., snapshotType: ..., scopeType: ..., scopeId: ..., periodStart: ..., periodEnd: ..., status: ..., totalCaPrevision: ..., totalCaRealise: ..., totalFacturesTtc: ..., totalMarge: ..., payloadPath: ..., payloadHash: ..., sourceWatermark: ..., createdById: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createAnalyticsSnapshotVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.analyticsSnapshot_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateRapport
You can execute the `CreateRapport` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateRapport(options?: useDataConnectMutationOptions<CreateRapportData, FirebaseError, CreateRapportVariables>): UseDataConnectMutationResult<CreateRapportData, CreateRapportVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateRapport(dc: DataConnect, options?: useDataConnectMutationOptions<CreateRapportData, FirebaseError, CreateRapportVariables>): UseDataConnectMutationResult<CreateRapportData, CreateRapportVariables>;
```

### Variables
The `CreateRapport` Mutation requires an argument of type `CreateRapportVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateRapport` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateRapport` Mutation is of type `CreateRapportData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateRapportData {
  query?: {
  };
    rapport_insert: Rapport_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateRapport`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateRapportVariables } from '@dataconnect/generated';
import { useCreateRapport } from '@dataconnect/generated/react'

export default function CreateRapportComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateRapport();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateRapport(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateRapport(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateRapport(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateRapport` Mutation requires an argument of type `CreateRapportVariables`:
  const createRapportVars: CreateRapportVariables = {
    snapshotId: ..., // optional
    authorId: ..., // optional
    clientId: ..., // optional
    chantierId: ..., // optional
    titre: ..., 
    rapportType: ..., 
    statut: ..., 
    periodeDebut: ..., // optional
    periodeFin: ..., // optional
    format: ..., // optional
    storagePath: ..., // optional
    sha256: ..., // optional
    summary: ..., // optional
    generatedAt: ..., // optional
  };
  mutation.mutate(createRapportVars);
  // Variables can be defined inline as well.
  mutation.mutate({ snapshotId: ..., authorId: ..., clientId: ..., chantierId: ..., titre: ..., rapportType: ..., statut: ..., periodeDebut: ..., periodeFin: ..., format: ..., storagePath: ..., sha256: ..., summary: ..., generatedAt: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createRapportVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.rapport_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## MarkRapportGenerated
You can execute the `MarkRapportGenerated` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useMarkRapportGenerated(options?: useDataConnectMutationOptions<MarkRapportGeneratedData, FirebaseError, MarkRapportGeneratedVariables>): UseDataConnectMutationResult<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useMarkRapportGenerated(dc: DataConnect, options?: useDataConnectMutationOptions<MarkRapportGeneratedData, FirebaseError, MarkRapportGeneratedVariables>): UseDataConnectMutationResult<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;
```

### Variables
The `MarkRapportGenerated` Mutation requires an argument of type `MarkRapportGeneratedVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface MarkRapportGeneratedVariables {
  id: UUIDString;
  statut: string;
  format?: string | null;
  storagePath?: string | null;
  sha256?: string | null;
  generatedAt?: TimestampString | null;
  summary?: string | null;
}
```
### Return Type
Recall that calling the `MarkRapportGenerated` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `MarkRapportGenerated` Mutation is of type `MarkRapportGeneratedData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface MarkRapportGeneratedData {
  query?: {
  };
    rapport_update?: Rapport_Key | null;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `MarkRapportGenerated`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, MarkRapportGeneratedVariables } from '@dataconnect/generated';
import { useMarkRapportGenerated } from '@dataconnect/generated/react'

export default function MarkRapportGeneratedComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useMarkRapportGenerated();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useMarkRapportGenerated(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useMarkRapportGenerated(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useMarkRapportGenerated(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useMarkRapportGenerated` Mutation requires an argument of type `MarkRapportGeneratedVariables`:
  const markRapportGeneratedVars: MarkRapportGeneratedVariables = {
    id: ..., 
    statut: ..., 
    format: ..., // optional
    storagePath: ..., // optional
    sha256: ..., // optional
    generatedAt: ..., // optional
    summary: ..., // optional
  };
  mutation.mutate(markRapportGeneratedVars);
  // Variables can be defined inline as well.
  mutation.mutate({ id: ..., statut: ..., format: ..., storagePath: ..., sha256: ..., generatedAt: ..., summary: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(markRapportGeneratedVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.rapport_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateAuditEvent
You can execute the `CreateAuditEvent` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateAuditEvent(options?: useDataConnectMutationOptions<CreateAuditEventData, FirebaseError, CreateAuditEventVariables>): UseDataConnectMutationResult<CreateAuditEventData, CreateAuditEventVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateAuditEvent(dc: DataConnect, options?: useDataConnectMutationOptions<CreateAuditEventData, FirebaseError, CreateAuditEventVariables>): UseDataConnectMutationResult<CreateAuditEventData, CreateAuditEventVariables>;
```

### Variables
The `CreateAuditEvent` Mutation requires an argument of type `CreateAuditEventVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateAuditEvent` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateAuditEvent` Mutation is of type `CreateAuditEventData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateAuditEventData {
  query?: {
  };
    auditEvent_insert: AuditEvent_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateAuditEvent`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateAuditEventVariables } from '@dataconnect/generated';
import { useCreateAuditEvent } from '@dataconnect/generated/react'

export default function CreateAuditEventComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateAuditEvent();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateAuditEvent(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateAuditEvent(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateAuditEvent(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateAuditEvent` Mutation requires an argument of type `CreateAuditEventVariables`:
  const createAuditEventVars: CreateAuditEventVariables = {
    environment: ..., 
    eventType: ..., 
    severity: ..., 
    entityType: ..., // optional
    entityId: ..., // optional
    action: ..., 
    status: ..., 
    actorEmail: ..., // optional
    source: ..., 
    message: ..., // optional
    evidencePath: ..., // optional
    evidenceHash: ..., // optional
  };
  mutation.mutate(createAuditEventVars);
  // Variables can be defined inline as well.
  mutation.mutate({ environment: ..., eventType: ..., severity: ..., entityType: ..., entityId: ..., action: ..., status: ..., actorEmail: ..., source: ..., message: ..., evidencePath: ..., evidenceHash: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createAuditEventVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.auditEvent_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateCheckpointRun
You can execute the `CreateCheckpointRun` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateCheckpointRun(options?: useDataConnectMutationOptions<CreateCheckpointRunData, FirebaseError, CreateCheckpointRunVariables>): UseDataConnectMutationResult<CreateCheckpointRunData, CreateCheckpointRunVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateCheckpointRun(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCheckpointRunData, FirebaseError, CreateCheckpointRunVariables>): UseDataConnectMutationResult<CreateCheckpointRunData, CreateCheckpointRunVariables>;
```

### Variables
The `CreateCheckpointRun` Mutation requires an argument of type `CreateCheckpointRunVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateCheckpointRun` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateCheckpointRun` Mutation is of type `CreateCheckpointRunData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCheckpointRunData {
  query?: {
  };
    checkpointRun_insert: CheckpointRun_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateCheckpointRun`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateCheckpointRunVariables } from '@dataconnect/generated';
import { useCreateCheckpointRun } from '@dataconnect/generated/react'

export default function CreateCheckpointRunComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateCheckpointRun();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateCheckpointRun(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointRun(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointRun(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateCheckpointRun` Mutation requires an argument of type `CreateCheckpointRunVariables`:
  const createCheckpointRunVars: CreateCheckpointRunVariables = {
    environment: ..., 
    checkpointKey: ..., 
    title: ..., 
    status: ..., 
    finishedAt: ..., // optional
    commitSha: ..., // optional
    sourceBranch: ..., // optional
    command: ..., // optional
    actorEmail: ..., // optional
    summary: ..., // optional
  };
  mutation.mutate(createCheckpointRunVars);
  // Variables can be defined inline as well.
  mutation.mutate({ environment: ..., checkpointKey: ..., title: ..., status: ..., finishedAt: ..., commitSha: ..., sourceBranch: ..., command: ..., actorEmail: ..., summary: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createCheckpointRunVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.checkpointRun_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateCheckpointStep
You can execute the `CreateCheckpointStep` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateCheckpointStep(options?: useDataConnectMutationOptions<CreateCheckpointStepData, FirebaseError, CreateCheckpointStepVariables>): UseDataConnectMutationResult<CreateCheckpointStepData, CreateCheckpointStepVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateCheckpointStep(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCheckpointStepData, FirebaseError, CreateCheckpointStepVariables>): UseDataConnectMutationResult<CreateCheckpointStepData, CreateCheckpointStepVariables>;
```

### Variables
The `CreateCheckpointStep` Mutation requires an argument of type `CreateCheckpointStepVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateCheckpointStep` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateCheckpointStep` Mutation is of type `CreateCheckpointStepData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCheckpointStepData {
  query?: {
  };
    checkpointStep_insert: CheckpointStep_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateCheckpointStep`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateCheckpointStepVariables } from '@dataconnect/generated';
import { useCreateCheckpointStep } from '@dataconnect/generated/react'

export default function CreateCheckpointStepComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateCheckpointStep();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateCheckpointStep(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointStep(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointStep(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateCheckpointStep` Mutation requires an argument of type `CreateCheckpointStepVariables`:
  const createCheckpointStepVars: CreateCheckpointStepVariables = {
    runId: ..., 
    stepKey: ..., 
    label: ..., 
    status: ..., 
    command: ..., // optional
    exitCode: ..., // optional
    durationMs: ..., // optional
    startedAt: ..., // optional
    finishedAt: ..., // optional
    logPath: ..., // optional
    logHash: ..., // optional
    message: ..., // optional
  };
  mutation.mutate(createCheckpointStepVars);
  // Variables can be defined inline as well.
  mutation.mutate({ runId: ..., stepKey: ..., label: ..., status: ..., command: ..., exitCode: ..., durationMs: ..., startedAt: ..., finishedAt: ..., logPath: ..., logHash: ..., message: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createCheckpointStepVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.checkpointStep_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateCheckpointArtifact
You can execute the `CreateCheckpointArtifact` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateCheckpointArtifact(options?: useDataConnectMutationOptions<CreateCheckpointArtifactData, FirebaseError, CreateCheckpointArtifactVariables>): UseDataConnectMutationResult<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateCheckpointArtifact(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCheckpointArtifactData, FirebaseError, CreateCheckpointArtifactVariables>): UseDataConnectMutationResult<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;
```

### Variables
The `CreateCheckpointArtifact` Mutation requires an argument of type `CreateCheckpointArtifactVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateCheckpointArtifact` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateCheckpointArtifact` Mutation is of type `CreateCheckpointArtifactData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCheckpointArtifactData {
  query?: {
  };
    checkpointArtifact_insert: CheckpointArtifact_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateCheckpointArtifact`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateCheckpointArtifactVariables } from '@dataconnect/generated';
import { useCreateCheckpointArtifact } from '@dataconnect/generated/react'

export default function CreateCheckpointArtifactComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateCheckpointArtifact();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateCheckpointArtifact(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointArtifact(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointArtifact(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateCheckpointArtifact` Mutation requires an argument of type `CreateCheckpointArtifactVariables`:
  const createCheckpointArtifactVars: CreateCheckpointArtifactVariables = {
    runId: ..., 
    stepId: ..., // optional
    artifactType: ..., 
    path: ..., 
    storagePath: ..., // optional
    sha256: ..., // optional
    sizeBytes: ..., // optional
    mimeType: ..., // optional
    description: ..., // optional
  };
  mutation.mutate(createCheckpointArtifactVars);
  // Variables can be defined inline as well.
  mutation.mutate({ runId: ..., stepId: ..., artifactType: ..., path: ..., storagePath: ..., sha256: ..., sizeBytes: ..., mimeType: ..., description: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createCheckpointArtifactVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.checkpointArtifact_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateCheckpointDecision
You can execute the `CreateCheckpointDecision` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateCheckpointDecision(options?: useDataConnectMutationOptions<CreateCheckpointDecisionData, FirebaseError, CreateCheckpointDecisionVariables>): UseDataConnectMutationResult<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateCheckpointDecision(dc: DataConnect, options?: useDataConnectMutationOptions<CreateCheckpointDecisionData, FirebaseError, CreateCheckpointDecisionVariables>): UseDataConnectMutationResult<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;
```

### Variables
The `CreateCheckpointDecision` Mutation requires an argument of type `CreateCheckpointDecisionVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface CreateCheckpointDecisionVariables {
  runId: UUIDString;
  decisionType: string;
  status: string;
  decidedByEmail?: string | null;
  decisionText: string;
  validationPhraseHash?: string | null;
}
```
### Return Type
Recall that calling the `CreateCheckpointDecision` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateCheckpointDecision` Mutation is of type `CreateCheckpointDecisionData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateCheckpointDecisionData {
  query?: {
  };
    checkpointDecision_insert: CheckpointDecision_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateCheckpointDecision`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateCheckpointDecisionVariables } from '@dataconnect/generated';
import { useCreateCheckpointDecision } from '@dataconnect/generated/react'

export default function CreateCheckpointDecisionComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateCheckpointDecision();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateCheckpointDecision(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointDecision(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateCheckpointDecision(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateCheckpointDecision` Mutation requires an argument of type `CreateCheckpointDecisionVariables`:
  const createCheckpointDecisionVars: CreateCheckpointDecisionVariables = {
    runId: ..., 
    decisionType: ..., 
    status: ..., 
    decidedByEmail: ..., // optional
    decisionText: ..., 
    validationPhraseHash: ..., // optional
  };
  mutation.mutate(createCheckpointDecisionVars);
  // Variables can be defined inline as well.
  mutation.mutate({ runId: ..., decisionType: ..., status: ..., decidedByEmail: ..., decisionText: ..., validationPhraseHash: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createCheckpointDecisionVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.checkpointDecision_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateDataImportRun
You can execute the `CreateDataImportRun` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateDataImportRun(options?: useDataConnectMutationOptions<CreateDataImportRunData, FirebaseError, CreateDataImportRunVariables>): UseDataConnectMutationResult<CreateDataImportRunData, CreateDataImportRunVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateDataImportRun(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDataImportRunData, FirebaseError, CreateDataImportRunVariables>): UseDataConnectMutationResult<CreateDataImportRunData, CreateDataImportRunVariables>;
```

### Variables
The `CreateDataImportRun` Mutation requires an argument of type `CreateDataImportRunVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateDataImportRun` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateDataImportRun` Mutation is of type `CreateDataImportRunData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateDataImportRunData {
  query?: {
  };
    dataImportRun_insert: DataImportRun_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateDataImportRun`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateDataImportRunVariables } from '@dataconnect/generated';
import { useCreateDataImportRun } from '@dataconnect/generated/react'

export default function CreateDataImportRunComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateDataImportRun();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateDataImportRun(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDataImportRun(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDataImportRun(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateDataImportRun` Mutation requires an argument of type `CreateDataImportRunVariables`:
  const createDataImportRunVars: CreateDataImportRunVariables = {
    environment: ..., 
    importKind: ..., 
    sourceName: ..., 
    sourcePath: ..., // optional
    sourceHash: ..., // optional
    status: ..., 
    finishedAt: ..., // optional
    rowCount: ..., // optional
    insertedCount: ..., // optional
    updatedCount: ..., // optional
    skippedCount: ..., // optional
    artifactPath: ..., // optional
    artifactHash: ..., // optional
    actorEmail: ..., // optional
    notes: ..., // optional
    previsionnelBatchId: ..., // optional
  };
  mutation.mutate(createDataImportRunVars);
  // Variables can be defined inline as well.
  mutation.mutate({ environment: ..., importKind: ..., sourceName: ..., sourcePath: ..., sourceHash: ..., status: ..., finishedAt: ..., rowCount: ..., insertedCount: ..., updatedCount: ..., skippedCount: ..., artifactPath: ..., artifactHash: ..., actorEmail: ..., notes: ..., previsionnelBatchId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createDataImportRunVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.dataImportRun_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateDataImportIssue
You can execute the `CreateDataImportIssue` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateDataImportIssue(options?: useDataConnectMutationOptions<CreateDataImportIssueData, FirebaseError, CreateDataImportIssueVariables>): UseDataConnectMutationResult<CreateDataImportIssueData, CreateDataImportIssueVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateDataImportIssue(dc: DataConnect, options?: useDataConnectMutationOptions<CreateDataImportIssueData, FirebaseError, CreateDataImportIssueVariables>): UseDataConnectMutationResult<CreateDataImportIssueData, CreateDataImportIssueVariables>;
```

### Variables
The `CreateDataImportIssue` Mutation requires an argument of type `CreateDataImportIssueVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateDataImportIssue` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateDataImportIssue` Mutation is of type `CreateDataImportIssueData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateDataImportIssueData {
  query?: {
  };
    dataImportIssue_insert: DataImportIssue_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateDataImportIssue`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateDataImportIssueVariables } from '@dataconnect/generated';
import { useCreateDataImportIssue } from '@dataconnect/generated/react'

export default function CreateDataImportIssueComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateDataImportIssue();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateDataImportIssue(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDataImportIssue(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateDataImportIssue(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateDataImportIssue` Mutation requires an argument of type `CreateDataImportIssueVariables`:
  const createDataImportIssueVars: CreateDataImportIssueVariables = {
    runId: ..., 
    severity: ..., 
    code: ..., 
    entityType: ..., // optional
    entityKey: ..., // optional
    sourceSheet: ..., // optional
    sourceRow: ..., // optional
    message: ..., 
    resolutionStatus: ..., 
  };
  mutation.mutate(createDataImportIssueVars);
  // Variables can be defined inline as well.
  mutation.mutate({ runId: ..., severity: ..., code: ..., entityType: ..., entityKey: ..., sourceSheet: ..., sourceRow: ..., message: ..., resolutionStatus: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createDataImportIssueVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.dataImportIssue_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

## CreateEntityChangeLog
You can execute the `CreateEntityChangeLog` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useCreateEntityChangeLog(options?: useDataConnectMutationOptions<CreateEntityChangeLogData, FirebaseError, CreateEntityChangeLogVariables>): UseDataConnectMutationResult<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useCreateEntityChangeLog(dc: DataConnect, options?: useDataConnectMutationOptions<CreateEntityChangeLogData, FirebaseError, CreateEntityChangeLogVariables>): UseDataConnectMutationResult<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;
```

### Variables
The `CreateEntityChangeLog` Mutation requires an argument of type `CreateEntityChangeLogVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
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
```
### Return Type
Recall that calling the `CreateEntityChangeLog` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `CreateEntityChangeLog` Mutation is of type `CreateEntityChangeLogData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface CreateEntityChangeLogData {
  query?: {
  };
    entityChangeLog_insert: EntityChangeLog_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `CreateEntityChangeLog`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, CreateEntityChangeLogVariables } from '@dataconnect/generated';
import { useCreateEntityChangeLog } from '@dataconnect/generated/react'

export default function CreateEntityChangeLogComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useCreateEntityChangeLog();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useCreateEntityChangeLog(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEntityChangeLog(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useCreateEntityChangeLog(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useCreateEntityChangeLog` Mutation requires an argument of type `CreateEntityChangeLogVariables`:
  const createEntityChangeLogVars: CreateEntityChangeLogVariables = {
    environment: ..., 
    entityType: ..., 
    entityId: ..., 
    action: ..., 
    source: ..., 
    actorEmail: ..., // optional
    beforeHash: ..., // optional
    afterHash: ..., // optional
    reason: ..., // optional
    auditEventId: ..., // optional
    checkpointRunId: ..., // optional
    dataImportRunId: ..., // optional
  };
  mutation.mutate(createEntityChangeLogVars);
  // Variables can be defined inline as well.
  mutation.mutate({ environment: ..., entityType: ..., entityId: ..., action: ..., source: ..., actorEmail: ..., beforeHash: ..., afterHash: ..., reason: ..., auditEventId: ..., checkpointRunId: ..., dataImportRunId: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(createEntityChangeLogVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.query);
    console.log(mutation.data.entityChangeLog_insert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

