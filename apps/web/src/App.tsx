import {
  useEffect,
  useState,
} from 'react'

import {
  Route,
  Routes,
} from 'react-router-dom'

import {
  Header,
} from './components/Navbar'

import {
  AdminPage,
} from './pages/AdminPage'

import {
  BankPage,
} from './pages/BankPage'

import {
  HomePage,
} from './pages/HomePage'

import {
  ProfilePage,
} from './pages/ProfilePage'

import {
  ShopPage,
} from './pages/ShopPage'

import {
  JobsPage,
} from './pages/JobsPage'

import {
  SocialPage,
} from './pages/SocialPage'

import {
  getMe,
  type User,
} from './lib'

export function App() {
  const [
    user,
    setUser,
  ] =
    useState<
      User |
      null |
      undefined
    >(undefined)

  useEffect(() => {
    void loadUser()
  }, [])

  async function loadUser() {
    try {
      const currentUser =
        await getMe()

      setUser(
        currentUser
      )
    } catch {
      setUser(null)
    }
  }

  return (
    <>
      <Header
        user={user ?? null}
      />

      <Routes>
        <Route
          path="/"
          element={
            <HomePage />
          }
        />

        <Route
          path="/loja"
          element={
            <ShopPage />
          }
        />

        <Route
          path="/banco"
          element={
            <BankPage />
          }
        />

        <Route
          path="/connections"
          element={
            <SocialPage />
          }
        />

        <Route
          path="/perfil"
          element={
            <ProfilePage />
          }
        />

        <Route
          path="/admin"
          element={
            <AdminPage />
          }
        />

        <Route
          path="/trabalho"
          element={
            <JobsPage />
          }
        />
      </Routes>
    </>
  )
}