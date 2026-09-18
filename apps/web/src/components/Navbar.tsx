import { Coins, Shield, Store, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { API_URL } from '../lib'

export function Navbar() {
  return (
    <header className="navbar-wrap">
      <nav className="navbar">
        <Link to="/" className="brand">
          <span className="brand-mark">B</span>
          <span><b>Bullworth Academy:</b><small>The Golden Years — 2000s</small></span>
        </Link>
        <div className="nav-links">
          <NavLink to="/">Início</NavLink>
          <NavLink to="/loja"><Store size={17} /> Loja</NavLink>
          <NavLink to="/perfil"><UserRound size={17} /> Perfil</NavLink>
          <NavLink to="/admin"><Shield size={17} /> Admin</NavLink>
        </div>
        <a className="discord-login" href={`${API_URL}/api/auth/discord`}>
          <Coins size={17} /> Entrar com Discord
        </a>
      </nav>
    </header>
  )
}
