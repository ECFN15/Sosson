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
  - [*ListClients*](#listclients)
  - [*GetClient*](#getclient)
  - [*ListChantiers*](#listchantiers)
  - [*GetChantier*](#getchantier)
  - [*ListFactures*](#listfactures)
  - [*ListFacturesByStatut*](#listfacturesbystatut)
- [**Mutations**](#mutations)
  - [*UpsertCurrentUser*](#upsertcurrentuser)
  - [*CreateClient*](#createclient)
  - [*UpdateClient*](#updateclient)
  - [*CreateChantier*](#createchantier)
  - [*UpdateChantierStatut*](#updatechantierstatut)
  - [*CreateFacture*](#createfacture)
  - [*SetFactureStatut*](#setfacturestatut)

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

## ListClients
You can execute the `ListClients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listClients(options?: ExecuteQueryOptions): QueryPromise<ListClientsData, undefined>;

interface ListClientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListClientsData, undefined>;
}
export const listClientsRef: ListClientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listClients(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListClientsData, undefined>;

interface ListClientsRef {
  ...
  (dc: DataConnect): QueryRef<ListClientsData, undefined>;
}
export const listClientsRef: ListClientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listClientsRef:
```typescript
const name = listClientsRef.operationName;
console.log(name);
```

### Variables
The `ListClients` query has no variables.
### Return Type
Recall that executing the `ListClients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListClientsData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListClients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listClients } from '@dataconnect/generated';


// Call the `listClients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listClients();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listClients(dataConnect);

console.log(data.clients);

// Or, you can use the `Promise` API.
listClients().then((response) => {
  const data = response.data;
  console.log(data.clients);
});
```

### Using `ListClients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listClientsRef } from '@dataconnect/generated';


// Call the `listClientsRef()` function to get a reference to the query.
const ref = listClientsRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listClientsRef(dataConnect);

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

## ListChantiers
You can execute the `ListChantiers` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listChantiers(options?: ExecuteQueryOptions): QueryPromise<ListChantiersData, undefined>;

interface ListChantiersRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListChantiersData, undefined>;
}
export const listChantiersRef: ListChantiersRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listChantiers(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<ListChantiersData, undefined>;

interface ListChantiersRef {
  ...
  (dc: DataConnect): QueryRef<ListChantiersData, undefined>;
}
export const listChantiersRef: ListChantiersRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listChantiersRef:
```typescript
const name = listChantiersRef.operationName;
console.log(name);
```

### Variables
The `ListChantiers` query has no variables.
### Return Type
Recall that executing the `ListChantiers` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListChantiersData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListChantiers`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listChantiers } from '@dataconnect/generated';


// Call the `listChantiers()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listChantiers();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listChantiers(dataConnect);

console.log(data.chantiers);

// Or, you can use the `Promise` API.
listChantiers().then((response) => {
  const data = response.data;
  console.log(data.chantiers);
});
```

### Using `ListChantiers`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listChantiersRef } from '@dataconnect/generated';


// Call the `listChantiersRef()` function to get a reference to the query.
const ref = listChantiersRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listChantiersRef(dataConnect);

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

## UpsertCurrentUser
You can execute the `UpsertCurrentUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
upsertCurrentUser(vars: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;

interface UpsertCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
}
export const upsertCurrentUserRef: UpsertCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
upsertCurrentUser(dc: DataConnect, vars: UpsertCurrentUserVariables): MutationPromise<UpsertCurrentUserData, UpsertCurrentUserVariables>;

interface UpsertCurrentUserRef {
  ...
  (dc: DataConnect, vars: UpsertCurrentUserVariables): MutationRef<UpsertCurrentUserData, UpsertCurrentUserVariables>;
}
export const upsertCurrentUserRef: UpsertCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the upsertCurrentUserRef:
```typescript
const name = upsertCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `UpsertCurrentUser` mutation requires an argument of type `UpsertCurrentUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpsertCurrentUserVariables {
  email: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
}
```
### Return Type
Recall that executing the `UpsertCurrentUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpsertCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpsertCurrentUserData {
  user_upsert: User_Key;
}
```
### Using `UpsertCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, upsertCurrentUser, UpsertCurrentUserVariables } from '@dataconnect/generated';

// The `UpsertCurrentUser` mutation requires an argument of type `UpsertCurrentUserVariables`:
const upsertCurrentUserVars: UpsertCurrentUserVariables = {
  email: ..., 
  nom: ..., 
  prenom: ..., 
  role: ..., 
  avatar: ..., // optional
};

// Call the `upsertCurrentUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await upsertCurrentUser(upsertCurrentUserVars);
// Variables can be defined inline as well.
const { data } = await upsertCurrentUser({ email: ..., nom: ..., prenom: ..., role: ..., avatar: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await upsertCurrentUser(dataConnect, upsertCurrentUserVars);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
upsertCurrentUser(upsertCurrentUserVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

### Using `UpsertCurrentUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, upsertCurrentUserRef, UpsertCurrentUserVariables } from '@dataconnect/generated';

// The `UpsertCurrentUser` mutation requires an argument of type `UpsertCurrentUserVariables`:
const upsertCurrentUserVars: UpsertCurrentUserVariables = {
  email: ..., 
  nom: ..., 
  prenom: ..., 
  role: ..., 
  avatar: ..., // optional
};

// Call the `upsertCurrentUserRef()` function to get a reference to the mutation.
const ref = upsertCurrentUserRef(upsertCurrentUserVars);
// Variables can be defined inline as well.
const ref = upsertCurrentUserRef({ email: ..., nom: ..., prenom: ..., role: ..., avatar: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = upsertCurrentUserRef(dataConnect, upsertCurrentUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
});
```

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

console.log(data.client_insert);

// Or, you can use the `Promise` API.
createClient(createClientVars).then((response) => {
  const data = response.data;
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

console.log(data.client_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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

console.log(data.client_update);

// Or, you can use the `Promise` API.
updateClient(updateClientVars).then((response) => {
  const data = response.data;
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

console.log(data.client_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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

console.log(data.chantier_insert);

// Or, you can use the `Promise` API.
createChantier(createChantierVars).then((response) => {
  const data = response.data;
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

console.log(data.chantier_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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

console.log(data.chantier_update);

// Or, you can use the `Promise` API.
updateChantierStatut(updateChantierStatutVars).then((response) => {
  const data = response.data;
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

console.log(data.chantier_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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

console.log(data.facture_insert);

// Or, you can use the `Promise` API.
createFacture(createFactureVars).then((response) => {
  const data = response.data;
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

console.log(data.facture_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
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

console.log(data.facture_update);

// Or, you can use the `Promise` API.
setFactureStatut(setFactureStatutVars).then((response) => {
  const data = response.data;
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

console.log(data.facture_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.facture_update);
});
```

