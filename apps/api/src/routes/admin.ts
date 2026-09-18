import {
  Router,
} from 'express'

import {
  prisma,
} from '../lib/prisma.js'

import {
  requireAdmin,
} from '../middleware/auth.js'

import {
  pointsSchema,
  productIdParamSchema,
  productSchema,
  userIdParamSchema,
} from '../schemas/admin.js'

const router =
  Router()

/*
 * Todas as rotas abaixo
 * exigem administrador.
 */
router.use(
  requireAdmin
)

/*
 * ============================================
 * HELPERS
 * ============================================
 */

function getZodMessage(
  error: {
    issues: Array<{
      message: string
    }>
  },
  fallback:
    string
) {
  return (
    error.issues[0]
      ?.message ??
    fallback
  )
}

/*
 * ============================================
 * DASHBOARD
 * ============================================
 */

router.get(
  '/dashboard',
  async (_req, res) => {
    try {
      const [
        usersCount,
        productsCount,
        purchasesCount,
        pointsAggregation,
      ] =
        await Promise.all([
          prisma.user.count(),

          prisma.product.count({
            where: {
              active: true,
            },
          }),

          prisma.purchase.count({
            where: {
              status:
                'COMPLETED',
            },
          }),

          prisma.user.aggregate({
            _sum: {
              bullyPoints: true,
            },
          }),
        ])

      res.json({
        users:
          usersCount,

        activeProducts:
          productsCount,

        purchases:
          purchasesCount,

        bullyPoints:
          pointsAggregation
            ._sum
            .bullyPoints ??
          0,
      })
    } catch (error) {
      console.error(
        'Erro dashboard:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao carregar dashboard',
        })
    }
  }
)

/*
 * ============================================
 * USUÁRIOS
 * ============================================
 */

router.get(
  '/users',
  async (_req, res) => {
    try {
      const users =
        await prisma.user.findMany({
          orderBy: {
            username:
              'asc',
          },

          select: {
            id: true,
            discordId: true,
            username: true,
            avatar: true,
            bullyPoints: true,
            role: true,
            active: true,
            createdAt: true,
          },
        })

      res.json(
        users
      )
    } catch (error) {
      console.error(
        'Erro usuários:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao carregar usuários',
        })
    }
  }
)

/*
 * ============================================
 * ATIVAR / DESATIVAR USUÁRIO
 * ============================================
 */

router.patch(
  '/users/:id/toggle',
  async (req, res) => {
    const parsedParams =
      userIdParamSchema.safeParse(
        req.params
      )

    if (
      !parsedParams.success
    ) {
      return res
        .status(400)
        .json({
          message:
            'Usuário inválido',
        })
    }

    const userId =
      parsedParams.data.id

    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },
        })

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado',
          })
      }

      /*
       * Impede um administrador
       * de desativar a própria
       * conta pelo painel.
       */
      if (
        user.id ===
        req.auth!.userId
      ) {
        return res
          .status(400)
          .json({
            message:
              'Você não pode alterar o status da sua própria conta.',
          })
      }

      const updated =
        await prisma.user.update({
          where: {
            id: userId,
          },

          data: {
            active:
              !user.active,
          },

          select: {
            id: true,
            discordId: true,
            username: true,
            avatar: true,
            bullyPoints: true,
            role: true,
            active: true,
            createdAt: true,
          },
        })

      res.json(
        updated
      )
    } catch (error) {
      console.error(
        'Erro toggle usuário:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Não foi possível alterar o usuário',
        })
    }
  }
)

/*
 * ============================================
 * ADICIONAR BULLY POINTS
 * ============================================
 */

router.post(
  '/users/:id/points/add',
  async (req, res) => {
    const parsedParams =
      userIdParamSchema.safeParse(
        req.params
      )

    if (
      !parsedParams.success
    ) {
      return res
        .status(400)
        .json({
          message:
            'Usuário inválido',
        })
    }

    const parsedBody =
      pointsSchema.safeParse(
        req.body
      )

    if (
      !parsedBody.success
    ) {
      return res
        .status(400)
        .json({
          message:
            getZodMessage(
              parsedBody.error,
              'Dados inválidos'
            ),
        })
    }

    const userId =
      parsedParams.data.id

    const {
      amount,
      reason,
    } =
      parsedBody.data

    try {
      const targetUser =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },

          select: {
            id: true,
          },
        })

      if (
        !targetUser
      ) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado',
          })
      }

      const result =
        await prisma.$transaction(
          async (tx) => {
            const user =
              await tx.user.update({
                where: {
                  id:
                    userId,
                },

                data: {
                  bullyPoints: {
                    increment:
                      amount,
                  },
                },

                select: {
                  bullyPoints:
                    true,
                },
              })

            await tx
              .pointTransaction
              .create({
                data: {
                  userId,

                  amount,

                  type:
                    'CREDIT',

                  reason,

                  createdBy:
                    req.auth!
                      .userId,
                },
              })

            return user
          }
        )

      res.json({
        message:
          'Bully Points adicionados',

        bullyPoints:
          result.bullyPoints,
      })
    } catch (error) {
      console.error(
        'Erro adicionar BP:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao adicionar Bully Points',
        })
    }
  }
)

