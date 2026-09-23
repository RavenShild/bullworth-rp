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
  socialProfileSchema,
  socialUserParamSchema,
} from '../schemas/social.js'

const router = Router()

const actionLimiter =
  rateLimit({
    windowMs:
      60 * 1000,

    limit: 30,

    standardHeaders:
      'draft-8',

    legacyHeaders:
      false,

    message: {
      message:
        'Muitas ações em pouco tempo. Aguarde um momento.',
    },
  })

/*
 * ============================================
 * MEU PERFIL SOCIAL
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
            active: true,

            socialProfile:
              true,
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
              'Usuário não encontrado.',
          })
      }

      return res.json({
        user: {
          id:
            user.id,

          username:
            user.username,

          avatar:
            user.avatar,
        },

        profile:
          user.socialProfile,
      })
    } catch (error) {
      console.error(
        'Erro ao carregar perfil social:',
        error
      )

      return res
        .status(500)
        .json({
          message:
            'Não foi possível carregar seu perfil social.',
        })
    }
  }
)

/*
 * ============================================
 * CRIAR / ATUALIZAR PERFIL SOCIAL
 * ============================================
 */

router.put(
  '/me',

  requireAuth,

  async (req, res) => {
    const parsed =
      socialProfileSchema.safeParse(
        req.body
      )

    if (!parsed.success) {
      return res
        .status(400)
        .json({
          message:
            parsed.error
              .issues[0]
              ?.message ??
            'Dados inválidos.',
        })
    }

    try {
      const userId =
        req.auth!.userId

      const user =
        await prisma.user.findUnique({
          where: {
            id:
              userId,
          },

          select: {
            active:
              true,
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
              'Usuário não encontrado.',
          })
      }

      const profile =
        await prisma.socialProfile
          .upsert({
            where: {
              userId,
            },

            create: {
              userId,

              bio:
                parsed.data
                  .bio ??
                null,

              interests:
                parsed.data
                  .interests ??
                null,

              active:
                parsed.data
                  .active,
            },

            update: {
              bio:
                parsed.data
                  .bio ??
                null,

              interests:
                parsed.data
                  .interests ??
                null,

              active:
                parsed.data
                  .active,
            },
          })

      return res.json({
        message:
          'Perfil social atualizado.',

        profile,
      })
    } catch (error) {
      console.error(
        'Erro ao atualizar perfil social:',
        error
      )

      return res
        .status(500)
        .json({
          message:
            'Não foi possível atualizar o perfil social.',
        })
    }
  }
)

/*
 * ============================================
 * DESCOBRIR OUTROS ALUNOS
 * ============================================
 */

router.get(
  '/discover',

  requireAuth,

  async (req, res) => {
    try {
      const userId =
        req.auth!.userId

      /*
       * Descobre quem já possui
       * match com o usuário.
       */

      const matches =
        await prisma.socialMatch
          .findMany({
            where: {
              OR: [
                {
                  userOneId:
                    userId,
                },

                {
                  userTwoId:
                    userId,
                },
              ],
            },

            select: {
              userOneId:
                true,

              userTwoId:
                true,
            },
          })

      const matchedUserIds =
        matches.map(
          (match) =>
            match.userOneId ===
            userId
              ? match.userTwoId
              : match.userOneId
        )

      /*
       * Não mostra:
       *
       * - o próprio usuário
       * - perfis desativados
       * - usuários inativos
       * - quem já recebeu like
       * - quem já possui match
       */

      const users =
        await prisma.user.findMany({
          where: {
            id: {
              notIn: [
                userId,
                ...matchedUserIds,
              ],
            },

            active:
              true,

            socialProfile: {
              is: {
                active:
                  true,
              },
            },

            receivedLikes: {
              none: {
                senderId:
                  userId,
              },
            },
          },

          select: {
            id: true,
            username: true,
            avatar: true,

            socialProfile: {
              select: {
                bio:
                  true,

                interests:
                  true,
              },
            },
          },

          orderBy: {
            createdAt:
              'desc',
          },

          take: 30,
        })

      return res.json(
        users
      )
    } catch (error) {
      console.error(
        'Erro ao descobrir alunos:',
        error
      )

      return res
        .status(500)
        .json({
          message:
            'Não foi possível carregar os perfis.',
        })
    }
  }
)

/*
 * ============================================
 * CURTIR PERFIL
 * ============================================
 */

