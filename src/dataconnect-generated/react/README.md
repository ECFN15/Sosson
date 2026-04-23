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

## ListClients
You can execute the `ListClients` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListClients(dc: DataConnect, options?: useDataConnectQueryOptions<ListClientsData>): UseDataConnectQueryResult<ListClientsData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListClients(options?: useDataConnectQueryOptions<ListClientsData>): UseDataConnectQueryResult<ListClientsData, undefined>;
```

### Variables
The `ListClients` Query has no variables.
### Return Type
Recall that calling the `ListClients` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListClients` Query is of type `ListClientsData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListClients`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListClients } from '@dataconnect/generated/react'

export default function ListClientsComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListClients();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListClients(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListClients(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListClients(dataConnect, options);

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

## ListChantiers
You can execute the `ListChantiers` Query using the following Query hook function, which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts):

```javascript
useListChantiers(dc: DataConnect, options?: useDataConnectQueryOptions<ListChantiersData>): UseDataConnectQueryResult<ListChantiersData, undefined>;
```
You can also pass in a `DataConnect` instance to the Query hook function.
```javascript
useListChantiers(options?: useDataConnectQueryOptions<ListChantiersData>): UseDataConnectQueryResult<ListChantiersData, undefined>;
```

### Variables
The `ListChantiers` Query has no variables.
### Return Type
Recall that calling the `ListChantiers` Query hook function returns a `UseQueryResult` object. This object holds the state of your Query, including whether the Query is loading, has completed, or has succeeded/failed, and any data returned by the Query, among other things.

To check the status of a Query, use the `UseQueryResult.status` field. You can also check for pending / success / error status using the `UseQueryResult.isPending`, `UseQueryResult.isSuccess`, and `UseQueryResult.isError` fields.

To access the data returned by a Query, use the `UseQueryResult.data` field. The data for the `ListChantiers` Query is of type `ListChantiersData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
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

To learn more about the `UseQueryResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useQuery).

### Using `ListChantiers`'s Query hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';
import { useListChantiers } from '@dataconnect/generated/react'

export default function ListChantiersComponent() {
  // You don't have to do anything to "execute" the Query.
  // Call the Query hook function to get a `UseQueryResult` object which holds the state of your Query.
  const query = useListChantiers();

  // You can also pass in a `DataConnect` instance to the Query hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const query = useListChantiers(dataConnect);

  // You can also pass in a `useDataConnectQueryOptions` object to the Query hook function.
  const options = { staleTime: 5 * 1000 };
  const query = useListChantiers(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectQueryOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = { staleTime: 5 * 1000 };
  const query = useListChantiers(dataConnect, options);

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

## UpsertCurrentUser
You can execute the `UpsertCurrentUser` Mutation using the `UseMutationResult` object returned by the following Mutation hook function (which is defined in [dataconnect-generated/react/index.d.ts](./index.d.ts)):
```javascript
useUpsertCurrentUser(options?: useDataConnectMutationOptions<UpsertCurrentUserData, FirebaseError, UpsertCurrentUserVariables>): UseDataConnectMutationResult<UpsertCurrentUserData, UpsertCurrentUserVariables>;
```
You can also pass in a `DataConnect` instance to the Mutation hook function.
```javascript
useUpsertCurrentUser(dc: DataConnect, options?: useDataConnectMutationOptions<UpsertCurrentUserData, FirebaseError, UpsertCurrentUserVariables>): UseDataConnectMutationResult<UpsertCurrentUserData, UpsertCurrentUserVariables>;
```

### Variables
The `UpsertCurrentUser` Mutation requires an argument of type `UpsertCurrentUserVariables`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:

```javascript
export interface UpsertCurrentUserVariables {
  email: string;
  nom: string;
  prenom: string;
  role: string;
  avatar?: string | null;
}
```
### Return Type
Recall that calling the `UpsertCurrentUser` Mutation hook function returns a `UseMutationResult` object. This object holds the state of your Mutation, including whether the Mutation is loading, has completed, or has succeeded/failed, among other things.

To check the status of a Mutation, use the `UseMutationResult.status` field. You can also check for pending / success / error status using the `UseMutationResult.isPending`, `UseMutationResult.isSuccess`, and `UseMutationResult.isError` fields.

To execute the Mutation, call `UseMutationResult.mutate()`. This function executes the Mutation, but does not return the data from the Mutation.

To access the data returned by a Mutation, use the `UseMutationResult.data` field. The data for the `UpsertCurrentUser` Mutation is of type `UpsertCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](../index.d.ts). It has the following fields:
```javascript
export interface UpsertCurrentUserData {
  user_upsert: User_Key;
}
```

To learn more about the `UseMutationResult` object, see the [TanStack React Query documentation](https://tanstack.com/query/v5/docs/framework/react/reference/useMutation).

### Using `UpsertCurrentUser`'s Mutation hook function

```javascript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, UpsertCurrentUserVariables } from '@dataconnect/generated';
import { useUpsertCurrentUser } from '@dataconnect/generated/react'

export default function UpsertCurrentUserComponent() {
  // Call the Mutation hook function to get a `UseMutationResult` object which holds the state of your Mutation.
  const mutation = useUpsertCurrentUser();

  // You can also pass in a `DataConnect` instance to the Mutation hook function.
  const dataConnect = getDataConnect(connectorConfig);
  const mutation = useUpsertCurrentUser(dataConnect);

  // You can also pass in a `useDataConnectMutationOptions` object to the Mutation hook function.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertCurrentUser(options);

  // You can also pass both a `DataConnect` instance and a `useDataConnectMutationOptions` object.
  const dataConnect = getDataConnect(connectorConfig);
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  const mutation = useUpsertCurrentUser(dataConnect, options);

  // After calling the Mutation hook function, you must call `UseMutationResult.mutate()` to execute the Mutation.
  // The `useUpsertCurrentUser` Mutation requires an argument of type `UpsertCurrentUserVariables`:
  const upsertCurrentUserVars: UpsertCurrentUserVariables = {
    email: ..., 
    nom: ..., 
    prenom: ..., 
    role: ..., 
    avatar: ..., // optional
  };
  mutation.mutate(upsertCurrentUserVars);
  // Variables can be defined inline as well.
  mutation.mutate({ email: ..., nom: ..., prenom: ..., role: ..., avatar: ..., });

  // You can also pass in a `useDataConnectMutationOptions` object to `UseMutationResult.mutate()`.
  const options = {
    onSuccess: () => { console.log('Mutation succeeded!'); }
  };
  mutation.mutate(upsertCurrentUserVars, options);

  // Then, you can render your component dynamically based on the status of the Mutation.
  if (mutation.isPending) {
    return <div>Loading...</div>;
  }

  if (mutation.isError) {
    return <div>Error: {mutation.error.message}</div>;
  }

  // If the Mutation is successful, you can access the data returned using the `UseMutationResult.data` field.
  if (mutation.isSuccess) {
    console.log(mutation.data.user_upsert);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

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
    console.log(mutation.data.facture_update);
  }
  return <div>Mutation execution {mutation.isSuccess ? 'successful' : 'failed'}!</div>;
}
```