/*
 * ============================================
 * REMOVER BULLY POINTS
 * ============================================
 */

router.post(
  '/users/:id/points/remove',
  async (req, res) => {
    const parsedParams =
      userIdParamSchema.safeParse(
        req.params
      )

    if (
      !parsedParams.success
    ) {
      return res
        .status(400)
        .json({
          message:
            'Usuário inválido',
        })
    }

    const parsedBody =
      pointsSchema.safeParse(
        req.body
      )

    if (
      !parsedBody.success
    ) {
      return res
        .status(400)
        .json({
          message:
            getZodMessage(
              parsedBody.error,
              'Dados inválidos'
            ),
        })
    }

    const userId =
      parsedParams.data.id

    const {
      amount,
      reason,
    } =
      parsedBody.data

    try {
      const exists =
        await prisma.user.findUnique({
          where: {
            id: userId,
          },

          select: {
            id: true,
          },
        })

      if (!exists) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado',
          })
      }

      const result =
        await prisma.$transaction(
          async (tx) => {
            /*
             * Operação atômica:
             *
             * só remove BP se
             * ainda existir saldo
             * suficiente naquele
             * exato momento.
             */
            const updated =
              await tx.user.updateMany({
                where: {
                  id:
                    userId,

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
              updated.count ===
              0
            ) {
              throw new Error(
                'INSUFFICIENT_POINTS'
              )
            }

            await tx
              .pointTransaction
              .create({
                data: {
                  userId,

                  amount:
                    -amount,

                  type:
                    'DEBIT',

                  reason,

                  createdBy:
                    req.auth!
                      .userId,
                },
              })

            const user =
              await tx.user.findUnique({
                where: {
                  id:
                    userId,
                },

                select: {
                  bullyPoints:
                    true,
                },
              })

            if (!user) {
              throw new Error(
                'USER_NOT_FOUND'
              )
            }

            return user
          }
        )

      res.json({
        message:
          'Bully Points removidos',

        bullyPoints:
          result.bullyPoints,
      })
    } catch (error) {
      if (
        error instanceof
          Error &&
        error.message ===
          'INSUFFICIENT_POINTS'
      ) {
        return res
          .status(400)
          .json({
            message:
              'O usuário não possui Bully Points suficientes',
          })
      }

      console.error(
        'Erro remover BP:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao remover Bully Points',
        })
    }
  }
)

/*
 * ============================================
 * PRODUTOS
 * ============================================
 */

router.get(
  '/products',
  async (_req, res) => {
    try {
      const products =
        await prisma.product.findMany({
          orderBy: {
            createdAt:
              'desc',
          },
        })

      res.json(
        products
      )
    } catch (error) {
      console.error(
        'Erro produtos:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao carregar produtos',
        })
    }
  }
)

/*
 * ============================================
 * CRIAR PRODUTO
 * ============================================
 */

router.post(
  '/products',
  async (req, res) => {
    const parsed =
      productSchema.safeParse(
        req.body
      )

    if (
      !parsed.success
    ) {
      return res
        .status(400)
        .json({
          message:
            getZodMessage(
              parsed.error,
              'Dados do produto inválidos'
            ),
        })
    }

    const {
      name,
      description,
      imageUrl,
      price,
      stock,
    } =
      parsed.data

    try {
      const product =
        await prisma.product.create({
          data: {
            name,

            description,

            imageUrl:
              imageUrl ??
              null,

            price,

            stock:
              stock ??
              null,

            active:
              true,
          },
        })

      res
        .status(201)
        .json(
          product
        )
    } catch (error) {
      console.error(
        'Erro criar produto:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao criar produto',
        })
    }
  }
)

/*
 * ============================================
 * EDITAR PRODUTO
 * ============================================
 */

