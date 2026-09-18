import {
  BookOpen,
  Coins,
  GraduationCap,
  ShoppingBag,
  Trophy,
  Users,
} from 'lucide-react'

import {
  Link,
} from 'react-router-dom'

export function HomePage() {
  return (
    <main className="home-page">

      <section className="home-hero">
        <div className="home-hero-overlay" />

        <div className="home-hero-content">
          <div className="home-hero-copy">

            <p className="home-kicker">
              BULLWORTH ACADEMY
            </p>

            <h1>
              The Golden Years
              <span>
                2000s
              </span>
            </h1>

            <p className="home-hero-description">
              Rivalidades, amizades, reputação
              e caos escolar em uma academia
              onde cada escolha pode definir
              sua história.
            </p>

            <div className="home-hero-actions">
              <a
                href="https://discord.gg/hPS6T6z3ah"
                target="_blank"
                rel="noopener noreferrer"
                className="btn primary home-main-action"
              >
                Entrar em Bullworth
              </a>

              <a
                href="#sobre"
                className="btn home-secondary-action"
              >
                Conhecer o RP
              </a>
            </div>

          </div>

          <div className="home-hero-emblem">
            <div className="home-emblem-ring">
              <img
                src="https://media.discordapp.net/attachments/1519195029640318996/1550602565979218020/ICONERPG.png?ex=6aaeeeac&is=6aad9d2c&hm=b40b48cb33071ee5201c044f5a83689d8e6ace3e5966cedef27761af7651b9a1&=&format=webp&quality=lossless"
                alt="Brasão da Bullworth Academy"
                className="home-emblem-image"
              />
            </div>

            <p>
              Bullworth Academy
            </p>

            <small>
              Excellence • Discipline • Tradition
            </small>
          </div>
        </div>

        <div className="home-hero-bottom">
          <span />

          <strong>
            EST. 2000
          </strong>

          <span />
        </div>
      </section>

      <section
        className="home-about"
        id="sobre"
      >
        <div className="home-section-heading">
          <p className="eyebrow">
            WELCOME TO BULLWORTH
          </p>

          <h2>
            Sua história começa aqui.
          </h2>

          <p>
            Bullworth é uma comunidade de
            roleplay escolar inspirada no
            universo de Bully, construída
            em torno de personagens,
            grupos, conflitos, amizades
            e histórias que evoluem com
            os próprios jogadores.
          </p>
        </div>

        <div className="home-feature-grid">

          <article className="home-feature-card">
            <div className="home-feature-icon">
              <GraduationCap
                size={26}
              />
            </div>

            <span>
              01
            </span>

            <h3>
              Vida escolar
            </h3>

            <p>
              Entre em Bullworth como aluno
              e construa relações, rivalidades
              e uma reputação própria.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">
              <Users
                size={26}
              />
            </div>

            <span>
              02
            </span>

            <h3>
              Comunidade
            </h3>

            <p>
              Toda a experiência é integrada
              ao Discord, mantendo jogadores,
              personagens e eventos conectados.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">
              <Trophy
                size={26}
              />
            </div>

            <span>
              03
            </span>

            <h3>
              Reputação
            </h3>

            <p>
              Suas ações no RP moldam como
              seu personagem é visto dentro
              da comunidade de Bullworth.
            </p>
          </article>

          <article className="home-feature-card">
            <div className="home-feature-icon">
              <Coins
                size={26}
              />
            </div>

            <span>
              04
            </span>

            <h3>
              Bully Points
            </h3>

            <p>
              Participe do RP, conquiste
              Bully Points e utilize sua
              economia dentro do portal.
            </p>
          </article>

        </div>
      </section>

      <section className="home-campus-section">

        <div className="home-campus-copy">
          <p className="eyebrow">
            LIFE AT BULLWORTH
          </p>

          <h2>
            Muito além da sala de aula.
          </h2>

          <p>
            O portal funciona como uma extensão
            da experiência do servidor.
            Acompanhe seu perfil, sua economia,
            suas conquistas e os sistemas
            que fazem parte do RP.
          </p>
        </div>

        <div className="home-campus-grid">

          <Link
            to="/perfil"
            className="home-campus-card"
          >
            <BookOpen
              size={28}
            />

            <div>
              <span>
                STUDENT RECORD
              </span>

              <h3>
                Meu Perfil
              </h3>

              <p>
                Consulte seu saldo,
                histórico e atividades.
              </p>
            </div>

            <strong>
              →
            </strong>
          </Link>

          <Link
            to="/loja"
            className="home-campus-card"
          >
            <ShoppingBag
              size={28}
            />

            <div>
              <span>
                SCHOOL STORE
              </span>

              <h3>
                Bullworth Store
              </h3>

              <p>
                Use seus Bully Points
                em itens e benefícios.
              </p>
            </div>

            <strong>
              →
            </strong>
          </Link>

        </div>
      </section>

      <section className="home-quote-section">
            <div className="home-emblem-ring">
              <img
                src="https://media.discordapp.net/attachments/1519195029640318996/1550602565979218020/ICONERPG.png?ex=6aaeeeac&is=6aad9d2c&hm=b40b48cb33071ee5201c044f5a83689d8e6ace3e5966cedef27761af7651b9a1&=&format=webp&quality=lossless"
                alt="Brasão da Bullworth Academy"
                className="home-emblem-image"
              />
            </div>

        <div>
          <p className="eyebrow">
            BULLWORTH ACADEMY
          </p>

          <blockquote>
            “Toda escola tem suas regras.
            Bullworth tem suas próprias histórias.”
          </blockquote>

          <span>
            The Golden Years — 2000s
          </span>
        </div>
      </section>

      <section className="home-final-cta">
        <div>
          <p className="eyebrow">
            ENROLL NOW
          </p>

          <h2>
            Pronto para entrar em Bullworth?
          </h2>

          <p>
            Crie seu personagem,
            entre na comunidade e faça
            parte das histórias da academia.
          </p>
        </div>

        <a
          href="https://discord.gg/hPS6T6z3ah"
          target="_blank"
          rel="noopener noreferrer"
          className="btn primary"
        >
          Entrar no servidor
        </a>
      </section>

    </main>
  )
}