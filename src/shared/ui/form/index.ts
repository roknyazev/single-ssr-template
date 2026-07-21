import { createFormHook } from '@tanstack/react-form'

import {
  WorkspaceFieldRoot,
  WorkspaceFieldError,
  WorkspaceInput,
  WorkspaceInputGroupInput,
  WorkspaceFieldLabel,
} from './field'
import {
  WorkspaceForm,
  WorkspaceSubmitButton,
  WorkspaceFormError,
} from './form'
import { fieldContext, formContext } from './form-context'

const fieldComponents = {
  Root: WorkspaceFieldRoot,
  Error: WorkspaceFieldError,
  Label: WorkspaceFieldLabel,
  Input: WorkspaceInput,
  InputGroupInput: WorkspaceInputGroupInput,
}

const formComponents = {
  Root: WorkspaceForm,
  Submit: WorkspaceSubmitButton,
  Error: WorkspaceFormError,
}

export const workspaceForm = createFormHook({
  fieldContext,
  formContext,
  fieldComponents,
  formComponents,
})

export { useFieldContext, useFormContext } from './form-context'
export { fieldComponents, formComponents }

export * from './utils'
