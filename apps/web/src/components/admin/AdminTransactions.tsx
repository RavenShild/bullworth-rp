import {
  ArrowDownCircle,
  ArrowUpCircle,
  History,
} from 'lucide-react'
import type { PointTransaction } from './types'

type Props = {
  transactions: PointTransaction[]
  loading: boolean
}

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

export function AdminTransactions({
  transactions,
  loading,
}: Props) {
  if (loading) {
    return (
      <section className="paper-card admin-section">
        <p>Carregando movimentações...</p>
      </section>
    )
  }

  return (
    <section className="paper-card admin-section">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">
            AUDITORIA
          </p>

          <h2>
            Movimentações de Bully Points
          </h2>
        </div>

        <History size={24} />
      </div>

      {transactions.length === 0 ? (
        <div className="admin-empty">
          <History size={40} />

          <p>
            Nenhuma movimentação registrada.
          </p>
        </div>
      ) : (
        <div className="admin-transaction-list">
          {transactions.map(
            (transaction) => {
              const positive =
                transaction.amount > 0

              return (
                <article
                  className="admin-transaction-item"
                  key={transaction.id}
                >
                  <div
                    className={`transaction-icon ${
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

                  <div className="transaction-main">
                    <strong>
                      {transaction.user.username}
                    </strong>

                    <span>
                      {transaction.reason}
                    </span>

                    <small>
                      {formatDate(
                        transaction.createdAt
                      )}
                    </small>
                  </div>

                  <div className="transaction-admin">
                    <span>
                      Responsável
                    </span>

                    <strong>
                      {transaction.admin
                        ? transaction.admin
                            .username
                        : 'Sistema'}
                    </strong>
                  </div>

                  <div
                    className={`transaction-value ${
                      positive
                        ? 'positive'
                        : 'negative'
                    }`}
                  >
                    {positive ? '+' : ''}
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