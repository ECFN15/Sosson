# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `sosson`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

**If you're looking for the `React README`, you can find it at [`dataconnect-generated/react/README.md`](./react/README.md)**

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
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

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `sosson`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `sosson` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetCurrentUser
You can execute the `GetCurrentUser` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUser(options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUser(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetCurrentUserData, undefined>;

interface GetCurrentUserRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserData, undefined>;
}
export const getCurrentUserRef: GetCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserRef:
```typescript
const name = getCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUser` query has no variables.
### Return Type
Recall that executing the `GetCurrentUser` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUser } from '@dataconnect/generated';


// Call the `getCurrentUser()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUser();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUser(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUser().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUser`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserRef } from '@dataconnect/generated';


// Call the `getCurrentUserRef()` function to get a reference to the query.
const ref = getCurrentUserRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

## ListUsers
You can execute the `ListUsers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUsers(options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUsers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUsersData, undefined>;

interface ListUsersRef {
  ...
  (dc: DataConnect): QueryRef<ListUsersData, undefined>;
}
export const listUsersRef: ListUsersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUsersRef:
```typescript
const name = listUsersRef.operationName;
console.log(name);
```

### Variables
The `ListUsers` query has no variables.
### Return Type
Recall that executing the `ListUsers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUsersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListUsers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUsers } from '@dataconnect/generated';


// Call the `listUsers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUsers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUsers(dataConnect);

console.log(data.users);

// Or, you can use the `Promise` API.
listUsers().then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

### Using `ListUsers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUsersRef } from '@dataconnect/generated';


// Call the `listUsersRef()` function to get a reference to the query.
const ref = listUsersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUsersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
});
```

## ListOperationalClients
You can execute the `ListOperationalClients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listOperationalClients(options?: ExecuteQueryOptions): QueryPromise<ListOperationalClientsData, undefined>;

interface ListOperationalClientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOperationalClientsData, undefined>;
}
export const listOperationalClientsRef: ListOperationalClientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOperationalClients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListOperationalClientsData, undefined>;

interface ListOperationalClientsRef {
  ...
  (dc: DataConnect): QueryRef<ListOperationalClientsData, undefined>;
}
export const listOperationalClientsRef: ListOperationalClientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOperationalClientsRef:
```typescript
const name = listOperationalClientsRef.operationName;
console.log(name);
```

### Variables
The `ListOperationalClients` query has no variables.
### Return Type
Recall that executing the `ListOperationalClients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOperationalClientsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListOperationalClients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOperationalClients } from '@dataconnect/generated';


// Call the `listOperationalClients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOperationalClients();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOperationalClients(dataConnect);

console.log(data.clients);

// Or, you can use the `Promise` API.
listOperationalClients().then((response) => {
  const data = response.data;
  console.log(data.clients);
});
```

### Using `ListOperationalClients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOperationalClientsRef } from '@dataconnect/generated';


// Call the `listOperationalClientsRef()` function to get a reference to the query.
const ref = listOperationalClientsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOperationalClientsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.clients);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.clients);
});
```

## GetClient
You can execute the `GetClient` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getClient(vars: GetClientVariables, options?: ExecuteQueryOptions): QueryPromise<GetClientData, GetClientVariables>;

interface GetClientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetClientVariables): QueryRef<GetClientData, GetClientVariables>;
}
export const getClientRef: GetClientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getClient(dc: DataConnect, vars: GetClientVariables, options?: ExecuteQueryOptions): QueryPromise<GetClientData, GetClientVariables>;

interface GetClientRef {
  ...
  (dc: DataConnect, vars: GetClientVariables): QueryRef<GetClientData, GetClientVariables>;
}
export const getClientRef: GetClientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getClientRef:
```typescript
const name = getClientRef.operationName;
console.log(name);
```

### Variables
The `GetClient` query requires an argument of type `GetClientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetClientVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetClient` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetClientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetClient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getClient, GetClientVariables } from '@dataconnect/generated';

// The `GetClient` query requires an argument of type `GetClientVariables`:
const getClientVars: GetClientVariables = {
  id: ..., 
};

// Call the `getClient()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getClient(getClientVars);
// Variables can be defined inline as well.
const { data } = await getClient({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getClient(dataConnect, getClientVars);

console.log(data.client);

// Or, you can use the `Promise` API.
getClient(getClientVars).then((response) => {
  const data = response.data;
  console.log(data.client);
});
```

### Using `GetClient`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getClientRef, GetClientVariables } from '@dataconnect/generated';

// The `GetClient` query requires an argument of type `GetClientVariables`:
const getClientVars: GetClientVariables = {
  id: ..., 
};

// Call the `getClientRef()` function to get a reference to the query.
const ref = getClientRef(getClientVars);
// Variables can be defined inline as well.
const ref = getClientRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getClientRef(dataConnect, getClientVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.client);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.client);
});
```

## ListOperationalChantiers
You can execute the `ListOperationalChantiers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listOperationalChantiers(options?: ExecuteQueryOptions): QueryPromise<ListOperationalChantiersData, undefined>;

interface ListOperationalChantiersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListOperationalChantiersData, undefined>;
}
export const listOperationalChantiersRef: ListOperationalChantiersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listOperationalChantiers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListOperationalChantiersData, undefined>;

interface ListOperationalChantiersRef {
  ...
  (dc: DataConnect): QueryRef<ListOperationalChantiersData, undefined>;
}
export const listOperationalChantiersRef: ListOperationalChantiersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listOperationalChantiersRef:
```typescript
const name = listOperationalChantiersRef.operationName;
console.log(name);
```

### Variables
The `ListOperationalChantiers` query has no variables.
### Return Type
Recall that executing the `ListOperationalChantiers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListOperationalChantiersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListOperationalChantiers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listOperationalChantiers } from '@dataconnect/generated';


// Call the `listOperationalChantiers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listOperationalChantiers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listOperationalChantiers(dataConnect);

console.log(data.chantiers);

// Or, you can use the `Promise` API.
listOperationalChantiers().then((response) => {
  const data = response.data;
  console.log(data.chantiers);
});
```

### Using `ListOperationalChantiers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listOperationalChantiersRef } from '@dataconnect/generated';


// Call the `listOperationalChantiersRef()` function to get a reference to the query.
const ref = listOperationalChantiersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listOperationalChantiersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chantiers);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chantiers);
});
```

## GetChantier
You can execute the `GetChantier` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getChantier(vars: GetChantierVariables, options?: ExecuteQueryOptions): QueryPromise<GetChantierData, GetChantierVariables>;

interface GetChantierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetChantierVariables): QueryRef<GetChantierData, GetChantierVariables>;
}
export const getChantierRef: GetChantierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getChantier(dc: DataConnect, vars: GetChantierVariables, options?: ExecuteQueryOptions): QueryPromise<GetChantierData, GetChantierVariables>;

interface GetChantierRef {
  ...
  (dc: DataConnect, vars: GetChantierVariables): QueryRef<GetChantierData, GetChantierVariables>;
}
export const getChantierRef: GetChantierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getChantierRef:
```typescript
const name = getChantierRef.operationName;
console.log(name);
```

### Variables
The `GetChantier` query requires an argument of type `GetChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetChantierVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetChantier` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetChantierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetChantier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getChantier, GetChantierVariables } from '@dataconnect/generated';

// The `GetChantier` query requires an argument of type `GetChantierVariables`:
const getChantierVars: GetChantierVariables = {
  id: ..., 
};

// Call the `getChantier()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getChantier(getChantierVars);
// Variables can be defined inline as well.
const { data } = await getChantier({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getChantier(dataConnect, getChantierVars);

console.log(data.chantier);

// Or, you can use the `Promise` API.
getChantier(getChantierVars).then((response) => {
  const data = response.data;
  console.log(data.chantier);
});
```

### Using `GetChantier`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getChantierRef, GetChantierVariables } from '@dataconnect/generated';

// The `GetChantier` query requires an argument of type `GetChantierVariables`:
const getChantierVars: GetChantierVariables = {
  id: ..., 
};

// Call the `getChantierRef()` function to get a reference to the query.
const ref = getChantierRef(getChantierVars);
// Variables can be defined inline as well.
const ref = getChantierRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getChantierRef(dataConnect, getChantierVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.chantier);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.chantier);
});
```

## ListFactures
You can execute the `ListFactures` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listFactures(options?: ExecuteQueryOptions): QueryPromise<ListFacturesData, undefined>;

interface ListFacturesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListFacturesData, undefined>;
}
export const listFacturesRef: ListFacturesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listFactures(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListFacturesData, undefined>;

interface ListFacturesRef {
  ...
  (dc: DataConnect): QueryRef<ListFacturesData, undefined>;
}
export const listFacturesRef: ListFacturesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listFacturesRef:
```typescript
const name = listFacturesRef.operationName;
console.log(name);
```

### Variables
The `ListFactures` query has no variables.
### Return Type
Recall that executing the `ListFactures` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListFacturesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListFactures`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listFactures } from '@dataconnect/generated';


// Call the `listFactures()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listFactures();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listFactures(dataConnect);

console.log(data.factures);

// Or, you can use the `Promise` API.
listFactures().then((response) => {
  const data = response.data;
  console.log(data.factures);
});
```

### Using `ListFactures`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listFacturesRef } from '@dataconnect/generated';


// Call the `listFacturesRef()` function to get a reference to the query.
const ref = listFacturesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listFacturesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.factures);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.factures);
});
```

## ListFacturesByStatut
You can execute the `ListFacturesByStatut` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listFacturesByStatut(vars: ListFacturesByStatutVariables, options?: ExecuteQueryOptions): QueryPromise<ListFacturesByStatutData, ListFacturesByStatutVariables>;

interface ListFacturesByStatutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListFacturesByStatutVariables): QueryRef<ListFacturesByStatutData, ListFacturesByStatutVariables>;
}
export const listFacturesByStatutRef: ListFacturesByStatutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listFacturesByStatut(dc: DataConnect, vars: ListFacturesByStatutVariables, options?: ExecuteQueryOptions): QueryPromise<ListFacturesByStatutData, ListFacturesByStatutVariables>;

interface ListFacturesByStatutRef {
  ...
  (dc: DataConnect, vars: ListFacturesByStatutVariables): QueryRef<ListFacturesByStatutData, ListFacturesByStatutVariables>;
}
export const listFacturesByStatutRef: ListFacturesByStatutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listFacturesByStatutRef:
```typescript
const name = listFacturesByStatutRef.operationName;
console.log(name);
```

