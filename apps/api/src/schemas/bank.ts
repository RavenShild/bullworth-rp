import { z } from 'zod'

export const transferSchema =
  z.object({
    recipientId: z.coerce
      .number()
      .int()
      .positive(),

    amount: z.coerce
      .number()
      .int()
      .positive(
        'O valor deve ser maior que zero.'
      )
      .max(
        50_000,
        'O limite por transferência é de 50.000 BP.'
      ),

    description: z
      .string()
      .trim()
      .max(
        140,
        'A descrição pode ter no máximo 140 caracteres.'
      )
      .optional()
      .transform(
        (value) =>
          value === ''
            ? undefined
            : value
      ),
  })

export const userSearchSchema =
  z.object({
    q: z
      .string()
      .trim()
      .min(
        1,
        'Informe um nome para pesquisar.'
      )
      .max(100),
  })