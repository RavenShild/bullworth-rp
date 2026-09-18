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
  productIdParamSchema,
} from '../schemas/products.js'

const router = Router()

const purchaseLimiter =
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
        'Muitas tentativas de compra. Aguarde um momento.',
    },
  })

/*
 * PRODUTOS ATIVOS
 */
router.get(
  '/',
  requireAuth,
  async (_req, res) => {
    try {
      const products =
        await prisma.product.findMany({
          where: {
            active: true,
          },

          orderBy: {
            createdAt: 'desc',
          },
        })

      res.json(products)
    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Não foi possível carregar os produtos.',
      })
    }
  }
)

/*
 * HISTÓRICO DO USUÁRIO
 */
router.get(
  '/purchases/me',
  requireAuth,
  async (req, res) => {
    try {
      const purchases =
        await prisma.purchase.findMany({
          where: {
            userId:
              req.auth!.userId,
          },

          include: {
            product: {
              select: {
                id: true,
                name: true,
                imageUrl: true,
              },
            },
          },

          orderBy: {
            createdAt: 'desc',
          },
        })

      res.json(purchases)
    } catch (error) {
      console.error(error)

      res.status(500).json({
        message:
          'Não foi possível carregar o histórico.',
      })
    }
  }
)

/*
 * COMPRAR
 */
router.post(
  '/:id/buy',

  requireAuth,

  purchaseLimiter,

  async (req, res) => {
    const parsedParams =
      productIdParamSchema.safeParse(
        req.params
      )

    if (
      !parsedParams.success
    ) {
      return res
        .status(400)
        .json({
          message:
            'Produto inválido.',
        })
    }

    const productId =
      parsedParams.data.id

    try {
      const result =
        await prisma.$transaction(
          async (tx) => {
            const product =
              await tx.product.findUnique({
                where: {
                  id: productId,
                },
              })

            if (
              !product ||
              !product.active
            ) {
              throw new Error(
                'Produto indisponível.'
              )
            }

            if (
              product.stock !==
                null &&
              product.stock <= 0
            ) {
              throw new Error(
                'Produto esgotado.'
              )
            }

            /*
             * Desconta BP somente
             * se o usuário ainda
             * possuir saldo.
             *
             * Isso também ajuda a
             * proteger contra duas
             * compras simultâneas.
             */
            const userUpdate =
              await tx.user.updateMany({
                where: {
                  id:
                    req.auth!
                      .userId,

                  active: true,

                  bullyPoints: {
                    gte:
                      product.price,
                  },
                },

                data: {
                  bullyPoints: {
                    decrement:
                      product.price,
                  },
                },
              })

            if (
              userUpdate.count ===
              0
            ) {
              throw new Error(
                'Saldo insuficiente.'
              )
            }

            /*
             * Reduz o estoque
             * atomicamente.
             */
            if (
              product.stock !==
              null
            ) {
              const stockUpdate =
                await tx.product.updateMany({
                  where: {
                    id:
                      product.id,

                    active: true,

                    stock: {
                      gt: 0,
                    },
                  },

                  data: {
                    stock: {
                      decrement: 1,
                    },
                  },
                })

              if (
                stockUpdate.count ===
                0
              ) {
                throw new Error(
                  'Produto esgotado.'
                )
              }
            }

            const purchase =
              await tx.purchase.create({
                data: {
                  userId:
                    req.auth!
                      .userId,

                  productId:
                    product.id,

                  price:
                    product.price,

                  status:
                    'COMPLETED',
                },
              })

            await tx
              .pointTransaction
              .create({
                data: {
                  userId:
                    req.auth!
                      .userId,

                  amount:
                    -product.price,

                  type:
                    'DEBIT',

                  reason:
                    `Compra: ${product.name}`,
                },
              })

            const updatedUser =
              await tx.user.findUnique({
                where: {
                  id:
                    req.auth!
                      .userId,
                },

                select: {
                  bullyPoints:
                    true,
                },
              })

            const updatedProduct =
              await tx.product.findUnique({
                where: {
                  id:
                    product.id,
                },

                select: {
                  stock: true,
                },
              })

            return {
              purchase,

              bullyPoints:
                updatedUser
                  ?.bullyPoints ??
                0,

              stock:
                updatedProduct
                  ?.stock ??
                null,
            }
          }
        )

      res
        .status(201)
        .json({
          message:
            'Compra realizada com sucesso!',

          ...result,
        })
    } catch (error) {
      console.error(error)

      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível realizar a compra.'

      const knownErrors = [
        'Produto indisponível.',
        'Produto esgotado.',
        'Saldo insuficiente.',
      ]

      res
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
              : 'Não foi possível realizar a compra.',
        })
    }
  }
)

export default router