### Variables
The `ListFacturesByStatut` query requires an argument of type `ListFacturesByStatutVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListFacturesByStatutVariables {
  statut: string;
}
```
### Return Type
Recall that executing the `ListFacturesByStatut` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListFacturesByStatutData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListFacturesByStatut`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listFacturesByStatut, ListFacturesByStatutVariables } from '@dataconnect/generated';

// The `ListFacturesByStatut` query requires an argument of type `ListFacturesByStatutVariables`:
const listFacturesByStatutVars: ListFacturesByStatutVariables = {
  statut: ..., 
};

// Call the `listFacturesByStatut()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listFacturesByStatut(listFacturesByStatutVars);
// Variables can be defined inline as well.
const { data } = await listFacturesByStatut({ statut: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listFacturesByStatut(dataConnect, listFacturesByStatutVars);

console.log(data.factures);

// Or, you can use the `Promise` API.
listFacturesByStatut(listFacturesByStatutVars).then((response) => {
  const data = response.data;
  console.log(data.factures);
});
```

### Using `ListFacturesByStatut`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listFacturesByStatutRef, ListFacturesByStatutVariables } from '@dataconnect/generated';

// The `ListFacturesByStatut` query requires an argument of type `ListFacturesByStatutVariables`:
const listFacturesByStatutVars: ListFacturesByStatutVariables = {
  statut: ..., 
};

// Call the `listFacturesByStatutRef()` function to get a reference to the query.
const ref = listFacturesByStatutRef(listFacturesByStatutVars);
// Variables can be defined inline as well.
const ref = listFacturesByStatutRef({ statut: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listFacturesByStatutRef(dataConnect, listFacturesByStatutVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.factures);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.factures);
});
```

## ListDocumentFolders
You can execute the `ListDocumentFolders` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDocumentFolders(options?: ExecuteQueryOptions): QueryPromise<ListDocumentFoldersData, undefined>;

interface ListDocumentFoldersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDocumentFoldersData, undefined>;
}
export const listDocumentFoldersRef: ListDocumentFoldersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDocumentFolders(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListDocumentFoldersData, undefined>;

interface ListDocumentFoldersRef {
  ...
  (dc: DataConnect): QueryRef<ListDocumentFoldersData, undefined>;
}
export const listDocumentFoldersRef: ListDocumentFoldersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDocumentFoldersRef:
```typescript
const name = listDocumentFoldersRef.operationName;
console.log(name);
```

### Variables
The `ListDocumentFolders` query has no variables.
### Return Type
Recall that executing the `ListDocumentFolders` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDocumentFoldersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListDocumentFolders`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDocumentFolders } from '@dataconnect/generated';


// Call the `listDocumentFolders()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDocumentFolders();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDocumentFolders(dataConnect);

console.log(data.documentFolders);

// Or, you can use the `Promise` API.
listDocumentFolders().then((response) => {
  const data = response.data;
  console.log(data.documentFolders);
});
```

### Using `ListDocumentFolders`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDocumentFoldersRef } from '@dataconnect/generated';


// Call the `listDocumentFoldersRef()` function to get a reference to the query.
const ref = listDocumentFoldersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDocumentFoldersRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.documentFolders);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.documentFolders);
});
```

## ListDocumentsAttaches
You can execute the `ListDocumentsAttaches` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDocumentsAttaches(options?: ExecuteQueryOptions): QueryPromise<ListDocumentsAttachesData, undefined>;

interface ListDocumentsAttachesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListDocumentsAttachesData, undefined>;
}
export const listDocumentsAttachesRef: ListDocumentsAttachesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDocumentsAttaches(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListDocumentsAttachesData, undefined>;

interface ListDocumentsAttachesRef {
  ...
  (dc: DataConnect): QueryRef<ListDocumentsAttachesData, undefined>;
}
export const listDocumentsAttachesRef: ListDocumentsAttachesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDocumentsAttachesRef:
```typescript
const name = listDocumentsAttachesRef.operationName;
console.log(name);
```

### Variables
The `ListDocumentsAttaches` query has no variables.
### Return Type
Recall that executing the `ListDocumentsAttaches` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDocumentsAttachesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListDocumentsAttaches`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDocumentsAttaches } from '@dataconnect/generated';


// Call the `listDocumentsAttaches()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDocumentsAttaches();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDocumentsAttaches(dataConnect);

console.log(data.documentAttaches);

// Or, you can use the `Promise` API.
listDocumentsAttaches().then((response) => {
  const data = response.data;
  console.log(data.documentAttaches);
});
```

### Using `ListDocumentsAttaches`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDocumentsAttachesRef } from '@dataconnect/generated';


// Call the `listDocumentsAttachesRef()` function to get a reference to the query.
const ref = listDocumentsAttachesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDocumentsAttachesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.documentAttaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.documentAttaches);
});
```

## ListDocumentsByChantier
You can execute the `ListDocumentsByChantier` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDocumentsByChantier(vars: ListDocumentsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;

interface ListDocumentsByChantierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDocumentsByChantierVariables): QueryRef<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;
}
export const listDocumentsByChantierRef: ListDocumentsByChantierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDocumentsByChantier(dc: DataConnect, vars: ListDocumentsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;

interface ListDocumentsByChantierRef {
  ...
  (dc: DataConnect, vars: ListDocumentsByChantierVariables): QueryRef<ListDocumentsByChantierData, ListDocumentsByChantierVariables>;
}
export const listDocumentsByChantierRef: ListDocumentsByChantierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDocumentsByChantierRef:
```typescript
const name = listDocumentsByChantierRef.operationName;
console.log(name);
```

### Variables
The `ListDocumentsByChantier` query requires an argument of type `ListDocumentsByChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListDocumentsByChantierVariables {
  chantierId: UUIDString;
}
```
### Return Type
Recall that executing the `ListDocumentsByChantier` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDocumentsByChantierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListDocumentsByChantier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDocumentsByChantier, ListDocumentsByChantierVariables } from '@dataconnect/generated';

// The `ListDocumentsByChantier` query requires an argument of type `ListDocumentsByChantierVariables`:
const listDocumentsByChantierVars: ListDocumentsByChantierVariables = {
  chantierId: ..., 
};

// Call the `listDocumentsByChantier()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDocumentsByChantier(listDocumentsByChantierVars);
// Variables can be defined inline as well.
const { data } = await listDocumentsByChantier({ chantierId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDocumentsByChantier(dataConnect, listDocumentsByChantierVars);

console.log(data.documentAttaches);

// Or, you can use the `Promise` API.
listDocumentsByChantier(listDocumentsByChantierVars).then((response) => {
  const data = response.data;
  console.log(data.documentAttaches);
});
```

### Using `ListDocumentsByChantier`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDocumentsByChantierRef, ListDocumentsByChantierVariables } from '@dataconnect/generated';

// The `ListDocumentsByChantier` query requires an argument of type `ListDocumentsByChantierVariables`:
const listDocumentsByChantierVars: ListDocumentsByChantierVariables = {
  chantierId: ..., 
};

// Call the `listDocumentsByChantierRef()` function to get a reference to the query.
const ref = listDocumentsByChantierRef(listDocumentsByChantierVars);
// Variables can be defined inline as well.
const ref = listDocumentsByChantierRef({ chantierId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDocumentsByChantierRef(dataConnect, listDocumentsByChantierVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.documentAttaches);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.documentAttaches);
});
```

## ListPrevisionnelExercises
You can execute the `ListPrevisionnelExercises` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPrevisionnelExercises(options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelExercisesData, undefined>;

interface ListPrevisionnelExercisesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListPrevisionnelExercisesData, undefined>;
}
export const listPrevisionnelExercisesRef: ListPrevisionnelExercisesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPrevisionnelExercises(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelExercisesData, undefined>;

interface ListPrevisionnelExercisesRef {
  ...
  (dc: DataConnect): QueryRef<ListPrevisionnelExercisesData, undefined>;
}
export const listPrevisionnelExercisesRef: ListPrevisionnelExercisesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPrevisionnelExercisesRef:
```typescript
const name = listPrevisionnelExercisesRef.operationName;
console.log(name);
```

### Variables
The `ListPrevisionnelExercises` query has no variables.
### Return Type
Recall that executing the `ListPrevisionnelExercises` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPrevisionnelExercisesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListPrevisionnelExercises`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPrevisionnelExercises } from '@dataconnect/generated';


// Call the `listPrevisionnelExercises()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPrevisionnelExercises();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPrevisionnelExercises(dataConnect);

console.log(data.previsionnelExercises);

// Or, you can use the `Promise` API.
listPrevisionnelExercises().then((response) => {
  const data = response.data;
  console.log(data.previsionnelExercises);
});
```

### Using `ListPrevisionnelExercises`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPrevisionnelExercisesRef } from '@dataconnect/generated';


// Call the `listPrevisionnelExercisesRef()` function to get a reference to the query.
const ref = listPrevisionnelExercisesRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPrevisionnelExercisesRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.previsionnelExercises);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.previsionnelExercises);
});
```

## ListPrevisionnelLinesByExercise
You can execute the `ListPrevisionnelLinesByExercise` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPrevisionnelLinesByExercise(vars: ListPrevisionnelLinesByExerciseVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;

interface ListPrevisionnelLinesByExerciseRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPrevisionnelLinesByExerciseVariables): QueryRef<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;
}
export const listPrevisionnelLinesByExerciseRef: ListPrevisionnelLinesByExerciseRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPrevisionnelLinesByExercise(dc: DataConnect, vars: ListPrevisionnelLinesByExerciseVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;

interface ListPrevisionnelLinesByExerciseRef {
  ...
  (dc: DataConnect, vars: ListPrevisionnelLinesByExerciseVariables): QueryRef<ListPrevisionnelLinesByExerciseData, ListPrevisionnelLinesByExerciseVariables>;
}
export const listPrevisionnelLinesByExerciseRef: ListPrevisionnelLinesByExerciseRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPrevisionnelLinesByExerciseRef:
```typescript
const name = listPrevisionnelLinesByExerciseRef.operationName;
console.log(name);
```

### Variables
The `ListPrevisionnelLinesByExercise` query requires an argument of type `ListPrevisionnelLinesByExerciseVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPrevisionnelLinesByExerciseVariables {
  exerciseId: UUIDString;
}
```
### Return Type
Recall that executing the `ListPrevisionnelLinesByExercise` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPrevisionnelLinesByExerciseData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListPrevisionnelLinesByExercise`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPrevisionnelLinesByExercise, ListPrevisionnelLinesByExerciseVariables } from '@dataconnect/generated';

// The `ListPrevisionnelLinesByExercise` query requires an argument of type `ListPrevisionnelLinesByExerciseVariables`:
const listPrevisionnelLinesByExerciseVars: ListPrevisionnelLinesByExerciseVariables = {
  exerciseId: ..., 
};

// Call the `listPrevisionnelLinesByExercise()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPrevisionnelLinesByExercise(listPrevisionnelLinesByExerciseVars);
// Variables can be defined inline as well.
const { data } = await listPrevisionnelLinesByExercise({ exerciseId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPrevisionnelLinesByExercise(dataConnect, listPrevisionnelLinesByExerciseVars);

console.log(data.previsionnelLines);

// Or, you can use the `Promise` API.
listPrevisionnelLinesByExercise(listPrevisionnelLinesByExerciseVars).then((response) => {
  const data = response.data;
  console.log(data.previsionnelLines);
});
```

### Using `ListPrevisionnelLinesByExercise`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPrevisionnelLinesByExerciseRef, ListPrevisionnelLinesByExerciseVariables } from '@dataconnect/generated';

// The `ListPrevisionnelLinesByExercise` query requires an argument of type `ListPrevisionnelLinesByExerciseVariables`:
const listPrevisionnelLinesByExerciseVars: ListPrevisionnelLinesByExerciseVariables = {
  exerciseId: ..., 
};

// Call the `listPrevisionnelLinesByExerciseRef()` function to get a reference to the query.
const ref = listPrevisionnelLinesByExerciseRef(listPrevisionnelLinesByExerciseVars);
// Variables can be defined inline as well.
const ref = listPrevisionnelLinesByExerciseRef({ exerciseId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPrevisionnelLinesByExerciseRef(dataConnect, listPrevisionnelLinesByExerciseVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.previsionnelLines);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.previsionnelLines);
});
```

## SearchClientAliases
You can execute the `SearchClientAliases` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
searchClientAliases(vars: SearchClientAliasesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchClientAliasesData, SearchClientAliasesVariables>;

interface SearchClientAliasesRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SearchClientAliasesVariables): QueryRef<SearchClientAliasesData, SearchClientAliasesVariables>;
}
export const searchClientAliasesRef: SearchClientAliasesRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
searchClientAliases(dc: DataConnect, vars: SearchClientAliasesVariables, options?: ExecuteQueryOptions): QueryPromise<SearchClientAliasesData, SearchClientAliasesVariables>;

interface SearchClientAliasesRef {
  ...
  (dc: DataConnect, vars: SearchClientAliasesVariables): QueryRef<SearchClientAliasesData, SearchClientAliasesVariables>;
}
export const searchClientAliasesRef: SearchClientAliasesRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the searchClientAliasesRef:
```typescript
const name = searchClientAliasesRef.operationName;
console.log(name);
```

### Variables
The `SearchClientAliases` query requires an argument of type `SearchClientAliasesVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SearchClientAliasesVariables {
  normalizedKey: string;
}
```
### Return Type
Recall that executing the `SearchClientAliases` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SearchClientAliasesData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `SearchClientAliases`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, searchClientAliases, SearchClientAliasesVariables } from '@dataconnect/generated';

// The `SearchClientAliases` query requires an argument of type `SearchClientAliasesVariables`:
const searchClientAliasesVars: SearchClientAliasesVariables = {
  normalizedKey: ..., 
};

// Call the `searchClientAliases()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await searchClientAliases(searchClientAliasesVars);
// Variables can be defined inline as well.
const { data } = await searchClientAliases({ normalizedKey: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await searchClientAliases(dataConnect, searchClientAliasesVars);

console.log(data.clientAliases);

// Or, you can use the `Promise` API.
searchClientAliases(searchClientAliasesVars).then((response) => {
  const data = response.data;
  console.log(data.clientAliases);
});
```

### Using `SearchClientAliases`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, searchClientAliasesRef, SearchClientAliasesVariables } from '@dataconnect/generated';

// The `SearchClientAliases` query requires an argument of type `SearchClientAliasesVariables`:
const searchClientAliasesVars: SearchClientAliasesVariables = {
  normalizedKey: ..., 
};

// Call the `searchClientAliasesRef()` function to get a reference to the query.
const ref = searchClientAliasesRef(searchClientAliasesVars);
// Variables can be defined inline as well.
const ref = searchClientAliasesRef({ normalizedKey: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = searchClientAliasesRef(dataConnect, searchClientAliasesVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.clientAliases);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.clientAliases);
});
```

## ListPrevisionnelCellEdits
You can execute the `ListPrevisionnelCellEdits` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPrevisionnelCellEdits(vars: ListPrevisionnelCellEditsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;

interface ListPrevisionnelCellEditsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPrevisionnelCellEditsVariables): QueryRef<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;
}
export const listPrevisionnelCellEditsRef: ListPrevisionnelCellEditsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPrevisionnelCellEdits(dc: DataConnect, vars: ListPrevisionnelCellEditsVariables, options?: ExecuteQueryOptions): QueryPromise<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;

interface ListPrevisionnelCellEditsRef {
  ...
  (dc: DataConnect, vars: ListPrevisionnelCellEditsVariables): QueryRef<ListPrevisionnelCellEditsData, ListPrevisionnelCellEditsVariables>;
}
export const listPrevisionnelCellEditsRef: ListPrevisionnelCellEditsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPrevisionnelCellEditsRef:
```typescript
const name = listPrevisionnelCellEditsRef.operationName;
console.log(name);
```

### Variables
The `ListPrevisionnelCellEdits` query requires an argument of type `ListPrevisionnelCellEditsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPrevisionnelCellEditsVariables {
  sourceSheet: string;
}
```
### Return Type
Recall that executing the `ListPrevisionnelCellEdits` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPrevisionnelCellEditsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListPrevisionnelCellEdits`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPrevisionnelCellEdits, ListPrevisionnelCellEditsVariables } from '@dataconnect/generated';

// The `ListPrevisionnelCellEdits` query requires an argument of type `ListPrevisionnelCellEditsVariables`:
const listPrevisionnelCellEditsVars: ListPrevisionnelCellEditsVariables = {
  sourceSheet: ..., 
};

// Call the `listPrevisionnelCellEdits()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPrevisionnelCellEdits(listPrevisionnelCellEditsVars);
// Variables can be defined inline as well.
const { data } = await listPrevisionnelCellEdits({ sourceSheet: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPrevisionnelCellEdits(dataConnect, listPrevisionnelCellEditsVars);

console.log(data.previsionnelCellEdits);

// Or, you can use the `Promise` API.
listPrevisionnelCellEdits(listPrevisionnelCellEditsVars).then((response) => {
  const data = response.data;
  console.log(data.previsionnelCellEdits);
});
```

### Using `ListPrevisionnelCellEdits`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPrevisionnelCellEditsRef, ListPrevisionnelCellEditsVariables } from '@dataconnect/generated';

// The `ListPrevisionnelCellEdits` query requires an argument of type `ListPrevisionnelCellEditsVariables`:
const listPrevisionnelCellEditsVars: ListPrevisionnelCellEditsVariables = {
  sourceSheet: ..., 
};

// Call the `listPrevisionnelCellEditsRef()` function to get a reference to the query.
const ref = listPrevisionnelCellEditsRef(listPrevisionnelCellEditsVars);
// Variables can be defined inline as well.
const ref = listPrevisionnelCellEditsRef({ sourceSheet: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPrevisionnelCellEditsRef(dataConnect, listPrevisionnelCellEditsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.previsionnelCellEdits);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.previsionnelCellEdits);
});
```

## ListEmailThreads
You can execute the `ListEmailThreads` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listEmailThreads(options?: ExecuteQueryOptions): QueryPromise<ListEmailThreadsData, undefined>;

interface ListEmailThreadsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListEmailThreadsData, undefined>;
}
export const listEmailThreadsRef: ListEmailThreadsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listEmailThreads(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListEmailThreadsData, undefined>;

interface ListEmailThreadsRef {
  ...
  (dc: DataConnect): QueryRef<ListEmailThreadsData, undefined>;
}
export const listEmailThreadsRef: ListEmailThreadsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listEmailThreadsRef:
```typescript
const name = listEmailThreadsRef.operationName;
console.log(name);
```

### Variables
The `ListEmailThreads` query has no variables.
### Return Type
Recall that executing the `ListEmailThreads` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListEmailThreadsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListEmailThreads`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listEmailThreads } from '@dataconnect/generated';


// Call the `listEmailThreads()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listEmailThreads();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listEmailThreads(dataConnect);

console.log(data.emailThreads);

// Or, you can use the `Promise` API.
listEmailThreads().then((response) => {
  const data = response.data;
  console.log(data.emailThreads);
});
```

### Using `ListEmailThreads`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listEmailThreadsRef } from '@dataconnect/generated';


// Call the `listEmailThreadsRef()` function to get a reference to the query.
const ref = listEmailThreadsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listEmailThreadsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.emailThreads);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.emailThreads);
});
```

## ListUnreadEmailThreads
You can execute the `ListUnreadEmailThreads` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listUnreadEmailThreads(options?: ExecuteQueryOptions): QueryPromise<ListUnreadEmailThreadsData, undefined>;

interface ListUnreadEmailThreadsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListUnreadEmailThreadsData, undefined>;
}
export const listUnreadEmailThreadsRef: ListUnreadEmailThreadsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listUnreadEmailThreads(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListUnreadEmailThreadsData, undefined>;

interface ListUnreadEmailThreadsRef {
  ...
  (dc: DataConnect): QueryRef<ListUnreadEmailThreadsData, undefined>;
}
export const listUnreadEmailThreadsRef: ListUnreadEmailThreadsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listUnreadEmailThreadsRef:
```typescript
const name = listUnreadEmailThreadsRef.operationName;
console.log(name);
```

### Variables
The `ListUnreadEmailThreads` query has no variables.
### Return Type
Recall that executing the `ListUnreadEmailThreads` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListUnreadEmailThreadsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListUnreadEmailThreads`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listUnreadEmailThreads } from '@dataconnect/generated';


// Call the `listUnreadEmailThreads()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listUnreadEmailThreads();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listUnreadEmailThreads(dataConnect);

console.log(data.emailThreads);

// Or, you can use the `Promise` API.
listUnreadEmailThreads().then((response) => {
  const data = response.data;
  console.log(data.emailThreads);
});
```

### Using `ListUnreadEmailThreads`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listUnreadEmailThreadsRef } from '@dataconnect/generated';


// Call the `listUnreadEmailThreadsRef()` function to get a reference to the query.
const ref = listUnreadEmailThreadsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listUnreadEmailThreadsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.emailThreads);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.emailThreads);
});
```

## GetEmailThread
You can execute the `GetEmailThread` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getEmailThread(vars: GetEmailThreadVariables, options?: ExecuteQueryOptions): QueryPromise<GetEmailThreadData, GetEmailThreadVariables>;

interface GetEmailThreadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetEmailThreadVariables): QueryRef<GetEmailThreadData, GetEmailThreadVariables>;
}
export const getEmailThreadRef: GetEmailThreadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getEmailThread(dc: DataConnect, vars: GetEmailThreadVariables, options?: ExecuteQueryOptions): QueryPromise<GetEmailThreadData, GetEmailThreadVariables>;

interface GetEmailThreadRef {
  ...
  (dc: DataConnect, vars: GetEmailThreadVariables): QueryRef<GetEmailThreadData, GetEmailThreadVariables>;
}
export const getEmailThreadRef: GetEmailThreadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getEmailThreadRef:
```typescript
const name = getEmailThreadRef.operationName;
console.log(name);
```

### Variables
The `GetEmailThread` query requires an argument of type `GetEmailThreadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetEmailThreadVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetEmailThread` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetEmailThreadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetEmailThread`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getEmailThread, GetEmailThreadVariables } from '@dataconnect/generated';

// The `GetEmailThread` query requires an argument of type `GetEmailThreadVariables`:
const getEmailThreadVars: GetEmailThreadVariables = {
  id: ..., 
};

// Call the `getEmailThread()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getEmailThread(getEmailThreadVars);
// Variables can be defined inline as well.
const { data } = await getEmailThread({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getEmailThread(dataConnect, getEmailThreadVars);

console.log(data.emailThread);

// Or, you can use the `Promise` API.
getEmailThread(getEmailThreadVars).then((response) => {
  const data = response.data;
  console.log(data.emailThread);
});
```

### Using `GetEmailThread`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getEmailThreadRef, GetEmailThreadVariables } from '@dataconnect/generated';

// The `GetEmailThread` query requires an argument of type `GetEmailThreadVariables`:
const getEmailThreadVars: GetEmailThreadVariables = {
  id: ..., 
};

// Call the `getEmailThreadRef()` function to get a reference to the query.
const ref = getEmailThreadRef(getEmailThreadVars);
// Variables can be defined inline as well.
const ref = getEmailThreadRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getEmailThreadRef(dataConnect, getEmailThreadVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.emailThread);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.emailThread);
});
```

## ListPlanningEventsByPeriod
You can execute the `ListPlanningEventsByPeriod` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPlanningEventsByPeriod(vars: ListPlanningEventsByPeriodVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;

interface ListPlanningEventsByPeriodRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPlanningEventsByPeriodVariables): QueryRef<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;
}
export const listPlanningEventsByPeriodRef: ListPlanningEventsByPeriodRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPlanningEventsByPeriod(dc: DataConnect, vars: ListPlanningEventsByPeriodVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;

interface ListPlanningEventsByPeriodRef {
  ...
  (dc: DataConnect, vars: ListPlanningEventsByPeriodVariables): QueryRef<ListPlanningEventsByPeriodData, ListPlanningEventsByPeriodVariables>;
}
export const listPlanningEventsByPeriodRef: ListPlanningEventsByPeriodRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPlanningEventsByPeriodRef:
```typescript
const name = listPlanningEventsByPeriodRef.operationName;
console.log(name);
```

### Variables
The `ListPlanningEventsByPeriod` query requires an argument of type `ListPlanningEventsByPeriodVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPlanningEventsByPeriodVariables {
  startAt: TimestampString;
  endAt: TimestampString;
}
```
### Return Type
Recall that executing the `ListPlanningEventsByPeriod` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPlanningEventsByPeriodData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListPlanningEventsByPeriod`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPlanningEventsByPeriod, ListPlanningEventsByPeriodVariables } from '@dataconnect/generated';

// The `ListPlanningEventsByPeriod` query requires an argument of type `ListPlanningEventsByPeriodVariables`:
const listPlanningEventsByPeriodVars: ListPlanningEventsByPeriodVariables = {
  startAt: ..., 
  endAt: ..., 
};

// Call the `listPlanningEventsByPeriod()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPlanningEventsByPeriod(listPlanningEventsByPeriodVars);
// Variables can be defined inline as well.
const { data } = await listPlanningEventsByPeriod({ startAt: ..., endAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPlanningEventsByPeriod(dataConnect, listPlanningEventsByPeriodVars);

console.log(data.planningEvents);

// Or, you can use the `Promise` API.
listPlanningEventsByPeriod(listPlanningEventsByPeriodVars).then((response) => {
  const data = response.data;
  console.log(data.planningEvents);
});
```

### Using `ListPlanningEventsByPeriod`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPlanningEventsByPeriodRef, ListPlanningEventsByPeriodVariables } from '@dataconnect/generated';

// The `ListPlanningEventsByPeriod` query requires an argument of type `ListPlanningEventsByPeriodVariables`:
const listPlanningEventsByPeriodVars: ListPlanningEventsByPeriodVariables = {
  startAt: ..., 
  endAt: ..., 
};

// Call the `listPlanningEventsByPeriodRef()` function to get a reference to the query.
const ref = listPlanningEventsByPeriodRef(listPlanningEventsByPeriodVars);
// Variables can be defined inline as well.
const ref = listPlanningEventsByPeriodRef({ startAt: ..., endAt: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPlanningEventsByPeriodRef(dataConnect, listPlanningEventsByPeriodVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.planningEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.planningEvents);
});
```

## ListPlanningEventsByChantier
You can execute the `ListPlanningEventsByChantier` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listPlanningEventsByChantier(vars: ListPlanningEventsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;

interface ListPlanningEventsByChantierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListPlanningEventsByChantierVariables): QueryRef<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;
}
export const listPlanningEventsByChantierRef: ListPlanningEventsByChantierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listPlanningEventsByChantier(dc: DataConnect, vars: ListPlanningEventsByChantierVariables, options?: ExecuteQueryOptions): QueryPromise<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;

interface ListPlanningEventsByChantierRef {
  ...
  (dc: DataConnect, vars: ListPlanningEventsByChantierVariables): QueryRef<ListPlanningEventsByChantierData, ListPlanningEventsByChantierVariables>;
}
export const listPlanningEventsByChantierRef: ListPlanningEventsByChantierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listPlanningEventsByChantierRef:
```typescript
const name = listPlanningEventsByChantierRef.operationName;
console.log(name);
```

### Variables
The `ListPlanningEventsByChantier` query requires an argument of type `ListPlanningEventsByChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListPlanningEventsByChantierVariables {
  chantierId: UUIDString;
}
```
### Return Type
Recall that executing the `ListPlanningEventsByChantier` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListPlanningEventsByChantierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListPlanningEventsByChantier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listPlanningEventsByChantier, ListPlanningEventsByChantierVariables } from '@dataconnect/generated';

// The `ListPlanningEventsByChantier` query requires an argument of type `ListPlanningEventsByChantierVariables`:
const listPlanningEventsByChantierVars: ListPlanningEventsByChantierVariables = {
  chantierId: ..., 
};

// Call the `listPlanningEventsByChantier()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listPlanningEventsByChantier(listPlanningEventsByChantierVars);
// Variables can be defined inline as well.
const { data } = await listPlanningEventsByChantier({ chantierId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listPlanningEventsByChantier(dataConnect, listPlanningEventsByChantierVars);

console.log(data.planningEvents);

// Or, you can use the `Promise` API.
listPlanningEventsByChantier(listPlanningEventsByChantierVars).then((response) => {
  const data = response.data;
  console.log(data.planningEvents);
});
```

### Using `ListPlanningEventsByChantier`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listPlanningEventsByChantierRef, ListPlanningEventsByChantierVariables } from '@dataconnect/generated';

// The `ListPlanningEventsByChantier` query requires an argument of type `ListPlanningEventsByChantierVariables`:
const listPlanningEventsByChantierVars: ListPlanningEventsByChantierVariables = {
  chantierId: ..., 
};

// Call the `listPlanningEventsByChantierRef()` function to get a reference to the query.
const ref = listPlanningEventsByChantierRef(listPlanningEventsByChantierVars);
// Variables can be defined inline as well.
const ref = listPlanningEventsByChantierRef({ chantierId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listPlanningEventsByChantierRef(dataConnect, listPlanningEventsByChantierVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.planningEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.planningEvents);
});
```

## ListAnalyticsSnapshots
You can execute the `ListAnalyticsSnapshots` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAnalyticsSnapshots(vars: ListAnalyticsSnapshotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;

interface ListAnalyticsSnapshotsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListAnalyticsSnapshotsVariables): QueryRef<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;
}
export const listAnalyticsSnapshotsRef: ListAnalyticsSnapshotsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAnalyticsSnapshots(dc: DataConnect, vars: ListAnalyticsSnapshotsVariables, options?: ExecuteQueryOptions): QueryPromise<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;

interface ListAnalyticsSnapshotsRef {
  ...
  (dc: DataConnect, vars: ListAnalyticsSnapshotsVariables): QueryRef<ListAnalyticsSnapshotsData, ListAnalyticsSnapshotsVariables>;
}
export const listAnalyticsSnapshotsRef: ListAnalyticsSnapshotsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAnalyticsSnapshotsRef:
```typescript
const name = listAnalyticsSnapshotsRef.operationName;
console.log(name);
```

### Variables
The `ListAnalyticsSnapshots` query requires an argument of type `ListAnalyticsSnapshotsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListAnalyticsSnapshotsVariables {
  environment: string;
}
```
### Return Type
Recall that executing the `ListAnalyticsSnapshots` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAnalyticsSnapshotsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListAnalyticsSnapshots`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAnalyticsSnapshots, ListAnalyticsSnapshotsVariables } from '@dataconnect/generated';

// The `ListAnalyticsSnapshots` query requires an argument of type `ListAnalyticsSnapshotsVariables`:
const listAnalyticsSnapshotsVars: ListAnalyticsSnapshotsVariables = {
  environment: ..., 
};

// Call the `listAnalyticsSnapshots()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAnalyticsSnapshots(listAnalyticsSnapshotsVars);
// Variables can be defined inline as well.
const { data } = await listAnalyticsSnapshots({ environment: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAnalyticsSnapshots(dataConnect, listAnalyticsSnapshotsVars);

console.log(data.analyticsSnapshots);

// Or, you can use the `Promise` API.
listAnalyticsSnapshots(listAnalyticsSnapshotsVars).then((response) => {
  const data = response.data;
  console.log(data.analyticsSnapshots);
});
```

### Using `ListAnalyticsSnapshots`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAnalyticsSnapshotsRef, ListAnalyticsSnapshotsVariables } from '@dataconnect/generated';

// The `ListAnalyticsSnapshots` query requires an argument of type `ListAnalyticsSnapshotsVariables`:
const listAnalyticsSnapshotsVars: ListAnalyticsSnapshotsVariables = {
  environment: ..., 
};

// Call the `listAnalyticsSnapshotsRef()` function to get a reference to the query.
const ref = listAnalyticsSnapshotsRef(listAnalyticsSnapshotsVars);
// Variables can be defined inline as well.
const ref = listAnalyticsSnapshotsRef({ environment: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAnalyticsSnapshotsRef(dataConnect, listAnalyticsSnapshotsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.analyticsSnapshots);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.analyticsSnapshots);
});
```

## GetAnalyticsSnapshot
You can execute the `GetAnalyticsSnapshot` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getAnalyticsSnapshot(vars: GetAnalyticsSnapshotVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;

interface GetAnalyticsSnapshotRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetAnalyticsSnapshotVariables): QueryRef<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;
}
export const getAnalyticsSnapshotRef: GetAnalyticsSnapshotRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getAnalyticsSnapshot(dc: DataConnect, vars: GetAnalyticsSnapshotVariables, options?: ExecuteQueryOptions): QueryPromise<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;

interface GetAnalyticsSnapshotRef {
  ...
  (dc: DataConnect, vars: GetAnalyticsSnapshotVariables): QueryRef<GetAnalyticsSnapshotData, GetAnalyticsSnapshotVariables>;
}
export const getAnalyticsSnapshotRef: GetAnalyticsSnapshotRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getAnalyticsSnapshotRef:
```typescript
const name = getAnalyticsSnapshotRef.operationName;
console.log(name);
```

### Variables
The `GetAnalyticsSnapshot` query requires an argument of type `GetAnalyticsSnapshotVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetAnalyticsSnapshotVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetAnalyticsSnapshot` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetAnalyticsSnapshotData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetAnalyticsSnapshot`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getAnalyticsSnapshot, GetAnalyticsSnapshotVariables } from '@dataconnect/generated';

// The `GetAnalyticsSnapshot` query requires an argument of type `GetAnalyticsSnapshotVariables`:
const getAnalyticsSnapshotVars: GetAnalyticsSnapshotVariables = {
  id: ..., 
};

// Call the `getAnalyticsSnapshot()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getAnalyticsSnapshot(getAnalyticsSnapshotVars);
// Variables can be defined inline as well.
const { data } = await getAnalyticsSnapshot({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getAnalyticsSnapshot(dataConnect, getAnalyticsSnapshotVars);

console.log(data.analyticsSnapshot);

// Or, you can use the `Promise` API.
getAnalyticsSnapshot(getAnalyticsSnapshotVars).then((response) => {
  const data = response.data;
  console.log(data.analyticsSnapshot);
});
```

### Using `GetAnalyticsSnapshot`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getAnalyticsSnapshotRef, GetAnalyticsSnapshotVariables } from '@dataconnect/generated';

// The `GetAnalyticsSnapshot` query requires an argument of type `GetAnalyticsSnapshotVariables`:
const getAnalyticsSnapshotVars: GetAnalyticsSnapshotVariables = {
  id: ..., 
};

// Call the `getAnalyticsSnapshotRef()` function to get a reference to the query.
const ref = getAnalyticsSnapshotRef(getAnalyticsSnapshotVars);
// Variables can be defined inline as well.
const ref = getAnalyticsSnapshotRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getAnalyticsSnapshotRef(dataConnect, getAnalyticsSnapshotVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.analyticsSnapshot);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.analyticsSnapshot);
});
```

## ListRapports
You can execute the `ListRapports` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRapports(options?: ExecuteQueryOptions): QueryPromise<ListRapportsData, undefined>;

interface ListRapportsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListRapportsData, undefined>;
}
export const listRapportsRef: ListRapportsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRapports(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListRapportsData, undefined>;

interface ListRapportsRef {
  ...
  (dc: DataConnect): QueryRef<ListRapportsData, undefined>;
}
export const listRapportsRef: ListRapportsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRapportsRef:
```typescript
const name = listRapportsRef.operationName;
console.log(name);
```

### Variables
The `ListRapports` query has no variables.
### Return Type
Recall that executing the `ListRapports` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRapportsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListRapports`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRapports } from '@dataconnect/generated';


// Call the `listRapports()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRapports();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRapports(dataConnect);

console.log(data.rapports);

// Or, you can use the `Promise` API.
listRapports().then((response) => {
  const data = response.data;
  console.log(data.rapports);
});
```

### Using `ListRapports`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRapportsRef } from '@dataconnect/generated';


// Call the `listRapportsRef()` function to get a reference to the query.
const ref = listRapportsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRapportsRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rapports);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rapports);
});
```

## GetRapport
You can execute the `GetRapport` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getRapport(vars: GetRapportVariables, options?: ExecuteQueryOptions): QueryPromise<GetRapportData, GetRapportVariables>;

interface GetRapportRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetRapportVariables): QueryRef<GetRapportData, GetRapportVariables>;
}
export const getRapportRef: GetRapportRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getRapport(dc: DataConnect, vars: GetRapportVariables, options?: ExecuteQueryOptions): QueryPromise<GetRapportData, GetRapportVariables>;

interface GetRapportRef {
  ...
  (dc: DataConnect, vars: GetRapportVariables): QueryRef<GetRapportData, GetRapportVariables>;
}
export const getRapportRef: GetRapportRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getRapportRef:
```typescript
const name = getRapportRef.operationName;
console.log(name);
```

### Variables
The `GetRapport` query requires an argument of type `GetRapportVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetRapportVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetRapport` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetRapportData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetRapport`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getRapport, GetRapportVariables } from '@dataconnect/generated';

// The `GetRapport` query requires an argument of type `GetRapportVariables`:
const getRapportVars: GetRapportVariables = {
  id: ..., 
};

// Call the `getRapport()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getRapport(getRapportVars);
// Variables can be defined inline as well.
const { data } = await getRapport({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getRapport(dataConnect, getRapportVars);

console.log(data.rapport);

// Or, you can use the `Promise` API.
getRapport(getRapportVars).then((response) => {
  const data = response.data;
  console.log(data.rapport);
});
```

### Using `GetRapport`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getRapportRef, GetRapportVariables } from '@dataconnect/generated';

// The `GetRapport` query requires an argument of type `GetRapportVariables`:
const getRapportVars: GetRapportVariables = {
  id: ..., 
};

// Call the `getRapportRef()` function to get a reference to the query.
const ref = getRapportRef(getRapportVars);
// Variables can be defined inline as well.
const ref = getRapportRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getRapportRef(dataConnect, getRapportVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.rapport);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.rapport);
});
```

## ListRecentAuditEvents
You can execute the `ListRecentAuditEvents` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listRecentAuditEvents(vars: ListRecentAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;

interface ListRecentAuditEventsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListRecentAuditEventsVariables): QueryRef<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;
}
export const listRecentAuditEventsRef: ListRecentAuditEventsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listRecentAuditEvents(dc: DataConnect, vars: ListRecentAuditEventsVariables, options?: ExecuteQueryOptions): QueryPromise<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;

interface ListRecentAuditEventsRef {
  ...
  (dc: DataConnect, vars: ListRecentAuditEventsVariables): QueryRef<ListRecentAuditEventsData, ListRecentAuditEventsVariables>;
}
export const listRecentAuditEventsRef: ListRecentAuditEventsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listRecentAuditEventsRef:
```typescript
const name = listRecentAuditEventsRef.operationName;
console.log(name);
```

### Variables
The `ListRecentAuditEvents` query requires an argument of type `ListRecentAuditEventsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListRecentAuditEventsVariables {
  environment: string;
}
```
### Return Type
Recall that executing the `ListRecentAuditEvents` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListRecentAuditEventsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListRecentAuditEvents`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listRecentAuditEvents, ListRecentAuditEventsVariables } from '@dataconnect/generated';

// The `ListRecentAuditEvents` query requires an argument of type `ListRecentAuditEventsVariables`:
const listRecentAuditEventsVars: ListRecentAuditEventsVariables = {
  environment: ..., 
};

// Call the `listRecentAuditEvents()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listRecentAuditEvents(listRecentAuditEventsVars);
// Variables can be defined inline as well.
const { data } = await listRecentAuditEvents({ environment: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listRecentAuditEvents(dataConnect, listRecentAuditEventsVars);

console.log(data.auditEvents);

// Or, you can use the `Promise` API.
listRecentAuditEvents(listRecentAuditEventsVars).then((response) => {
  const data = response.data;
  console.log(data.auditEvents);
});
```

### Using `ListRecentAuditEvents`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listRecentAuditEventsRef, ListRecentAuditEventsVariables } from '@dataconnect/generated';

// The `ListRecentAuditEvents` query requires an argument of type `ListRecentAuditEventsVariables`:
const listRecentAuditEventsVars: ListRecentAuditEventsVariables = {
  environment: ..., 
};

// Call the `listRecentAuditEventsRef()` function to get a reference to the query.
const ref = listRecentAuditEventsRef(listRecentAuditEventsVars);
// Variables can be defined inline as well.
const ref = listRecentAuditEventsRef({ environment: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listRecentAuditEventsRef(dataConnect, listRecentAuditEventsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.auditEvents);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.auditEvents);
});
```

## ListEntityChangeLogs
You can execute the `ListEntityChangeLogs` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listEntityChangeLogs(vars: ListEntityChangeLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;

interface ListEntityChangeLogsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListEntityChangeLogsVariables): QueryRef<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;
}
export const listEntityChangeLogsRef: ListEntityChangeLogsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listEntityChangeLogs(dc: DataConnect, vars: ListEntityChangeLogsVariables, options?: ExecuteQueryOptions): QueryPromise<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;

interface ListEntityChangeLogsRef {
  ...
  (dc: DataConnect, vars: ListEntityChangeLogsVariables): QueryRef<ListEntityChangeLogsData, ListEntityChangeLogsVariables>;
}
export const listEntityChangeLogsRef: ListEntityChangeLogsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listEntityChangeLogsRef:
```typescript
const name = listEntityChangeLogsRef.operationName;
console.log(name);
```

### Variables
The `ListEntityChangeLogs` query requires an argument of type `ListEntityChangeLogsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListEntityChangeLogsVariables {
  environment: string;
  entityType: string;
  entityId: string;
}
```
### Return Type
Recall that executing the `ListEntityChangeLogs` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListEntityChangeLogsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListEntityChangeLogs`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listEntityChangeLogs, ListEntityChangeLogsVariables } from '@dataconnect/generated';

// The `ListEntityChangeLogs` query requires an argument of type `ListEntityChangeLogsVariables`:
const listEntityChangeLogsVars: ListEntityChangeLogsVariables = {
  environment: ..., 
  entityType: ..., 
  entityId: ..., 
};

// Call the `listEntityChangeLogs()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listEntityChangeLogs(listEntityChangeLogsVars);
// Variables can be defined inline as well.
const { data } = await listEntityChangeLogs({ environment: ..., entityType: ..., entityId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listEntityChangeLogs(dataConnect, listEntityChangeLogsVars);

console.log(data.entityChangeLogs);

// Or, you can use the `Promise` API.
listEntityChangeLogs(listEntityChangeLogsVars).then((response) => {
  const data = response.data;
  console.log(data.entityChangeLogs);
});
```

### Using `ListEntityChangeLogs`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listEntityChangeLogsRef, ListEntityChangeLogsVariables } from '@dataconnect/generated';

// The `ListEntityChangeLogs` query requires an argument of type `ListEntityChangeLogsVariables`:
const listEntityChangeLogsVars: ListEntityChangeLogsVariables = {
  environment: ..., 
  entityType: ..., 
  entityId: ..., 
};

// Call the `listEntityChangeLogsRef()` function to get a reference to the query.
const ref = listEntityChangeLogsRef(listEntityChangeLogsVars);
// Variables can be defined inline as well.
const ref = listEntityChangeLogsRef({ environment: ..., entityType: ..., entityId: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listEntityChangeLogsRef(dataConnect, listEntityChangeLogsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.entityChangeLogs);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.entityChangeLogs);
});
```

## ListCheckpointRuns
You can execute the `ListCheckpointRuns` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listCheckpointRuns(vars: ListCheckpointRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListCheckpointRunsData, ListCheckpointRunsVariables>;

interface ListCheckpointRunsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListCheckpointRunsVariables): QueryRef<ListCheckpointRunsData, ListCheckpointRunsVariables>;
}
export const listCheckpointRunsRef: ListCheckpointRunsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listCheckpointRuns(dc: DataConnect, vars: ListCheckpointRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListCheckpointRunsData, ListCheckpointRunsVariables>;

interface ListCheckpointRunsRef {
  ...
  (dc: DataConnect, vars: ListCheckpointRunsVariables): QueryRef<ListCheckpointRunsData, ListCheckpointRunsVariables>;
}
export const listCheckpointRunsRef: ListCheckpointRunsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listCheckpointRunsRef:
```typescript
const name = listCheckpointRunsRef.operationName;
console.log(name);
```

### Variables
The `ListCheckpointRuns` query requires an argument of type `ListCheckpointRunsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListCheckpointRunsVariables {
  environment: string;
}
```
### Return Type
Recall that executing the `ListCheckpointRuns` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListCheckpointRunsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListCheckpointRuns`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listCheckpointRuns, ListCheckpointRunsVariables } from '@dataconnect/generated';

// The `ListCheckpointRuns` query requires an argument of type `ListCheckpointRunsVariables`:
const listCheckpointRunsVars: ListCheckpointRunsVariables = {
  environment: ..., 
};

// Call the `listCheckpointRuns()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listCheckpointRuns(listCheckpointRunsVars);
// Variables can be defined inline as well.
const { data } = await listCheckpointRuns({ environment: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listCheckpointRuns(dataConnect, listCheckpointRunsVars);

console.log(data.checkpointRuns);

// Or, you can use the `Promise` API.
listCheckpointRuns(listCheckpointRunsVars).then((response) => {
  const data = response.data;
  console.log(data.checkpointRuns);
});
```

### Using `ListCheckpointRuns`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listCheckpointRunsRef, ListCheckpointRunsVariables } from '@dataconnect/generated';

// The `ListCheckpointRuns` query requires an argument of type `ListCheckpointRunsVariables`:
const listCheckpointRunsVars: ListCheckpointRunsVariables = {
  environment: ..., 
};

// Call the `listCheckpointRunsRef()` function to get a reference to the query.
const ref = listCheckpointRunsRef(listCheckpointRunsVars);
// Variables can be defined inline as well.
const ref = listCheckpointRunsRef({ environment: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listCheckpointRunsRef(dataConnect, listCheckpointRunsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.checkpointRuns);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.checkpointRuns);
});
```

## GetCheckpointRun
You can execute the `GetCheckpointRun` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCheckpointRun(vars: GetCheckpointRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetCheckpointRunData, GetCheckpointRunVariables>;

interface GetCheckpointRunRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetCheckpointRunVariables): QueryRef<GetCheckpointRunData, GetCheckpointRunVariables>;
}
export const getCheckpointRunRef: GetCheckpointRunRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCheckpointRun(dc: DataConnect, vars: GetCheckpointRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetCheckpointRunData, GetCheckpointRunVariables>;

interface GetCheckpointRunRef {
  ...
  (dc: DataConnect, vars: GetCheckpointRunVariables): QueryRef<GetCheckpointRunData, GetCheckpointRunVariables>;
}
export const getCheckpointRunRef: GetCheckpointRunRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCheckpointRunRef:
```typescript
const name = getCheckpointRunRef.operationName;
console.log(name);
```

### Variables
The `GetCheckpointRun` query requires an argument of type `GetCheckpointRunVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetCheckpointRunVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetCheckpointRun` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCheckpointRunData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetCheckpointRun`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCheckpointRun, GetCheckpointRunVariables } from '@dataconnect/generated';

// The `GetCheckpointRun` query requires an argument of type `GetCheckpointRunVariables`:
const getCheckpointRunVars: GetCheckpointRunVariables = {
  id: ..., 
};

// Call the `getCheckpointRun()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCheckpointRun(getCheckpointRunVars);
// Variables can be defined inline as well.
const { data } = await getCheckpointRun({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCheckpointRun(dataConnect, getCheckpointRunVars);

console.log(data.checkpointRun);

// Or, you can use the `Promise` API.
getCheckpointRun(getCheckpointRunVars).then((response) => {
  const data = response.data;
  console.log(data.checkpointRun);
});
```

### Using `GetCheckpointRun`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCheckpointRunRef, GetCheckpointRunVariables } from '@dataconnect/generated';

// The `GetCheckpointRun` query requires an argument of type `GetCheckpointRunVariables`:
const getCheckpointRunVars: GetCheckpointRunVariables = {
  id: ..., 
};

// Call the `getCheckpointRunRef()` function to get a reference to the query.
const ref = getCheckpointRunRef(getCheckpointRunVars);
// Variables can be defined inline as well.
const ref = getCheckpointRunRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCheckpointRunRef(dataConnect, getCheckpointRunVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.checkpointRun);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.checkpointRun);
});
```

## ListDataImportRuns
You can execute the `ListDataImportRuns` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listDataImportRuns(vars: ListDataImportRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDataImportRunsData, ListDataImportRunsVariables>;

interface ListDataImportRunsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListDataImportRunsVariables): QueryRef<ListDataImportRunsData, ListDataImportRunsVariables>;
}
export const listDataImportRunsRef: ListDataImportRunsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listDataImportRuns(dc: DataConnect, vars: ListDataImportRunsVariables, options?: ExecuteQueryOptions): QueryPromise<ListDataImportRunsData, ListDataImportRunsVariables>;

interface ListDataImportRunsRef {
  ...
  (dc: DataConnect, vars: ListDataImportRunsVariables): QueryRef<ListDataImportRunsData, ListDataImportRunsVariables>;
}
export const listDataImportRunsRef: ListDataImportRunsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listDataImportRunsRef:
```typescript
const name = listDataImportRunsRef.operationName;
console.log(name);
```

### Variables
The `ListDataImportRuns` query requires an argument of type `ListDataImportRunsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListDataImportRunsVariables {
  environment: string;
}
```
### Return Type
Recall that executing the `ListDataImportRuns` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListDataImportRunsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `ListDataImportRuns`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listDataImportRuns, ListDataImportRunsVariables } from '@dataconnect/generated';

// The `ListDataImportRuns` query requires an argument of type `ListDataImportRunsVariables`:
const listDataImportRunsVars: ListDataImportRunsVariables = {
  environment: ..., 
};

// Call the `listDataImportRuns()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listDataImportRuns(listDataImportRunsVars);
// Variables can be defined inline as well.
const { data } = await listDataImportRuns({ environment: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listDataImportRuns(dataConnect, listDataImportRunsVars);

console.log(data.dataImportRuns);

// Or, you can use the `Promise` API.
listDataImportRuns(listDataImportRunsVars).then((response) => {
  const data = response.data;
  console.log(data.dataImportRuns);
});
```

### Using `ListDataImportRuns`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listDataImportRunsRef, ListDataImportRunsVariables } from '@dataconnect/generated';

// The `ListDataImportRuns` query requires an argument of type `ListDataImportRunsVariables`:
const listDataImportRunsVars: ListDataImportRunsVariables = {
  environment: ..., 
};

// Call the `listDataImportRunsRef()` function to get a reference to the query.
const ref = listDataImportRunsRef(listDataImportRunsVars);
// Variables can be defined inline as well.
const ref = listDataImportRunsRef({ environment: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listDataImportRunsRef(dataConnect, listDataImportRunsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.dataImportRuns);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.dataImportRuns);
});
```

## GetDataImportRun
You can execute the `GetDataImportRun` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getDataImportRun(vars: GetDataImportRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetDataImportRunData, GetDataImportRunVariables>;

interface GetDataImportRunRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: GetDataImportRunVariables): QueryRef<GetDataImportRunData, GetDataImportRunVariables>;
}
export const getDataImportRunRef: GetDataImportRunRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getDataImportRun(dc: DataConnect, vars: GetDataImportRunVariables, options?: ExecuteQueryOptions): QueryPromise<GetDataImportRunData, GetDataImportRunVariables>;

interface GetDataImportRunRef {
  ...
  (dc: DataConnect, vars: GetDataImportRunVariables): QueryRef<GetDataImportRunData, GetDataImportRunVariables>;
}
export const getDataImportRunRef: GetDataImportRunRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getDataImportRunRef:
```typescript
const name = getDataImportRunRef.operationName;
console.log(name);
```

### Variables
The `GetDataImportRun` query requires an argument of type `GetDataImportRunVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface GetDataImportRunVariables {
  id: UUIDString;
}
```
### Return Type
Recall that executing the `GetDataImportRun` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetDataImportRunData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
### Using `GetDataImportRun`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getDataImportRun, GetDataImportRunVariables } from '@dataconnect/generated';

// The `GetDataImportRun` query requires an argument of type `GetDataImportRunVariables`:
const getDataImportRunVars: GetDataImportRunVariables = {
  id: ..., 
};

// Call the `getDataImportRun()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getDataImportRun(getDataImportRunVars);
// Variables can be defined inline as well.
const { data } = await getDataImportRun({ id: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getDataImportRun(dataConnect, getDataImportRunVars);

console.log(data.dataImportRun);

// Or, you can use the `Promise` API.
getDataImportRun(getDataImportRunVars).then((response) => {
  const data = response.data;
  console.log(data.dataImportRun);
});
```

### Using `GetDataImportRun`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getDataImportRunRef, GetDataImportRunVariables } from '@dataconnect/generated';

// The `GetDataImportRun` query requires an argument of type `GetDataImportRunVariables`:
const getDataImportRunVars: GetDataImportRunVariables = {
  id: ..., 
};

// Call the `getDataImportRunRef()` function to get a reference to the query.
const ref = getDataImportRunRef(getDataImportRunVars);
// Variables can be defined inline as well.
const ref = getDataImportRunRef({ id: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getDataImportRunRef(dataConnect, getDataImportRunVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.dataImportRun);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.dataImportRun);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `sosson` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateClient
You can execute the `CreateClient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createClient(vars: CreateClientVariables): MutationPromise<CreateClientData, CreateClientVariables>;

interface CreateClientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateClientVariables): MutationRef<CreateClientData, CreateClientVariables>;
}
export const createClientRef: CreateClientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createClient(dc: DataConnect, vars: CreateClientVariables): MutationPromise<CreateClientData, CreateClientVariables>;

interface CreateClientRef {
  ...
  (dc: DataConnect, vars: CreateClientVariables): MutationRef<CreateClientData, CreateClientVariables>;
}
export const createClientRef: CreateClientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createClientRef:
```typescript
const name = createClientRef.operationName;
console.log(name);
```

### Variables
The `CreateClient` mutation requires an argument of type `CreateClientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateClient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateClientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateClientData {
  query?: {
  };
    client_insert: Client_Key;
}
```
### Using `CreateClient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createClient, CreateClientVariables } from '@dataconnect/generated';

// The `CreateClient` mutation requires an argument of type `CreateClientVariables`:
const createClientVars: CreateClientVariables = {
  type: ..., 
  nom: ..., 
  email: ..., // optional
  telephone: ..., // optional
  adresse: ..., // optional
  ville: ..., // optional
  codePostal: ..., // optional
};

// Call the `createClient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createClient(createClientVars);
// Variables can be defined inline as well.
const { data } = await createClient({ type: ..., nom: ..., email: ..., telephone: ..., adresse: ..., ville: ..., codePostal: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createClient(dataConnect, createClientVars);

console.log(data.query);
console.log(data.client_insert);

// Or, you can use the `Promise` API.
createClient(createClientVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.client_insert);
});
```

### Using `CreateClient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createClientRef, CreateClientVariables } from '@dataconnect/generated';

// The `CreateClient` mutation requires an argument of type `CreateClientVariables`:
const createClientVars: CreateClientVariables = {
  type: ..., 
  nom: ..., 
  email: ..., // optional
  telephone: ..., // optional
  adresse: ..., // optional
  ville: ..., // optional
  codePostal: ..., // optional
};

// Call the `createClientRef()` function to get a reference to the mutation.
const ref = createClientRef(createClientVars);
// Variables can be defined inline as well.
const ref = createClientRef({ type: ..., nom: ..., email: ..., telephone: ..., adresse: ..., ville: ..., codePostal: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createClientRef(dataConnect, createClientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.client_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.client_insert);
});
```

## UpdateClient
You can execute the `UpdateClient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateClient(vars: UpdateClientVariables): MutationPromise<UpdateClientData, UpdateClientVariables>;

interface UpdateClientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateClientVariables): MutationRef<UpdateClientData, UpdateClientVariables>;
}
export const updateClientRef: UpdateClientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateClient(dc: DataConnect, vars: UpdateClientVariables): MutationPromise<UpdateClientData, UpdateClientVariables>;

interface UpdateClientRef {
  ...
  (dc: DataConnect, vars: UpdateClientVariables): MutationRef<UpdateClientData, UpdateClientVariables>;
}
export const updateClientRef: UpdateClientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateClientRef:
```typescript
const name = updateClientRef.operationName;
console.log(name);
```

### Variables
The `UpdateClient` mutation requires an argument of type `UpdateClientVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `UpdateClient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateClientData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateClientData {
  query?: {
  };
    client_update?: Client_Key | null;
}
```
### Using `UpdateClient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateClient, UpdateClientVariables } from '@dataconnect/generated';

// The `UpdateClient` mutation requires an argument of type `UpdateClientVariables`:
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

// Call the `updateClient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateClient(updateClientVars);
// Variables can be defined inline as well.
const { data } = await updateClient({ id: ..., type: ..., nom: ..., email: ..., telephone: ..., adresse: ..., ville: ..., codePostal: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateClient(dataConnect, updateClientVars);

console.log(data.query);
console.log(data.client_update);

// Or, you can use the `Promise` API.
updateClient(updateClientVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.client_update);
});
```

### Using `UpdateClient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateClientRef, UpdateClientVariables } from '@dataconnect/generated';

// The `UpdateClient` mutation requires an argument of type `UpdateClientVariables`:
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

// Call the `updateClientRef()` function to get a reference to the mutation.
const ref = updateClientRef(updateClientVars);
// Variables can be defined inline as well.
const ref = updateClientRef({ id: ..., type: ..., nom: ..., email: ..., telephone: ..., adresse: ..., ville: ..., codePostal: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateClientRef(dataConnect, updateClientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.client_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.client_update);
});
```

## CreateChantier
You can execute the `CreateChantier` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createChantier(vars: CreateChantierVariables): MutationPromise<CreateChantierData, CreateChantierVariables>;

interface CreateChantierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateChantierVariables): MutationRef<CreateChantierData, CreateChantierVariables>;
}
export const createChantierRef: CreateChantierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createChantier(dc: DataConnect, vars: CreateChantierVariables): MutationPromise<CreateChantierData, CreateChantierVariables>;

interface CreateChantierRef {
  ...
  (dc: DataConnect, vars: CreateChantierVariables): MutationRef<CreateChantierData, CreateChantierVariables>;
}
export const createChantierRef: CreateChantierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createChantierRef:
```typescript
const name = createChantierRef.operationName;
console.log(name);
```

### Variables
The `CreateChantier` mutation requires an argument of type `CreateChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateChantier` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateChantierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateChantierData {
  query?: {
  };
    chantier_insert: Chantier_Key;
}
```
### Using `CreateChantier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createChantier, CreateChantierVariables } from '@dataconnect/generated';

// The `CreateChantier` mutation requires an argument of type `CreateChantierVariables`:
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

// Call the `createChantier()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createChantier(createChantierVars);
// Variables can be defined inline as well.
const { data } = await createChantier({ clientId: ..., chefChantierId: ..., nom: ..., statut: ..., dateDebut: ..., dateFinPrevue: ..., budgetPrevisionnel: ..., description: ..., adresse: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createChantier(dataConnect, createChantierVars);

console.log(data.query);
console.log(data.chantier_insert);

// Or, you can use the `Promise` API.
createChantier(createChantierVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.chantier_insert);
});
```

### Using `CreateChantier`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createChantierRef, CreateChantierVariables } from '@dataconnect/generated';

// The `CreateChantier` mutation requires an argument of type `CreateChantierVariables`:
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

// Call the `createChantierRef()` function to get a reference to the mutation.
const ref = createChantierRef(createChantierVars);
// Variables can be defined inline as well.
const ref = createChantierRef({ clientId: ..., chefChantierId: ..., nom: ..., statut: ..., dateDebut: ..., dateFinPrevue: ..., budgetPrevisionnel: ..., description: ..., adresse: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createChantierRef(dataConnect, createChantierVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.chantier_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.chantier_insert);
});
```

## UpdateChantierStatut
You can execute the `UpdateChantierStatut` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateChantierStatut(vars: UpdateChantierStatutVariables): MutationPromise<UpdateChantierStatutData, UpdateChantierStatutVariables>;

interface UpdateChantierStatutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateChantierStatutVariables): MutationRef<UpdateChantierStatutData, UpdateChantierStatutVariables>;
}
export const updateChantierStatutRef: UpdateChantierStatutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateChantierStatut(dc: DataConnect, vars: UpdateChantierStatutVariables): MutationPromise<UpdateChantierStatutData, UpdateChantierStatutVariables>;

interface UpdateChantierStatutRef {
  ...
  (dc: DataConnect, vars: UpdateChantierStatutVariables): MutationRef<UpdateChantierStatutData, UpdateChantierStatutVariables>;
}
export const updateChantierStatutRef: UpdateChantierStatutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateChantierStatutRef:
```typescript
const name = updateChantierStatutRef.operationName;
console.log(name);
```

### Variables
The `UpdateChantierStatut` mutation requires an argument of type `UpdateChantierStatutVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateChantierStatutVariables {
  id: UUIDString;
  statut: string;
  dateFin?: DateString | null;
}
```
### Return Type
Recall that executing the `UpdateChantierStatut` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateChantierStatutData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateChantierStatutData {
  query?: {
  };
    chantier_update?: Chantier_Key | null;
}
```
### Using `UpdateChantierStatut`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateChantierStatut, UpdateChantierStatutVariables } from '@dataconnect/generated';

// The `UpdateChantierStatut` mutation requires an argument of type `UpdateChantierStatutVariables`:
const updateChantierStatutVars: UpdateChantierStatutVariables = {
  id: ..., 
  statut: ..., 
  dateFin: ..., // optional
};

// Call the `updateChantierStatut()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateChantierStatut(updateChantierStatutVars);
// Variables can be defined inline as well.
const { data } = await updateChantierStatut({ id: ..., statut: ..., dateFin: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateChantierStatut(dataConnect, updateChantierStatutVars);

console.log(data.query);
console.log(data.chantier_update);

// Or, you can use the `Promise` API.
updateChantierStatut(updateChantierStatutVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.chantier_update);
});
```

### Using `UpdateChantierStatut`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateChantierStatutRef, UpdateChantierStatutVariables } from '@dataconnect/generated';

// The `UpdateChantierStatut` mutation requires an argument of type `UpdateChantierStatutVariables`:
const updateChantierStatutVars: UpdateChantierStatutVariables = {
  id: ..., 
  statut: ..., 
  dateFin: ..., // optional
};

// Call the `updateChantierStatutRef()` function to get a reference to the mutation.
const ref = updateChantierStatutRef(updateChantierStatutVars);
// Variables can be defined inline as well.
const ref = updateChantierStatutRef({ id: ..., statut: ..., dateFin: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateChantierStatutRef(dataConnect, updateChantierStatutVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.chantier_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.chantier_update);
});
```

## CreateFacture
You can execute the `CreateFacture` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createFacture(vars: CreateFactureVariables): MutationPromise<CreateFactureData, CreateFactureVariables>;

interface CreateFactureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateFactureVariables): MutationRef<CreateFactureData, CreateFactureVariables>;
}
export const createFactureRef: CreateFactureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createFacture(dc: DataConnect, vars: CreateFactureVariables): MutationPromise<CreateFactureData, CreateFactureVariables>;

interface CreateFactureRef {
  ...
  (dc: DataConnect, vars: CreateFactureVariables): MutationRef<CreateFactureData, CreateFactureVariables>;
}
export const createFactureRef: CreateFactureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createFactureRef:
```typescript
const name = createFactureRef.operationName;
console.log(name);
```

### Variables
The `CreateFacture` mutation requires an argument of type `CreateFactureVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateFacture` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateFactureData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateFactureData {
  query?: {
  };
    facture_insert: Facture_Key;
}
```
### Using `CreateFacture`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createFacture, CreateFactureVariables } from '@dataconnect/generated';

// The `CreateFacture` mutation requires an argument of type `CreateFactureVariables`:
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

// Call the `createFacture()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createFacture(createFactureVars);
// Variables can be defined inline as well.
const { data } = await createFacture({ chantierId: ..., fournisseur: ..., numeroFacture: ..., montantHT: ..., tva: ..., montantTTC: ..., date: ..., categorie: ..., statut: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createFacture(dataConnect, createFactureVars);

console.log(data.query);
console.log(data.facture_insert);

// Or, you can use the `Promise` API.
createFacture(createFactureVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.facture_insert);
});
```

### Using `CreateFacture`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createFactureRef, CreateFactureVariables } from '@dataconnect/generated';

// The `CreateFacture` mutation requires an argument of type `CreateFactureVariables`:
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

// Call the `createFactureRef()` function to get a reference to the mutation.
const ref = createFactureRef(createFactureVars);
// Variables can be defined inline as well.
const ref = createFactureRef({ chantierId: ..., fournisseur: ..., numeroFacture: ..., montantHT: ..., tva: ..., montantTTC: ..., date: ..., categorie: ..., statut: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createFactureRef(dataConnect, createFactureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.facture_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.facture_insert);
});
```

## SetFactureStatut
You can execute the `SetFactureStatut` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
setFactureStatut(vars: SetFactureStatutVariables): MutationPromise<SetFactureStatutData, SetFactureStatutVariables>;

interface SetFactureStatutRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: SetFactureStatutVariables): MutationRef<SetFactureStatutData, SetFactureStatutVariables>;
}
export const setFactureStatutRef: SetFactureStatutRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
setFactureStatut(dc: DataConnect, vars: SetFactureStatutVariables): MutationPromise<SetFactureStatutData, SetFactureStatutVariables>;

interface SetFactureStatutRef {
  ...
  (dc: DataConnect, vars: SetFactureStatutVariables): MutationRef<SetFactureStatutData, SetFactureStatutVariables>;
}
export const setFactureStatutRef: SetFactureStatutRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the setFactureStatutRef:
```typescript
const name = setFactureStatutRef.operationName;
console.log(name);
```

### Variables
The `SetFactureStatut` mutation requires an argument of type `SetFactureStatutVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface SetFactureStatutVariables {
  id: UUIDString;
  statut: string;
}
```
### Return Type
Recall that executing the `SetFactureStatut` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `SetFactureStatutData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface SetFactureStatutData {
  query?: {
  };
    facture_update?: Facture_Key | null;
}
```
### Using `SetFactureStatut`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, setFactureStatut, SetFactureStatutVariables } from '@dataconnect/generated';

// The `SetFactureStatut` mutation requires an argument of type `SetFactureStatutVariables`:
const setFactureStatutVars: SetFactureStatutVariables = {
  id: ..., 
  statut: ..., 
};

// Call the `setFactureStatut()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await setFactureStatut(setFactureStatutVars);
// Variables can be defined inline as well.
const { data } = await setFactureStatut({ id: ..., statut: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await setFactureStatut(dataConnect, setFactureStatutVars);

console.log(data.query);
console.log(data.facture_update);

// Or, you can use the `Promise` API.
setFactureStatut(setFactureStatutVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.facture_update);
});
```

### Using `SetFactureStatut`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, setFactureStatutRef, SetFactureStatutVariables } from '@dataconnect/generated';

// The `SetFactureStatut` mutation requires an argument of type `SetFactureStatutVariables`:
const setFactureStatutVars: SetFactureStatutVariables = {
  id: ..., 
  statut: ..., 
};

// Call the `setFactureStatutRef()` function to get a reference to the mutation.
const ref = setFactureStatutRef(setFactureStatutVars);
// Variables can be defined inline as well.
const ref = setFactureStatutRef({ id: ..., statut: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = setFactureStatutRef(dataConnect, setFactureStatutVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.facture_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.facture_update);
});
```

## CreateDocumentFolder
You can execute the `CreateDocumentFolder` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDocumentFolder(vars: CreateDocumentFolderVariables): MutationPromise<CreateDocumentFolderData, CreateDocumentFolderVariables>;

interface CreateDocumentFolderRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDocumentFolderVariables): MutationRef<CreateDocumentFolderData, CreateDocumentFolderVariables>;
}
export const createDocumentFolderRef: CreateDocumentFolderRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDocumentFolder(dc: DataConnect, vars: CreateDocumentFolderVariables): MutationPromise<CreateDocumentFolderData, CreateDocumentFolderVariables>;

interface CreateDocumentFolderRef {
  ...
  (dc: DataConnect, vars: CreateDocumentFolderVariables): MutationRef<CreateDocumentFolderData, CreateDocumentFolderVariables>;
}
export const createDocumentFolderRef: CreateDocumentFolderRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDocumentFolderRef:
```typescript
const name = createDocumentFolderRef.operationName;
console.log(name);
```

### Variables
The `CreateDocumentFolder` mutation requires an argument of type `CreateDocumentFolderVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateDocumentFolder` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDocumentFolderData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDocumentFolderData {
  query?: {
  };
    documentFolder_insert: DocumentFolder_Key;
}
```
### Using `CreateDocumentFolder`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDocumentFolder, CreateDocumentFolderVariables } from '@dataconnect/generated';

// The `CreateDocumentFolder` mutation requires an argument of type `CreateDocumentFolderVariables`:
const createDocumentFolderVars: CreateDocumentFolderVariables = {
  nom: ..., 
  slug: ..., 
  parentId: ..., // optional
  clientId: ..., // optional
  chantierId: ..., // optional
  description: ..., // optional
};

// Call the `createDocumentFolder()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDocumentFolder(createDocumentFolderVars);
// Variables can be defined inline as well.
const { data } = await createDocumentFolder({ nom: ..., slug: ..., parentId: ..., clientId: ..., chantierId: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDocumentFolder(dataConnect, createDocumentFolderVars);

console.log(data.query);
console.log(data.documentFolder_insert);

// Or, you can use the `Promise` API.
createDocumentFolder(createDocumentFolderVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.documentFolder_insert);
});
```

### Using `CreateDocumentFolder`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDocumentFolderRef, CreateDocumentFolderVariables } from '@dataconnect/generated';

// The `CreateDocumentFolder` mutation requires an argument of type `CreateDocumentFolderVariables`:
const createDocumentFolderVars: CreateDocumentFolderVariables = {
  nom: ..., 
  slug: ..., 
  parentId: ..., // optional
  clientId: ..., // optional
  chantierId: ..., // optional
  description: ..., // optional
};

// Call the `createDocumentFolderRef()` function to get a reference to the mutation.
const ref = createDocumentFolderRef(createDocumentFolderVars);
// Variables can be defined inline as well.
const ref = createDocumentFolderRef({ nom: ..., slug: ..., parentId: ..., clientId: ..., chantierId: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDocumentFolderRef(dataConnect, createDocumentFolderVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.documentFolder_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.documentFolder_insert);
});
```

## CreateDocumentAttache
You can execute the `CreateDocumentAttache` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDocumentAttache(vars: CreateDocumentAttacheVariables): MutationPromise<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;

interface CreateDocumentAttacheRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDocumentAttacheVariables): MutationRef<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;
}
export const createDocumentAttacheRef: CreateDocumentAttacheRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDocumentAttache(dc: DataConnect, vars: CreateDocumentAttacheVariables): MutationPromise<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;

interface CreateDocumentAttacheRef {
  ...
  (dc: DataConnect, vars: CreateDocumentAttacheVariables): MutationRef<CreateDocumentAttacheData, CreateDocumentAttacheVariables>;
}
export const createDocumentAttacheRef: CreateDocumentAttacheRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDocumentAttacheRef:
```typescript
const name = createDocumentAttacheRef.operationName;
console.log(name);
```

### Variables
The `CreateDocumentAttache` mutation requires an argument of type `CreateDocumentAttacheVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateDocumentAttache` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDocumentAttacheData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDocumentAttacheData {
  query?: {
  };
    documentAttache_insert: DocumentAttache_Key;
}
```
### Using `CreateDocumentAttache`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDocumentAttache, CreateDocumentAttacheVariables } from '@dataconnect/generated';

// The `CreateDocumentAttache` mutation requires an argument of type `CreateDocumentAttacheVariables`:
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

// Call the `createDocumentAttache()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDocumentAttache(createDocumentAttacheVars);
// Variables can be defined inline as well.
const { data } = await createDocumentAttache({ folderId: ..., clientId: ..., chantierId: ..., factureId: ..., nomFichier: ..., storagePath: ..., mimeType: ..., tailleBytes: ..., sha256: ..., typeDocument: ..., statut: ..., source: ..., description: ..., dateDocument: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDocumentAttache(dataConnect, createDocumentAttacheVars);

console.log(data.query);
console.log(data.documentAttache_insert);

// Or, you can use the `Promise` API.
createDocumentAttache(createDocumentAttacheVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.documentAttache_insert);
});
```

### Using `CreateDocumentAttache`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDocumentAttacheRef, CreateDocumentAttacheVariables } from '@dataconnect/generated';

// The `CreateDocumentAttache` mutation requires an argument of type `CreateDocumentAttacheVariables`:
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

// Call the `createDocumentAttacheRef()` function to get a reference to the mutation.
const ref = createDocumentAttacheRef(createDocumentAttacheVars);
// Variables can be defined inline as well.
const ref = createDocumentAttacheRef({ folderId: ..., clientId: ..., chantierId: ..., factureId: ..., nomFichier: ..., storagePath: ..., mimeType: ..., tailleBytes: ..., sha256: ..., typeDocument: ..., statut: ..., source: ..., description: ..., dateDocument: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDocumentAttacheRef(dataConnect, createDocumentAttacheVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.documentAttache_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.documentAttache_insert);
});
```

## UpdateDocumentAttacheLinks
You can execute the `UpdateDocumentAttacheLinks` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateDocumentAttacheLinks(vars: UpdateDocumentAttacheLinksVariables): MutationPromise<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;

interface UpdateDocumentAttacheLinksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateDocumentAttacheLinksVariables): MutationRef<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;
}
export const updateDocumentAttacheLinksRef: UpdateDocumentAttacheLinksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateDocumentAttacheLinks(dc: DataConnect, vars: UpdateDocumentAttacheLinksVariables): MutationPromise<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;