router.post(
  '/:userId/like',

  requireAuth,

  actionLimiter,

  async (req, res) => {
    const parsed =
      socialUserParamSchema.safeParse(
        req.params
      )

    if (!parsed.success) {
      return res
        .status(400)
        .json({
          message:
            'Usuário inválido.',
        })
    }

    const senderId =
      req.auth!.userId

    const receiverId =
      parsed.data.userId

    if (
      senderId ===
      receiverId
    ) {
      return res
        .status(400)
        .json({
          message:
            'Você não pode curtir seu próprio perfil.',
        })
    }

    try {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const receiver =
              await tx.user.findUnique({
                where: {
                  id:
                    receiverId,
                },

                select: {
                  id:
                    true,

                  username:
                    true,

                  active:
                    true,

                  socialProfile: {
                    select: {
                      active:
                        true,
                    },
                  },
                },
              })

            if (
              !receiver ||
              !receiver.active ||
              !receiver
                .socialProfile
                ?.active
            ) {
              throw new Error(
                'Perfil indisponível.'
              )
            }

            /*
             * Cria o like.
             *
             * Upsert impede duplicação.
             */

            await tx.socialLike.upsert({
              where: {
                senderId_receiverId: {
                  senderId,
                  receiverId,
                },
              },

              create: {
                senderId,
                receiverId,
              },

              update: {},
            })

            /*
             * Verifica se a outra
             * pessoa já curtiu você.
             */

            const reciprocalLike =
              await tx.socialLike
                .findUnique({
                  where: {
                    senderId_receiverId: {
                      senderId:
                        receiverId,

                      receiverId:
                        senderId,
                    },
                  },
                })

            if (!reciprocalLike) {
              return {
                matched:
                  false,

                match:
                  null,

                user: {
                  id:
                    receiver.id,

                  username:
                    receiver.username,
                },
              }
            }

            /*
             * IDs sempre ficam em
             * ordem para impedir
             * matches duplicados.
             */

            const userOneId =
              Math.min(
                senderId,
                receiverId
              )

            const userTwoId =
              Math.max(
                senderId,
                receiverId
              )

            const match =
              await tx.socialMatch
                .upsert({
                  where: {
                    userOneId_userTwoId: {
                      userOneId,
                      userTwoId,
                    },
                  },

                  create: {
                    userOneId,
                    userTwoId,
                  },

                  update: {},
                })

            return {
              matched:
                true,

              match,

              user: {
                id:
                  receiver.id,

                username:
                  receiver.username,
              },
            }
          }
        )

      return res
        .status(201)
        .json({
          message:
            result.matched
              ? `Você e ${result.user.username} deram match!`
              : 'Curtida registrada.',

          ...result,
        })
    } catch (error) {
      console.error(
        'Erro ao curtir perfil:',
        error
      )

      const message =
        error instanceof Error
          ? error.message
          : ''

      return res
        .status(
          message ===
            'Perfil indisponível.'
            ? 400
            : 500
        )
        .json({
          message:
            message ===
            'Perfil indisponível.'
              ? message
              : 'Não foi possível registrar a curtida.',
        })
    }
  }
)

/*
 * ============================================
 * LISTAR MATCHES
 * ============================================
 */

router.get(
  '/matches',

  requireAuth,

  async (req, res) => {
    try {
      const userId =
        req.auth!.userId

      const matches =
        await prisma.socialMatch
          .findMany({
            where: {
              OR: [
                {
                  userOneId:
                    userId,
                },

                {
                  userTwoId:
                    userId,
                },
              ],
            },

            include: {
              userOne: {
                select: {
                  id:
                    true,

                  username:
                    true,

                  avatar:
                    true,

                  socialProfile: {
                    select: {
                      bio:
                        true,

                      interests:
                        true,

                      active:
                        true,
                    },
                  },
                },
              },

              userTwo: {
                select: {
                  id:
                    true,

                  username:
                    true,

                  avatar:
                    true,

                  socialProfile: {
                    select: {
                      bio:
                        true,

                      interests:
                        true,

                      active:
                        true,
                    },
                  },
                },
              },
            },

            orderBy: {
              createdAt:
                'desc',
            },
          })

      const result =
        matches.map(
          (match) => {
            const otherUser =
              match.userOneId ===
              userId
                ? match.userTwo
                : match.userOne

            return {
              id:
                match.id,

              createdAt:
                match.createdAt,

              user:
                otherUser,
            }
          }
        )

      return res.json(
        result
      )
    } catch (error) {
      console.error(
        'Erro ao carregar matches:',
        error
      )

      return res
        .status(500)
        .json({
          message:
            'Não foi possível carregar seus matches.',
        })
    }
  }
)

/*
 * ============================================
 * PASSAR PERFIL
 * ============================================
 *
 * Na v1 o "passar" não precisa
 * gravar nada no banco.
 *
 * O frontend apenas remove o
 * perfil atual da sequência.
 */

router.post(
  '/:userId/pass',

  requireAuth,

  actionLimiter,

  async (req, res) => {
    const parsed =
      socialUserParamSchema.safeParse(
        req.params
      )

    if (!parsed.success) {
      return res
        .status(400)
        .json({
          message:
            'Usuário inválido.',
        })
    }

    if (
      parsed.data.userId ===
      req.auth!.userId
    ) {
      return res
        .status(400)
        .json({
          message:
            'Ação inválida.',
        })
    }

    return res.json({
      message:
        'Perfil ignorado.',
    })
  }
)

export default router