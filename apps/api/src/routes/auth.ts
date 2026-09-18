import crypto from 'node:crypto'

import {
  Router,
} from 'express'

import jwt from 'jsonwebtoken'

import {
  prisma,
} from '../lib/prisma.js'

import {
  getSessionCookieOptions,
  requireAuth,
} from '../middleware/auth.js'

const router =
  Router()

const DISCORD_API =
  'https://discord.com/api/v10'

const SESSION_MAX_AGE =
  7 *
  24 *
  60 *
  60 *
  1000

const OAUTH_STATE_MAX_AGE =
  10 *
  60 *
  1000

type DiscordTokenResponse = {
  access_token: string
  token_type?: string
  expires_in?: number
  scope?: string
}

type DiscordUser = {
  id: string
  username: string

  global_name?:
    | string
    | null

  avatar?:
    | string
    | null
}

type DiscordMember = {
  roles: string[]
}

function env(
  name: string
) {
  const value =
    process.env[name]

  if (!value) {
    throw new Error(
      `${name} não configurado.`
    )
  }

  return value
}

function getWebUrl() {
  return (
    process.env.WEB_URL ??
    'http://localhost:5173'
  )
}

function getOAuthCookieOptions() {
  const isProduction =
    process.env.NODE_ENV ===
    'production'

  return {
    httpOnly: true,

    secure:
      isProduction,

    /*
     * OAuth usa redirecionamento
     * de navegação normal.
     * Lax funciona neste fluxo.
     */
    sameSite:
      'lax' as const,

    maxAge:
      OAUTH_STATE_MAX_AGE,

    path: '/',
  }
}

function getOAuthClearOptions() {
  const isProduction =
    process.env.NODE_ENV ===
    'production'

  return {
    httpOnly: true,

    secure:
      isProduction,

    sameSite:
      'lax' as const,

    path: '/',
  }
}

function getSessionOptions() {
  return {
    ...getSessionCookieOptions(),

    maxAge:
      SESSION_MAX_AGE,
  }
}

/*
 * ============================================
 * INICIAR LOGIN DISCORD
 * ============================================
 */
router.get(
  '/discord',
  (_req, res) => {
    try {
      const clientId =
        env(
          'DISCORD_CLIENT_ID'
        )

      const redirectUri =
        env(
          'DISCORD_REDIRECT_URI'
        )

      const state =
        crypto
          .randomBytes(32)
          .toString('hex')

      res.cookie(
        'oauth_state',
        state,
        getOAuthCookieOptions()
      )

      const params =
        new URLSearchParams({
          client_id:
            clientId,

          redirect_uri:
            redirectUri,

          response_type:
            'code',

          scope:
            'identify',

          state,
        })

      res.redirect(
        `https://discord.com/oauth2/authorize?${params.toString()}`
      )
    } catch (error) {
      console.error(
        'Erro ao iniciar OAuth:',
        error
      )

      res.redirect(
        `${getWebUrl()}/?erro=configuracao`
      )
    }
  }
)

/*
 * ============================================
 * CALLBACK DISCORD
 * ============================================
 */