interface UpdateDocumentAttacheLinksRef {
  ...
  (dc: DataConnect, vars: UpdateDocumentAttacheLinksVariables): MutationRef<UpdateDocumentAttacheLinksData, UpdateDocumentAttacheLinksVariables>;
}
export const updateDocumentAttacheLinksRef: UpdateDocumentAttacheLinksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateDocumentAttacheLinksRef:
```typescript
const name = updateDocumentAttacheLinksRef.operationName;
console.log(name);
```

### Variables
The `UpdateDocumentAttacheLinks` mutation requires an argument of type `UpdateDocumentAttacheLinksVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `UpdateDocumentAttacheLinks` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateDocumentAttacheLinksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateDocumentAttacheLinksData {
  query?: {
  };
    documentAttache_update?: DocumentAttache_Key | null;
}
```
### Using `UpdateDocumentAttacheLinks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateDocumentAttacheLinks, UpdateDocumentAttacheLinksVariables } from '@dataconnect/generated';

// The `UpdateDocumentAttacheLinks` mutation requires an argument of type `UpdateDocumentAttacheLinksVariables`:
const updateDocumentAttacheLinksVars: UpdateDocumentAttacheLinksVariables = {
  id: ..., 
  folderId: ..., // optional
  clientId: ..., // optional
  chantierId: ..., // optional
  factureId: ..., // optional
  statut: ..., // optional
  typeDocument: ..., // optional
};

