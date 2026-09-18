import 'dotenv/config'

import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import productRoutes from './routes/products.js'
import adminRoutes from './routes/admin.js'

const app = express()

const port =
  Number(
    process.env.PORT ?? 3001
  )

const isProduction =
  process.env.NODE_ENV ===
  'production'

/*
 * Necessário quando a API estiver
 * atrás de proxy, como Railway.
 */
if (isProduction) {
  app.set(
    'trust proxy',
    1
  )
}

/*
 * ============================================
 * RATE LIMIT GERAL
 * ============================================
 */

const apiLimiter =
  rateLimit({
    windowMs:
      15 * 60 * 1000,

    limit: 300,

    standardHeaders:
      'draft-8',

    legacyHeaders:
      false,

    message: {
      message:
        'Muitas requisições. Aguarde alguns minutos e tente novamente.',
    },
  })

/*
 * ============================================
 * SEGURANÇA
 * ============================================
 */

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy:
        'cross-origin',
    },
  })
)

/*
 * ============================================
 * CORS
 * ============================================
 */

app.use(
  cors({
    origin:
      process.env.WEB_URL ??
      'http://localhost:5173',

    credentials:
      true,

    methods: [
      'GET',
      'POST',
      'PUT',
      'PATCH',
      'DELETE',
      'OPTIONS',
    ],
  })
)

/*
 * ============================================
 * PARSERS
 * ============================================
 */

app.use(
  express.json({
    limit: '1mb',
  })
)

app.use(
  express.urlencoded({
    extended: false,
    limit: '1mb',
  })
)

app.use(
  cookieParser()
)

/*
 * ============================================
 * HEALTH
 * ============================================
 */

app.get(
  '/health',
  (_req, res) => {
    res.json({
      ok: true,
    })
  }
)

/*
 * ============================================
 * RATE LIMIT
 * ============================================
 *
 * IMPORTANTE:
 * precisa ficar ANTES das rotas.
 */

app.use(
  '/api',
  apiLimiter
)

/*
 * ============================================
 * ROTAS
 * ============================================
 */

app.use(
  '/api/auth',
  authRoutes
)

app.use(
  '/api/products',
  productRoutes
)

app.use(
  '/api/admin',
  adminRoutes
)

/*
 * ============================================
 * 404
 * ============================================
 */

app.use(
  (
    _req,
    res
  ) => {
    res
      .status(404)
      .json({
        message:
          'Rota não encontrada',
      })
  }
)

/*
 * ============================================
 * ERRO GLOBAL
 * ============================================
 */

app.use(
  (
    err: unknown,
    _req:
      express.Request,
    res:
      express.Response,
    _next:
      express.NextFunction
  ) => {
    console.error(
      'Erro não tratado:',
      err
    )

    if (
      res.headersSent
    ) {
      return
    }

    res
      .status(500)
      .json({
        message:
          'Erro interno do servidor',
      })
  }
)

/*
 * ============================================
 * INICIAR API
 * ============================================
 */

app.listen(
  port,
  () => {
    console.log(
      `API em http://localhost:${port}`
    )
  }
)