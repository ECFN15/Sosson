# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.




### React
For each operation, there is a wrapper hook that can be used to call the operation.

Here are all of the hooks that get generated:
```ts
import { useSubmitCurrentTeamProfile, useConvertTeamProfileSubmission, useCreateSossonTeam, useUpdateSossonTeam, useCreateSossonTeamMember, useUpdateSossonTeamMember, useCreateSossonTeamLeavePeriod, useCreateSossonWorkTimeEntry, useCreateSossonPayrollPeriod, useCreatePlanningJobSheet } from '@dataconnect/generated/react';
// The types of these hooks are available in react/index.d.ts

const { data, isPending, isSuccess, isError, error } = useSubmitCurrentTeamProfile(submitCurrentTeamProfileVars);

const { data, isPending, isSuccess, isError, error } = useConvertTeamProfileSubmission(convertTeamProfileSubmissionVars);

const { data, isPending, isSuccess, isError, error } = useCreateSossonTeam(createSossonTeamVars);

const { data, isPending, isSuccess, isError, error } = useUpdateSossonTeam(updateSossonTeamVars);

const { data, isPending, isSuccess, isError, error } = useCreateSossonTeamMember(createSossonTeamMemberVars);

const { data, isPending, isSuccess, isError, error } = useUpdateSossonTeamMember(updateSossonTeamMemberVars);

const { data, isPending, isSuccess, isError, error } = useCreateSossonTeamLeavePeriod(createSossonTeamLeavePeriodVars);

const { data, isPending, isSuccess, isError, error } = useCreateSossonWorkTimeEntry(createSossonWorkTimeEntryVars);

const { data, isPending, isSuccess, isError, error } = useCreateSossonPayrollPeriod(createSossonPayrollPeriodVars);

const { data, isPending, isSuccess, isError, error } = useCreatePlanningJobSheet(createPlanningJobSheetVars);

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
import { submitCurrentTeamProfile, convertTeamProfileSubmission, createSossonTeam, updateSossonTeam, createSossonTeamMember, updateSossonTeamMember, createSossonTeamLeavePeriod, createSossonWorkTimeEntry, createSossonPayrollPeriod, createPlanningJobSheet } from '@dataconnect/generated';


// Operation SubmitCurrentTeamProfile:  For variables, look at type SubmitCurrentTeamProfileVars in ../index.d.ts
const { data } = await SubmitCurrentTeamProfile(dataConnect, submitCurrentTeamProfileVars);

// Operation ConvertTeamProfileSubmission:  For variables, look at type ConvertTeamProfileSubmissionVars in ../index.d.ts
const { data } = await ConvertTeamProfileSubmission(dataConnect, convertTeamProfileSubmissionVars);

// Operation CreateSossonTeam:  For variables, look at type CreateSossonTeamVars in ../index.d.ts
const { data } = await CreateSossonTeam(dataConnect, createSossonTeamVars);

// Operation UpdateSossonTeam:  For variables, look at type UpdateSossonTeamVars in ../index.d.ts
const { data } = await UpdateSossonTeam(dataConnect, updateSossonTeamVars);

// Operation CreateSossonTeamMember:  For variables, look at type CreateSossonTeamMemberVars in ../index.d.ts
const { data } = await CreateSossonTeamMember(dataConnect, createSossonTeamMemberVars);

// Operation UpdateSossonTeamMember:  For variables, look at type UpdateSossonTeamMemberVars in ../index.d.ts
const { data } = await UpdateSossonTeamMember(dataConnect, updateSossonTeamMemberVars);

// Operation CreateSossonTeamLeavePeriod:  For variables, look at type CreateSossonTeamLeavePeriodVars in ../index.d.ts
const { data } = await CreateSossonTeamLeavePeriod(dataConnect, createSossonTeamLeavePeriodVars);

// Operation CreateSossonWorkTimeEntry:  For variables, look at type CreateSossonWorkTimeEntryVars in ../index.d.ts
const { data } = await CreateSossonWorkTimeEntry(dataConnect, createSossonWorkTimeEntryVars);

// Operation CreateSossonPayrollPeriod:  For variables, look at type CreateSossonPayrollPeriodVars in ../index.d.ts
const { data } = await CreateSossonPayrollPeriod(dataConnect, createSossonPayrollPeriodVars);

// Operation CreatePlanningJobSheet:  For variables, look at type CreatePlanningJobSheetVars in ../index.d.ts
const { data } = await CreatePlanningJobSheet(dataConnect, createPlanningJobSheetVars);


```