// Call the `updateDocumentAttacheLinks()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateDocumentAttacheLinks(updateDocumentAttacheLinksVars);
// Variables can be defined inline as well.
const { data } = await updateDocumentAttacheLinks({ id: ..., folderId: ..., clientId: ..., chantierId: ..., factureId: ..., statut: ..., typeDocument: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateDocumentAttacheLinks(dataConnect, updateDocumentAttacheLinksVars);

console.log(data.query);
console.log(data.documentAttache_update);

// Or, you can use the `Promise` API.
updateDocumentAttacheLinks(updateDocumentAttacheLinksVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.documentAttache_update);
});
```

### Using `UpdateDocumentAttacheLinks`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateDocumentAttacheLinksRef, UpdateDocumentAttacheLinksVariables } from '@dataconnect/generated';

// The `UpdateDocumentAttacheLinks` mutation requires an argument of type `UpdateDocumentAttacheLinksVariables`:
const updateDocumentAttacheLinksVars: UpdateDocumentAttacheLinksVariables = {
  id: ..., 
  folderId: ..., // optional
  clientId: ..., // optional
  chantierId: ..., // optional
  factureId: ..., // optional
  statut: ..., // optional
  typeDocument: ..., // optional
};

// Call the `updateDocumentAttacheLinksRef()` function to get a reference to the mutation.
const ref = updateDocumentAttacheLinksRef(updateDocumentAttacheLinksVars);
// Variables can be defined inline as well.
const ref = updateDocumentAttacheLinksRef({ id: ..., folderId: ..., clientId: ..., chantierId: ..., factureId: ..., statut: ..., typeDocument: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateDocumentAttacheLinksRef(dataConnect, updateDocumentAttacheLinksVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.documentAttache_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.documentAttache_update);
});
```

