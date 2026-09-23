import {
  BriefcaseBusiness,
  Clock3,
  Coins,
  Play,
  CheckCircle2,
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

type JobShift = {
  id: number
  userId: number
  reward: number
  startedAt: string
  availableAt: string
  completedAt: string | null
}

type JobStatusResponse = {
  job: {
    name: string
    durationHours: number
    reward: number
  }

  status:
    | 'AVAILABLE'
    | 'IN_PROGRESS'

  canStart: boolean
  canComplete: boolean

  shift:
    | JobShift
    | null

  bullyPoints: number

  nextAvailableAt:
    | string
    | null
}

export function JobsPage() {
  const [
    user,
    setUser,
  ] = useState<
    User |
    null |
    undefined
  >(undefined)

  const [
    data,
    setData,
  ] = useState<
    JobStatusResponse |
    null
  >(null)

  const [
    loading,
    setLoading,
  ] = useState(true)

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState<string | null>(
    null
  )

  const [
    message,
    setMessage,
  ] = useState<string | null>(
    null
  )

  const [
    now,
    setNow,
  ] = useState(
    Date.now()
  )

  useEffect(() => {
    void loadPage()
  }, [])

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setNow(
            Date.now()
          )
        },
        1000
      )

    return () => {
      window.clearInterval(
        interval
      )
    }
  }, [])

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

      await loadJob()
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível carregar o emprego.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadJob() {
    const response =
      await fetch(
        `${API_URL}/api/jobs/me`,
        {
          credentials:
            'include',
        }
      )

    const responseData =
      await response.json()

    if (!response.ok) {
      throw new Error(
        responseData.message ??
          'Erro ao carregar emprego.'
      )
    }

    setData(responseData)
  }

  async function startShift() {
    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)

      const response =
        await fetch(
          `${API_URL}/api/jobs/start`,
          {
            method:
              'POST',

            credentials:
              'include',
          }
        )

      const responseData =
        await response.json()

      if (!response.ok) {
        setError(
          responseData.message ??
            'Não foi possível iniciar o turno.'
        )
        return
      }

      setMessage(
        'Turno iniciado com sucesso.'
      )

      await loadJob()
    } catch (err) {
      console.error(err)

      setError(
        'Erro ao iniciar o turno.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function completeShift() {
    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)

      const response =
        await fetch(
          `${API_URL}/api/jobs/complete`,
          {
            method:
              'POST',

            credentials:
              'include',
          }
        )

      const responseData =
        await response.json()

      if (!response.ok) {
        setError(
          responseData.message ??
            'Não foi possível concluir o turno.'
        )
        return
      }

      setMessage(
        responseData.message ??
          'Turno concluído com sucesso.'
      )

      await loadJob()
    } catch (err) {
      console.error(err)

      setError(
        'Erro ao concluir o turno.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  const remainingMs =
    useMemo(() => {
      if (
        !data?.shift ||
        !data.shift.availableAt
      ) {
        return 0
      }

      return Math.max(
        0,
        new Date(
          data.shift.availableAt
        ).getTime() -
          now
      )
    }, [
      data,
      now,
    ])

  const remainingText =
    useMemo(() => {
      const totalSeconds =
        Math.floor(
          remainingMs /
            1000
        )

      const hours =
        Math.floor(
          totalSeconds /
            3600
        )

      const minutes =
        Math.floor(
          (
            totalSeconds %
            3600
          ) /
            60
        )

      const seconds =
        totalSeconds %
        60

      return `${String(
        hours
      ).padStart(
        2,
        '0'
      )}:${String(
        minutes
      ).padStart(
        2,
        '0'
      )}:${String(
        seconds
      ).padStart(
        2,
        '0'
      )}`
    }, [
      remainingMs,
    ])

  function formatDate(
    value:
      | string
      | null
  ) {
    if (!value) {
      return '—'
    }

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
        <section className="paper-card jobs-loading-card">
          <BriefcaseBusiness
            size={36}
          />

          <h1>
            Trabalho
          </h1>

          <p>
            Carregando informações do turno...
          </p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page centered">
        <section className="paper-card locked-card">
          <BriefcaseBusiness
            size={38}
          />

          <p className="eyebrow">
            BULLWORTH ACADEMY
          </p>

          <h1>
            Área restrita
          </h1>

          <p>
            Entre com sua conta para acessar
            o emprego de meio turno.
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
    <main className="page jobs-page">

      <header className="jobs-page-heading">
        <div>
          <p className="eyebrow">
            STUDENT WORK PROGRAM
          </p>

          <h1>
            Trabalho
          </h1>

          <p>
            Faça um turno de meio período
            sem atrapalhar seus estudos.
          </p>
        </div>
      </header>

      {error && (
        <div className="jobs-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="jobs-message success">
          {message}
        </div>
      )}

      <section className="jobs-main-card">

        <div className="jobs-main-icon">
          <BriefcaseBusiness
            size={34}
          />
        </div>

        <div className="jobs-main-info">

          <p className="eyebrow">
            PART-TIME JOB
          </p>

          <h2>
            {data?.job.name ??
              'Emprego de Meio Turno'}
          </h2>

          <p>
            Um turno remunerado para alunos
            da Bullworth Academy.
          </p>

          <div className="jobs-meta">

            <div>
              <Clock3
                size={18}
              />

              <span>
                Duração
              </span>

              <strong>
                {data?.job.durationHours ??
                  4}{' '}
                horas
              </strong>
            </div>

            <div>
              <Coins
                size={18}
              />

              <span>
                Pagamento
              </span>

              <strong>
                {data?.job.reward ??
                  50}{' '}
                BP
              </strong>
            </div>

            <div>
              <Coins
                size={18}
              />

              <span>
                Seu saldo
              </span>

              <strong>
                {(
                  data?.bullyPoints ??
                  0
                ).toLocaleString(
                  'pt-BR'
                )}{' '}
                BP
              </strong>
            </div>

          </div>

        </div>

      </section>

      {data?.status ===
      'IN_PROGRESS' ? (
        <section className="jobs-shift-card">

          <div className="jobs-shift-heading">

            <div>
              <p className="eyebrow">
                TURNO EM ANDAMENTO
              </p>

              <h2>
                Você está trabalhando
              </h2>
            </div>

            <span className="jobs-status-badge active">
              Em andamento
            </span>

          </div>

          <div className="jobs-shift-grid">

            <div>
              <span>
                Início
              </span>

              <strong>
                {formatDate(
                  data.shift
                    ?.startedAt ??
                    null
                )}
              </strong>
            </div>

            <div>
              <span>
                Pode concluir em
              </span>

              <strong>
                {remainingMs >
                0
                  ? remainingText
                  : 'Disponível'}
              </strong>
            </div>

            <div>
              <span>
                Horário de conclusão
              </span>

              <strong>
                {formatDate(
                  data.shift
                    ?.availableAt ??
                    null
                )}
              </strong>
            </div>

          </div>

          <button
            type="button"
            className="btn primary jobs-action-button"
            disabled={
              actionLoading ||
              remainingMs >
                0
            }
            onClick={
              completeShift
            }
          >
            <CheckCircle2
              size={18}
            />

            {actionLoading
              ? 'Processando...'
              : remainingMs >
                  0
                ? `Aguarde ${remainingText}`
                : `Concluir turno e receber ${data.job.reward} BP`}
          </button>

        </section>
      ) : (
        <section className="jobs-shift-card">

          <div className="jobs-shift-heading">

            <div>
              <p className="eyebrow">
                DISPONIBILIDADE
              </p>

              <h2>
                Novo turno
              </h2>
            </div>

            <span
              className={`jobs-status-badge ${
                data?.canStart
                  ? 'available'
                  : 'locked'
              }`}
            >
              {data?.canStart
                ? 'Disponível'
                : 'Indisponível'}
            </span>

          </div>

          {data?.canStart ? (
            <>
              <p className="jobs-description">
                Você pode iniciar seu turno
                de meio período agora.
                Após quatro horas, poderá
                concluí-lo e receber
                os Bully Points.
              </p>

              <button
                type="button"
                className="btn primary jobs-action-button"
                disabled={
                  actionLoading
                }
                onClick={
                  startShift
                }
              >
                <Play
                  size={18}
                />

                {actionLoading
                  ? 'Iniciando...'
                  : 'Iniciar turno'}
              </button>
            </>
          ) : (
            <>
              <p className="jobs-description">
                Você já realizou seu turno
                recente. Um novo turno ficará
                disponível após o período
                de descanso.
              </p>

              <div className="jobs-next-shift">
                <Clock3
                  size={19}
                />

                <div>
                  <span>
                    Próximo turno
                  </span>

                  <strong>
                    {formatDate(
                      data?.nextAvailableAt ??
                        null
                    )}
                  </strong>
                </div>
              </div>
            </>
          )}

        </section>
      )}

    </main>
  )
}