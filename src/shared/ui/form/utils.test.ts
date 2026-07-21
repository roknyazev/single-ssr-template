import { FieldApi, FormApi } from '@tanstack/react-form'
import { describe, expect, test } from 'vite-plus/test'

import { blurFirstValidationLogic } from './utils'

type FieldValidator = (props: { value: string }) => string | undefined

const minLength =
  (length: number): FieldValidator =>
  ({ value }) =>
    value.length >= length ? undefined : 'too-short'

function createForm(
  onDynamic?: (props: { value: { email: string } }) => string | undefined,
) {
  const form = new FormApi({
    defaultValues: { email: '' },
    validationLogic: blurFirstValidationLogic,
    validators: { onDynamic },
  })
  form.mount()
  return form
}

function createField(
  form: ReturnType<typeof createForm>,
  validators?: {
    onChange?: FieldValidator
    onBlur?: FieldValidator
    onDynamic?: FieldValidator
    onDynamicAsync?: (props: { value: string }) => Promise<string | undefined>
  },
) {
  const field = new FieldApi({ form, name: 'email', validators })
  field.mount()
  return field
}

describe('field-level onDynamic', () => {
  test('does not run on mount', () => {
    const form = createForm()
    const field = createField(form, { onDynamic: minLength(2) })
    expect(field.state.meta.errors).toEqual([])
  })

  test('does not run on change before blur', () => {
    const form = createForm()
    const field = createField(form, { onDynamic: minLength(2) })
    field.handleChange('x')
    expect(field.state.meta.errors).toEqual([])
  })

  test('does not run on blur while pristine', () => {
    const form = createForm()
    const field = createField(form, { onDynamic: minLength(2) })
    field.handleBlur()
    expect(field.state.meta.errors).toEqual([])
  })

  test('runs on change once blurred and dirty', () => {
    const form = createForm()
    const field = createField(form, { onDynamic: minLength(2) })
    field.handleBlur()
    field.handleChange('x')
    expect(field.state.meta.errors).toEqual(['too-short'])
    field.handleChange('xy')
    expect(field.state.meta.errors).toEqual([])
  })

  test('runs on blur once dirty', () => {
    const form = createForm()
    const field = createField(form, { onDynamic: minLength(2) })
    field.handleChange('x')
    expect(field.state.meta.errors).toEqual([])
    field.handleBlur()
    expect(field.state.meta.errors).toEqual(['too-short'])
  })

  test('runs on submit even when untouched', async () => {
    const form = createForm()
    const field = createField(form, { onDynamic: minLength(2) })
    await form.handleSubmit()
    expect(field.state.meta.errors).toEqual(['too-short'])
  })

  test('runs on change after a submit attempt without blur', async () => {
    const form = createForm()
    const field = createField(form, { onDynamic: minLength(2) })
    await form.handleSubmit()
    expect(field.state.meta.errors).toEqual(['too-short'])
    field.handleChange('xy')
    expect(field.state.meta.errors).toEqual([])
  })
})

describe('form-level onDynamic', () => {
  const noAt = ({ value }: { value: { email: string } }) =>
    value.email.includes('@') ? undefined : 'no-at'

  test('does not run on change or blur before submit', () => {
    const form = createForm(noAt)
    const field = createField(form)
    field.handleChange('x')
    field.handleBlur()
    field.handleChange('xy')
    expect(form.state.errorMap.onDynamic).toBeUndefined()
  })

  test('runs on submit', async () => {
    const form = createForm(noAt)
    createField(form)
    await form.handleSubmit()
    expect(form.state.errorMap.onDynamic).toBe('no-at')
  })

  test('runs on change after a submit attempt', async () => {
    const form = createForm(noAt)
    const field = createField(form)
    await form.handleSubmit()
    expect(form.state.errorMap.onDynamic).toBe('no-at')
    field.handleChange('x@y')
    expect(form.state.errorMap.onDynamic).toBeUndefined()
  })

  test('stays submit-first while field-level onDynamic runs blur-first', async () => {
    const form = createForm(noAt)
    const field = createField(form, { onDynamic: minLength(2) })
    field.handleBlur()
    field.handleChange('x')
    expect(field.state.meta.errors).toEqual(['too-short'])
    expect(form.state.errorMap.onDynamic).toBeUndefined()
    field.handleChange('xy')
    expect(field.state.meta.errors).toEqual([])
    expect(form.state.errorMap.onDynamic).toBeUndefined()
    await form.handleSubmit()
    expect(form.state.errorMap.onDynamic).toBe('no-at')
    field.handleChange('x@y')
    expect(form.state.errorMap.onDynamic).toBeUndefined()
  })
})

describe('onDynamicAsync', () => {
  test('follows the same gating as onDynamic', async () => {
    const form = createForm()
    const field = createField(form, {
      onDynamicAsync: async ({ value }: { value: string }) =>
        value.length >= 2 ? undefined : 'async-too-short',
    })
    field.handleChange('x')
    await new Promise(resolve => setTimeout(resolve, 0))
    expect(field.state.meta.errors).toEqual([])
    await form.handleSubmit()
    expect(field.state.meta.errors).toEqual(['async-too-short'])
    field.handleChange('xy')
    await expect.poll(() => field.state.meta.errors).toEqual([])
  })
})

describe('classic validators', () => {
  test('field-level onChange runs immediately without blur or submit', () => {
    const form = createForm()
    const field = createField(form, { onChange: minLength(2) })
    field.handleChange('x')
    expect(field.state.meta.errors).toEqual(['too-short'])
  })

  test('field-level onBlur runs on first blur', () => {
    const form = createForm()
    const field = createField(form, { onBlur: minLength(2) })
    field.handleBlur()
    expect(field.state.meta.errors).toEqual(['too-short'])
  })

  test('classic and onDynamic validators combine on one field', async () => {
    const form = createForm()
    const field = createField(form, {
      onChange: ({ value }: { value: string }) =>
        value.includes(' ') ? 'no-spaces' : undefined,
      onDynamic: minLength(2),
    })
    field.handleChange('a b')
    expect(field.state.meta.errors).toEqual(['no-spaces'])
    await form.handleSubmit()
    field.handleChange('x')
    expect(field.state.meta.errors).toEqual(['too-short'])
  })

  test('fields without validators produce no errors', async () => {
    const form = createForm()
    const field = createField(form)
    field.handleChange('x')
    field.handleBlur()
    await form.handleSubmit()
    expect(field.state.meta.errors).toEqual([])
    expect(form.state.isValid).toBe(true)
  })
})