## CreatePrevisionnelImportBatch
You can execute the `CreatePrevisionnelImportBatch` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPrevisionnelImportBatch(vars: CreatePrevisionnelImportBatchVariables): MutationPromise<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;

interface CreatePrevisionnelImportBatchRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePrevisionnelImportBatchVariables): MutationRef<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;
}
export const createPrevisionnelImportBatchRef: CreatePrevisionnelImportBatchRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPrevisionnelImportBatch(dc: DataConnect, vars: CreatePrevisionnelImportBatchVariables): MutationPromise<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;

interface CreatePrevisionnelImportBatchRef {
  ...
  (dc: DataConnect, vars: CreatePrevisionnelImportBatchVariables): MutationRef<CreatePrevisionnelImportBatchData, CreatePrevisionnelImportBatchVariables>;
}
export const createPrevisionnelImportBatchRef: CreatePrevisionnelImportBatchRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPrevisionnelImportBatchRef:
```typescript
const name = createPrevisionnelImportBatchRef.operationName;
console.log(name);
```

### Variables
The `CreatePrevisionnelImportBatch` mutation requires an argument of type `CreatePrevisionnelImportBatchVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePrevisionnelImportBatchVariables {
  workbook: string;
  sourcePath: string;
  workbookHash?: string | null;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `CreatePrevisionnelImportBatch` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePrevisionnelImportBatchData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePrevisionnelImportBatchData {
  query?: {
  };
    previsionnelImportBatch_insert: PrevisionnelImportBatch_Key;
}
```
### Using `CreatePrevisionnelImportBatch`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPrevisionnelImportBatch, CreatePrevisionnelImportBatchVariables } from '@dataconnect/generated';

// The `CreatePrevisionnelImportBatch` mutation requires an argument of type `CreatePrevisionnelImportBatchVariables`:
const createPrevisionnelImportBatchVars: CreatePrevisionnelImportBatchVariables = {
  workbook: ..., 
  sourcePath: ..., 
  workbookHash: ..., // optional
  notes: ..., // optional
};

// Call the `createPrevisionnelImportBatch()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPrevisionnelImportBatch(createPrevisionnelImportBatchVars);
// Variables can be defined inline as well.
const { data } = await createPrevisionnelImportBatch({ workbook: ..., sourcePath: ..., workbookHash: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPrevisionnelImportBatch(dataConnect, createPrevisionnelImportBatchVars);

console.log(data.query);
console.log(data.previsionnelImportBatch_insert);

// Or, you can use the `Promise` API.
createPrevisionnelImportBatch(createPrevisionnelImportBatchVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelImportBatch_insert);
});
```

### Using `CreatePrevisionnelImportBatch`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPrevisionnelImportBatchRef, CreatePrevisionnelImportBatchVariables } from '@dataconnect/generated';

// The `CreatePrevisionnelImportBatch` mutation requires an argument of type `CreatePrevisionnelImportBatchVariables`:
const createPrevisionnelImportBatchVars: CreatePrevisionnelImportBatchVariables = {
  workbook: ..., 
  sourcePath: ..., 
  workbookHash: ..., // optional
  notes: ..., // optional
};

// Call the `createPrevisionnelImportBatchRef()` function to get a reference to the mutation.
const ref = createPrevisionnelImportBatchRef(createPrevisionnelImportBatchVars);
// Variables can be defined inline as well.
const ref = createPrevisionnelImportBatchRef({ workbook: ..., sourcePath: ..., workbookHash: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPrevisionnelImportBatchRef(dataConnect, createPrevisionnelImportBatchVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.previsionnelImportBatch_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelImportBatch_insert);
});
```

## UpdatePrevisionnelMonthlyAmount
You can execute the `UpdatePrevisionnelMonthlyAmount` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePrevisionnelMonthlyAmount(vars: UpdatePrevisionnelMonthlyAmountVariables): MutationPromise<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;

interface UpdatePrevisionnelMonthlyAmountRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePrevisionnelMonthlyAmountVariables): MutationRef<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;
}
export const updatePrevisionnelMonthlyAmountRef: UpdatePrevisionnelMonthlyAmountRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePrevisionnelMonthlyAmount(dc: DataConnect, vars: UpdatePrevisionnelMonthlyAmountVariables): MutationPromise<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;

interface UpdatePrevisionnelMonthlyAmountRef {
  ...
  (dc: DataConnect, vars: UpdatePrevisionnelMonthlyAmountVariables): MutationRef<UpdatePrevisionnelMonthlyAmountData, UpdatePrevisionnelMonthlyAmountVariables>;
}
export const updatePrevisionnelMonthlyAmountRef: UpdatePrevisionnelMonthlyAmountRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePrevisionnelMonthlyAmountRef:
```typescript
const name = updatePrevisionnelMonthlyAmountRef.operationName;
console.log(name);
```

### Variables
The `UpdatePrevisionnelMonthlyAmount` mutation requires an argument of type `UpdatePrevisionnelMonthlyAmountVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePrevisionnelMonthlyAmountVariables {
  id: UUIDString;
  planned?: number | null;
  realized?: number | null;
  invoiceSent?: boolean | null;
}
```
### Return Type
Recall that executing the `UpdatePrevisionnelMonthlyAmount` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePrevisionnelMonthlyAmountData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePrevisionnelMonthlyAmountData {
  query?: {
  };
    previsionnelMonthlyAmount_update?: PrevisionnelMonthlyAmount_Key | null;
}
```
### Using `UpdatePrevisionnelMonthlyAmount`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePrevisionnelMonthlyAmount, UpdatePrevisionnelMonthlyAmountVariables } from '@dataconnect/generated';

// The `UpdatePrevisionnelMonthlyAmount` mutation requires an argument of type `UpdatePrevisionnelMonthlyAmountVariables`:
const updatePrevisionnelMonthlyAmountVars: UpdatePrevisionnelMonthlyAmountVariables = {
  id: ..., 
  planned: ..., // optional
  realized: ..., // optional
  invoiceSent: ..., // optional
};

// Call the `updatePrevisionnelMonthlyAmount()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePrevisionnelMonthlyAmount(updatePrevisionnelMonthlyAmountVars);
// Variables can be defined inline as well.
const { data } = await updatePrevisionnelMonthlyAmount({ id: ..., planned: ..., realized: ..., invoiceSent: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePrevisionnelMonthlyAmount(dataConnect, updatePrevisionnelMonthlyAmountVars);

console.log(data.query);
console.log(data.previsionnelMonthlyAmount_update);

// Or, you can use the `Promise` API.
updatePrevisionnelMonthlyAmount(updatePrevisionnelMonthlyAmountVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelMonthlyAmount_update);
});
```

### Using `UpdatePrevisionnelMonthlyAmount`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePrevisionnelMonthlyAmountRef, UpdatePrevisionnelMonthlyAmountVariables } from '@dataconnect/generated';

// The `UpdatePrevisionnelMonthlyAmount` mutation requires an argument of type `UpdatePrevisionnelMonthlyAmountVariables`:
const updatePrevisionnelMonthlyAmountVars: UpdatePrevisionnelMonthlyAmountVariables = {
  id: ..., 
  planned: ..., // optional
  realized: ..., // optional
  invoiceSent: ..., // optional
};

// Call the `updatePrevisionnelMonthlyAmountRef()` function to get a reference to the mutation.
const ref = updatePrevisionnelMonthlyAmountRef(updatePrevisionnelMonthlyAmountVars);
// Variables can be defined inline as well.
const ref = updatePrevisionnelMonthlyAmountRef({ id: ..., planned: ..., realized: ..., invoiceSent: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePrevisionnelMonthlyAmountRef(dataConnect, updatePrevisionnelMonthlyAmountVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.previsionnelMonthlyAmount_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelMonthlyAmount_update);
});
```

## UpdatePrevisionnelLineAmounts
You can execute the `UpdatePrevisionnelLineAmounts` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePrevisionnelLineAmounts(vars: UpdatePrevisionnelLineAmountsVariables): MutationPromise<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;

interface UpdatePrevisionnelLineAmountsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePrevisionnelLineAmountsVariables): MutationRef<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;
}
export const updatePrevisionnelLineAmountsRef: UpdatePrevisionnelLineAmountsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePrevisionnelLineAmounts(dc: DataConnect, vars: UpdatePrevisionnelLineAmountsVariables): MutationPromise<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;

interface UpdatePrevisionnelLineAmountsRef {
  ...
  (dc: DataConnect, vars: UpdatePrevisionnelLineAmountsVariables): MutationRef<UpdatePrevisionnelLineAmountsData, UpdatePrevisionnelLineAmountsVariables>;
}
export const updatePrevisionnelLineAmountsRef: UpdatePrevisionnelLineAmountsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePrevisionnelLineAmountsRef:
```typescript
const name = updatePrevisionnelLineAmountsRef.operationName;
console.log(name);
```

### Variables
The `UpdatePrevisionnelLineAmounts` mutation requires an argument of type `UpdatePrevisionnelLineAmountsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `UpdatePrevisionnelLineAmounts` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePrevisionnelLineAmountsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePrevisionnelLineAmountsData {
  query?: {
  };
    previsionnelLine_update?: PrevisionnelLine_Key | null;
}
```
### Using `UpdatePrevisionnelLineAmounts`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePrevisionnelLineAmounts, UpdatePrevisionnelLineAmountsVariables } from '@dataconnect/generated';

// The `UpdatePrevisionnelLineAmounts` mutation requires an argument of type `UpdatePrevisionnelLineAmountsVariables`:
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

// Call the `updatePrevisionnelLineAmounts()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePrevisionnelLineAmounts(updatePrevisionnelLineAmountsVars);
// Variables can be defined inline as well.
const { data } = await updatePrevisionnelLineAmounts({ id: ..., rawName: ..., clientName: ..., caTce: ..., caPrevision: ..., caContrat: ..., plannedTotal: ..., realizedTotal: ..., invoicedTotal: ..., invoiceSentTotal: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePrevisionnelLineAmounts(dataConnect, updatePrevisionnelLineAmountsVars);

console.log(data.query);
console.log(data.previsionnelLine_update);

// Or, you can use the `Promise` API.
updatePrevisionnelLineAmounts(updatePrevisionnelLineAmountsVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelLine_update);
});
```

### Using `UpdatePrevisionnelLineAmounts`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePrevisionnelLineAmountsRef, UpdatePrevisionnelLineAmountsVariables } from '@dataconnect/generated';

// The `UpdatePrevisionnelLineAmounts` mutation requires an argument of type `UpdatePrevisionnelLineAmountsVariables`:
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

// Call the `updatePrevisionnelLineAmountsRef()` function to get a reference to the mutation.
const ref = updatePrevisionnelLineAmountsRef(updatePrevisionnelLineAmountsVars);
// Variables can be defined inline as well.
const ref = updatePrevisionnelLineAmountsRef({ id: ..., rawName: ..., clientName: ..., caTce: ..., caPrevision: ..., caContrat: ..., plannedTotal: ..., realizedTotal: ..., invoicedTotal: ..., invoiceSentTotal: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePrevisionnelLineAmountsRef(dataConnect, updatePrevisionnelLineAmountsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.previsionnelLine_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelLine_update);
});
```

## LinkPrevisionnelLineToChantier
You can execute the `LinkPrevisionnelLineToChantier` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
linkPrevisionnelLineToChantier(vars: LinkPrevisionnelLineToChantierVariables): MutationPromise<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;

interface LinkPrevisionnelLineToChantierRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: LinkPrevisionnelLineToChantierVariables): MutationRef<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;
}
export const linkPrevisionnelLineToChantierRef: LinkPrevisionnelLineToChantierRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
linkPrevisionnelLineToChantier(dc: DataConnect, vars: LinkPrevisionnelLineToChantierVariables): MutationPromise<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;

interface LinkPrevisionnelLineToChantierRef {
  ...
  (dc: DataConnect, vars: LinkPrevisionnelLineToChantierVariables): MutationRef<LinkPrevisionnelLineToChantierData, LinkPrevisionnelLineToChantierVariables>;
}
export const linkPrevisionnelLineToChantierRef: LinkPrevisionnelLineToChantierRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the linkPrevisionnelLineToChantierRef:
```typescript
const name = linkPrevisionnelLineToChantierRef.operationName;
console.log(name);
```

### Variables
The `LinkPrevisionnelLineToChantier` mutation requires an argument of type `LinkPrevisionnelLineToChantierVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface LinkPrevisionnelLineToChantierVariables {
  id: UUIDString;
  chantierId?: UUIDString | null;
}
```
### Return Type
Recall that executing the `LinkPrevisionnelLineToChantier` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `LinkPrevisionnelLineToChantierData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface LinkPrevisionnelLineToChantierData {
  query?: {
  };
    previsionnelLine_update?: PrevisionnelLine_Key | null;
}
```
### Using `LinkPrevisionnelLineToChantier`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, linkPrevisionnelLineToChantier, LinkPrevisionnelLineToChantierVariables } from '@dataconnect/generated';

// The `LinkPrevisionnelLineToChantier` mutation requires an argument of type `LinkPrevisionnelLineToChantierVariables`:
const linkPrevisionnelLineToChantierVars: LinkPrevisionnelLineToChantierVariables = {
  id: ..., 
  chantierId: ..., // optional
};

// Call the `linkPrevisionnelLineToChantier()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await linkPrevisionnelLineToChantier(linkPrevisionnelLineToChantierVars);
// Variables can be defined inline as well.
const { data } = await linkPrevisionnelLineToChantier({ id: ..., chantierId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await linkPrevisionnelLineToChantier(dataConnect, linkPrevisionnelLineToChantierVars);

console.log(data.query);
console.log(data.previsionnelLine_update);

// Or, you can use the `Promise` API.
linkPrevisionnelLineToChantier(linkPrevisionnelLineToChantierVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelLine_update);
});
```

### Using `LinkPrevisionnelLineToChantier`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, linkPrevisionnelLineToChantierRef, LinkPrevisionnelLineToChantierVariables } from '@dataconnect/generated';

// The `LinkPrevisionnelLineToChantier` mutation requires an argument of type `LinkPrevisionnelLineToChantierVariables`:
const linkPrevisionnelLineToChantierVars: LinkPrevisionnelLineToChantierVariables = {
  id: ..., 
  chantierId: ..., // optional
};

// Call the `linkPrevisionnelLineToChantierRef()` function to get a reference to the mutation.
const ref = linkPrevisionnelLineToChantierRef(linkPrevisionnelLineToChantierVars);
// Variables can be defined inline as well.
const ref = linkPrevisionnelLineToChantierRef({ id: ..., chantierId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = linkPrevisionnelLineToChantierRef(dataConnect, linkPrevisionnelLineToChantierVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.previsionnelLine_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelLine_update);
});
```

## UpsertPrevisionnelCellEdit
You can execute the `UpsertPrevisionnelCellEdit` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertPrevisionnelCellEdit(vars: UpsertPrevisionnelCellEditVariables): MutationPromise<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;

interface UpsertPrevisionnelCellEditRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertPrevisionnelCellEditVariables): MutationRef<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;
}
export const upsertPrevisionnelCellEditRef: UpsertPrevisionnelCellEditRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertPrevisionnelCellEdit(dc: DataConnect, vars: UpsertPrevisionnelCellEditVariables): MutationPromise<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;

interface UpsertPrevisionnelCellEditRef {
  ...
  (dc: DataConnect, vars: UpsertPrevisionnelCellEditVariables): MutationRef<UpsertPrevisionnelCellEditData, UpsertPrevisionnelCellEditVariables>;
}
export const upsertPrevisionnelCellEditRef: UpsertPrevisionnelCellEditRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertPrevisionnelCellEditRef:
```typescript
const name = upsertPrevisionnelCellEditRef.operationName;
console.log(name);
```

### Variables
The `UpsertPrevisionnelCellEdit` mutation requires an argument of type `UpsertPrevisionnelCellEditVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertPrevisionnelCellEditVariables {
  id: string;
  sourceSheet: string;
  cellRef: string;
  valueText?: string | null;
  numericValue?: number | null;
}
```
### Return Type
Recall that executing the `UpsertPrevisionnelCellEdit` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertPrevisionnelCellEditData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertPrevisionnelCellEditData {
  query?: {
  };
    previsionnelCellEdit_upsert: PrevisionnelCellEdit_Key;
}
```
### Using `UpsertPrevisionnelCellEdit`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertPrevisionnelCellEdit, UpsertPrevisionnelCellEditVariables } from '@dataconnect/generated';

// The `UpsertPrevisionnelCellEdit` mutation requires an argument of type `UpsertPrevisionnelCellEditVariables`:
const upsertPrevisionnelCellEditVars: UpsertPrevisionnelCellEditVariables = {
  id: ..., 
  sourceSheet: ..., 
  cellRef: ..., 
  valueText: ..., // optional
  numericValue: ..., // optional
};

// Call the `upsertPrevisionnelCellEdit()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertPrevisionnelCellEdit(upsertPrevisionnelCellEditVars);
// Variables can be defined inline as well.
const { data } = await upsertPrevisionnelCellEdit({ id: ..., sourceSheet: ..., cellRef: ..., valueText: ..., numericValue: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertPrevisionnelCellEdit(dataConnect, upsertPrevisionnelCellEditVars);

console.log(data.query);
console.log(data.previsionnelCellEdit_upsert);

// Or, you can use the `Promise` API.
upsertPrevisionnelCellEdit(upsertPrevisionnelCellEditVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelCellEdit_upsert);
});
```

### Using `UpsertPrevisionnelCellEdit`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertPrevisionnelCellEditRef, UpsertPrevisionnelCellEditVariables } from '@dataconnect/generated';

// The `UpsertPrevisionnelCellEdit` mutation requires an argument of type `UpsertPrevisionnelCellEditVariables`:
const upsertPrevisionnelCellEditVars: UpsertPrevisionnelCellEditVariables = {
  id: ..., 
  sourceSheet: ..., 
  cellRef: ..., 
  valueText: ..., // optional
  numericValue: ..., // optional
};

// Call the `upsertPrevisionnelCellEditRef()` function to get a reference to the mutation.
const ref = upsertPrevisionnelCellEditRef(upsertPrevisionnelCellEditVars);
// Variables can be defined inline as well.
const ref = upsertPrevisionnelCellEditRef({ id: ..., sourceSheet: ..., cellRef: ..., valueText: ..., numericValue: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertPrevisionnelCellEditRef(dataConnect, upsertPrevisionnelCellEditVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.previsionnelCellEdit_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.previsionnelCellEdit_upsert);
});
```