router.get(
  '/discord/callback',
  async (req, res) => {
    try {
      const code =
        String(
          req.query.code ??
            ''
        )

      const state =
        String(
          req.query.state ??
            ''
        )

      const storedState =
        req.cookies
          ?.oauth_state

      /*
       * O state protege contra
       * ataques CSRF no OAuth.
       */
      if (
        !code ||
        !state ||
        !storedState ||
        state !==
          storedState
      ) {
        res.clearCookie(
          'oauth_state',
          getOAuthClearOptions()
        )

        return res
          .status(400)
          .send(
            'OAuth inválido.'
          )
      }

      /*
       * O state só deve ser
       * utilizado uma vez.
       */
      res.clearCookie(
        'oauth_state',
        getOAuthClearOptions()
      )

      const clientId =
        env(
          'DISCORD_CLIENT_ID'
        )

      const clientSecret =
        env(
          'DISCORD_CLIENT_SECRET'
        )

      const redirectUri =
        env(
          'DISCORD_REDIRECT_URI'
        )

      const guildId =
        env(
          'DISCORD_GUILD_ID'
        )

      const botToken =
        env(
          'DISCORD_BOT_TOKEN'
        )

      /*
       * Troca o código OAuth
       * pelo access token.
       */
      const tokenResponse =
        await fetch(
          `${DISCORD_API}/oauth2/token`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/x-www-form-urlencoded',
            },

            body:
              new URLSearchParams(
                {
                  client_id:
                    clientId,

                  client_secret:
                    clientSecret,

                  grant_type:
                    'authorization_code',

                  code,

                  redirect_uri:
                    redirectUri,
                }
              ),
          }
        )

      if (
        !tokenResponse.ok
      ) {
        console.error(
          'Discord token:',
          tokenResponse.status
        )

        throw new Error(
          'Falha ao trocar código OAuth.'
        )
      }

      const token =
        (
          await tokenResponse.json()
        ) as DiscordTokenResponse

      if (
        !token.access_token
      ) {
        throw new Error(
          'Discord não retornou access token.'
        )
      }

      /*
       * Dados do usuário Discord.
       */
      const userResponse =
        await fetch(
          `${DISCORD_API}/users/@me`,
          {
            headers: {
              Authorization:
                `Bearer ${token.access_token}`,
            },
          }
        )

      if (
        !userResponse.ok
      ) {
        throw new Error(
          'Falha ao obter usuário Discord.'
        )
      }

      const discordUser =
        (
          await userResponse.json()
        ) as DiscordUser

      if (
        !discordUser.id
      ) {
        throw new Error(
          'Usuário Discord inválido.'
        )
      }

      /*
       * Verifica se a pessoa
       * realmente está no servidor.
       */
      const memberResponse =
        await fetch(
          `${DISCORD_API}/guilds/${guildId}/members/${discordUser.id}`,
          {
            headers: {
              Authorization:
                `Bot ${botToken}`,
            },
          }
        )

      if (
        memberResponse.status ===
        404
      ) {
        return res.redirect(
          `${getWebUrl()}/?erro=nao-membro`
        )
      }

      if (
        !memberResponse.ok
      ) {
        console.error(
          'Discord member:',
          memberResponse.status
        )

        throw new Error(
          'Não foi possível validar o membro no servidor.'
        )
      }

      const member =
        (
          await memberResponse.json()
        ) as DiscordMember

      /*
       * Cargo administrativo
       * sincronizado com Discord.
       */
      const adminRoleId =
        process.env
          .DISCORD_ADMIN_ROLE_ID

      const role:
        | 'ADMIN'
        | 'MEMBER' =
        adminRoleId &&
        member.roles.includes(
          adminRoleId
        )
          ? 'ADMIN'
          : 'MEMBER'

      const username =
        discordUser.global_name?.trim() ||
        discordUser.username

      const avatar =
        discordUser.avatar
          ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256`
          : null

      /*
       * IMPORTANTE:
       *
       * Não atualizamos "active".
       *
       * Se um administrador
       * desativar alguém pelo
       * painel, fazer login
       * novamente NÃO reativa
       * automaticamente a conta.
       */
      const user =
        await prisma.user.upsert({
          where: {
            discordId:
              discordUser.id,
          },

          create: {
            discordId:
              discordUser.id,

            username,

            avatar,

            role,
          },

          update: {
            username,

            avatar,

            role,
          },
        })

      if (
        !user.active
      ) {
        return res.redirect(
          `${getWebUrl()}/?erro=conta-inativa`
        )
      }

      /*
       * O JWT agora guarda
       * somente a identificação
       * do usuário.
       *
       * O cargo é consultado
       * no banco pelo middleware.
       */
      const session =
        jwt.sign(
          {
            userId:
              user.id,
          },

          env(
            'JWT_SECRET'
          ),

          {
            expiresIn:
              '7d',
          }
        )

      res.cookie(
        'session',
        session,
        getSessionOptions()
      )

      res.redirect(
        `${getWebUrl()}/perfil`
      )
    } catch (error) {
      console.error(
        'Erro OAuth:',
        error
      )

      res.clearCookie(
        'oauth_state',
        getOAuthClearOptions()
      )

      res.redirect(
        `${getWebUrl()}/?erro=oauth`
      )
    }
  }
)

/*
 * ============================================
 * USUÁRIO LOGADO
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
              req.auth!
                .userId,
          },

          select: {
            id: true,
            discordId: true,
            username: true,
            avatar: true,
            bullyPoints: true,
            role: true,
            active: true,
          },
        })

      if (
        !user ||
        !user.active
      ) {
        return res
          .status(401)
          .json({
            message:
              'Usuário indisponível',
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
      })
    } catch (error) {
      console.error(
        'Erro /me:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Não foi possível carregar o usuário.',
        })
    }
  }
)

/*
 * ============================================
 * PERFIL
 * ============================================
 */
router.get(
  '/profile',
  requireAuth,
  async (req, res) => {
    try {
      const user =
        await prisma.user.findUnique({
          where: {
            id:
              req.auth!
                .userId,
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
            },

            pointTransactions:
              {
                orderBy: {
                  createdAt:
                    'desc',
                },
              },
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

        createdAt:
          user.createdAt,

        purchases:
          user.purchases.map(
            (
              purchase
            ) => ({
              id:
                purchase.id,

              price:
                purchase.price,

              status:
                purchase.status,

              createdAt:
                purchase.createdAt,

              product: {
                id:
                  purchase
                    .product.id,

                name:
                  purchase
                    .product.name,

                imageUrl:
                  purchase
                    .product
                    .imageUrl,
              },
            })
          ),

        transactions:
          user
            .pointTransactions
            .map(
              (
                transaction
              ) => ({
                id:
                  transaction.id,

                amount:
                  transaction.amount,

                type:
                  transaction.type,

                reason:
                  transaction.reason,

                createdAt:
                  transaction.createdAt,
              })
            ),
      })
    } catch (error) {
      console.error(
        'Erro profile:',
        error
      )

      res
        .status(500)
        .json({
          message:
            'Não foi possível carregar o perfil',
        })
    }
  }
)

/*
 * ============================================
 * LOGOUT
 * ============================================
 */
router.post(
  '/logout',
  (_req, res) => {
    res.clearCookie(
      'session',
      getSessionCookieOptions()
    )

    res
      .status(204)
      .end()
  }
)

export default router