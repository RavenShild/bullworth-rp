import { BookOpen, Coins, GraduationCap, Users } from 'lucide-react'
import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero-card paper-card">
          <p className="eyebrow">BULLWORTH ACADEMY • NOVO SEMESTRE</p>
          <h1>Bem-vindo ao<br /><span>Bullworth Academy</span></h1>
          <p className="hero-text">
            Um RP escolar inspirado no caos, nas rivalidades e nas histórias de uma academia onde reputação vale tudo.
          </p>
          <div className="hero-actions">
            <Link to="/loja" className="btn primary">Conhecer a loja</Link>
            <a href="https://discord.gg/hPS6T6z3ah" target="_blank" rel="noopener noreferrer" className="btn secondary">
              Entrar no servidor
            </a>
          </div>
        </div>
        <aside className="notice-board">
          <div className="tape" />
          <p className="handwritten">Aviso aos alunos</p>
          <h2>As aulas voltaram.</h2>
          <p>Escolha seu grupo, construa sua reputação e escreva sua história dentro de Bullworth.</p>
          <span>— Direção</span>
        </aside>
      </section>

      <section className="feature-grid" id="sobre">
        <article className="feature paper-card"><GraduationCap /><h3>Roleplay escolar</h3><p>Personagens, clubes, rivalidades, eventos e histórias criadas pela comunidade.</p></article>
        <article className="feature paper-card"><Users /><h3>Comunidade</h3><p>O acesso à área de membros é validado diretamente pelo servidor do Discord.</p></article>
        <article className="feature paper-card"><Coins /><h3>Bully Points</h3><p>Ganhe pontos participando do RP e troque por itens e benefícios dentro da loja.</p></article>
        <article className="feature paper-card"><BookOpen /><h3>História viva</h3><p>O site será o centro do RP: informações, economia, compras e administração.</p></article>
      </section>
    </main>
  )
}
