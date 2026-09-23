import {
  Router,
} from 'express'

import rateLimit from 'express-rate-limit'

import {
  prisma,
} from '../lib/prisma.js'

import {
  requireAuth,
} from '../middleware/auth.js'

const router = Router()

const SHIFT_DURATION_MS =
  4 * 60 * 60 * 1000

const SHIFT_COOLDOWN_MS =
  24 * 60 * 60 * 1000

const SHIFT_REWARD = 50

const actionLimiter =
  rateLimit({
    windowMs:
      60 * 1000,

    limit: 10,

    standardHeaders:
      'draft-8',

    legacyHeaders:
      false,

    message: {
      message:
        'Muitas tentativas. Aguarde um momento.',
    },
  })

/*
 * ============================================
 * STATUS DO EMPREGO
 * ============================================
 */

router.get(
  '/me',
  requireAuth,

  async (req, res) => {
    try {
      const userId =
        req.auth!.userId

      const now =
        new Date()

      const [
        user,
        activeShift,
        lastShift,
      ] =
        await Promise.all([
          prisma.user.findUnique({
            where: {
              id: userId,
            },

            select: {
              id: true,
              username: true,
              bullyPoints: true,
              active: true,
            },
          }),

          prisma.jobShift.findFirst({
            where: {
              userId,

              completedAt:
                null,
            },

            orderBy: {
              startedAt:
                'desc',
            },
          }),

          prisma.jobShift.findFirst({
            where: {
              userId,
            },

            orderBy: {
              startedAt:
                'desc',
            },
          }),
        ])

      if (
        !user ||
        !user.active
      ) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado.',
          })
      }

      /*
       * Se existe turno ativo,
       * verificamos se as 4 horas
       * já terminaram.
       */

      if (activeShift) {
        const canComplete =
          now >=
          activeShift.availableAt

        return res.json({
          job: {
            name:
              'Emprego de Meio Turno',

            durationHours:
              4,

            reward:
              SHIFT_REWARD,
          },

          status:
            'IN_PROGRESS',

          canStart:
            false,

          canComplete,

          shift:
            activeShift,

          bullyPoints:
            user.bullyPoints,

          nextAvailableAt:
            null,
        })
      }

      /*
       * Sem turno ativo.
       * Verifica cooldown de 24h
       * desde o início do último.
       */

      let nextAvailableAt:
        Date |
        null =
          null

      if (lastShift) {
        nextAvailableAt =
          new Date(
            lastShift
              .startedAt
              .getTime() +
              SHIFT_COOLDOWN_MS
          )
      }

      const canStart =
        !nextAvailableAt ||
        now >=
          nextAvailableAt

      return res.json({
        job: {
          name:
            'Emprego de Meio Turno',

          durationHours:
            4,

          reward:
            SHIFT_REWARD,
        },

        status:
          'AVAILABLE',

        canStart,

        canComplete:
          false,

        shift:
          null,

        bullyPoints:
          user.bullyPoints,

        nextAvailableAt:
          canStart
            ? null
            : nextAvailableAt,
      })
    } catch (error) {
      console.error(
        'Erro ao carregar emprego:',
        error
      )

      return res
        .status(500)
        .json({
          message:
            'Não foi possível carregar o emprego.',
        })
    }
  }
)

/*
 * ============================================
 * INICIAR TURNO
 * ============================================
 */

