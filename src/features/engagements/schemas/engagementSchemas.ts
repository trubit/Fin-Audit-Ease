import { z } from 'zod'

export const createEngagementSchema = z
  .object({
    title: z
      .string()
      .min(3, 'Engagement title must be at least 3 characters')
      .max(200, 'Title cannot exceed 200 characters'),
    clientOrganizationName: z
      .string()
      .min(2, 'Client company name is required')
      .max(150, 'Client company name cannot exceed 150 characters'),
    fiscalYear: z.coerce
      .number()
      .int('Fiscal year must be an integer')
      .min(2000, 'Please enter a valid fiscal year')
      .max(2100, 'Please enter a valid fiscal year'),
    startDate: z.string().min(1, 'Please select an audit start date'),
    targetCompletionDate: z.string().min(1, 'Please select a target completion date'),
  })
  .refine(
    (data) => {
      if (!data.startDate || !data.targetCompletionDate) return true
      return data.targetCompletionDate >= data.startDate
    },
    {
      message: 'Target completion date must be on or after the start date',
      path: ['targetCompletionDate'],
    }
  )

export type CreateEngagementFormData = z.infer<typeof createEngagementSchema>