router.put(
  '/products/:id',
  async (req, res) => {
    const parsedParams =
      productIdParamSchema
        .safeParse(
          req.params
        )

    if (
      !parsedParams.success
    ) {
      return res
        .status(400)
        .json({
          message:
            'Produto inválido',
        })
    }

    const parsedBody =
      productSchema.safeParse(
        req.body
      )

    if (
      !parsedBody.success
    ) {
      return res
        .status(400)
        .json({
          message:
            getZodMessage(
              parsedBody.error,
              'Dados do produto inválidos'
            ),
        })
    }

    const productId =
      parsedParams.data.id

    const {
      name,
      description,
      imageUrl,
      price,
      stock,
    } =
      parsedBody.data

    try {
      const existing =
        await prisma.product.findUnique({
          where: {
            id:
              productId,
          },

          select: {
            id: true,
          },
        })

      if (
        !existing
      ) {
        return res
          .status(404)
          .json({
            message:
              'Produto não encontrado',
          })
      }

      const product =
        await prisma.product.update({
          where: {
            id:
              productId,
          },

          data: {
            name,

            description,

            imageUrl:
              imageUrl ??
              null,

            price,

            stock:
              stock ??
              null,
          },
        })

      res.json(
        product
      )
    } catch (error) {
      console.error(
        'Erro editar produto:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao editar produto',
        })
    }
  }
)

/*
 * ============================================
 * ATIVAR / DESATIVAR PRODUTO
 * ============================================
 */

router.patch(
  '/products/:id/toggle',
  async (req, res) => {
    const parsedParams =
      productIdParamSchema
        .safeParse(
          req.params
        )

    if (
      !parsedParams.success
    ) {
      return res
        .status(400)
        .json({
          message:
            'Produto inválido',
        })
    }

    const productId =
      parsedParams.data.id

    try {
      const product =
        await prisma.product.findUnique({
          where: {
            id:
              productId,
          },
        })

      if (
        !product
      ) {
        return res
          .status(404)
          .json({
            message:
              'Produto não encontrado',
          })
      }

      const updated =
        await prisma.product.update({
          where: {
            id:
              productId,
          },

          data: {
            active:
              !product.active,
          },
        })

      res.json(
        updated
      )
    } catch (error) {
      console.error(
        'Erro toggle produto:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao alterar produto',
        })
    }
  }
)

/*
 * ============================================
 * COMPRAS
 * ============================================
 */

router.get(
  '/purchases',
  async (_req, res) => {
    try {
      const purchases =
        await prisma.purchase.findMany({
          include: {
            user: {
              select: {
                id: true,
                username: true,
                avatar: true,
                discordId: true,
              },
            },

            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },

          orderBy: {
            createdAt:
              'desc',
          },

          take: 200,
        })

      res.json(
        purchases
      )
    } catch (error) {
      console.error(
        'Erro compras admin:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao carregar compras',
        })
    }
  }
)

/*
 * ============================================
 * MOVIMENTAÇÕES DE BP
 * ============================================
 */

router.get(
  '/transactions',
  async (_req, res) => {
    try {
      const transactions =
        await prisma
          .pointTransaction
          .findMany({
            include: {
              user: {
                select: {
                  id: true,
                  username:
                    true,
                  avatar:
                    true,
                },
              },

              admin: {
                select: {
                  id: true,
                  username:
                    true,
                  avatar:
                    true,
                },
              },
            },

            orderBy: {
              createdAt:
                'desc',
            },

            take: 300,
          })

      res.json(
        transactions
      )
    } catch (error) {
      console.error(
        'Erro movimentações:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Erro ao carregar movimentações',
        })
    }
  }
)

/*
 * ============================================
 * DETALHES DO JOGADOR
 * ============================================
 */

router.get(
  '/users/:id/details',
  async (req, res) => {
    const parsedParams =
      userIdParamSchema.safeParse(
        req.params
      )

    if (
      !parsedParams.success
    ) {
      return res
        .status(400)
        .json({
          message:
            'Usuário inválido',
        })
    }

    const userId =
      parsedParams.data.id

    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id:
              userId,
          },

          include: {
            purchases: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    imageUrl:
                      true,
                  },
                },
              },

              orderBy: {
                createdAt:
                  'desc',
              },

              take: 50,
            },

            pointTransactions:
              {
                include: {
                  admin: {
                    select: {
                      id: true,
                      username:
                        true,
                      avatar:
                        true,
                    },
                  },
                },

                orderBy: {
                  createdAt:
                    'desc',
                },

                take: 100,
              },
          },
        })

      if (!user) {
        return res
          .status(404)
          .json({
            message:
              'Usuário não encontrado',
          })
      }

      res.json({
        id:
          user.id,

        discordId:
          user.discordId,

        username:
          user.username,

        avatar:
          user.avatar,

        bullyPoints:
          user.bullyPoints,

        role:
          user.role,

        active:
          user.active,

        createdAt:
          user.createdAt,

        purchases:
          user.purchases,

        transactions:
          user
            .pointTransactions,
      })
    } catch (error) {
      console.error(
        'Erro detalhes jogador:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Não foi possível carregar os dados do jogador',
        })
    }
  }
)

export default router