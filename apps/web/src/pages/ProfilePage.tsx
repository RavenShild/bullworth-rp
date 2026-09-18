import {
  CalendarDays,
  Coins,
  History,
  IdCard,
  Receipt,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  API_URL,
} from '../lib'

type Purchase = {
  id: number
  price: number
  status: string
  createdAt: string

  product: {
    id: number
    name: string
    imageUrl: string | null
  }
}

type Transaction = {
  id: number
  amount: number
  type: 'CREDIT' | 'DEBIT'
  reason: string
  createdAt: string
}

type Profile = {
  id: number
  discordId: string
  username: string
  avatar: string | null
  bullyPoints: number
  role: string
  createdAt: string
  purchases: Purchase[]
  transactions: Transaction[]
}

export function ProfilePage() {
  const [
    profile,
    setProfile,
  ] =
    useState<
      Profile |
      null |
      undefined
    >(undefined)

  const [
    error,
    setError,
  ] =
    useState<
      string |
      null
    >(null)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setError(null)

      const response =
        await fetch(
          `${API_URL}/api/auth/profile`,
          {
            credentials:
              'include',
          }
        )

      if (
        response.status ===
        401
      ) {
        setProfile(null)

        return
      }

      const data =
        await response.json()

      if (!response.ok) {
        throw new Error(
          data.message ??
            'Não foi possível carregar o perfil'
        )
      }

      setProfile(data)
    } catch (err) {
      console.error(err)

      setError(
        err instanceof Error
          ? err.message
          : 'Erro ao carregar perfil'
      )

      setProfile(null)
    }
  }

  const totalSpent =
    useMemo(() => {
      if (!profile) {
        return 0
      }

      return profile.purchases
        .filter(
          (purchase) =>
            purchase.status ===
            'COMPLETED'
        )
        .reduce(
          (
            total,
            purchase
          ) =>
            total +
            purchase.price,
          0
        )
    }, [profile])

  function formatDate(
    value: string
  ) {
    return new Intl
      .DateTimeFormat(
        'pt-BR',
        {
          day:
            '2-digit',

          month:
            '2-digit',

          year:
            'numeric',

          hour:
            '2-digit',

          minute:
            '2-digit',
        }
      )
      .format(
        new Date(value)
      )
  }

  function formatShortDate(
    value: string
  ) {
    return new Intl
      .DateTimeFormat(
        'pt-BR',
        {
          day:
            '2-digit',

          month:
            'long',

          year:
            'numeric',
        }
      )
      .format(
        new Date(value)
      )
  }

  function roleLabel(
    role: string
  ) {
    if (
      role === 'ADMIN'
    ) {
      return 'Administrador'
    }

    if (
      role ===
      'MODERATOR'
    ) {
      return 'Moderador'
    }

    return 'Aluno'
  }

  if (
    profile === undefined
  ) {
    return (
      <main className="student-page">
        <div className="student-loading">
          <div className="student-loading-emblem">
            B
          </div>

          <p>
            Carregando registro
            acadêmico...
          </p>
        </div>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="student-page student-page-centered">
        <section className="student-login-card">
          <div className="student-login-emblem">
            <ShieldCheck
              size={36}
            />
          </div>

          <p className="eyebrow">
            BULLWORTH ACADEMY
          </p>

          <h1>
            Student Record
          </h1>

          <p>
            Entre com sua conta
            do Discord para
            acessar seu registro,
            saldo, compras e
            histórico dentro da
            academia.
          </p>

          <a
            className="btn primary"
            href={`${API_URL}/api/auth/discord`}
          >
            Entrar com Discord
          </a>

          {error && (
            <div className="student-login-error">
              {error}
            </div>
          )}
        </section>
      </main>
    )
  }

  return (
    <main className="student-page">

      <section className="student-record">

        <div className="student-record-sidebar">

          <div className="student-record-seal">
            <span>
              B
            </span>
          </div>

          <div className="student-avatar-wrap">
            {profile.avatar ? (
              <img
                src={
                  profile.avatar
                }
                alt={
                  profile.username
                }
                className="student-avatar"
              />
            ) : (
              <div className="student-avatar student-avatar-placeholder">
                {profile.username
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
          </div>

          <div className="student-sidebar-name">
            <small>
              STUDENT
            </small>

            <strong>
              {profile.username}
            </strong>
          </div>

          <div className="student-sidebar-divider" />

          <dl className="student-sidebar-data">
            <div>
              <dt>
                Função
              </dt>

              <dd>
                {roleLabel(
                  profile.role
                )}
              </dd>
            </div>

            <div>
              <dt>
                Discord ID
              </dt>

              <dd>
                {profile.discordId}
              </dd>
            </div>

            <div>
              <dt>
                Registro
              </dt>

              <dd>
                #{String(
                  profile.id
                ).padStart(
                  4,
                  '0'
                )}
              </dd>
            </div>
          </dl>

          <div className="student-sidebar-footer">
            BULLWORTH ACADEMY
            <span>
              THE GOLDEN YEARS
            </span>
          </div>

        </div>

        <div className="student-record-main">

          <header className="student-record-header">
            <div>
              <p className="eyebrow">
                OFFICIAL STUDENT RECORD
              </p>

              <h1>
                {profile.username}
              </h1>

              <p className="student-record-subtitle">
                Registro individual
                do aluno • Bullworth
                Academy
              </p>
            </div>

            <div className="student-status">
              <span>
                STATUS
              </span>

              <strong>
                ATIVO
              </strong>
            </div>
          </header>

          <div className="student-gold-rule" />

          <section className="student-balance-panel">

            <div className="student-balance-icon">
              <Coins
                size={26}
              />
            </div>

            <div>
              <span>
                Bully Points
              </span>

              <strong>
                {profile.bullyPoints.toLocaleString(
                  'pt-BR'
                )}{' '}
                BP
              </strong>
            </div>

            <p>
              Saldo disponível
              para uso na
              Bullworth Store.
            </p>

          </section>

          <section className="student-stat-grid">

            <article className="student-stat-card">
              <ShoppingBag
                size={21}
              />

              <span>
                Compras
              </span>

              <strong>
                {profile.purchases.length}
              </strong>

              <small>
                realizadas
              </small>
            </article>

            <article className="student-stat-card">
              <Receipt
                size={21}
              />

              <span>
                BP gastos
              </span>

              <strong>
                {totalSpent.toLocaleString(
                  'pt-BR'
                )}
              </strong>

              <small>
                em compras
              </small>
            </article>

            <article className="student-stat-card">
              <History
                size={21}
              />

              <span>
                Movimentações
              </span>

              <strong>
                {profile.transactions.length}
              </strong>

              <small>
                registradas
              </small>
            </article>

            <article className="student-stat-card student-stat-card-date">
              <CalendarDays
                size={21}
              />

              <span>
                Membro desde
              </span>

              <strong>
                {formatShortDate(
                  profile.createdAt
                )}
              </strong>

              <small>
                na academia
              </small>
            </article>

          </section>

        </div>

      </section>

      <section className="student-content-grid">

        <article className="student-panel">

          <div className="student-panel-header">

            <div className="student-panel-title">
              <div className="student-panel-icon">
                <ShoppingBag
                  size={20}
                />
              </div>

              <div>
                <p className="eyebrow">
                  SCHOOL STORE
                </p>

                <h2>
                  Histórico de compras
                </h2>
              </div>
            </div>

            <span className="student-panel-count">
              {profile.purchases.length}
            </span>

          </div>

          {profile.purchases.length ===
          0 ? (
            <div className="student-empty">
              <ShoppingBag
                size={34}
              />

              <strong>
                Nenhuma compra
              </strong>

              <p>
                Os itens adquiridos
                na Bullworth Store
                aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="student-list">
              {profile.purchases.map(
                (
                  purchase
                ) => (
                  <article
                    className="student-list-item"
                    key={
                      purchase.id
                    }
                  >
                    <div className="student-list-image">
                      {purchase
                        .product
                        .imageUrl ? (
                        <img
                          src={
                            purchase
                              .product
                              .imageUrl
                          }
                          alt={
                            purchase
                              .product
                              .name
                          }
                        />
                      ) : (
                        <ShoppingBag
                          size={20}
                        />
                      )}
                    </div>

                    <div className="student-list-copy">
                      <strong>
                        {
                          purchase
                            .product
                            .name
                        }
                      </strong>

                      <span>
                        {formatDate(
                          purchase.createdAt
                        )}
                      </span>
                    </div>

                    <div className="student-list-value negative">
                      -
                      {purchase.price.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      BP
                    </div>
                  </article>
                )
              )}
            </div>
          )}

        </article>

        <article className="student-panel">

          <div className="student-panel-header">

            <div className="student-panel-title">
              <div className="student-panel-icon">
                <History
                  size={20}
                />
              </div>

              <div>
                <p className="eyebrow">
                  ACCOUNT LEDGER
                </p>

                <h2>
                  Extrato de BP
                </h2>
              </div>
            </div>

            <span className="student-panel-count">
              {profile.transactions.length}
            </span>

          </div>

          {profile.transactions.length ===
          0 ? (
            <div className="student-empty">
              <History
                size={34}
              />

              <strong>
                Nenhuma movimentação
              </strong>

              <p>
                Entradas e saídas
                de Bully Points
                aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="student-list">
              {profile.transactions.map(
                (
                  transaction
                ) => {
                  const positive =
                    transaction.amount >
                    0

                  return (
                    <article
                      className="student-list-item"
                      key={
                        transaction.id
                      }
                    >
                      <div className="student-list-icon">
                        <IdCard
                          size={19}
                        />
                      </div>

                      <div className="student-list-copy">
                        <strong>
                          {
                            transaction.reason
                          }
                        </strong>

                        <span>
                          {formatDate(
                            transaction.createdAt
                          )}
                        </span>
                      </div>

                      <div
                        className={`student-list-value ${
                          positive
                            ? 'positive'
                            : 'negative'
                        }`}
                      >
                        {positive
                          ? '+'
                          : ''}

                        {transaction.amount.toLocaleString(
                          'pt-BR'
                        )}{' '}
                        BP
                      </div>
                    </article>
                  )
                }
              )}
            </div>
          )}

        </article>

      </section>

      <footer className="student-record-footer">
        <span>
          BULLWORTH ACADEMY
        </span>

        <span>
          STUDENT SERVICES
        </span>

        <span>
          THE GOLDEN YEARS — 2000s
        </span>
      </footer>

    </main>
  )
}