## CreateEmailThread
You can execute the `CreateEmailThread` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createEmailThread(vars: CreateEmailThreadVariables): MutationPromise<CreateEmailThreadData, CreateEmailThreadVariables>;

interface CreateEmailThreadRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailThreadVariables): MutationRef<CreateEmailThreadData, CreateEmailThreadVariables>;
}
export const createEmailThreadRef: CreateEmailThreadRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEmailThread(dc: DataConnect, vars: CreateEmailThreadVariables): MutationPromise<CreateEmailThreadData, CreateEmailThreadVariables>;

interface CreateEmailThreadRef {
  ...
  (dc: DataConnect, vars: CreateEmailThreadVariables): MutationRef<CreateEmailThreadData, CreateEmailThreadVariables>;
}
export const createEmailThreadRef: CreateEmailThreadRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEmailThreadRef:
```typescript
const name = createEmailThreadRef.operationName;
console.log(name);
```

### Variables
The `CreateEmailThread` mutation requires an argument of type `CreateEmailThreadVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateEmailThread` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEmailThreadData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEmailThreadData {
  query?: {
  };
    emailThread_insert: EmailThread_Key;
}
```
### Using `CreateEmailThread`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEmailThread, CreateEmailThreadVariables } from '@dataconnect/generated';

// The `CreateEmailThread` mutation requires an argument of type `CreateEmailThreadVariables`:
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

// Call the `createEmailThread()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEmailThread(createEmailThreadVars);
// Variables can be defined inline as well.
const { data } = await createEmailThread({ provider: ..., externalThreadId: ..., subject: ..., statut: ..., importance: ..., clientId: ..., chantierId: ..., assignedToId: ..., lastMessageAt: ..., participantsSummary: ..., messageCount: ..., hasAttachments: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEmailThread(dataConnect, createEmailThreadVars);

console.log(data.query);
console.log(data.emailThread_insert);

// Or, you can use the `Promise` API.
createEmailThread(createEmailThreadVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailThread_insert);
});
```

### Using `CreateEmailThread`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEmailThreadRef, CreateEmailThreadVariables } from '@dataconnect/generated';

// The `CreateEmailThread` mutation requires an argument of type `CreateEmailThreadVariables`:
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

// Call the `createEmailThreadRef()` function to get a reference to the mutation.
const ref = createEmailThreadRef(createEmailThreadVars);
// Variables can be defined inline as well.
const ref = createEmailThreadRef({ provider: ..., externalThreadId: ..., subject: ..., statut: ..., importance: ..., clientId: ..., chantierId: ..., assignedToId: ..., lastMessageAt: ..., participantsSummary: ..., messageCount: ..., hasAttachments: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEmailThreadRef(dataConnect, createEmailThreadVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.emailThread_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailThread_insert);
});
```

## UpdateEmailThreadStatusAndLinks
You can execute the `UpdateEmailThreadStatusAndLinks` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateEmailThreadStatusAndLinks(vars: UpdateEmailThreadStatusAndLinksVariables): MutationPromise<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;

interface UpdateEmailThreadStatusAndLinksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateEmailThreadStatusAndLinksVariables): MutationRef<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;
}
export const updateEmailThreadStatusAndLinksRef: UpdateEmailThreadStatusAndLinksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateEmailThreadStatusAndLinks(dc: DataConnect, vars: UpdateEmailThreadStatusAndLinksVariables): MutationPromise<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;

interface UpdateEmailThreadStatusAndLinksRef {
  ...
  (dc: DataConnect, vars: UpdateEmailThreadStatusAndLinksVariables): MutationRef<UpdateEmailThreadStatusAndLinksData, UpdateEmailThreadStatusAndLinksVariables>;
}
export const updateEmailThreadStatusAndLinksRef: UpdateEmailThreadStatusAndLinksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateEmailThreadStatusAndLinksRef:
```typescript
const name = updateEmailThreadStatusAndLinksRef.operationName;
console.log(name);
```

### Variables
The `UpdateEmailThreadStatusAndLinks` mutation requires an argument of type `UpdateEmailThreadStatusAndLinksVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateEmailThreadStatusAndLinksVariables {
  id: UUIDString;
  statut?: string | null;
  clientId?: UUIDString | null;
  chantierId?: UUIDString | null;
  assignedToId?: string | null;
}
```
### Return Type
Recall that executing the `UpdateEmailThreadStatusAndLinks` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateEmailThreadStatusAndLinksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateEmailThreadStatusAndLinksData {
  query?: {
  };
    emailThread_update?: EmailThread_Key | null;
}
```
### Using `UpdateEmailThreadStatusAndLinks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateEmailThreadStatusAndLinks, UpdateEmailThreadStatusAndLinksVariables } from '@dataconnect/generated';

// The `UpdateEmailThreadStatusAndLinks` mutation requires an argument of type `UpdateEmailThreadStatusAndLinksVariables`:
const updateEmailThreadStatusAndLinksVars: UpdateEmailThreadStatusAndLinksVariables = {
  id: ..., 
  statut: ..., // optional
  clientId: ..., // optional
  chantierId: ..., // optional
  assignedToId: ..., // optional
};

// Call the `updateEmailThreadStatusAndLinks()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateEmailThreadStatusAndLinks(updateEmailThreadStatusAndLinksVars);
// Variables can be defined inline as well.
const { data } = await updateEmailThreadStatusAndLinks({ id: ..., statut: ..., clientId: ..., chantierId: ..., assignedToId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateEmailThreadStatusAndLinks(dataConnect, updateEmailThreadStatusAndLinksVars);

console.log(data.query);
console.log(data.emailThread_update);

// Or, you can use the `Promise` API.
updateEmailThreadStatusAndLinks(updateEmailThreadStatusAndLinksVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailThread_update);
});
```

### Using `UpdateEmailThreadStatusAndLinks`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateEmailThreadStatusAndLinksRef, UpdateEmailThreadStatusAndLinksVariables } from '@dataconnect/generated';

// The `UpdateEmailThreadStatusAndLinks` mutation requires an argument of type `UpdateEmailThreadStatusAndLinksVariables`:
const updateEmailThreadStatusAndLinksVars: UpdateEmailThreadStatusAndLinksVariables = {
  id: ..., 
  statut: ..., // optional
  clientId: ..., // optional
  chantierId: ..., // optional
  assignedToId: ..., // optional
};

// Call the `updateEmailThreadStatusAndLinksRef()` function to get a reference to the mutation.
const ref = updateEmailThreadStatusAndLinksRef(updateEmailThreadStatusAndLinksVars);
// Variables can be defined inline as well.
const ref = updateEmailThreadStatusAndLinksRef({ id: ..., statut: ..., clientId: ..., chantierId: ..., assignedToId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateEmailThreadStatusAndLinksRef(dataConnect, updateEmailThreadStatusAndLinksVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.emailThread_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailThread_update);
});
```

## CreateEmailMessage
You can execute the `CreateEmailMessage` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createEmailMessage(vars: CreateEmailMessageVariables): MutationPromise<CreateEmailMessageData, CreateEmailMessageVariables>;

interface CreateEmailMessageRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailMessageVariables): MutationRef<CreateEmailMessageData, CreateEmailMessageVariables>;
}
export const createEmailMessageRef: CreateEmailMessageRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEmailMessage(dc: DataConnect, vars: CreateEmailMessageVariables): MutationPromise<CreateEmailMessageData, CreateEmailMessageVariables>;

interface CreateEmailMessageRef {
  ...
  (dc: DataConnect, vars: CreateEmailMessageVariables): MutationRef<CreateEmailMessageData, CreateEmailMessageVariables>;
}
export const createEmailMessageRef: CreateEmailMessageRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEmailMessageRef:
```typescript
const name = createEmailMessageRef.operationName;
console.log(name);
```

### Variables
The `CreateEmailMessage` mutation requires an argument of type `CreateEmailMessageVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateEmailMessage` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEmailMessageData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEmailMessageData {
  query?: {
  };
    emailMessage_insert: EmailMessage_Key;
}
```
### Using `CreateEmailMessage`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEmailMessage, CreateEmailMessageVariables } from '@dataconnect/generated';

// The `CreateEmailMessage` mutation requires an argument of type `CreateEmailMessageVariables`:
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

// Call the `createEmailMessage()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEmailMessage(createEmailMessageVars);
// Variables can be defined inline as well.
const { data } = await createEmailMessage({ threadId: ..., externalMessageId: ..., direction: ..., fromEmail: ..., fromName: ..., toSummary: ..., ccSummary: ..., subject: ..., bodyPreview: ..., bodyStoragePath: ..., bodyHash: ..., sentAt: ..., receivedAt: ..., isRead: ..., hasAttachments: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEmailMessage(dataConnect, createEmailMessageVars);

console.log(data.query);
console.log(data.emailMessage_insert);

// Or, you can use the `Promise` API.
createEmailMessage(createEmailMessageVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailMessage_insert);
});
```

### Using `CreateEmailMessage`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEmailMessageRef, CreateEmailMessageVariables } from '@dataconnect/generated';

// The `CreateEmailMessage` mutation requires an argument of type `CreateEmailMessageVariables`:
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

// Call the `createEmailMessageRef()` function to get a reference to the mutation.
const ref = createEmailMessageRef(createEmailMessageVars);
// Variables can be defined inline as well.
const ref = createEmailMessageRef({ threadId: ..., externalMessageId: ..., direction: ..., fromEmail: ..., fromName: ..., toSummary: ..., ccSummary: ..., subject: ..., bodyPreview: ..., bodyStoragePath: ..., bodyHash: ..., sentAt: ..., receivedAt: ..., isRead: ..., hasAttachments: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEmailMessageRef(dataConnect, createEmailMessageVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.emailMessage_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailMessage_insert);
});
```

## CreateEmailAttachment
You can execute the `CreateEmailAttachment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createEmailAttachment(vars: CreateEmailAttachmentVariables): MutationPromise<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;

interface CreateEmailAttachmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEmailAttachmentVariables): MutationRef<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;
}
export const createEmailAttachmentRef: CreateEmailAttachmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEmailAttachment(dc: DataConnect, vars: CreateEmailAttachmentVariables): MutationPromise<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;

interface CreateEmailAttachmentRef {
  ...
  (dc: DataConnect, vars: CreateEmailAttachmentVariables): MutationRef<CreateEmailAttachmentData, CreateEmailAttachmentVariables>;
}
export const createEmailAttachmentRef: CreateEmailAttachmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEmailAttachmentRef:
```typescript
const name = createEmailAttachmentRef.operationName;
console.log(name);
```

### Variables
The `CreateEmailAttachment` mutation requires an argument of type `CreateEmailAttachmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateEmailAttachment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEmailAttachmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEmailAttachmentData {
  query?: {
  };
    emailAttachment_insert: EmailAttachment_Key;
}
```
### Using `CreateEmailAttachment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEmailAttachment, CreateEmailAttachmentVariables } from '@dataconnect/generated';

// The `CreateEmailAttachment` mutation requires an argument of type `CreateEmailAttachmentVariables`:
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

// Call the `createEmailAttachment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEmailAttachment(createEmailAttachmentVars);
// Variables can be defined inline as well.
const { data } = await createEmailAttachment({ messageId: ..., documentId: ..., externalAttachmentId: ..., nomFichier: ..., storagePath: ..., mimeType: ..., tailleBytes: ..., sha256: ..., statut: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEmailAttachment(dataConnect, createEmailAttachmentVars);

console.log(data.query);
console.log(data.emailAttachment_insert);

// Or, you can use the `Promise` API.
createEmailAttachment(createEmailAttachmentVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailAttachment_insert);
});
```

### Using `CreateEmailAttachment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEmailAttachmentRef, CreateEmailAttachmentVariables } from '@dataconnect/generated';

// The `CreateEmailAttachment` mutation requires an argument of type `CreateEmailAttachmentVariables`:
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

// Call the `createEmailAttachmentRef()` function to get a reference to the mutation.
const ref = createEmailAttachmentRef(createEmailAttachmentVars);
// Variables can be defined inline as well.
const ref = createEmailAttachmentRef({ messageId: ..., documentId: ..., externalAttachmentId: ..., nomFichier: ..., storagePath: ..., mimeType: ..., tailleBytes: ..., sha256: ..., statut: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEmailAttachmentRef(dataConnect, createEmailAttachmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.emailAttachment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.emailAttachment_insert);
});
```

## CreatePlanningEvent
You can execute the `CreatePlanningEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPlanningEvent(vars: CreatePlanningEventVariables): MutationPromise<CreatePlanningEventData, CreatePlanningEventVariables>;

interface CreatePlanningEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePlanningEventVariables): MutationRef<CreatePlanningEventData, CreatePlanningEventVariables>;
}
export const createPlanningEventRef: CreatePlanningEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPlanningEvent(dc: DataConnect, vars: CreatePlanningEventVariables): MutationPromise<CreatePlanningEventData, CreatePlanningEventVariables>;

interface CreatePlanningEventRef {
  ...
  (dc: DataConnect, vars: CreatePlanningEventVariables): MutationRef<CreatePlanningEventData, CreatePlanningEventVariables>;
}
export const createPlanningEventRef: CreatePlanningEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPlanningEventRef:
```typescript
const name = createPlanningEventRef.operationName;
console.log(name);
```

### Variables
The `CreatePlanningEvent` mutation requires an argument of type `CreatePlanningEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreatePlanningEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePlanningEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePlanningEventData {
  query?: {
  };
    planningEvent_insert: PlanningEvent_Key;
}
```
### Using `CreatePlanningEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPlanningEvent, CreatePlanningEventVariables } from '@dataconnect/generated';

// The `CreatePlanningEvent` mutation requires an argument of type `CreatePlanningEventVariables`:
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

// Call the `createPlanningEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPlanningEvent(createPlanningEventVars);
// Variables can be defined inline as well.
const { data } = await createPlanningEvent({ chantierId: ..., titre: ..., eventType: ..., statut: ..., startAt: ..., endAt: ..., location: ..., notes: ..., createdById: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPlanningEvent(dataConnect, createPlanningEventVars);

console.log(data.query);
console.log(data.planningEvent_insert);

// Or, you can use the `Promise` API.
createPlanningEvent(createPlanningEventVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_insert);
});
```

### Using `CreatePlanningEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPlanningEventRef, CreatePlanningEventVariables } from '@dataconnect/generated';

// The `CreatePlanningEvent` mutation requires an argument of type `CreatePlanningEventVariables`:
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

// Call the `createPlanningEventRef()` function to get a reference to the mutation.
const ref = createPlanningEventRef(createPlanningEventVars);
// Variables can be defined inline as well.
const ref = createPlanningEventRef({ chantierId: ..., titre: ..., eventType: ..., statut: ..., startAt: ..., endAt: ..., location: ..., notes: ..., createdById: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPlanningEventRef(dataConnect, createPlanningEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.planningEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_insert);
});
```

## UpdatePlanningEventStatus
You can execute the `UpdatePlanningEventStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePlanningEventStatus(vars: UpdatePlanningEventStatusVariables): MutationPromise<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;

interface UpdatePlanningEventStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePlanningEventStatusVariables): MutationRef<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;
}
export const updatePlanningEventStatusRef: UpdatePlanningEventStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePlanningEventStatus(dc: DataConnect, vars: UpdatePlanningEventStatusVariables): MutationPromise<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;

interface UpdatePlanningEventStatusRef {
  ...
  (dc: DataConnect, vars: UpdatePlanningEventStatusVariables): MutationRef<UpdatePlanningEventStatusData, UpdatePlanningEventStatusVariables>;
}
export const updatePlanningEventStatusRef: UpdatePlanningEventStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePlanningEventStatusRef:
```typescript
const name = updatePlanningEventStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdatePlanningEventStatus` mutation requires an argument of type `UpdatePlanningEventStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePlanningEventStatusVariables {
  id: UUIDString;
  statut: string;
  updatedById?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePlanningEventStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePlanningEventStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePlanningEventStatusData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}
```
### Using `UpdatePlanningEventStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePlanningEventStatus, UpdatePlanningEventStatusVariables } from '@dataconnect/generated';

// The `UpdatePlanningEventStatus` mutation requires an argument of type `UpdatePlanningEventStatusVariables`:
const updatePlanningEventStatusVars: UpdatePlanningEventStatusVariables = {
  id: ..., 
  statut: ..., 
  updatedById: ..., // optional
};

// Call the `updatePlanningEventStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePlanningEventStatus(updatePlanningEventStatusVars);
// Variables can be defined inline as well.
const { data } = await updatePlanningEventStatus({ id: ..., statut: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePlanningEventStatus(dataConnect, updatePlanningEventStatusVars);

console.log(data.query);
console.log(data.planningEvent_update);

// Or, you can use the `Promise` API.
updatePlanningEventStatus(updatePlanningEventStatusVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_update);
});
```

### Using `UpdatePlanningEventStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePlanningEventStatusRef, UpdatePlanningEventStatusVariables } from '@dataconnect/generated';

// The `UpdatePlanningEventStatus` mutation requires an argument of type `UpdatePlanningEventStatusVariables`:
const updatePlanningEventStatusVars: UpdatePlanningEventStatusVariables = {
  id: ..., 
  statut: ..., 
  updatedById: ..., // optional
};

// Call the `updatePlanningEventStatusRef()` function to get a reference to the mutation.
const ref = updatePlanningEventStatusRef(updatePlanningEventStatusVars);
// Variables can be defined inline as well.
const ref = updatePlanningEventStatusRef({ id: ..., statut: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePlanningEventStatusRef(dataConnect, updatePlanningEventStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.planningEvent_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_update);
});
```

## UpdatePlanningEventDetails
You can execute the `UpdatePlanningEventDetails` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePlanningEventDetails(vars: UpdatePlanningEventDetailsVariables): MutationPromise<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;

interface UpdatePlanningEventDetailsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePlanningEventDetailsVariables): MutationRef<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;
}
export const updatePlanningEventDetailsRef: UpdatePlanningEventDetailsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePlanningEventDetails(dc: DataConnect, vars: UpdatePlanningEventDetailsVariables): MutationPromise<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;

interface UpdatePlanningEventDetailsRef {
  ...
  (dc: DataConnect, vars: UpdatePlanningEventDetailsVariables): MutationRef<UpdatePlanningEventDetailsData, UpdatePlanningEventDetailsVariables>;
}
export const updatePlanningEventDetailsRef: UpdatePlanningEventDetailsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePlanningEventDetailsRef:
```typescript
const name = updatePlanningEventDetailsRef.operationName;
console.log(name);
```

### Variables
The `UpdatePlanningEventDetails` mutation requires an argument of type `UpdatePlanningEventDetailsVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `UpdatePlanningEventDetails` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePlanningEventDetailsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePlanningEventDetailsData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}
```
### Using `UpdatePlanningEventDetails`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePlanningEventDetails, UpdatePlanningEventDetailsVariables } from '@dataconnect/generated';

// The `UpdatePlanningEventDetails` mutation requires an argument of type `UpdatePlanningEventDetailsVariables`:
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

// Call the `updatePlanningEventDetails()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePlanningEventDetails(updatePlanningEventDetailsVars);
// Variables can be defined inline as well.
const { data } = await updatePlanningEventDetails({ id: ..., chantierId: ..., titre: ..., eventType: ..., statut: ..., startAt: ..., endAt: ..., location: ..., notes: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePlanningEventDetails(dataConnect, updatePlanningEventDetailsVars);

console.log(data.query);
console.log(data.planningEvent_update);

// Or, you can use the `Promise` API.
updatePlanningEventDetails(updatePlanningEventDetailsVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_update);
});
```

### Using `UpdatePlanningEventDetails`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePlanningEventDetailsRef, UpdatePlanningEventDetailsVariables } from '@dataconnect/generated';

// The `UpdatePlanningEventDetails` mutation requires an argument of type `UpdatePlanningEventDetailsVariables`:
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

// Call the `updatePlanningEventDetailsRef()` function to get a reference to the mutation.
const ref = updatePlanningEventDetailsRef(updatePlanningEventDetailsVars);
// Variables can be defined inline as well.
const ref = updatePlanningEventDetailsRef({ id: ..., chantierId: ..., titre: ..., eventType: ..., statut: ..., startAt: ..., endAt: ..., location: ..., notes: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePlanningEventDetailsRef(dataConnect, updatePlanningEventDetailsVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.planningEvent_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_update);
});
```

