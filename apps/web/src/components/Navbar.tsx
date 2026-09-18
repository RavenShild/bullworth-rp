import {
  Link,
  NavLink,
} from 'react-router-dom'

import {
  GraduationCap,
  LogIn,
  Shield,
  ShoppingBag,
  UserRound,
} from 'lucide-react'

import {
  API_URL,
} from '../lib'

type Props = {
  user?: {
    username: string
    role: string
    avatar?: string | null
  } | null
}

export function Header({
  user,
}: Props) {
  return (
    <header className="site-header">
      <div className="site-header-inner">

        <Link
          to="/"
          className="brand"
        >
          <div className="brand-mark">
            <img
              src="https://media.discordapp.net/attachments/1519195029640318996/1550602565979218020/ICONERPG.png?ex=6aaeeeac&is=6aad9d2c&hm=b40b48cb33071ee5201c044f5a83689d8e6ace3e5966cedef27761af7651b9a1&=&format=webp&quality=lossless"
              alt="Bullworth Academy"
              className="brand-mark-image"
            />
          </div>

          <div className="brand-copy">
            <span className="brand-title">
              Bullworth Academy
            </span>

            <span className="brand-subtitle">
              The Golden Years
            </span>
          </div>
        </Link>

        <nav className="site-nav">
          <NavLink to="/">
            <GraduationCap
              size={17}
            />

            Início
          </NavLink>

          <NavLink to="/loja">
            <ShoppingBag
              size={17}
            />

            Loja
          </NavLink>

          {user && (
            <NavLink
              to="/perfil"
              className="nav-profile-link"
            >
              {user.avatar ? (
                <img
                  src={
                    user.avatar
                  }
                  alt={
                    user.username
                  }
                  className="nav-avatar"
                />
              ) : (
                <UserRound
                  size={17}
                />
              )}

              {user.username}
            </NavLink>
          )}

          {user?.role ===
            'ADMIN' && (
            <NavLink
              to="/admin"
            >
              <Shield
                size={17}
              />

              Administração
            </NavLink>
          )}

          {!user && (
            <a
              href={`${API_URL}/api/auth/discord`}
              className="nav-login"
            >
              <LogIn
                size={17}
              />

              Entrar
            </a>
          )}
        </nav>

      </div>
    </header>
  )
}