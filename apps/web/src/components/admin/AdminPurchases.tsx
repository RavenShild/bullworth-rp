import {
  Coins,
  ShoppingBag,
} from 'lucide-react'

import type {
  Purchase,
} from './types'

type Props = {
  purchases: Purchase[]
  loading: boolean
}

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

function statusLabel(
  status: string
) {
  if (
    status ===
    'COMPLETED'
  ) {
    return 'Concluída'
  }

  if (
    status ===
    'PENDING'
  ) {
    return 'Pendente'
  }

  if (
    status ===
    'CANCELLED'
  ) {
    return 'Cancelada'
  }

  return status
}

export function AdminPurchases({
  purchases,
  loading,
}: Props) {
  return (
    <section className="admin-audit-panel">

      <header className="admin-audit-header">

        <div>
          <p className="eyebrow">
            SCHOOL STORE
          </p>

          <h2>
            Histórico de compras
          </h2>

          <p>
            Registro das aquisições
            realizadas pelos alunos.
          </p>
        </div>

        <div className="admin-audit-header-icon">
          <ShoppingBag
            size={23}
          />
        </div>

      </header>

      {loading ? (
        <div className="admin-audit-state">
          Carregando compras...
        </div>
      ) : purchases.length ===
        0 ? (
        <div className="admin-audit-empty">
          <ShoppingBag
            size={36}
          />

          <strong>
            Nenhuma compra registrada
          </strong>

          <p>
            As compras efetuadas
            na Bullworth Store
            aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="admin-purchase-list">

          <div className="admin-purchase-columns">
            <span>
              Jogador
            </span>

            <span>
              Produto
            </span>

            <span>
              Valor
            </span>

            <span>
              Status
            </span>

            <span>
              Data
            </span>
          </div>

          {purchases.map(
            (
              purchase
            ) => (
              <article
                className="admin-purchase-row"
                key={
                  purchase.id
                }
              >

                <div className="admin-purchase-user">
                  {purchase.user.avatar ? (
                    <img
                      src={
                        purchase.user.avatar
                      }
                      alt={
                        purchase.user.username
                      }
                    />
                  ) : (
                    <div className="admin-purchase-avatar-placeholder">
                      {purchase.user.username
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <strong>
                      {
                        purchase.user
                          .username
                      }
                    </strong>

                    <small>
                      ID{' '}
                      {
                        purchase.user
                          .discordId
                      }
                    </small>
                  </div>
                </div>

                <div className="admin-purchase-product">
                  <strong>
                    {
                      purchase.product
                        .name
                    }
                  </strong>
                </div>

                <div className="admin-purchase-value">
                  <Coins
                    size={15}
                  />

                  <strong>
                    {purchase.price.toLocaleString(
                      'pt-BR'
                    )}{' '}
                    BP
                  </strong>
                </div>

                <div>
                  <span
                    className={`admin-status-badge ${purchase.status.toLowerCase()}`}
                  >
                    {statusLabel(
                      purchase.status
                    )}
                  </span>
                </div>

                <time className="admin-purchase-date">
                  {formatDate(
                    purchase.createdAt
                  )}
                </time>

              </article>
            )
          )}

        </div>
      )}

    </section>
  )
}