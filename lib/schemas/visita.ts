import { z } from 'zod'

export const RegisterVisitaSchema = z.object({
  campoId: z.string().uuid('campoId debe ser un UUID válido'),
})

export type RegisterVisitaInput = z.infer<typeof RegisterVisitaSchema>
