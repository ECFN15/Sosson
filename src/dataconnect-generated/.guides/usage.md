# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useCreateClient, useUpdateClient, useCreateChantier, useUpdateChantierStatut, useCreateDevis, useUpdateDevisStatut, useCreateFacture, useSetFactureStatut, useCreateDocumentFolder, useCreateDocumentAttache } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useCreateClient(createClientVars);

const { data, isPending, isSuccess, isError, error } = useUpdateClient(updateClientVars);

const { data, isPending, isSuccess, isError, error } = useCreateChantier(createChantierVars);

const { data, isPending, isSuccess, isError, error } = useUpdateChantierStatut(updateChantierStatutVars);

const { data, isPending, isSuccess, isError, error } = useCreateDevis(createDevisVars);

const { data, isPending, isSuccess, isError, error } = useUpdateDevisStatut(updateDevisStatutVars);

const { data, isPending, isSuccess, isError, error } = useCreateFacture(createFactureVars);

const { data, isPending, isSuccess, isError, error } = useSetFactureStatut(setFactureStatutVars);

const { data, isPending, isSuccess, isError, error } = useCreateDocumentFolder(createDocumentFolderVars);

const { data, isPending, isSuccess, isError, error } = useCreateDocumentAttache(createDocumentAttacheVars);

```

Here's an example from a different generated SDK:

```ts
import { useListAllMovies } from '@dataconnect/generated/react';

function MyComponent() {
  const { isLoading, data, error } = useListAllMovies();
  if(isLoading) {
    return <div>Loading...</div>
  }
  if(error) {
    return <div> An Error Occurred: {error} </div>
  }
}

// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MyComponent from './my-component';

function App() {
  const queryClient = new QueryClient();
  return <QueryClientProvider client={queryClient}>
    <MyComponent />
  </QueryClientProvider>
}
```



## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createClient, updateClient, createChantier, updateChantierStatut, createDevis, updateDevisStatut, createFacture, setFactureStatut, createDocumentFolder, createDocumentAttache } from '@dataconnect/generated';


// Operation CreateClient:  For variables, look at type CreateClientVars in ../index.d.ts
const { data } = await CreateClient(dataConnect, createClientVars);

// Operation UpdateClient:  For variables, look at type UpdateClientVars in ../index.d.ts
const { data } = await UpdateClient(dataConnect, updateClientVars);

// Operation CreateChantier:  For variables, look at type CreateChantierVars in ../index.d.ts
const { data } = await CreateChantier(dataConnect, createChantierVars);

// Operation UpdateChantierStatut:  For variables, look at type UpdateChantierStatutVars in ../index.d.ts
const { data } = await UpdateChantierStatut(dataConnect, updateChantierStatutVars);

// Operation CreateDevis:  For variables, look at type CreateDevisVars in ../index.d.ts
const { data } = await CreateDevis(dataConnect, createDevisVars);

// Operation UpdateDevisStatut:  For variables, look at type UpdateDevisStatutVars in ../index.d.ts
const { data } = await UpdateDevisStatut(dataConnect, updateDevisStatutVars);

// Operation CreateFacture:  For variables, look at type CreateFactureVars in ../index.d.ts
const { data } = await CreateFacture(dataConnect, createFactureVars);

// Operation SetFactureStatut:  For variables, look at type SetFactureStatutVars in ../index.d.ts
const { data } = await SetFactureStatut(dataConnect, setFactureStatutVars);

// Operation CreateDocumentFolder:  For variables, look at type CreateDocumentFolderVars in ../index.d.ts
const { data } = await CreateDocumentFolder(dataConnect, createDocumentFolderVars);

// Operation CreateDocumentAttache:  For variables, look at type CreateDocumentAttacheVars in ../index.d.ts
const { data } = await CreateDocumentAttache(dataConnect, createDocumentAttacheVars);


```