## CancelPlanningEvent
You can execute the `CancelPlanningEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
cancelPlanningEvent(vars: CancelPlanningEventVariables): MutationPromise<CancelPlanningEventData, CancelPlanningEventVariables>;

interface CancelPlanningEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CancelPlanningEventVariables): MutationRef<CancelPlanningEventData, CancelPlanningEventVariables>;
}
export const cancelPlanningEventRef: CancelPlanningEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
cancelPlanningEvent(dc: DataConnect, vars: CancelPlanningEventVariables): MutationPromise<CancelPlanningEventData, CancelPlanningEventVariables>;

interface CancelPlanningEventRef {
  ...
  (dc: DataConnect, vars: CancelPlanningEventVariables): MutationRef<CancelPlanningEventData, CancelPlanningEventVariables>;
}
export const cancelPlanningEventRef: CancelPlanningEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the cancelPlanningEventRef:
```typescript
const name = cancelPlanningEventRef.operationName;
console.log(name);
```

### Variables
The `CancelPlanningEvent` mutation requires an argument of type `CancelPlanningEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CancelPlanningEventVariables {
  id: UUIDString;
  notes?: string | null;
  updatedById?: string | null;
}
```
### Return Type
Recall that executing the `CancelPlanningEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CancelPlanningEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CancelPlanningEventData {
  query?: {
  };
    planningEvent_update?: PlanningEvent_Key | null;
}
```
### Using `CancelPlanningEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, cancelPlanningEvent, CancelPlanningEventVariables } from '@dataconnect/generated';

// The `CancelPlanningEvent` mutation requires an argument of type `CancelPlanningEventVariables`:
const cancelPlanningEventVars: CancelPlanningEventVariables = {
  id: ..., 
  notes: ..., // optional
  updatedById: ..., // optional
};

// Call the `cancelPlanningEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await cancelPlanningEvent(cancelPlanningEventVars);
// Variables can be defined inline as well.
const { data } = await cancelPlanningEvent({ id: ..., notes: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await cancelPlanningEvent(dataConnect, cancelPlanningEventVars);

console.log(data.query);
console.log(data.planningEvent_update);

// Or, you can use the `Promise` API.
cancelPlanningEvent(cancelPlanningEventVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_update);
});
```

### Using `CancelPlanningEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, cancelPlanningEventRef, CancelPlanningEventVariables } from '@dataconnect/generated';

// The `CancelPlanningEvent` mutation requires an argument of type `CancelPlanningEventVariables`:
const cancelPlanningEventVars: CancelPlanningEventVariables = {
  id: ..., 
  notes: ..., // optional
  updatedById: ..., // optional
};

// Call the `cancelPlanningEventRef()` function to get a reference to the mutation.
const ref = cancelPlanningEventRef(cancelPlanningEventVars);
// Variables can be defined inline as well.
const ref = cancelPlanningEventRef({ id: ..., notes: ..., updatedById: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = cancelPlanningEventRef(dataConnect, cancelPlanningEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.planningEvent_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningEvent_update);
});
```

## CreatePlanningAssignment
You can execute the `CreatePlanningAssignment` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createPlanningAssignment(vars: CreatePlanningAssignmentVariables): MutationPromise<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;

interface CreatePlanningAssignmentRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreatePlanningAssignmentVariables): MutationRef<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;
}
export const createPlanningAssignmentRef: CreatePlanningAssignmentRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createPlanningAssignment(dc: DataConnect, vars: CreatePlanningAssignmentVariables): MutationPromise<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;

interface CreatePlanningAssignmentRef {
  ...
  (dc: DataConnect, vars: CreatePlanningAssignmentVariables): MutationRef<CreatePlanningAssignmentData, CreatePlanningAssignmentVariables>;
}
export const createPlanningAssignmentRef: CreatePlanningAssignmentRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createPlanningAssignmentRef:
```typescript
const name = createPlanningAssignmentRef.operationName;
console.log(name);
```

### Variables
The `CreatePlanningAssignment` mutation requires an argument of type `CreatePlanningAssignmentVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreatePlanningAssignmentVariables {
  eventId: UUIDString;
  userId?: string | null;
  assignmentRole?: string | null;
  statut: string;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `CreatePlanningAssignment` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreatePlanningAssignmentData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreatePlanningAssignmentData {
  query?: {
  };
    planningAssignment_insert: PlanningAssignment_Key;
}
```
### Using `CreatePlanningAssignment`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createPlanningAssignment, CreatePlanningAssignmentVariables } from '@dataconnect/generated';

// The `CreatePlanningAssignment` mutation requires an argument of type `CreatePlanningAssignmentVariables`:
const createPlanningAssignmentVars: CreatePlanningAssignmentVariables = {
  eventId: ..., 
  userId: ..., // optional
  assignmentRole: ..., // optional
  statut: ..., 
  notes: ..., // optional
};

// Call the `createPlanningAssignment()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createPlanningAssignment(createPlanningAssignmentVars);
// Variables can be defined inline as well.
const { data } = await createPlanningAssignment({ eventId: ..., userId: ..., assignmentRole: ..., statut: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createPlanningAssignment(dataConnect, createPlanningAssignmentVars);

console.log(data.query);
console.log(data.planningAssignment_insert);

// Or, you can use the `Promise` API.
createPlanningAssignment(createPlanningAssignmentVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningAssignment_insert);
});
```

### Using `CreatePlanningAssignment`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createPlanningAssignmentRef, CreatePlanningAssignmentVariables } from '@dataconnect/generated';

// The `CreatePlanningAssignment` mutation requires an argument of type `CreatePlanningAssignmentVariables`:
const createPlanningAssignmentVars: CreatePlanningAssignmentVariables = {
  eventId: ..., 
  userId: ..., // optional
  assignmentRole: ..., // optional
  statut: ..., 
  notes: ..., // optional
};

// Call the `createPlanningAssignmentRef()` function to get a reference to the mutation.
const ref = createPlanningAssignmentRef(createPlanningAssignmentVars);
// Variables can be defined inline as well.
const ref = createPlanningAssignmentRef({ eventId: ..., userId: ..., assignmentRole: ..., statut: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createPlanningAssignmentRef(dataConnect, createPlanningAssignmentVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.planningAssignment_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningAssignment_insert);
});
```

## UpdatePlanningAssignmentStatus
You can execute the `UpdatePlanningAssignmentStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updatePlanningAssignmentStatus(vars: UpdatePlanningAssignmentStatusVariables): MutationPromise<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;

interface UpdatePlanningAssignmentStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdatePlanningAssignmentStatusVariables): MutationRef<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;
}
export const updatePlanningAssignmentStatusRef: UpdatePlanningAssignmentStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updatePlanningAssignmentStatus(dc: DataConnect, vars: UpdatePlanningAssignmentStatusVariables): MutationPromise<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;

interface UpdatePlanningAssignmentStatusRef {
  ...
  (dc: DataConnect, vars: UpdatePlanningAssignmentStatusVariables): MutationRef<UpdatePlanningAssignmentStatusData, UpdatePlanningAssignmentStatusVariables>;
}
export const updatePlanningAssignmentStatusRef: UpdatePlanningAssignmentStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updatePlanningAssignmentStatusRef:
```typescript
const name = updatePlanningAssignmentStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdatePlanningAssignmentStatus` mutation requires an argument of type `UpdatePlanningAssignmentStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdatePlanningAssignmentStatusVariables {
  id: UUIDString;
  statut: string;
  notes?: string | null;
}
```
### Return Type
Recall that executing the `UpdatePlanningAssignmentStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdatePlanningAssignmentStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdatePlanningAssignmentStatusData {
  query?: {
  };
    planningAssignment_update?: PlanningAssignment_Key | null;
}
```
### Using `UpdatePlanningAssignmentStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updatePlanningAssignmentStatus, UpdatePlanningAssignmentStatusVariables } from '@dataconnect/generated';

// The `UpdatePlanningAssignmentStatus` mutation requires an argument of type `UpdatePlanningAssignmentStatusVariables`:
const updatePlanningAssignmentStatusVars: UpdatePlanningAssignmentStatusVariables = {
  id: ..., 
  statut: ..., 
  notes: ..., // optional
};

// Call the `updatePlanningAssignmentStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updatePlanningAssignmentStatus(updatePlanningAssignmentStatusVars);
// Variables can be defined inline as well.
const { data } = await updatePlanningAssignmentStatus({ id: ..., statut: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updatePlanningAssignmentStatus(dataConnect, updatePlanningAssignmentStatusVars);

console.log(data.query);
console.log(data.planningAssignment_update);

// Or, you can use the `Promise` API.
updatePlanningAssignmentStatus(updatePlanningAssignmentStatusVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningAssignment_update);
});
```

### Using `UpdatePlanningAssignmentStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updatePlanningAssignmentStatusRef, UpdatePlanningAssignmentStatusVariables } from '@dataconnect/generated';

// The `UpdatePlanningAssignmentStatus` mutation requires an argument of type `UpdatePlanningAssignmentStatusVariables`:
const updatePlanningAssignmentStatusVars: UpdatePlanningAssignmentStatusVariables = {
  id: ..., 
  statut: ..., 
  notes: ..., // optional
};

// Call the `updatePlanningAssignmentStatusRef()` function to get a reference to the mutation.
const ref = updatePlanningAssignmentStatusRef(updatePlanningAssignmentStatusVars);
// Variables can be defined inline as well.
const ref = updatePlanningAssignmentStatusRef({ id: ..., statut: ..., notes: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updatePlanningAssignmentStatusRef(dataConnect, updatePlanningAssignmentStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.planningAssignment_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.planningAssignment_update);
});
```

## CreateAnalyticsSnapshot
You can execute the `CreateAnalyticsSnapshot` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAnalyticsSnapshot(vars: CreateAnalyticsSnapshotVariables): MutationPromise<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;

interface CreateAnalyticsSnapshotRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAnalyticsSnapshotVariables): MutationRef<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;
}
export const createAnalyticsSnapshotRef: CreateAnalyticsSnapshotRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAnalyticsSnapshot(dc: DataConnect, vars: CreateAnalyticsSnapshotVariables): MutationPromise<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;

interface CreateAnalyticsSnapshotRef {
  ...
  (dc: DataConnect, vars: CreateAnalyticsSnapshotVariables): MutationRef<CreateAnalyticsSnapshotData, CreateAnalyticsSnapshotVariables>;
}
export const createAnalyticsSnapshotRef: CreateAnalyticsSnapshotRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAnalyticsSnapshotRef:
```typescript
const name = createAnalyticsSnapshotRef.operationName;
console.log(name);
```

### Variables
The `CreateAnalyticsSnapshot` mutation requires an argument of type `CreateAnalyticsSnapshotVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateAnalyticsSnapshot` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAnalyticsSnapshotData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAnalyticsSnapshotData {
  query?: {
  };
    analyticsSnapshot_insert: AnalyticsSnapshot_Key;
}
```
### Using `CreateAnalyticsSnapshot`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAnalyticsSnapshot, CreateAnalyticsSnapshotVariables } from '@dataconnect/generated';

// The `CreateAnalyticsSnapshot` mutation requires an argument of type `CreateAnalyticsSnapshotVariables`:
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

// Call the `createAnalyticsSnapshot()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAnalyticsSnapshot(createAnalyticsSnapshotVars);
// Variables can be defined inline as well.
const { data } = await createAnalyticsSnapshot({ environment: ..., snapshotType: ..., scopeType: ..., scopeId: ..., periodStart: ..., periodEnd: ..., status: ..., totalCaPrevision: ..., totalCaRealise: ..., totalFacturesTtc: ..., totalMarge: ..., payloadPath: ..., payloadHash: ..., sourceWatermark: ..., createdById: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAnalyticsSnapshot(dataConnect, createAnalyticsSnapshotVars);

console.log(data.query);
console.log(data.analyticsSnapshot_insert);

// Or, you can use the `Promise` API.
createAnalyticsSnapshot(createAnalyticsSnapshotVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.analyticsSnapshot_insert);
});
```

### Using `CreateAnalyticsSnapshot`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAnalyticsSnapshotRef, CreateAnalyticsSnapshotVariables } from '@dataconnect/generated';

// The `CreateAnalyticsSnapshot` mutation requires an argument of type `CreateAnalyticsSnapshotVariables`:
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

// Call the `createAnalyticsSnapshotRef()` function to get a reference to the mutation.
const ref = createAnalyticsSnapshotRef(createAnalyticsSnapshotVars);
// Variables can be defined inline as well.
const ref = createAnalyticsSnapshotRef({ environment: ..., snapshotType: ..., scopeType: ..., scopeId: ..., periodStart: ..., periodEnd: ..., status: ..., totalCaPrevision: ..., totalCaRealise: ..., totalFacturesTtc: ..., totalMarge: ..., payloadPath: ..., payloadHash: ..., sourceWatermark: ..., createdById: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAnalyticsSnapshotRef(dataConnect, createAnalyticsSnapshotVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.analyticsSnapshot_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.analyticsSnapshot_insert);
});
```

## CreateRapport
You can execute the `CreateRapport` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createRapport(vars: CreateRapportVariables): MutationPromise<CreateRapportData, CreateRapportVariables>;

interface CreateRapportRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateRapportVariables): MutationRef<CreateRapportData, CreateRapportVariables>;
}
export const createRapportRef: CreateRapportRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createRapport(dc: DataConnect, vars: CreateRapportVariables): MutationPromise<CreateRapportData, CreateRapportVariables>;

interface CreateRapportRef {
  ...
  (dc: DataConnect, vars: CreateRapportVariables): MutationRef<CreateRapportData, CreateRapportVariables>;
}
export const createRapportRef: CreateRapportRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createRapportRef:
```typescript
const name = createRapportRef.operationName;
console.log(name);
```

### Variables
The `CreateRapport` mutation requires an argument of type `CreateRapportVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateRapport` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateRapportData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateRapportData {
  query?: {
  };
    rapport_insert: Rapport_Key;
}
```
### Using `CreateRapport`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createRapport, CreateRapportVariables } from '@dataconnect/generated';

// The `CreateRapport` mutation requires an argument of type `CreateRapportVariables`:
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

// Call the `createRapport()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createRapport(createRapportVars);
// Variables can be defined inline as well.
const { data } = await createRapport({ snapshotId: ..., authorId: ..., clientId: ..., chantierId: ..., titre: ..., rapportType: ..., statut: ..., periodeDebut: ..., periodeFin: ..., format: ..., storagePath: ..., sha256: ..., summary: ..., generatedAt: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createRapport(dataConnect, createRapportVars);

console.log(data.query);
console.log(data.rapport_insert);

// Or, you can use the `Promise` API.
createRapport(createRapportVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.rapport_insert);
});
```

### Using `CreateRapport`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createRapportRef, CreateRapportVariables } from '@dataconnect/generated';

// The `CreateRapport` mutation requires an argument of type `CreateRapportVariables`:
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

// Call the `createRapportRef()` function to get a reference to the mutation.
const ref = createRapportRef(createRapportVars);
// Variables can be defined inline as well.
const ref = createRapportRef({ snapshotId: ..., authorId: ..., clientId: ..., chantierId: ..., titre: ..., rapportType: ..., statut: ..., periodeDebut: ..., periodeFin: ..., format: ..., storagePath: ..., sha256: ..., summary: ..., generatedAt: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createRapportRef(dataConnect, createRapportVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.rapport_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.rapport_insert);
});
```

## MarkRapportGenerated
You can execute the `MarkRapportGenerated` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
markRapportGenerated(vars: MarkRapportGeneratedVariables): MutationPromise<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;

interface MarkRapportGeneratedRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: MarkRapportGeneratedVariables): MutationRef<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;
}
export const markRapportGeneratedRef: MarkRapportGeneratedRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
markRapportGenerated(dc: DataConnect, vars: MarkRapportGeneratedVariables): MutationPromise<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;

interface MarkRapportGeneratedRef {
  ...
  (dc: DataConnect, vars: MarkRapportGeneratedVariables): MutationRef<MarkRapportGeneratedData, MarkRapportGeneratedVariables>;
}
export const markRapportGeneratedRef: MarkRapportGeneratedRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the markRapportGeneratedRef:
```typescript
const name = markRapportGeneratedRef.operationName;
console.log(name);
```

### Variables
The `MarkRapportGenerated` mutation requires an argument of type `MarkRapportGeneratedVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `MarkRapportGenerated` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `MarkRapportGeneratedData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface MarkRapportGeneratedData {
  query?: {
  };
    rapport_update?: Rapport_Key | null;
}
```
### Using `MarkRapportGenerated`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, markRapportGenerated, MarkRapportGeneratedVariables } from '@dataconnect/generated';

// The `MarkRapportGenerated` mutation requires an argument of type `MarkRapportGeneratedVariables`:
const markRapportGeneratedVars: MarkRapportGeneratedVariables = {
  id: ..., 
  statut: ..., 
  format: ..., // optional
  storagePath: ..., // optional
  sha256: ..., // optional
  generatedAt: ..., // optional
  summary: ..., // optional
};

// Call the `markRapportGenerated()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await markRapportGenerated(markRapportGeneratedVars);
// Variables can be defined inline as well.
const { data } = await markRapportGenerated({ id: ..., statut: ..., format: ..., storagePath: ..., sha256: ..., generatedAt: ..., summary: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await markRapportGenerated(dataConnect, markRapportGeneratedVars);

console.log(data.query);
console.log(data.rapport_update);

// Or, you can use the `Promise` API.
markRapportGenerated(markRapportGeneratedVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.rapport_update);
});
```

### Using `MarkRapportGenerated`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, markRapportGeneratedRef, MarkRapportGeneratedVariables } from '@dataconnect/generated';

// The `MarkRapportGenerated` mutation requires an argument of type `MarkRapportGeneratedVariables`:
const markRapportGeneratedVars: MarkRapportGeneratedVariables = {
  id: ..., 
  statut: ..., 
  format: ..., // optional
  storagePath: ..., // optional
  sha256: ..., // optional
  generatedAt: ..., // optional
  summary: ..., // optional
};

// Call the `markRapportGeneratedRef()` function to get a reference to the mutation.
const ref = markRapportGeneratedRef(markRapportGeneratedVars);
// Variables can be defined inline as well.
const ref = markRapportGeneratedRef({ id: ..., statut: ..., format: ..., storagePath: ..., sha256: ..., generatedAt: ..., summary: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = markRapportGeneratedRef(dataConnect, markRapportGeneratedVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.rapport_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.rapport_update);
});
```

## CreateAuditEvent
You can execute the `CreateAuditEvent` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createAuditEvent(vars: CreateAuditEventVariables): MutationPromise<CreateAuditEventData, CreateAuditEventVariables>;

interface CreateAuditEventRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateAuditEventVariables): MutationRef<CreateAuditEventData, CreateAuditEventVariables>;
}
export const createAuditEventRef: CreateAuditEventRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createAuditEvent(dc: DataConnect, vars: CreateAuditEventVariables): MutationPromise<CreateAuditEventData, CreateAuditEventVariables>;

interface CreateAuditEventRef {
  ...
  (dc: DataConnect, vars: CreateAuditEventVariables): MutationRef<CreateAuditEventData, CreateAuditEventVariables>;
}
export const createAuditEventRef: CreateAuditEventRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createAuditEventRef:
```typescript
const name = createAuditEventRef.operationName;
console.log(name);
```

### Variables
The `CreateAuditEvent` mutation requires an argument of type `CreateAuditEventVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateAuditEvent` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateAuditEventData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateAuditEventData {
  query?: {
  };
    auditEvent_insert: AuditEvent_Key;
}
```
### Using `CreateAuditEvent`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createAuditEvent, CreateAuditEventVariables } from '@dataconnect/generated';

// The `CreateAuditEvent` mutation requires an argument of type `CreateAuditEventVariables`:
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

// Call the `createAuditEvent()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createAuditEvent(createAuditEventVars);
// Variables can be defined inline as well.
const { data } = await createAuditEvent({ environment: ..., eventType: ..., severity: ..., entityType: ..., entityId: ..., action: ..., status: ..., actorEmail: ..., source: ..., message: ..., evidencePath: ..., evidenceHash: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createAuditEvent(dataConnect, createAuditEventVars);

console.log(data.query);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
createAuditEvent(createAuditEventVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.auditEvent_insert);
});
```

### Using `CreateAuditEvent`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createAuditEventRef, CreateAuditEventVariables } from '@dataconnect/generated';

// The `CreateAuditEvent` mutation requires an argument of type `CreateAuditEventVariables`:
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

// Call the `createAuditEventRef()` function to get a reference to the mutation.
const ref = createAuditEventRef(createAuditEventVars);
// Variables can be defined inline as well.
const ref = createAuditEventRef({ environment: ..., eventType: ..., severity: ..., entityType: ..., entityId: ..., action: ..., status: ..., actorEmail: ..., source: ..., message: ..., evidencePath: ..., evidenceHash: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createAuditEventRef(dataConnect, createAuditEventVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.auditEvent_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.auditEvent_insert);
});
```

