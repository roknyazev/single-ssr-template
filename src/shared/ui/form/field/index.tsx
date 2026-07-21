import type { ComponentProps } from 'react'

import { Field, FieldError, FieldLabel } from '@/shared/ui/components/field'

import { useFieldContext } from '../form-context'
import { getFieldErrorId, getFieldId } from '../utils'

export function WorkspaceFieldRoot({ ...props }: ComponentProps<typeof Field>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  return <Field data-invalid={isInvalid} {...props} />
}

export function WorkspaceFieldError({
  ...props
}: ComponentProps<typeof FieldError>) {
  const field = useFieldContext()
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid
  if (!isInvalid) return null
  return (
    <FieldError
      id={getFieldErrorId(field)}
      errors={field.state.meta.errors}
      {...props}
    />
  )
}

export function WorkspaceFieldLabel({
  ...props
}: ComponentProps<typeof FieldLabel>) {
  const field = useFieldContext()
  return <FieldLabel htmlFor={getFieldId(field)} {...props} />
}

export * from './input'
