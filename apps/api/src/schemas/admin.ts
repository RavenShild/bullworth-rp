import { z } from 'zod'

export const userIdParamSchema =
  z.object({
    id: z.coerce
      .number()
      .int()
      .positive(),
  })

export const productIdParamSchema =
  z.object({
    id: z.coerce
      .number()
      .int()
      .positive(),
  })

export const pointsSchema =
  z.object({
    amount: z.coerce
      .number()
      .int()
      .positive()
      .max(1_000_000),

    reason: z
      .string()
      .trim()
      .min(
        3,
        'Informe um motivo com pelo menos 3 caracteres.'
      )
      .max(
        255,
        'O motivo pode ter no máximo 255 caracteres.'
      ),
  })

export const productSchema =
  z.object({
    name: z
      .string()
      .trim()
      .min(
        2,
        'O nome deve possuir pelo menos 2 caracteres.'
      )
      .max(
        120,
        'O nome pode ter no máximo 120 caracteres.'
      ),

    description: z
      .string()
      .trim()
      .min(
        3,
        'Informe uma descrição válida.'
      )
      .max(
        5000,
        'A descrição é muito longa.'
      ),

    imageUrl: z
      .string()
      .trim()
      .url(
        'Informe uma URL de imagem válida.'
      )
      .nullable()
      .optional(),

    price: z.coerce
      .number()
      .int()
      .positive(
        'O preço deve ser maior que zero.'
      )
      .max(
        10_000_000,
        'O preço informado é muito alto.'
      ),

    stock: z
      .union([
        z.coerce
          .number()
          .int()
          .nonnegative(),

        z.null(),
      ])
      .optional(),
  })