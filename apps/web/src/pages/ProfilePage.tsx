import {
  CalendarDays,
  Coins,
  History,
  Receipt,
  ShieldCheck,
  ShoppingBag,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { API_URL } from '../lib'

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
  const [profile, setProfile] =
    useState<Profile | null | undefined>(undefined)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    void loadProfile()
  }, [])

  async function loadProfile() {
    try {
      setError(null)

      const response = await fetch(
        `${API_URL}/api/auth/profile`,
        {
          credentials: 'include',
        }
      )

      if (response.status === 401) {
        setProfile(null)
        return
      }

      const data = await response.json()

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

  const totalSpent = useMemo(() => {
    if (!profile) return 0

    return profile.purchases
      .filter(
        (purchase) =>
          purchase.status === 'COMPLETED'
      )
      .reduce(
        (total, purchase) =>
          total + purchase.price,
        0
      )
  }, [profile])

  function formatDate(value: string) {
    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    ).format(new Date(value))
  }

  function formatShortDate(value: string) {
    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      }
    ).format(new Date(value))
  }

  function roleLabel(role: string) {
    if (role === 'ADMIN') {
      return 'Administrador'
    }

    if (role === 'MODERATOR') {
      return 'Moderador'
    }

    return 'Membro'
  }

  if (profile === undefined) {
    return (
      <main className="page">
        <p>Carregando perfil...</p>
      </main>
    )
  }

  if (!profile) {
    return (
      <main className="page centered">
        <div className="paper-card locked-card">
          <ShieldCheck size={42} />

          <h1>
            Faça login para acessar seu perfil
          </h1>

          <p>
            Entre com sua conta do Discord para
            acessar seu saldo, compras e histórico.
          </p>

          <a
            className="btn primary"
            href={`${API_URL}/api/auth/discord`}
          >
            Entrar com Discord
          </a>

          {error && (
            <div className="admin-error">
              {error}
            </div>
          )}
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <section className="profile-hero paper-card">
        <div className="profile-main">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="profile-avatar"
            />
          ) : (
            <div className="profile-avatar profile-avatar-placeholder">
              {profile.username
                .charAt(0)
                .toUpperCase()}
            </div>
          )}

          <div className="profile-identity">
            <p className="eyebrow">
              ALUNO DE BULLWORTH
            </p>

            <h1>
              {profile.username}
            </h1>

            <div className="profile-meta">
              <span>
                {roleLabel(profile.role)}
              </span>

              <span>
                •
              </span>

              <span>
                ID Discord: {profile.discordId}
              </span>
            </div>
          </div>
        </div>

        <div className="profile-balance">
          <Coins size={22} />

          <span>
            Saldo disponível
          </span>

          <strong>
            {profile.bullyPoints.toLocaleString(
              'pt-BR'
            )}{' '}
            BP
          </strong>
        </div>
      </section>

      <section className="profile-stats">
        <div className="stat paper-card">
          <Coins size={22} />

          <span>
            Saldo atual
          </span>

          <strong>
            {profile.bullyPoints.toLocaleString(
              'pt-BR'
            )}
          </strong>

          <small>
            Bully Points
          </small>
        </div>

        <div className="stat paper-card">
          <ShoppingBag size={22} />

          <span>
            Compras
          </span>

          <strong>
            {profile.purchases.length}
          </strong>

          <small>
            realizadas
          </small>
        </div>

        <div className="stat paper-card">
          <Receipt size={22} />

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
        </div>

        <div className="stat paper-card">
          <CalendarDays size={22} />

          <span>
            Membro desde
          </span>

          <strong className="profile-date-stat">
            {formatShortDate(
              profile.createdAt
            )}
          </strong>

          <small>
            no site
          </small>
        </div>
      </section>

      <section className="profile-columns">
        <div className="paper-card profile-section">
          <div className="profile-section-header">
            <div>
              <p className="eyebrow">
                COMPRAS
              </p>

              <h2>
                Histórico de compras
              </h2>
            </div>

            <ShoppingBag size={24} />
          </div>

          {profile.purchases.length === 0 ? (
            <div className="profile-empty">
              <ShoppingBag size={36} />

              <p>
                Você ainda não realizou nenhuma compra.
              </p>
            </div>
          ) : (
            <div className="profile-purchase-list">
              {profile.purchases.map(
                (purchase) => (
                  <article
                    className="profile-purchase-item"
                    key={purchase.id}
                  >
                    <div className="profile-purchase-image">
                      {purchase.product
                        .imageUrl ? (
                        <img
                          src={
                            purchase.product
                              .imageUrl
                          }
                          alt={
                            purchase.product.name
                          }
                        />
                      ) : (
                        <ShoppingBag
                          size={24}
                        />
                      )}
                    </div>

                    <div className="profile-purchase-info">
                      <strong>
                        {
                          purchase.product
                            .name
                        }
                      </strong>

                      <span>
                        {formatDate(
                          purchase.createdAt
                        )}
                      </span>
                    </div>

                    <div className="profile-purchase-price">
                      -{' '}
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
        </div>

        <div className="paper-card profile-section">
          <div className="profile-section-header">
            <div>
              <p className="eyebrow">
                EXTRATO
              </p>

              <h2>
                Movimentações de BP
              </h2>
            </div>

            <History size={24} />
          </div>

          {profile.transactions.length === 0 ? (
            <div className="profile-empty">
              <History size={36} />

              <p>
                Nenhuma movimentação registrada.
              </p>
            </div>
          ) : (
            <div className="transaction-list">
              {profile.transactions.map(
                (transaction) => {
                  const positive =
                    transaction.amount > 0

                  return (
                    <div
                      className="transaction-item"
                      key={
                        transaction.id
                      }
                    >
                      <div>
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
                        className={`transaction-amount ${
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
                    </div>
                  )
                }
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}