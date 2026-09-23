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

import {
  transferSchema,
  userSearchSchema,
} from '../schemas/bank.js'

const router = Router()

const transferLimiter =
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
        'Muitas tentativas de transferência. Aguarde um momento.',
    },
  })

/*
 * ============================================
 * RESUMO DA CONTA
 * ============================================
 */

router.get(
  '/me',
  requireAuth,
  async (req, res) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id:
              req.auth!.userId,
          },

          select: {
            id: true,
            username: true,
            avatar: true,
            bullyPoints: true,
            active: true,
          },
        })

      if (
        !user ||
        !user.active
      ) {
        return res
          .status(404)
          .json({
            message:
              'Conta não encontrada.',
          })
      }

      res.json(user)
    } catch (error) {
      console.error(
        'Erro ao carregar conta bancária:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Não foi possível carregar sua conta.',
        })
    }
  }
)

/*
 * ============================================
 * PESQUISAR JOGADORES
 * ============================================
 */

router.get(
  '/users',
  requireAuth,
  async (req, res) => {
    const parsed =
      userSearchSchema.safeParse(
        req.query
      )

    if (!parsed.success) {
      return res
        .status(400)
        .json({
          message:
            parsed.error.issues[0]
              ?.message ??
            'Pesquisa inválida.',
        })
    }

    try {
      const users =
        await prisma.user.findMany({
          where: {
            active: true,

            id: {
              not:
                req.auth!.userId,
            },

            username: {
              contains:
                parsed.data.q,
            },
          },

          select: {
            id: true,
            username: true,
            avatar: true,
          },

          orderBy: {
            username: 'asc',
          },

          take: 10,
        })

      res.json(users)
    } catch (error) {
      console.error(
        'Erro ao pesquisar jogadores:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Não foi possível pesquisar jogadores.',
        })
    }
  }
)

/*
 * ============================================
 * HISTÓRICO DE TRANSFERÊNCIAS
 * ============================================
 */

router.get(
  '/transfers',
  requireAuth,
  async (req, res) => {
    try {
      const userId =
        req.auth!.userId

      const transfers =
        await prisma
          .bankTransfer
          .findMany({
            where: {
              OR: [
                {
                  senderId:
                    userId,
                },

                {
                  recipientId:
                    userId,
                },
              ],
            },

            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },

              recipient: {
                select: {
                  id: true,
                  username: true,
                  avatar: true,
                },
              },
            },

            orderBy: {
              createdAt:
                'desc',
            },

            take: 100,
          })

      const result =
        transfers.map(
          (transfer) => ({
            id:
              transfer.id,

            amount:
              transfer.amount,

            description:
              transfer.description,

            createdAt:
              transfer.createdAt,

            direction:
              transfer.senderId ===
              userId
                ? 'SENT'
                : 'RECEIVED',

            otherUser:
              transfer.senderId ===
              userId
                ? transfer.recipient
                : transfer.sender,
          })
        )

      res.json(result)
    } catch (error) {
      console.error(
        'Erro ao carregar transferências:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Não foi possível carregar o histórico.',
        })
    }
  }
)

/*
 * ============================================
 * REALIZAR TRANSFERÊNCIA
 * ============================================
 */

router.post(
  '/transfer',

  requireAuth,

  transferLimiter,

  async (req, res) => {
    const parsed =
      transferSchema.safeParse(
        req.body
      )

    if (!parsed.success) {
      return res
        .status(400)
        .json({
          message:
            parsed.error.issues[0]
              ?.message ??
            'Dados inválidos.',
        })
    }

    const {
      recipientId,
      amount,
      description,
    } = parsed.data

    const senderId =
      req.auth!.userId

    if (
      recipientId ===
      senderId
    ) {
      return res
        .status(400)
        .json({
          message:
            'Você não pode transferir BP para si mesmo.',
        })
    }

    try {
      const result =
        await prisma.$transaction(
          async (tx) => {
            /*
             * Verifica destinatário.
             */
            const recipient =
              await tx.user.findUnique({
                where: {
                  id:
                    recipientId,
                },

                select: {
                  id: true,
                  username: true,
                  active: true,
                },
              })

            if (
              !recipient ||
              !recipient.active
            ) {
              throw new Error(
                'Destinatário indisponível.'
              )
            }

            /*
             * Desconta BP apenas se
             * o remetente continuar
             * ativo e possuir saldo.
             *
             * updateMany ajuda a evitar
             * problemas com transferências
             * simultâneas.
             */
            const senderUpdate =
              await tx.user.updateMany({
                where: {
                  id:
                    senderId,

                  active: true,

                  bullyPoints: {
                    gte:
                      amount,
                  },
                },

                data: {
                  bullyPoints: {
                    decrement:
                      amount,
                  },
                },
              })

            if (
              senderUpdate.count ===
              0
            ) {
              throw new Error(
                'Saldo insuficiente.'
              )
            }

            /*
             * Credita o destinatário.
             */
            const recipientUpdate =
              await tx.user.updateMany({
                where: {
                  id:
                    recipientId,

                  active: true,
                },

                data: {
                  bullyPoints: {
                    increment:
                      amount,
                  },
                },
              })

            if (
              recipientUpdate.count ===
              0
            ) {
              throw new Error(
                'Destinatário indisponível.'
              )
            }

            /*
             * Registra a transferência.
             */
            const transfer =
              await tx
                .bankTransfer
                .create({
                  data: {
                    senderId,
                    recipientId,
                    amount,

                    description:
                      description ??
                      null,
                  },

                  include: {
                    sender: {
                      select: {
                        id: true,
                        username: true,
                        avatar: true,
                      },
                    },

                    recipient: {
                      select: {
                        id: true,
                        username: true,
                        avatar: true,
                      },
                    },
                  },
                })

            /*
             * Registro de débito no
             * extrato do remetente.
             */
            await tx
              .pointTransaction
              .create({
                data: {
                  userId:
                    senderId,

                  amount:
                    -amount,

                  type:
                    'DEBIT',

                  reason:
                    description
                      ? `Transferência para ${recipient.username}: ${description}`
                      : `Transferência para ${recipient.username}`,
                },
              })

            /*
             * Registro de crédito no
             * extrato do destinatário.
             */
            const sender =
              await tx.user.findUnique({
                where: {
                  id:
                    senderId,
                },

                select: {
                  username:
                    true,
                },
              })

            if (!sender) {
              throw new Error(
                'Remetente indisponível.'
              )
            }

            await tx
              .pointTransaction
              .create({
                data: {
                  userId:
                    recipientId,

                  amount,

                  type:
                    'CREDIT',

                  reason:
                    description
                      ? `Transferência recebida de ${sender.username}: ${description}`
                      : `Transferência recebida de ${sender.username}`,
                },
              })

            /*
             * Novo saldo do remetente.
             */
            const updatedSender =
              await tx.user.findUnique({
                where: {
                  id:
                    senderId,
                },

                select: {
                  bullyPoints:
                    true,
                },
              })

            return {
              transfer,

              bullyPoints:
                updatedSender
                  ?.bullyPoints ??
                0,
            }
          }
        )

      return res
        .status(201)
        .json({
          message:
            'Transferência realizada com sucesso.',

          ...result,
        })
    } catch (error) {
      console.error(
        'Erro na transferência:',
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar a transferência.'

      const knownErrors = [
        'Saldo insuficiente.',
        'Destinatário indisponível.',
        'Remetente indisponível.',
      ]

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
              : 'Não foi possível realizar a transferência.',
        })
    }
  }
)

export default router