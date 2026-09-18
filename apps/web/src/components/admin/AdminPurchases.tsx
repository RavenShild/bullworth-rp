import {
  Coins,
  ShoppingBag,
} from 'lucide-react'
import type { Purchase } from './types'

type Props = {
  purchases: Purchase[]
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

export function AdminPurchases({
  purchases,
  loading,
}: Props) {
  if (loading) {
    return (
      <section className="paper-card admin-section">
        <p>Carregando compras...</p>
      </section>
    )
  }

  return (
    <section className="paper-card admin-section">
      <div className="admin-section-heading">
        <div>
          <p className="eyebrow">
            LOJA
          </p>

          <h2>
            Histórico de compras
          </h2>
        </div>

        <ShoppingBag size={24} />
      </div>

      {purchases.length === 0 ? (
        <div className="admin-empty">
          <ShoppingBag size={40} />

          <p>
            Nenhuma compra registrada.
          </p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Jogador</th>
                <th>Produto</th>
                <th>Valor</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>
                    <div className="table-user">
                      {purchase.user.avatar ? (
                        <img
                          src={purchase.user.avatar}
                          alt={purchase.user.username}
                        />
                      ) : (
                        <div className="table-avatar-placeholder">
                          {purchase.user.username
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      <span>
                        {purchase.user.username}
                      </span>
                    </div>
                  </td>

                  <td>
                    {purchase.product.name}
                  </td>

                  <td>
                    <div className="table-points">
                      <Coins size={15} />

                      {purchase.price.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      BP
                    </div>
                  </td>

                  <td>
                    <span
                      className={`status-badge ${
                        purchase.status.toLowerCase()
                      }`}
                    >
                      {purchase.status}
                    </span>
                  </td>

                  <td>
                    {formatDate(
                      purchase.createdAt
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}