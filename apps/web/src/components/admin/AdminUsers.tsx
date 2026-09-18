import {
  Coins,
  Eye,
  Minus,
  Plus,
  Search,
  UserRoundCheck,
  UserRoundX,
  X,
} from 'lucide-react'

import {
  useMemo,
  useState,
} from 'react'

import type {
  AdminUserDetails,
} from './types'

import {
  ConfirmModal,
} from '../ConfirmModal'

import {
  ToastContainer,
} from '../ToastContainer'

import {
  useToast,
} from '../../hooks/useToast'

type AdminUser = {
  id: number
  discordId: string
  username: string
  avatar: string | null
  bullyPoints: number
  role: string
  active: boolean
  createdAt: string
}

type Props = {
  users: AdminUser[]
  loading: boolean
  error: string | null
  apiUrl: string

  reloadUsers: () => Promise<void>
  reloadAudit: () => Promise<void>
}

type PointsMode =
  | 'add'
  | 'remove'

export function AdminUsers({
  users,
  loading,
  error,
  apiUrl,
  reloadUsers,
  reloadAudit,
}: Props) {
  const [search, setSearch] =
    useState('')

  const [pointsUser, setPointsUser] =
    useState<AdminUser | null>(null)

  const [pointsMode, setPointsMode] =
    useState<PointsMode>('add')

  const [amount, setAmount] =
    useState('')

  const [reason, setReason] =
    useState('')

  const [
    savingPoints,
    setSavingPoints,
  ] = useState(false)

  const [
    detailsOpen,
    setDetailsOpen,
  ] = useState(false)

  const [details, setDetails] =
    useState<AdminUserDetails | null>(
      null
    )

  const [
    loadingDetails,
    setLoadingDetails,
  ] = useState(false)

  const [
    userToToggle,
    setUserToToggle,
  ] = useState<AdminUser | null>(
    null
  )

  const [
    togglingUser,
    setTogglingUser,
  ] = useState(false)

  const {
    toasts,
    showToast,
    removeToast,
  } = useToast()

  const filteredUsers =
    useMemo(() => {
      const term =
        search
          .trim()
          .toLowerCase()

      if (!term) {
        return users
      }

      return users.filter(
        (item) =>
          item.username
            .toLowerCase()
            .includes(term) ||
          item.discordId
            .toLowerCase()
            .includes(term)
      )
    }, [users, search])

  function openPointsModal(
    user: AdminUser,
    mode: PointsMode
  ) {
    setPointsUser(user)
    setPointsMode(mode)
    setAmount('')
    setReason('')
  }

  function closePointsModal() {
    if (savingPoints) {
      return
    }

    setPointsUser(null)
    setAmount('')
    setReason('')
  }

  async function savePoints() {
    if (!pointsUser) {
      return
    }

    const numericAmount =
      Number(amount)

    if (
      !Number.isInteger(
        numericAmount
      ) ||
      numericAmount <= 0
    ) {
      showToast(
        'Informe uma quantidade válida.',
        'error'
      )

      return
    }

    if (!reason.trim()) {
      showToast(
        'Informe o motivo da movimentação.',
        'error'
      )

      return
    }

    if (
      pointsMode === 'remove' &&
      numericAmount >
        pointsUser.bullyPoints
    ) {
      showToast(
        'O jogador não possui BP suficientes.',
        'error'
      )

      return
    }

    try {
      setSavingPoints(true)

      const route =
        pointsMode === 'add'
          ? 'add'
          : 'remove'

      const response =
        await fetch(
          `${apiUrl}/api/admin/users/${pointsUser.id}/points/${route}`,
          {
            method: 'POST',

            credentials:
              'include',

            headers: {
              'Content-Type':
                'application/json',
            },

            body: JSON.stringify(
              {
                amount:
                  numericAmount,

                reason:
                  reason.trim(),
              }
            ),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message ??
            'Não foi possível alterar os Bully Points.',
          'error'
        )

        return
      }

      showToast(
        pointsMode === 'add'
          ? `${numericAmount.toLocaleString(
              'pt-BR'
            )} BP adicionados para ${pointsUser.username}.`
          : `${numericAmount.toLocaleString(
              'pt-BR'
            )} BP removidos de ${pointsUser.username}.`,
        'success'
      )

      setPointsUser(null)
      setAmount('')
      setReason('')

      await Promise.all([
        reloadUsers(),
        reloadAudit(),
      ])
    } catch (error) {
      console.error(error)

      showToast(
        'Erro ao alterar Bully Points.',
        'error'
      )
    } finally {
      setSavingPoints(false)
    }
  }

  async function confirmToggleUser() {
    if (!userToToggle) {
      return
    }

    try {
      setTogglingUser(true)

      const target =
        userToToggle

      const response =
        await fetch(
          `${apiUrl}/api/admin/users/${target.id}/toggle`,
          {
            method: 'PATCH',

            credentials:
              'include',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message ??
            'Não foi possível alterar o jogador.',
          'error'
        )

        return
      }

      showToast(
        target.active
          ? `${target.username} foi desativado.`
          : `${target.username} foi ativado.`,
        'success'
      )

      setUserToToggle(null)

      await Promise.all([
        reloadUsers(),
        reloadAudit(),
      ])
    } catch (error) {
      console.error(error)

      showToast(
        'Erro ao alterar jogador.',
        'error'
      )
    } finally {
      setTogglingUser(false)
    }
  }

  async function openDetails(
    user: AdminUser
  ) {
    try {
      setLoadingDetails(true)
      setDetailsOpen(true)
      setDetails(null)

      const response =
        await fetch(
          `${apiUrl}/api/admin/users/${user.id}/details`,
          {
            credentials:
              'include',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message ??
            'Não foi possível carregar o jogador.',
          'error'
        )

        setDetailsOpen(false)

        return
      }

      setDetails(data)
    } catch (error) {
      console.error(error)

      showToast(
        'Erro ao carregar jogador.',
        'error'
      )

      setDetailsOpen(false)
    } finally {
      setLoadingDetails(false)
    }
  }

  function closeDetails() {
    if (loadingDetails) {
      return
    }

    setDetailsOpen(false)
    setDetails(null)
  }

  function formatDate(
    value: string
  ) {
    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }
    ).format(
      new Date(value)
    )
  }

  return (
    <>
      <section className="paper-card admin-users-section">
        <div className="admin-users-header">
          <div>
            <p className="eyebrow">
              MEMBROS
            </p>

            <h2>
              Gerenciar jogadores
            </h2>
          </div>

          <div className="admin-search">
            <Search size={18} />

            <input
              type="text"
              placeholder="Nome ou Discord ID..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />
          </div>
        </div>

        {error && (
          <div className="admin-error">
            {error}
          </div>
        )}

        {loading ? (
          <p>
            Carregando usuários...
          </p>
        ) : filteredUsers.length ===
          0 ? (
          <p>
            Nenhum usuário
            encontrado.
          </p>
        ) : (
          <div className="admin-user-list">
            {filteredUsers.map(
              (user) => (
                <div
                  className="admin-user-row"
                  key={user.id}
                >
                  <div className="admin-user-info">
                    {user.avatar ? (
                      <img
                        src={
                          user.avatar
                        }
                        alt={
                          user.username
                        }
                        className="admin-avatar"
                      />
                    ) : (
                      <div className="admin-avatar admin-avatar-placeholder">
                        {user.username
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}

                    <div>
                      <strong>
                        {
                          user.username
                        }
                      </strong>

                      <div className="admin-user-meta">
                        <span>
                          {
                            user.role
                          }
                        </span>

                        <span>
                          •
                        </span>

                        <span>
                          {user.active
                            ? 'Ativo'
                            : 'Inativo'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="admin-user-points">
                    <span>
                      Saldo
                    </span>

                    <strong>
                      {user.bullyPoints.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      BP
                    </strong>
                  </div>

                  <div className="admin-user-actions">
                    <button
                      type="button"
                      className="admin-action details"
                      onClick={() =>
                        openDetails(
                          user
                        )
                      }
                    >
                      <Eye
                        size={16}
                      />

                      Detalhes
                    </button>

                    <button
                      type="button"
                      className="admin-action add"
                      onClick={() =>
                        openPointsModal(
                          user,
                          'add'
                        )
                      }
                    >
                      <Plus
                        size={16}
                      />

                      BP
                    </button>

                    <button
                      type="button"
                      className="admin-action remove"
                      onClick={() =>
                        openPointsModal(
                          user,
                          'remove'
                        )
                      }
                    >
                      <Minus
                        size={16}
                      />

                      BP
                    </button>

                    <button
                      type="button"
                      className={`admin-action ${
                        user.active
                          ? 'deactivate'
                          : 'activate'
                      }`}
                      onClick={() =>
                        setUserToToggle(
                          user
                        )
                      }
                    >
                      {user.active ? (
                        <>
                          <UserRoundX
                            size={16}
                          />

                          Desativar
                        </>
                      ) : (
                        <>
                          <UserRoundCheck
                            size={16}
                          />

                          Ativar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {pointsUser && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closePointsModal
          }
        >
          <div
            className="points-modal paper-card"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="product-modal-header">
              <div>
                <p className="eyebrow">
                  BULLY POINTS
                </p>

                <h2>
                  {pointsMode ===
                  'add'
                    ? 'Adicionar BP'
                    : 'Remover BP'}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closePointsModal
                }
                disabled={
                  savingPoints
                }
              >
                <X
                  size={24}
                />
              </button>
            </div>

            <div className="points-player">
              {pointsUser.avatar ? (
                <img
                  src={
                    pointsUser.avatar
                  }
                  alt={
                    pointsUser.username
                  }
                />
              ) : (
                <div className="points-player-avatar">
                  {pointsUser.username
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}

              <div>
                <strong>
                  {
                    pointsUser.username
                  }
                </strong>

                <span>
                  Saldo atual:{' '}
                  {pointsUser.bullyPoints.toLocaleString(
                    'pt-BR'
                  )}{' '}
                  BP
                </span>
              </div>
            </div>

            <div className="product-form">
              <label>
                Quantidade

                <div className="input-with-icon">
                  <Coins
                    size={17}
                  />

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(
                      event
                    ) =>
                      setAmount(
                        event
                          .target
                          .value
                      )
                    }
                    placeholder="500"
                  />
                </div>
              </label>

              <label>
                Motivo

                <textarea
                  rows={3}
                  value={reason}
                  onChange={(
                    event
                  ) =>
                    setReason(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="Ex.: Premiação do evento escolar"
                />
              </label>

              {amount &&
                Number(amount) >
                  0 && (
                  <div className="points-preview">
                    <span>
                      Novo saldo
                    </span>

                    <strong>
                      {(
                        pointsMode ===
                        'add'
                          ? pointsUser.bullyPoints +
                            Number(
                              amount
                            )
                          : pointsUser.bullyPoints -
                            Number(
                              amount
                            )
                      ).toLocaleString(
                        'pt-BR'
                      )}{' '}
                      BP
                    </strong>
                  </div>
                )}

              {pointsMode ===
                'remove' &&
                Number(amount) >
                  pointsUser.bullyPoints && (
                  <div className="admin-error">
                    O valor informado é
                    maior que o saldo do
                    jogador.
                  </div>
                )}

              <div className="product-modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={
                    closePointsModal
                  }
                  disabled={
                    savingPoints
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className={`btn ${
                    pointsMode ===
                    'add'
                      ? 'primary'
                      : 'danger'
                  }`}
                  onClick={
                    savePoints
                  }
                  disabled={
                    savingPoints ||
                    (pointsMode ===
                      'remove' &&
                      Number(amount) >
                        pointsUser.bullyPoints)
                  }
                >
                  {savingPoints
                    ? 'Salvando...'
                    : pointsMode ===
                        'add'
                      ? 'Adicionar BP'
                      : 'Remover BP'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {detailsOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closeDetails
          }
        >
          <div
            className="user-details-modal paper-card"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="product-modal-header">
              <div>
                <p className="eyebrow">
                  FICHA DO ALUNO
                </p>

                <h2>
                  Detalhes do jogador
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeDetails
                }
                disabled={
                  loadingDetails
                }
              >
                <X
                  size={24}
                />
              </button>
            </div>

            {loadingDetails ? (
              <p>
                Carregando jogador...
              </p>
            ) : details ? (
              <>
                <div className="user-details-header">
                  {details.avatar ? (
                    <img
                      src={
                        details.avatar
                      }
                      alt={
                        details.username
                      }
                    />
                  ) : (
                    <div className="details-avatar-placeholder">
                      {details.username
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}

                  <div>
                    <h2>
                      {
                        details.username
                      }
                    </h2>

                    <span>
                      {
                        details.role
                      }{' '}
                      •{' '}
                      {details.active
                        ? 'Ativo'
                        : 'Inativo'}
                    </span>

                    <small>
                      Discord ID:{' '}
                      {
                        details.discordId
                      }
                    </small>
                  </div>

                  <div className="details-balance">
                    <Coins
                      size={18}
                    />

                    <strong>
                      {details.bullyPoints.toLocaleString(
                        'pt-BR'
                      )}{' '}
                      BP
                    </strong>
                  </div>
                </div>

                <div className="details-summary">
                  <div>
                    <span>
                      Compras
                    </span>

                    <strong>
                      {
                        details
                          .purchases
                          .length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Movimentações
                    </span>

                    <strong>
                      {
                        details
                          .transactions
                          .length
                      }
                    </strong>
                  </div>

                  <div>
                    <span>
                      Membro desde
                    </span>

                    <strong>
                      {formatDate(
                        details.createdAt
                      )}
                    </strong>
                  </div>
                </div>

                <div className="details-columns">
                  <section>
                    <h3>
                      Compras recentes
                    </h3>

                    {details
                      .purchases
                      .length ===
                    0 ? (
                      <p className="details-empty">
                        Nenhuma compra
                        realizada.
                      </p>
                    ) : (
                      <div className="details-list">
                        {details.purchases.map(
                          (
                            purchase
                          ) => (
                            <div
                              key={
                                purchase.id
                              }
                              className="details-list-item"
                            >
                              <div>
                                <strong>
                                  {
                                    purchase
                                      .product
                                      .name
                                  }
                                </strong>

                                <span>
                                  {formatDate(
                                    purchase
                                      .createdAt
                                  )}
                                </span>
                              </div>

                              <strong className="negative">
                                -
                                {purchase.price.toLocaleString(
                                  'pt-BR'
                                )}{' '}
                                BP
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </section>

                  <section>
                    <h3>
                      Extrato de BP
                    </h3>

                    {details
                      .transactions
                      .length ===
                    0 ? (
                      <p className="details-empty">
                        Nenhuma
                        movimentação.
                      </p>
                    ) : (
                      <div className="details-list">
                        {details.transactions.map(
                          (
                            transaction
                          ) => (
                            <div
                              key={
                                transaction.id
                              }
                              className="details-list-item"
                            >
                              <div>
                                <strong>
                                  {
                                    transaction.reason
                                  }
                                </strong>

                                <span>
                                  {formatDate(
                                    transaction
                                      .createdAt
                                  )}

                                  {' • '}

                                  {transaction.admin
                                    ? `por ${transaction.admin.username}`
                                    : 'Sistema'}
                                </span>
                              </div>

                              <strong
                                className={
                                  transaction.amount >
                                  0
                                    ? 'positive'
                                    : 'negative'
                                }
                              >
                                {transaction.amount >
                                0
                                  ? '+'
                                  : ''}

                                {transaction.amount.toLocaleString(
                                  'pt-BR'
                                )}{' '}
                                BP
                              </strong>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </section>
                </div>
              </>
            ) : (
              <div className="details-empty">
                Não foi possível
                carregar os dados do
                jogador.
              </div>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={
          userToToggle !== null
        }
        title={
          userToToggle?.active
            ? 'Desativar jogador'
            : 'Ativar jogador'
        }
        message={
          userToToggle
            ? userToToggle.active
              ? `Tem certeza de que deseja desativar ${userToToggle.username}? O jogador deixará de utilizar normalmente sua conta no sistema.`
              : `Deseja reativar ${userToToggle.username}?`
            : ''
        }
        confirmLabel={
          userToToggle?.active
            ? 'Desativar'
            : 'Ativar'
        }
        danger={
          userToToggle?.active ??
          false
        }
        loading={
          togglingUser
        }
        onCancel={() => {
          if (!togglingUser) {
            setUserToToggle(null)
          }
        }}
        onConfirm={
          confirmToggleUser
        }
      />

      <ToastContainer
        toasts={toasts}
        onClose={
          removeToast
        }
      />
    </>
  )
}