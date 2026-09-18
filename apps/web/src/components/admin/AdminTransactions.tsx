import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
} from 'lucide-react'

import type {
  PointTransaction,
} from './types'

type Props = {
  transactions:
    PointTransaction[]

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

export function AdminTransactions({
  transactions,
  loading,
}: Props) {
  return (
    <section className="admin-audit-panel">

      <header className="admin-audit-header">

        <div>
          <p className="eyebrow">
            ACCOUNT LEDGER
          </p>

          <h2>
            Movimentações de Bully Points
          </h2>

          <p>
            Auditoria das entradas
            e saídas da economia
            da academia.
          </p>
        </div>

        <div className="admin-audit-header-icon">
          <History
            size={23}
          />
        </div>

      </header>

      {loading ? (
        <div className="admin-audit-state">
          Carregando movimentações...
        </div>
      ) : transactions.length ===
        0 ? (
        <div className="admin-audit-empty">
          <History
            size={36}
          />

          <strong>
            Nenhuma movimentação
          </strong>

          <p>
            Alterações de Bully Points
            serão registradas aqui.
          </p>
        </div>
      ) : (
        <div className="admin-ledger-list">

          {transactions.map(
            (
              transaction
            ) => {
              const positive =
                transaction.amount >
                0

              return (
                <article
                  className="admin-ledger-row"
                  key={
                    transaction.id
                  }
                >

                  <div
                    className={`admin-ledger-icon ${
                      positive
                        ? 'credit'
                        : 'debit'
                    }`}
                  >
                    {positive ? (
                      <ArrowUpCircle
                        size={22}
                      />
                    ) : (
                      <ArrowDownCircle
                        size={22}
                      />
                    )}
                  </div>

                  <div className="admin-ledger-main">

                    <div className="admin-ledger-user">
                      {transaction
                        .user
                        .avatar ? (
                        <img
                          src={
                            transaction
                              .user
                              .avatar
                          }
                          alt={
                            transaction
                              .user
                              .username
                          }
                        />
                      ) : (
                        <div className="admin-ledger-avatar-placeholder">
                          {transaction
                            .user
                            .username
                            .charAt(
                              0
                            )
                            .toUpperCase()}
                        </div>
                      )}

                      <strong>
                        {
                          transaction
                            .user
                            .username
                        }
                      </strong>
                    </div>

                    <span>
                      {
                        transaction.reason
                      }
                    </span>

                    <small>
                      {formatDate(
                        transaction.createdAt
                      )}
                    </small>

                  </div>

                  <div className="admin-ledger-responsible">
                    <span>
                      RESPONSÁVEL
                    </span>

                    <strong>
                      {transaction.admin
                        ? transaction
                            .admin
                            .username
                        : 'Sistema'}
                    </strong>
                  </div>

                  <div
                    className={`admin-ledger-value ${
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

    </section>
  )
}