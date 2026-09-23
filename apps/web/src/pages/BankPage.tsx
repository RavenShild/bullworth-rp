import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Coins,
  Landmark,
  Search,
  Send,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  API_URL,
  getMe,
  type User,
} from '../lib'

type BankAccount = {
  id: number
  username: string
  avatar: string | null
  bullyPoints: number
  active: boolean
}

type BankUser = {
  id: number
  username: string
  avatar: string | null
}

type BankTransfer = {
  id: number
  amount: number
  description: string | null
  createdAt: string
  direction:
    | 'SENT'
    | 'RECEIVED'
  otherUser: BankUser
}

export function BankPage() {
  const [
    user,
    setUser,
  ] = useState<
    User |
    null |
    undefined
  >(undefined)

  const [
    account,
    setAccount,
  ] = useState<
    BankAccount |
    null
  >(null)

  const [
    transfers,
    setTransfers,
  ] = useState<
    BankTransfer[]
  >([])

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    search,
    setSearch,
  ] = useState('')

  const [
    searchResults,
    setSearchResults,
  ] = useState<BankUser[]>([])

  const [
    searching,
    setSearching,
  ] = useState(false)

  const [
    selectedUser,
    setSelectedUser,
  ] = useState<
    BankUser |
    null
  >(null)

  const [
    amount,
    setAmount,
  ] = useState('')

  const [
    description,
    setDescription,
  ] = useState('')

  const [
    sending,
    setSending,
  ] = useState(false)

  const [
    successMessage,
    setSuccessMessage,
  ] = useState<
    string |
    null
  >(null)

  useEffect(() => {
    void loadPage()
  }, [])

  useEffect(() => {
    if (
      !user ||
      search.trim().length <
        1 ||
      selectedUser
    ) {
      setSearchResults([])
      return
    }

    const timeout =
      window.setTimeout(
        () => {
          void searchUsers()
        },
        300
      )

    return () =>
      window.clearTimeout(
        timeout
      )
  }, [
    search,
    user,
    selectedUser,
  ])

  async function loadPage() {
    try {
      setLoading(true)
      setError(null)

      const currentUser =
        await getMe()

      setUser(
        currentUser
      )

      if (!currentUser) {
        return
      }

      await Promise.all([
        loadAccount(),
        loadTransfers(),
      ])
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível carregar o Bullworth Bank.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadAccount() {
    const response =
      await fetch(
        `${API_URL}/api/bank/me`,
        {
          credentials:
            'include',
        }
      )

    const data =
      await response.json()

    if (!response.ok) {
      throw new Error(
        data.message ??
          'Erro ao carregar conta.'
      )
    }

    setAccount(data)
  }

  async function loadTransfers() {
    const response =
      await fetch(
        `${API_URL}/api/bank/transfers`,
        {
          credentials:
            'include',
        }
      )

    const data =
      await response.json()

    if (!response.ok) {
      throw new Error(
        data.message ??
          'Erro ao carregar transferências.'
      )
    }

    setTransfers(data)
  }

  async function searchUsers() {
    try {
      setSearching(true)

      const response =
        await fetch(
          `${API_URL}/api/bank/users?q=${encodeURIComponent(
            search.trim()
          )}`,
          {
            credentials:
              'include',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        setSearchResults([])
        return
      }

      setSearchResults(data)
    } catch (err) {
      console.error(err)

      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  async function sendTransfer() {
    if (!selectedUser) {
      setError(
        'Selecione um aluno para receber os Bully Points.'
      )
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
      setError(
        'Informe um valor válido.'
      )
      return
    }

    if (
      account &&
      numericAmount >
        account.bullyPoints
    ) {
      setError(
        'Você não possui BP suficientes.'
      )
      return
    }

    try {
      setSending(true)
      setError(null)
      setSuccessMessage(null)

      const response =
        await fetch(
          `${API_URL}/api/bank/transfer`,
          {
            method:
              'POST',

            credentials:
              'include',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                recipientId:
                  selectedUser.id,

                amount:
                  numericAmount,

                description:
                  description.trim(),
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.message ??
            'Não foi possível realizar a transferência.'
        )
        return
      }

      setSuccessMessage(
        `${numericAmount.toLocaleString(
          'pt-BR'
        )} BP enviados para ${selectedUser.username}.`
      )

      setAmount('')
      setDescription('')
      setSearch('')
      setSelectedUser(null)
      setSearchResults([])

      await Promise.all([
        loadAccount(),
        loadTransfers(),
      ])
    } catch (err) {
      console.error(err)

      setError(
        'Erro ao realizar transferência.'
      )
    } finally {
      setSending(false)
    }
  }

  const sentTotal =
    useMemo(
      () =>
        transfers
          .filter(
            (
              transfer
            ) =>
              transfer.direction ===
              'SENT'
          )
          .reduce(
            (
              total,
              transfer
            ) =>
              total +
              transfer.amount,
            0
          ),
      [transfers]
    )

  const receivedTotal =
    useMemo(
      () =>
        transfers
          .filter(
            (
              transfer
            ) =>
              transfer.direction ===
              'RECEIVED'
          )
          .reduce(
            (
              total,
              transfer
            ) =>
              total +
              transfer.amount,
            0
          ),
      [transfers]
    )

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

  if (loading) {
    return (
      <main className="page centered">
        <section className="paper-card bank-loading-card">
          <Landmark size={34} />

          <h1>
            Bullworth Bank
          </h1>

          <p>
            Acessando sua conta estudantil...
          </p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page centered">
        <section className="paper-card locked-card">
          <Landmark size={38} />

          <p className="eyebrow">
            BULLWORTH STUDENT BANK
          </p>

          <h1>
            Área restrita
          </h1>

          <p>
            Entre com sua conta da Bullworth
            Academy para acessar o banco.
          </p>

          <a
            className="btn primary"
            href={`${API_URL}/api/auth/discord`}
          >
            Entrar com Discord
          </a>
        </section>
      </main>
    )
  }

  return (
    <main className="page bank-page">

      <header className="bank-page-heading">
        <div>
          <p className="eyebrow">
            BULLWORTH ACADEMY
          </p>

          <h1>
            Student Bank
          </h1>

          <p>
            Transferências, saldo e histórico
            da sua conta estudantil.
          </p>
        </div>

        <div className="bank-page-seal">
          <Landmark size={27} />

          <div>
            <strong>
              BULLWORTH BANK
            </strong>

            <small>
              STUDENT ACCOUNT
            </small>
          </div>
        </div>
      </header>

      {error && (
        <div className="bank-message error">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bank-message success">
          {successMessage}
        </div>
      )}

      <section className="bank-account-card">

        <div className="bank-account-top">

          <div>
            <span>
              CURRENT BALANCE
            </span>

            <strong>
              {(
                account?.bullyPoints ??
                0
              ).toLocaleString(
                'pt-BR'
              )}{' '}
              BP
            </strong>
          </div>

          <div className="bank-account-user">
            {account?.avatar ? (
              <img
                src={
                  account.avatar
                }
                alt={
                  account.username
                }
              />
            ) : (
              <div className="bank-user-avatar-placeholder">
                {account?.username
                  ?.charAt(0)
                  .toUpperCase()}
              </div>
            )}

            <div>
              <small>
                ACCOUNT HOLDER
              </small>

              <strong>
                {
                  account?.username
                }
              </strong>
            </div>
          </div>

        </div>

        <div className="bank-account-footer">
          <div>
            <ShieldCheck
              size={16}
            />

            Conta verificada
          </div>

          <span>
            Bullworth Academy
          </span>
        </div>

      </section>

      <div className="bank-summary-grid">

        <article className="bank-summary-card">
          <ArrowDownLeft
            size={21}
          />

          <span>
            RECEBIDO
          </span>

          <strong>
            +{receivedTotal.toLocaleString(
              'pt-BR'
            )}{' '}
            BP
          </strong>
        </article>

        <article className="bank-summary-card">
          <ArrowUpRight
            size={21}
          />

          <span>
            ENVIADO
          </span>

          <strong>
            -{sentTotal.toLocaleString(
              'pt-BR'
            )}{' '}
            BP
          </strong>
        </article>

        <article className="bank-summary-card">
          <Banknote
            size={21}
          />

          <span>
            TRANSFERÊNCIAS
          </span>

          <strong>
            {transfers.length}
          </strong>
        </article>

      </div>

      <div className="bank-layout">

        <section className="bank-transfer-panel">

          <div className="bank-section-heading">
            <div>
              <p className="eyebrow">
                QUICK TRANSFER
              </p>

              <h2>
                Enviar Bully Points
              </h2>

              <p>
                Envie BP diretamente para
                outro aluno da Bullworth.
              </p>
            </div>

            <Send size={23} />
          </div>

          <div className="bank-transfer-form">

            <label>
              Destinatário

              <div className="bank-search-box">
                <Search size={17} />

                <input
                  type="text"
                  value={
                    selectedUser
                      ? selectedUser
                          .username
                      : search
                  }
                  placeholder="Pesquisar aluno..."
                  onChange={(
                    event
                  ) => {
                    setSelectedUser(
                      null
                    )

                    setSearch(
                      event
                        .target
                        .value
                    )
                  }}
                />
              </div>
            </label>

            {!selectedUser &&
              search.trim() && (
              <div className="bank-user-results">

                {searching ? (
                  <div className="bank-search-state">
                    Pesquisando...
                  </div>
                ) : searchResults.length ===
                  0 ? (
                  <div className="bank-search-state">
                    Nenhum aluno encontrado.
                  </div>
                ) : (
                  searchResults.map(
                    (
                      result
                    ) => (
                      <button
                        type="button"
                        key={
                          result.id
                        }
                        className="bank-user-result"
                        onClick={() => {
                          setSelectedUser(
                            result
                          )

                          setSearch(
                            result.username
                          )

                          setSearchResults(
                            []
                          )
                        }}
                      >
                        {result.avatar ? (
                          <img
                            src={
                              result.avatar
                            }
                            alt={
                              result.username
                            }
                          />
                        ) : (
                          <div className="bank-result-avatar-placeholder">
                            {result.username
                              .charAt(
                                0
                              )
                              .toUpperCase()}
                          </div>
                        )}

                        <div>
                          <strong>
                            {
                              result.username
                            }
                          </strong>

                          <span>
                            Bullworth Student
                          </span>
                        </div>
                      </button>
                    )
                  )
                )}

              </div>
            )}

            {selectedUser && (
              <div className="bank-selected-user">

                {selectedUser.avatar ? (
                  <img
                    src={
                      selectedUser.avatar
                    }
                    alt={
                      selectedUser.username
                    }
                  />
                ) : (
                  <div className="bank-selected-avatar-placeholder">
                    {selectedUser.username
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                <div>
                  <small>
                    DESTINATÁRIO
                  </small>

                  <strong>
                    {
                      selectedUser.username
                    }
                  </strong>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedUser(
                      null
                    )
                    setSearch('')
                  }}
                >
                  Alterar
                </button>

              </div>
            )}

            <label>
              Valor

              <div className="bank-amount-input">
                <Coins size={17} />

                <input
                  type="number"
                  min="1"
                  max="50000"
                  step="1"
                  value={amount}
                  onChange={(
                    event
                  ) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  placeholder="150"
                />

                <span>
                  BP
                </span>
              </div>
            </label>

            <label>
              Descrição

              <textarea
                rows={3}
                maxLength={140}
                value={
                  description
                }
                onChange={(
                  event
                ) =>
                  setDescription(
                    event.target.value
                  )
                }
                placeholder="Ex.: Aposta do jogo de basquete"
              />

              <small className="bank-character-count">
                {description.length}/140
              </small>
            </label>

            {amount &&
              Number(amount) >
                0 && (
              <div className="bank-transfer-preview">

                <span>
                  Saldo após transferência
                </span>

                <strong>
                  {Math.max(
                    0,
                    (
                      account
                        ?.bullyPoints ??
                      0
                    ) -
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

            <button
              type="button"
              className="btn primary bank-send-button"
              disabled={
                sending ||
                !selectedUser ||
                !amount ||
                Number(amount) <=
                  0
              }
              onClick={
                sendTransfer
              }
            >
              <Send size={17} />

              {sending
                ? 'Enviando...'
                : 'Enviar Bully Points'}
            </button>

          </div>

        </section>

        <section className="bank-history-panel">

          <div className="bank-section-heading">
            <div>
              <p className="eyebrow">
                ACCOUNT ACTIVITY
              </p>

              <h2>
                Atividade recente
              </h2>

              <p>
                Histórico das suas transferências.
              </p>
            </div>

            <Landmark size={23} />
          </div>

          {transfers.length ===
          0 ? (
            <div className="bank-empty-state">
              <Banknote size={36} />

              <strong>
                Nenhuma transferência
              </strong>

              <p>
                As movimentações entre
                alunos aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="bank-history-list">

              {transfers.map(
                (
                  transfer
                ) => {
                  const received =
                    transfer.direction ===
                    'RECEIVED'

                  return (
                    <article
                      className="bank-history-item"
                      key={
                        transfer.id
                      }
                    >

                      <div
                        className={`bank-history-icon ${
                          received
                            ? 'received'
                            : 'sent'
                        }`}
                      >
                        {received ? (
                          <ArrowDownLeft
                            size={20}
                          />
                        ) : (
                          <ArrowUpRight
                            size={20}
                          />
                        )}
                      </div>

                      <div className="bank-history-main">

                        <div className="bank-history-person">
                          {transfer
                            .otherUser
                            .avatar ? (
                            <img
                              src={
                                transfer
                                  .otherUser
                                  .avatar
                              }
                              alt={
                                transfer
                                  .otherUser
                                  .username
                              }
                            />
                          ) : (
                            <UserRound
                              size={17}
                            />
                          )}

                          <strong>
                            {
                              transfer
                                .otherUser
                                .username
                            }
                          </strong>
                        </div>

                        <span>
                          {transfer.description ??
                            (received
                              ? 'Transferência recebida'
                              : 'Transferência enviada')}
                        </span>

                        <small>
                          {formatDate(
                            transfer.createdAt
                          )}
                        </small>

                      </div>

                      <strong
                        className={
                          received
                            ? 'bank-history-value received'
                            : 'bank-history-value sent'
                        }
                      >
                        {received
                          ? '+'
                          : '-'}

                        {transfer.amount.toLocaleString(
                          'pt-BR'
                        )}{' '}
                        BP
                      </strong>

                    </article>
                  )
                }
              )}

            </div>
          )}

        </section>

      </div>

    </main>
  )
}