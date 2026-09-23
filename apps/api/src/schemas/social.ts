import {
  z,
} from 'zod'

export const socialProfileSchema =
  z.object({
    bio: z
      .string()
      .trim()
      .max(
        300,
        'A bio pode ter no máximo 300 caracteres.'
      )
      .optional()
      .transform(
        (value) =>
          value === ''
            ? undefined
            : value
      ),

    interests: z
      .string()
      .trim()
      .max(
        300,
        'Os interesses podem ter no máximo 300 caracteres.'
      )
      .optional()
      .transform(
        (value) =>
          value === ''
            ? undefined
            : value
      ),

    active: z
      .boolean()
      .default(true),
  })

export const socialUserParamSchema =
  z.object({
    userId: z.coerce
      .number()
      .int()
      .positive(),
  })