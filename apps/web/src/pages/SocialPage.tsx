import {
  Heart,
  UserRound,
  X,
  Users,
  Pencil,
  Save,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import {
  API_URL,
  getMe,
  type User,
} from '../lib'

type SocialProfile = {
  id?: number
  userId?: number
  bio: string | null
  interests: string | null
  active: boolean
}

type SocialUser = {
  id: number
  username: string
  avatar: string | null
  socialProfile: {
    bio: string | null
    interests: string | null
  } | null
}

type Match = {
  id: number
  createdAt: string
  user: {
    id: number
    username: string
    avatar: string | null
    socialProfile: {
      bio: string | null
      interests: string | null
      active: boolean
    } | null
  }
}

type Tab =
  | 'discover'
  | 'matches'
  | 'profile'

export function SocialPage() {
  const [
    user,
    setUser,
  ] = useState<
    User |
    null |
    undefined
  >(undefined)

  const [
    tab,
    setTab,
  ] = useState<Tab>(
    'discover'
  )

  const [
    profile,
    setProfile,
  ] = useState<
    SocialProfile |
    null
  >(null)

  const [
    bio,
    setBio,
  ] = useState('')

  const [
    interests,
    setInterests,
  ] = useState('')

  const [
    profileActive,
    setProfileActive,
  ] = useState(true)

  const [
    discover,
    setDiscover,
  ] = useState<
    SocialUser[]
  >([])

  const [
    currentIndex,
    setCurrentIndex,
  ] = useState(0)

  const [
    matches,
    setMatches,
  ] = useState<
    Match[]
  >([])

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
  ] = useState<
    string |
    null
  >(null)

  const [
    message,
    setMessage,
  ] = useState<
    string |
    null
  >(null)

  const [
    matchMessage,
    setMatchMessage,
  ] = useState<
    string |
    null
  >(null)

  useEffect(() => {
    void loadPage()
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

      await Promise.all([
        loadProfile(),
        loadDiscover(),
        loadMatches(),
      ])
    } catch (err) {
      console.error(err)

      setError(
        'Não foi possível carregar o módulo social.'
      )
    } finally {
      setLoading(false)
    }
  }

  async function loadProfile() {
    const response =
      await fetch(
        `${API_URL}/api/social/me`,
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
          'Erro ao carregar perfil.'
      )
    }

    const currentProfile =
      data.profile

    setProfile(
      currentProfile
    )

    setBio(
      currentProfile?.bio ??
        ''
    )

    setInterests(
      currentProfile
        ?.interests ??
        ''
    )

    setProfileActive(
      currentProfile
        ?.active ??
        true
    )
  }

  async function loadDiscover() {
    const response =
      await fetch(
        `${API_URL}/api/social/discover`,
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
          'Erro ao carregar perfis.'
      )
    }

    setDiscover(data)
    setCurrentIndex(0)
  }

  async function loadMatches() {
    const response =
      await fetch(
        `${API_URL}/api/social/matches`,
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
          'Erro ao carregar matches.'
      )
    }

    setMatches(data)
  }

  async function saveProfile() {
    try {
      setActionLoading(true)
      setError(null)
      setMessage(null)

      const response =
        await fetch(
          `${API_URL}/api/social/me`,
          {
            method:
              'PUT',

            credentials:
              'include',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                bio:
                  bio.trim(),

                interests:
                  interests.trim(),

                active:
                  profileActive,
              }),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.message ??
            'Não foi possível salvar o perfil.'
        )
        return
      }

      setProfile(
        data.profile
      )

      setMessage(
        'Perfil social atualizado.'
      )

      await loadDiscover()
    } catch (err) {
      console.error(err)

      setError(
        'Erro ao salvar perfil.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function likeUser(
    target:
      SocialUser
  ) {
    try {
      setActionLoading(true)
      setError(null)
      setMatchMessage(null)

      const response =
        await fetch(
          `${API_URL}/api/social/${target.id}/like`,
          {
            method:
              'POST',

            credentials:
              'include',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        setError(
          data.message ??
            'Não foi possível curtir este perfil.'
        )
        return
      }

      if (
        data.matched
      ) {
        setMatchMessage(
          `Você e ${target.username} deram match!`
        )

        await loadMatches()
      }

      nextProfile()
    } catch (err) {
      console.error(err)

      setError(
        'Erro ao registrar curtida.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  async function passUser(
    target:
      SocialUser
  ) {
    try {
      setActionLoading(true)
      setError(null)

      await fetch(
        `${API_URL}/api/social/${target.id}/pass`,
        {
          method:
            'POST',

          credentials:
            'include',
        }
      )

      nextProfile()
    } catch (err) {
      console.error(err)

      setError(
        'Erro ao passar perfil.'
      )
    } finally {
      setActionLoading(false)
    }
  }

  function nextProfile() {
    setCurrentIndex(
      (current) =>
        current + 1
    )
  }

  const currentProfile =
    discover[
      currentIndex
    ] ?? null

  if (loading) {
    return (
      <main className="page centered">
        <section className="paper-card social-loading-card">
          <Heart
            size={36}
          />

          <h1>
            Connections
          </h1>

          <p>
            Carregando perfis...
          </p>
        </section>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="page centered">
        <section className="paper-card locked-card">
          <Heart
            size={38}
          />

          <p className="eyebrow">
            BULLWORTH CONNECTIONS
          </p>

          <h1>
            Área restrita
          </h1>

          <p>
            Entre com sua conta para acessar
            o módulo social.
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
    <main className="page social-page">

      <header className="social-page-heading">
        <div>
          <p className="eyebrow">
            BULLWORTH CONNECTIONS
          </p>

          <h1>
            Connections
          </h1>

          <p>
            Conheça outros alunos e descubra
            novas conexões dentro da Bullworth.
          </p>
        </div>
      </header>

      {error && (
        <div className="social-message error">
          {error}
        </div>
      )}

      {message && (
        <div className="social-message success">
          {message}
        </div>
      )}

      {matchMessage && (
        <div className="social-match-banner">
          <Heart size={22} />

          <div>
            <strong>
              MATCH!
            </strong>

            <span>
              {matchMessage}
            </span>
          </div>
        </div>
      )}

      <nav className="social-tabs">
        <button
          className={
            tab ===
            'discover'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'discover'
            )
          }
        >
          <Heart
            size={17}
          />

          Descobrir
        </button>

        <button
          className={
            tab ===
            'matches'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'matches'
            )
          }
        >
          <Users
            size={17}
          />

          Matches

          {matches.length >
            0 && (
            <span className="social-tab-count">
              {
                matches.length
              }
            </span>
          )}
        </button>

        <button
          className={
            tab ===
            'profile'
              ? 'active'
              : ''
          }
          onClick={() =>
            setTab(
              'profile'
            )
          }
        >
          <Pencil
            size={17}
          />

          Meu perfil
        </button>
      </nav>

      {tab ===
        'discover' && (
        <section className="social-discover-section">

          {!profile ? (
            <div className="paper-card social-empty-card">
              <UserRound
                size={38}
              />

              <h2>
                Crie seu perfil primeiro
              </h2>

              <p>
                Para aparecer para outros alunos
                e descobrir perfis, configure
                seu perfil social.
              </p>

              <button
                className="btn primary"
                onClick={() =>
                  setTab(
                    'profile'
                  )
                }
              >
                Criar meu perfil
              </button>
            </div>
          ) : !profile.active ? (
            <div className="paper-card social-empty-card">
              <ToggleLeft
                size={38}
              />

              <h2>
                Perfil desativado
              </h2>

              <p>
                Ative seu perfil para voltar
                a participar do Connections.
              </p>

              <button
                className="btn primary"
                onClick={() =>
                  setTab(
                    'profile'
                  )
                }
              >
                Configurar perfil
              </button>
            </div>
          ) : currentProfile ? (
            <article className="social-profile-card">

              <div className="social-profile-photo">

                {currentProfile
                  .avatar ? (
                  <img
                    src={
                      currentProfile
                        .avatar
                    }
                    alt={
                      currentProfile
                        .username
                    }
                  />
                ) : (
                  <div className="social-profile-placeholder">
                    <UserRound
                      size={72}
                    />
                  </div>
                )}

                <div className="social-profile-overlay">
                  <h2>
                    {
                      currentProfile
                        .username
                    }
                  </h2>

                  <span>
                    Bullworth Student
                  </span>
                </div>

              </div>

              <div className="social-profile-content">

                <section>
                  <span className="social-label">
                    SOBRE
                  </span>

                  <p>
                    {currentProfile
                      .socialProfile
                      ?.bio ||
                      'Este aluno ainda não escreveu uma bio.'}
                  </p>
                </section>

                <section>
                  <span className="social-label">
                    INTERESSES
                  </span>

                  <p>
                    {currentProfile
                      .socialProfile
                      ?.interests ||
                      'Nenhum interesse informado.'}
                  </p>
                </section>

                <div className="social-actions">

                  <button
                    className="social-action pass"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      void passUser(
                        currentProfile
                      )
                    }
                    title="Passar"
                  >
                    <X
                      size={31}
                    />
                  </button>

                  <button
                    className="social-action like"
                    disabled={
                      actionLoading
                    }
                    onClick={() =>
                      void likeUser(
                        currentProfile
                      )
                    }
                    title="Curtir"
                  >
                    <Heart
                      size={30}
                    />
                  </button>

                </div>

              </div>

            </article>
          ) : (
            <div className="paper-card social-empty-card">
              <Heart
                size={38}
              />

              <h2>
                Você viu todo mundo
              </h2>

              <p>
                Não há novos perfis disponíveis
                neste momento.
              </p>

              <button
                className="btn"
                onClick={() =>
                  void loadDiscover()
                }
              >
                Atualizar
              </button>
            </div>
          )}

        </section>
      )}

      {tab ===
        'matches' && (
        <section className="social-matches-section">

          {matches.length ===
          0 ? (
            <div className="paper-card social-empty-card">
              <Heart
                size={38}
              />

              <h2>
                Nenhum match ainda
              </h2>

              <p>
                Quando duas pessoas se curtirem,
                o match aparecerá aqui.
              </p>
            </div>
          ) : (
            <div className="social-matches-grid">

              {matches.map(
                (
                  match
                ) => (
                  <article
                    className="social-match-card paper-card"
                    key={
                      match.id
                    }
                  >

                    {match.user
                      .avatar ? (
                      <img
                        src={
                          match.user
                            .avatar
                        }
                        alt={
                          match.user
                            .username
                        }
                      />
                    ) : (
                      <div className="social-match-placeholder">
                        <UserRound
                          size={38}
                        />
                      </div>
                    )}

                    <div>
                      <span className="social-label">
                        MATCH
                      </span>

                      <h3>
                        {
                          match.user
                            .username
                        }
                      </h3>

                      <p>
                        {match.user
                          .socialProfile
                          ?.bio ||
                          'Sem bio.'}
                      </p>
                    </div>

                  </article>
                )
              )}

            </div>
          )}

        </section>
      )}

      {tab ===
        'profile' && (
        <section className="paper-card social-profile-editor">

          <div className="social-editor-heading">
            <div>
              <p className="eyebrow">
                SOCIAL PROFILE
              </p>

              <h2>
                Meu perfil
              </h2>
            </div>

            {profileActive ? (
              <ToggleRight
                size={28}
              />
            ) : (
              <ToggleLeft
                size={28}
              />
            )}
          </div>

          <div className="social-editor-user">

            {user.avatar ? (
              <img
                src={
                  user.avatar
                }
                alt={
                  user.username
                }
              />
            ) : (
              <div className="social-editor-avatar">
                <UserRound
                  size={28}
                />
              </div>
            )}

            <strong>
              {
                user.username
              }
            </strong>

          </div>

          <label>
            Bio

            <textarea
              value={bio}
              maxLength={300}
              rows={5}
              onChange={(
                event
              ) =>
                setBio(
                  event
                    .target
                    .value
                )
              }
              placeholder="Conte um pouco sobre seu personagem..."
            />

            <small>
              {bio.length}/300
            </small>
          </label>

          <label>
            Interesses

            <textarea
              value={
                interests
              }
              maxLength={300}
              rows={4}
              onChange={(
                event
              ) =>
                setInterests(
                  event
                    .target
                    .value
                )
              }
              placeholder="Ex.: esportes, música, festas, fotografia..."
            />

            <small>
              {interests.length}/300
            </small>
          </label>

          <button
            type="button"
            className={`social-profile-toggle ${
              profileActive
                ? 'active'
                : ''
            }`}
            onClick={() =>
              setProfileActive(
                (
                  current
                ) =>
                  !current
              )
            }
          >
            {profileActive ? (
              <ToggleRight
                size={25}
              />
            ) : (
              <ToggleLeft
                size={25}
              />
            )}

            <div>
              <strong>
                Perfil social
              </strong>

              <span>
                {profileActive
                  ? 'Seu perfil está visível para outros alunos.'
                  : 'Seu perfil está oculto.'}
              </span>
            </div>
          </button>

          <button
            className="btn primary social-save-button"
            disabled={
              actionLoading
            }
            onClick={() =>
              void saveProfile()
            }
          >
            <Save
              size={17}
            />

            {actionLoading
              ? 'Salvando...'
              : 'Salvar perfil'}
          </button>

        </section>
      )}

    </main>
  )
}