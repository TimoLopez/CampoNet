import { z } from 'zod'

export const CreateLeadSchema = z.object({
  campoId: z.string().uuid('campoId debe ser un UUID válido'),
  nombre: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido').nullable().optional(),
  telefono: z.string().nullable().optional(),
  mensaje: z.string().nullable().optional(),
  origenHint: z.enum(['pagina_publica', 'buscador']).nullable().optional(),
}).refine(data => data.email || data.telefono, {
  message: 'Se requiere al menos email o teléfono',
})

export type CreateLeadInput = z.infer<typeof CreateLeadSchema>