router.post(
  '/start',

  requireAuth,

  actionLimiter,

  async (req, res) => {
    try {
      const userId =
        req.auth!.userId

      const now =
        new Date()

      const cooldownLimit =
        new Date(
          now.getTime() -
            SHIFT_COOLDOWN_MS
        )

      const result =
        await prisma.$transaction(
          async (tx) => {
            const user =
              await tx.user.findUnique({
                where: {
                  id: userId,
                },

                select: {
                  id: true,
                  active: true,
                },
              })

            if (
              !user ||
              !user.active
            ) {
              throw new Error(
                'Usuário indisponível.'
              )
            }

            /*
             * Não permite outro
             * turno ainda ativo.
             */

            const activeShift =
              await tx.jobShift
                .findFirst({
                  where: {
                    userId,

                    completedAt:
                      null,
                  },
                })

            if (activeShift) {
              throw new Error(
                'Você já possui um turno em andamento.'
              )
            }

            /*
             * Verifica se iniciou
             * algum turno nas
             * últimas 24 horas.
             */

            const recentShift =
              await tx.jobShift
                .findFirst({
                  where: {
                    userId,

                    startedAt: {
                      gt:
                        cooldownLimit,
                    },
                  },

                  orderBy: {
                    startedAt:
                      'desc',
                  },
                })

            if (recentShift) {
              const nextAvailableAt =
                new Date(
                  recentShift
                    .startedAt
                    .getTime() +
                    SHIFT_COOLDOWN_MS
                )

              const error =
                new Error(
                  'Seu próximo turno ainda não está disponível.'
                ) as Error & {
                  nextAvailableAt?: Date
                }

              error.nextAvailableAt =
                nextAvailableAt

              throw error
            }

            const availableAt =
              new Date(
                now.getTime() +
                  SHIFT_DURATION_MS
              )

            const shift =
              await tx.jobShift
                .create({
                  data: {
                    userId,

                    reward:
                      SHIFT_REWARD,

                    startedAt:
                      now,

                    availableAt,
                  },
                })

            return shift
          }
        )

      return res
        .status(201)
        .json({
          message:
            'Turno iniciado com sucesso.',

          shift:
            result,
        })
    } catch (error) {
      console.error(
        'Erro ao iniciar turno:',
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível iniciar o turno.'

      const knownErrors = [
        'Usuário indisponível.',
        'Você já possui um turno em andamento.',
        'Seu próximo turno ainda não está disponível.',
      ]

      const nextAvailableAt =
        error instanceof Error &&
        'nextAvailableAt' in error
          ? (
              error as Error & {
                nextAvailableAt?: Date
              }
            ).nextAvailableAt
          : undefined

      return res
        .status(
          knownErrors.includes(
            message
          )
            ? 400
            : 500
        )
        .json({
          message:
            knownErrors.includes(
              message
            )
              ? message
              : 'Não foi possível iniciar o turno.',

          ...(nextAvailableAt
            ? {
                nextAvailableAt,
              }
            : {}),
        })
    }
  }
)

/*
 * ============================================
 * CONCLUIR TURNO
 * ============================================
 */

router.post(
  '/complete',

  requireAuth,

  actionLimiter,

  async (req, res) => {
    try {
      const userId =
        req.auth!.userId

      const now =
        new Date()

      const result =
        await prisma.$transaction(
          async (tx) => {
            const shift =
              await tx.jobShift
                .findFirst({
                  where: {
                    userId,

                    completedAt:
                      null,
                  },

                  orderBy: {
                    startedAt:
                      'desc',
                  },
                })

            if (!shift) {
              throw new Error(
                'Você não possui um turno em andamento.'
              )
            }

            /*
             * Impede concluir antes
             * das 4 horas.
             */

            if (
              now <
              shift.availableAt
            ) {
              const error =
                new Error(
                  'Seu turno ainda não terminou.'
                ) as Error & {
                  availableAt?: Date
                }

              error.availableAt =
                shift.availableAt

              throw error
            }

            /*
             * Marca como concluído
             * somente se ainda
             * estiver pendente.
             *
             * Isso ajuda a evitar
             * pagamento duplicado.
             */

            const completed =
              await tx.jobShift
                .updateMany({
                  where: {
                    id:
                      shift.id,

                    userId,

                    completedAt:
                      null,
                  },

                  data: {
                    completedAt:
                      now,
                  },
                })

            if (
              completed.count ===
              0
            ) {
              throw new Error(
                'Este turno já foi concluído.'
              )
            }

            /*
             * Adiciona os BP.
             */

            const updatedUser =
              await tx.user.update({
                where: {
                  id: userId,
                },

                data: {
                  bullyPoints: {
                    increment:
                      shift.reward,
                  },
                },

                select: {
                  bullyPoints:
                    true,
                },
              })

            /*
             * Registra no extrato
             * geral de Bully Points.
             */

            await tx
              .pointTransaction
              .create({
                data: {
                  userId,

                  amount:
                    shift.reward,

                  type:
                    'CREDIT',

                  reason:
                    'Pagamento de emprego de meio turno',
                },
              })

            const completedShift =
              await tx.jobShift
                .findUnique({
                  where: {
                    id:
                      shift.id,
                  },
                })

            return {
              shift:
                completedShift,

              reward:
                shift.reward,

              bullyPoints:
                updatedUser
                  .bullyPoints,
            }
          }
        )

      return res.json({
        message:
          `Turno concluído. Você recebeu ${result.reward} BP.`,

        ...result,
      })
    } catch (error) {
      console.error(
        'Erro ao concluir turno:',
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível concluir o turno.'

      const knownErrors = [
        'Você não possui um turno em andamento.',
        'Seu turno ainda não terminou.',
        'Este turno já foi concluído.',
      ]

      const availableAt =
        error instanceof Error &&
        'availableAt' in error
          ? (
              error as Error & {
                availableAt?: Date
              }
            ).availableAt
          : undefined

      return res
        .status(
          knownErrors.includes(
            message
          )
            ? 400
            : 500
        )
        .json({
          message:
            knownErrors.includes(
              message
            )
              ? message
              : 'Não foi possível concluir o turno.',

          ...(availableAt
            ? {
                availableAt,
              }
            : {}),
        })
    }
  }
)

export default router