import { z } from 'zod'

export const createAuditRequestSchema = z.object({
  engagementId: z.string().min(1, 'Please select an audit engagement'),
  title: z
    .string()
    .trim()
    .min(3, 'Request title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .min(5, 'Please provide detailed instructions for the requested items')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.string().min(1, 'Please select a financial category'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], {
    message: 'Please select a valid priority level',
  }),
  dueDate: z
    .string()
    .min(1, 'Please provide a due date')
    .refine(
      (val) => {
        if (!val) return false
        const parts = val.split('-').map(Number)
        if (parts.length !== 3 || parts.some(isNaN)) return false
        const [year, month, day] = parts
        const inputDate = new Date(year, month - 1, day)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        return inputDate >= today
      },
      {
        message: 'Deadline cannot be in the past',
      }
    ),
  assigneeId: z.string().optional(),
})

export type CreateAuditRequestFormData = z.infer<typeof createAuditRequestSchema>

