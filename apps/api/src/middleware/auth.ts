import type {
  NextFunction,
  Request,
  Response,
} from 'express'

import jwt from 'jsonwebtoken'

import {
  prisma,
} from '../lib/prisma.js'

type SessionPayload = {
  userId: number
}

type AuthUser = {
  userId: number
  role:
    | 'MEMBER'
    | 'MODERATOR'
    | 'ADMIN'
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthUser
    }
  }
}

function getJwtSecret() {
  const secret =
    process.env.JWT_SECRET

  if (!secret) {
    throw new Error(
      'JWT_SECRET não configurado.'
    )
  }

  return secret
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token =
    req.cookies?.session

  if (!token) {
    return res
      .status(401)
      .json({
        message:
          'Não autenticado',
      })
  }

  try {
    const payload =
      jwt.verify(
        token,
        getJwtSecret()
      ) as SessionPayload

    if (
      !payload.userId ||
      !Number.isInteger(
        payload.userId
      )
    ) {
      return res
        .status(401)
        .json({
          message:
            'Sessão inválida',
        })
    }

    /*
     * Consultamos o banco em vez
     * de confiar no cargo salvo
     * dentro do JWT.
     *
     * Assim:
     * - usuário desativado perde acesso;
     * - ADMIN removido perde permissão;
     * - alterações de cargo passam
     *   a valer imediatamente.
     */
    const user =
      await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },

        select: {
          id: true,
          role: true,
          active: true,
        },
      })

    if (
      !user ||
      !user.active
    ) {
      res.clearCookie(
        'session',
        getSessionCookieOptions()
      )

      return res
        .status(401)
        .json({
          message:
            'Usuário indisponível',
        })
    }

    req.auth = {
      userId:
        user.id,

      role:
        user.role,
    }

    next()
  } catch (error) {
    if (
      error instanceof
        jwt.JsonWebTokenError ||
      error instanceof
        jwt.TokenExpiredError
    ) {
      res.clearCookie(
        'session',
        getSessionCookieOptions()
      )

      return res
        .status(401)
        .json({
          message:
            'Sessão inválida ou expirada',
        })
    }

    console.error(
      'Erro ao validar sessão:',
      error
    )

    return res
      .status(500)
      .json({
        message:
          'Erro ao validar sessão',
      })
  }
}

export async function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
) {
  await requireAuth(
    req,
    res,
    () => {
      if (
        req.auth?.role !==
        'ADMIN'
      ) {
        return res
          .status(403)
          .json({
            message:
              'Acesso negado',
          })
      }

      next()
    }
  )
}

export function getSessionCookieOptions() {
  const isProduction =
    process.env.NODE_ENV ===
    'production'

  return {
    httpOnly: true,

    secure:
      isProduction,

    sameSite:
      (
        isProduction
          ? 'none'
          : 'lax'
      ) as
        | 'none'
        | 'lax',

    path: '/',
  }
}