## CreateCheckpointRun
You can execute the `CreateCheckpointRun` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCheckpointRun(vars: CreateCheckpointRunVariables): MutationPromise<CreateCheckpointRunData, CreateCheckpointRunVariables>;

interface CreateCheckpointRunRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointRunVariables): MutationRef<CreateCheckpointRunData, CreateCheckpointRunVariables>;
}
export const createCheckpointRunRef: CreateCheckpointRunRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCheckpointRun(dc: DataConnect, vars: CreateCheckpointRunVariables): MutationPromise<CreateCheckpointRunData, CreateCheckpointRunVariables>;

interface CreateCheckpointRunRef {
  ...
  (dc: DataConnect, vars: CreateCheckpointRunVariables): MutationRef<CreateCheckpointRunData, CreateCheckpointRunVariables>;
}
export const createCheckpointRunRef: CreateCheckpointRunRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCheckpointRunRef:
```typescript
const name = createCheckpointRunRef.operationName;
console.log(name);
```

### Variables
The `CreateCheckpointRun` mutation requires an argument of type `CreateCheckpointRunVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateCheckpointRun` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCheckpointRunData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCheckpointRunData {
  query?: {
  };
    checkpointRun_insert: CheckpointRun_Key;
}
```
### Using `CreateCheckpointRun`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCheckpointRun, CreateCheckpointRunVariables } from '@dataconnect/generated';

// The `CreateCheckpointRun` mutation requires an argument of type `CreateCheckpointRunVariables`:
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

// Call the `createCheckpointRun()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCheckpointRun(createCheckpointRunVars);
// Variables can be defined inline as well.
const { data } = await createCheckpointRun({ environment: ..., checkpointKey: ..., title: ..., status: ..., finishedAt: ..., commitSha: ..., sourceBranch: ..., command: ..., actorEmail: ..., summary: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCheckpointRun(dataConnect, createCheckpointRunVars);

console.log(data.query);
console.log(data.checkpointRun_insert);

// Or, you can use the `Promise` API.
createCheckpointRun(createCheckpointRunVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointRun_insert);
});
```

### Using `CreateCheckpointRun`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCheckpointRunRef, CreateCheckpointRunVariables } from '@dataconnect/generated';

// The `CreateCheckpointRun` mutation requires an argument of type `CreateCheckpointRunVariables`:
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

// Call the `createCheckpointRunRef()` function to get a reference to the mutation.
const ref = createCheckpointRunRef(createCheckpointRunVars);
// Variables can be defined inline as well.
const ref = createCheckpointRunRef({ environment: ..., checkpointKey: ..., title: ..., status: ..., finishedAt: ..., commitSha: ..., sourceBranch: ..., command: ..., actorEmail: ..., summary: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCheckpointRunRef(dataConnect, createCheckpointRunVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.checkpointRun_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointRun_insert);
});
```

## CreateCheckpointStep
You can execute the `CreateCheckpointStep` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCheckpointStep(vars: CreateCheckpointStepVariables): MutationPromise<CreateCheckpointStepData, CreateCheckpointStepVariables>;

interface CreateCheckpointStepRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointStepVariables): MutationRef<CreateCheckpointStepData, CreateCheckpointStepVariables>;
}
export const createCheckpointStepRef: CreateCheckpointStepRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCheckpointStep(dc: DataConnect, vars: CreateCheckpointStepVariables): MutationPromise<CreateCheckpointStepData, CreateCheckpointStepVariables>;

interface CreateCheckpointStepRef {
  ...
  (dc: DataConnect, vars: CreateCheckpointStepVariables): MutationRef<CreateCheckpointStepData, CreateCheckpointStepVariables>;
}
export const createCheckpointStepRef: CreateCheckpointStepRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCheckpointStepRef:
```typescript
const name = createCheckpointStepRef.operationName;
console.log(name);
```

### Variables
The `CreateCheckpointStep` mutation requires an argument of type `CreateCheckpointStepVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateCheckpointStep` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCheckpointStepData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCheckpointStepData {
  query?: {
  };
    checkpointStep_insert: CheckpointStep_Key;
}
```
### Using `CreateCheckpointStep`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCheckpointStep, CreateCheckpointStepVariables } from '@dataconnect/generated';

// The `CreateCheckpointStep` mutation requires an argument of type `CreateCheckpointStepVariables`:
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

// Call the `createCheckpointStep()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCheckpointStep(createCheckpointStepVars);
// Variables can be defined inline as well.
const { data } = await createCheckpointStep({ runId: ..., stepKey: ..., label: ..., status: ..., command: ..., exitCode: ..., durationMs: ..., startedAt: ..., finishedAt: ..., logPath: ..., logHash: ..., message: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCheckpointStep(dataConnect, createCheckpointStepVars);

console.log(data.query);
console.log(data.checkpointStep_insert);

// Or, you can use the `Promise` API.
createCheckpointStep(createCheckpointStepVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointStep_insert);
});
```

### Using `CreateCheckpointStep`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCheckpointStepRef, CreateCheckpointStepVariables } from '@dataconnect/generated';

// The `CreateCheckpointStep` mutation requires an argument of type `CreateCheckpointStepVariables`:
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

// Call the `createCheckpointStepRef()` function to get a reference to the mutation.
const ref = createCheckpointStepRef(createCheckpointStepVars);
// Variables can be defined inline as well.
const ref = createCheckpointStepRef({ runId: ..., stepKey: ..., label: ..., status: ..., command: ..., exitCode: ..., durationMs: ..., startedAt: ..., finishedAt: ..., logPath: ..., logHash: ..., message: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCheckpointStepRef(dataConnect, createCheckpointStepVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.checkpointStep_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointStep_insert);
});
```

## CreateCheckpointArtifact
You can execute the `CreateCheckpointArtifact` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCheckpointArtifact(vars: CreateCheckpointArtifactVariables): MutationPromise<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;

interface CreateCheckpointArtifactRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointArtifactVariables): MutationRef<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;
}
export const createCheckpointArtifactRef: CreateCheckpointArtifactRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCheckpointArtifact(dc: DataConnect, vars: CreateCheckpointArtifactVariables): MutationPromise<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;

interface CreateCheckpointArtifactRef {
  ...
  (dc: DataConnect, vars: CreateCheckpointArtifactVariables): MutationRef<CreateCheckpointArtifactData, CreateCheckpointArtifactVariables>;
}
export const createCheckpointArtifactRef: CreateCheckpointArtifactRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCheckpointArtifactRef:
```typescript
const name = createCheckpointArtifactRef.operationName;
console.log(name);
```

### Variables
The `CreateCheckpointArtifact` mutation requires an argument of type `CreateCheckpointArtifactVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateCheckpointArtifact` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCheckpointArtifactData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCheckpointArtifactData {
  query?: {
  };
    checkpointArtifact_insert: CheckpointArtifact_Key;
}
```
### Using `CreateCheckpointArtifact`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCheckpointArtifact, CreateCheckpointArtifactVariables } from '@dataconnect/generated';

// The `CreateCheckpointArtifact` mutation requires an argument of type `CreateCheckpointArtifactVariables`:
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

// Call the `createCheckpointArtifact()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCheckpointArtifact(createCheckpointArtifactVars);
// Variables can be defined inline as well.
const { data } = await createCheckpointArtifact({ runId: ..., stepId: ..., artifactType: ..., path: ..., storagePath: ..., sha256: ..., sizeBytes: ..., mimeType: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCheckpointArtifact(dataConnect, createCheckpointArtifactVars);

console.log(data.query);
console.log(data.checkpointArtifact_insert);

// Or, you can use the `Promise` API.
createCheckpointArtifact(createCheckpointArtifactVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointArtifact_insert);
});
```

### Using `CreateCheckpointArtifact`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCheckpointArtifactRef, CreateCheckpointArtifactVariables } from '@dataconnect/generated';

// The `CreateCheckpointArtifact` mutation requires an argument of type `CreateCheckpointArtifactVariables`:
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

// Call the `createCheckpointArtifactRef()` function to get a reference to the mutation.
const ref = createCheckpointArtifactRef(createCheckpointArtifactVars);
// Variables can be defined inline as well.
const ref = createCheckpointArtifactRef({ runId: ..., stepId: ..., artifactType: ..., path: ..., storagePath: ..., sha256: ..., sizeBytes: ..., mimeType: ..., description: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCheckpointArtifactRef(dataConnect, createCheckpointArtifactVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.checkpointArtifact_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointArtifact_insert);
});
```

## CreateCheckpointDecision
You can execute the `CreateCheckpointDecision` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createCheckpointDecision(vars: CreateCheckpointDecisionVariables): MutationPromise<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;

interface CreateCheckpointDecisionRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateCheckpointDecisionVariables): MutationRef<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;
}
export const createCheckpointDecisionRef: CreateCheckpointDecisionRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createCheckpointDecision(dc: DataConnect, vars: CreateCheckpointDecisionVariables): MutationPromise<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;

interface CreateCheckpointDecisionRef {
  ...
  (dc: DataConnect, vars: CreateCheckpointDecisionVariables): MutationRef<CreateCheckpointDecisionData, CreateCheckpointDecisionVariables>;
}
export const createCheckpointDecisionRef: CreateCheckpointDecisionRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createCheckpointDecisionRef:
```typescript
const name = createCheckpointDecisionRef.operationName;
console.log(name);
```

### Variables
The `CreateCheckpointDecision` mutation requires an argument of type `CreateCheckpointDecisionVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateCheckpointDecision` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateCheckpointDecisionData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateCheckpointDecisionData {
  query?: {
  };
    checkpointDecision_insert: CheckpointDecision_Key;
}
```
### Using `CreateCheckpointDecision`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createCheckpointDecision, CreateCheckpointDecisionVariables } from '@dataconnect/generated';

// The `CreateCheckpointDecision` mutation requires an argument of type `CreateCheckpointDecisionVariables`:
const createCheckpointDecisionVars: CreateCheckpointDecisionVariables = {
  runId: ..., 
  decisionType: ..., 
  status: ..., 
  decidedByEmail: ..., // optional
  decisionText: ..., 
  validationPhraseHash: ..., // optional
};

// Call the `createCheckpointDecision()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createCheckpointDecision(createCheckpointDecisionVars);
// Variables can be defined inline as well.
const { data } = await createCheckpointDecision({ runId: ..., decisionType: ..., status: ..., decidedByEmail: ..., decisionText: ..., validationPhraseHash: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createCheckpointDecision(dataConnect, createCheckpointDecisionVars);

console.log(data.query);
console.log(data.checkpointDecision_insert);

// Or, you can use the `Promise` API.
createCheckpointDecision(createCheckpointDecisionVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointDecision_insert);
});
```

### Using `CreateCheckpointDecision`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createCheckpointDecisionRef, CreateCheckpointDecisionVariables } from '@dataconnect/generated';

// The `CreateCheckpointDecision` mutation requires an argument of type `CreateCheckpointDecisionVariables`:
const createCheckpointDecisionVars: CreateCheckpointDecisionVariables = {
  runId: ..., 
  decisionType: ..., 
  status: ..., 
  decidedByEmail: ..., // optional
  decisionText: ..., 
  validationPhraseHash: ..., // optional
};

// Call the `createCheckpointDecisionRef()` function to get a reference to the mutation.
const ref = createCheckpointDecisionRef(createCheckpointDecisionVars);
// Variables can be defined inline as well.
const ref = createCheckpointDecisionRef({ runId: ..., decisionType: ..., status: ..., decidedByEmail: ..., decisionText: ..., validationPhraseHash: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createCheckpointDecisionRef(dataConnect, createCheckpointDecisionVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.checkpointDecision_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.checkpointDecision_insert);
});
```

## CreateDataImportRun
You can execute the `CreateDataImportRun` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDataImportRun(vars: CreateDataImportRunVariables): MutationPromise<CreateDataImportRunData, CreateDataImportRunVariables>;

interface CreateDataImportRunRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDataImportRunVariables): MutationRef<CreateDataImportRunData, CreateDataImportRunVariables>;
}
export const createDataImportRunRef: CreateDataImportRunRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDataImportRun(dc: DataConnect, vars: CreateDataImportRunVariables): MutationPromise<CreateDataImportRunData, CreateDataImportRunVariables>;

interface CreateDataImportRunRef {
  ...
  (dc: DataConnect, vars: CreateDataImportRunVariables): MutationRef<CreateDataImportRunData, CreateDataImportRunVariables>;
}
export const createDataImportRunRef: CreateDataImportRunRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDataImportRunRef:
```typescript
const name = createDataImportRunRef.operationName;
console.log(name);
```

### Variables
The `CreateDataImportRun` mutation requires an argument of type `CreateDataImportRunVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateDataImportRun` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDataImportRunData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDataImportRunData {
  query?: {
  };
    dataImportRun_insert: DataImportRun_Key;
}
```
### Using `CreateDataImportRun`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDataImportRun, CreateDataImportRunVariables } from '@dataconnect/generated';

// The `CreateDataImportRun` mutation requires an argument of type `CreateDataImportRunVariables`:
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

// Call the `createDataImportRun()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDataImportRun(createDataImportRunVars);
// Variables can be defined inline as well.
const { data } = await createDataImportRun({ environment: ..., importKind: ..., sourceName: ..., sourcePath: ..., sourceHash: ..., status: ..., finishedAt: ..., rowCount: ..., insertedCount: ..., updatedCount: ..., skippedCount: ..., artifactPath: ..., artifactHash: ..., actorEmail: ..., notes: ..., previsionnelBatchId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDataImportRun(dataConnect, createDataImportRunVars);

console.log(data.query);
console.log(data.dataImportRun_insert);

// Or, you can use the `Promise` API.
createDataImportRun(createDataImportRunVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.dataImportRun_insert);
});
```

### Using `CreateDataImportRun`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDataImportRunRef, CreateDataImportRunVariables } from '@dataconnect/generated';

// The `CreateDataImportRun` mutation requires an argument of type `CreateDataImportRunVariables`:
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

// Call the `createDataImportRunRef()` function to get a reference to the mutation.
const ref = createDataImportRunRef(createDataImportRunVars);
// Variables can be defined inline as well.
const ref = createDataImportRunRef({ environment: ..., importKind: ..., sourceName: ..., sourcePath: ..., sourceHash: ..., status: ..., finishedAt: ..., rowCount: ..., insertedCount: ..., updatedCount: ..., skippedCount: ..., artifactPath: ..., artifactHash: ..., actorEmail: ..., notes: ..., previsionnelBatchId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDataImportRunRef(dataConnect, createDataImportRunVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.dataImportRun_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.dataImportRun_insert);
});
```

## CreateDataImportIssue
You can execute the `CreateDataImportIssue` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createDataImportIssue(vars: CreateDataImportIssueVariables): MutationPromise<CreateDataImportIssueData, CreateDataImportIssueVariables>;

interface CreateDataImportIssueRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateDataImportIssueVariables): MutationRef<CreateDataImportIssueData, CreateDataImportIssueVariables>;
}
export const createDataImportIssueRef: CreateDataImportIssueRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createDataImportIssue(dc: DataConnect, vars: CreateDataImportIssueVariables): MutationPromise<CreateDataImportIssueData, CreateDataImportIssueVariables>;

interface CreateDataImportIssueRef {
  ...
  (dc: DataConnect, vars: CreateDataImportIssueVariables): MutationRef<CreateDataImportIssueData, CreateDataImportIssueVariables>;
}
export const createDataImportIssueRef: CreateDataImportIssueRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createDataImportIssueRef:
```typescript
const name = createDataImportIssueRef.operationName;
console.log(name);
```

### Variables
The `CreateDataImportIssue` mutation requires an argument of type `CreateDataImportIssueVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateDataImportIssue` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateDataImportIssueData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateDataImportIssueData {
  query?: {
  };
    dataImportIssue_insert: DataImportIssue_Key;
}
```
### Using `CreateDataImportIssue`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createDataImportIssue, CreateDataImportIssueVariables } from '@dataconnect/generated';

// The `CreateDataImportIssue` mutation requires an argument of type `CreateDataImportIssueVariables`:
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

// Call the `createDataImportIssue()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createDataImportIssue(createDataImportIssueVars);
// Variables can be defined inline as well.
const { data } = await createDataImportIssue({ runId: ..., severity: ..., code: ..., entityType: ..., entityKey: ..., sourceSheet: ..., sourceRow: ..., message: ..., resolutionStatus: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createDataImportIssue(dataConnect, createDataImportIssueVars);

console.log(data.query);
console.log(data.dataImportIssue_insert);

// Or, you can use the `Promise` API.
createDataImportIssue(createDataImportIssueVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.dataImportIssue_insert);
});
```

### Using `CreateDataImportIssue`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createDataImportIssueRef, CreateDataImportIssueVariables } from '@dataconnect/generated';

// The `CreateDataImportIssue` mutation requires an argument of type `CreateDataImportIssueVariables`:
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

// Call the `createDataImportIssueRef()` function to get a reference to the mutation.
const ref = createDataImportIssueRef(createDataImportIssueVars);
// Variables can be defined inline as well.
const ref = createDataImportIssueRef({ runId: ..., severity: ..., code: ..., entityType: ..., entityKey: ..., sourceSheet: ..., sourceRow: ..., message: ..., resolutionStatus: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createDataImportIssueRef(dataConnect, createDataImportIssueVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.dataImportIssue_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.dataImportIssue_insert);
});
```

## CreateEntityChangeLog
You can execute the `CreateEntityChangeLog` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createEntityChangeLog(vars: CreateEntityChangeLogVariables): MutationPromise<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;

interface CreateEntityChangeLogRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateEntityChangeLogVariables): MutationRef<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;
}
export const createEntityChangeLogRef: CreateEntityChangeLogRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createEntityChangeLog(dc: DataConnect, vars: CreateEntityChangeLogVariables): MutationPromise<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;

interface CreateEntityChangeLogRef {
  ...
  (dc: DataConnect, vars: CreateEntityChangeLogVariables): MutationRef<CreateEntityChangeLogData, CreateEntityChangeLogVariables>;
}
export const createEntityChangeLogRef: CreateEntityChangeLogRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createEntityChangeLogRef:
```typescript
const name = createEntityChangeLogRef.operationName;
console.log(name);
```

### Variables
The `CreateEntityChangeLog` mutation requires an argument of type `CreateEntityChangeLogVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
Recall that executing the `CreateEntityChangeLog` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateEntityChangeLogData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateEntityChangeLogData {
  query?: {
  };
    entityChangeLog_insert: EntityChangeLog_Key;
}
```
### Using `CreateEntityChangeLog`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createEntityChangeLog, CreateEntityChangeLogVariables } from '@dataconnect/generated';

// The `CreateEntityChangeLog` mutation requires an argument of type `CreateEntityChangeLogVariables`:
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

// Call the `createEntityChangeLog()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createEntityChangeLog(createEntityChangeLogVars);
// Variables can be defined inline as well.
const { data } = await createEntityChangeLog({ environment: ..., entityType: ..., entityId: ..., action: ..., source: ..., actorEmail: ..., beforeHash: ..., afterHash: ..., reason: ..., auditEventId: ..., checkpointRunId: ..., dataImportRunId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createEntityChangeLog(dataConnect, createEntityChangeLogVars);

console.log(data.query);
console.log(data.entityChangeLog_insert);

// Or, you can use the `Promise` API.
createEntityChangeLog(createEntityChangeLogVars).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.entityChangeLog_insert);
});
```

### Using `CreateEntityChangeLog`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createEntityChangeLogRef, CreateEntityChangeLogVariables } from '@dataconnect/generated';

// The `CreateEntityChangeLog` mutation requires an argument of type `CreateEntityChangeLogVariables`:
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

// Call the `createEntityChangeLogRef()` function to get a reference to the mutation.
const ref = createEntityChangeLogRef(createEntityChangeLogVars);
// Variables can be defined inline as well.
const ref = createEntityChangeLogRef({ environment: ..., entityType: ..., entityId: ..., action: ..., source: ..., actorEmail: ..., beforeHash: ..., afterHash: ..., reason: ..., auditEventId: ..., checkpointRunId: ..., dataImportRunId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createEntityChangeLogRef(dataConnect, createEntityChangeLogVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.query);
console.log(data.entityChangeLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.query);
  console.log(data.entityChangeLog_insert);
});
```

