import { workspaceForm } from '@/shared/ui/form'

import {
  AppEmailField,
  AppNameField,
  AppOtpField,
  AppPasswordField,
} from './field'

export const { useAppForm } = workspaceForm.extendForm({
  fieldComponents: {
    Email: AppEmailField,
    Name: AppNameField,
    Otp: AppOtpField,
    Password: AppPasswordField,
  },
})
