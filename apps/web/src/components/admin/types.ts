export type AdminUser = {
  id: number
  discordId: string
  username: string
  avatar: string | null
  bullyPoints: number
  role: string
  active: boolean
  createdAt: string
}

export type Product = {
  id: number
  name: string
  description: string
  imageUrl: string | null
  price: number
  stock: number | null
  active: boolean
  createdAt: string
}

export type DashboardData = {
  users: number
  activeProducts: number
  purchases: number
  bullyPoints: number
}

export type Purchase = {
  id: number
  price: number
  status: string
  createdAt: string

  user: {
    id: number
    username: string
    avatar: string | null
    discordId: string
  }

  product: {
    id: number
    name: string
    imageUrl: string | null
  }
}

export type PointTransaction = {
  id: number
  amount: number
  type: 'CREDIT' | 'DEBIT'
  reason: string
  createdAt: string

  user: {
    id: number
    username: string
    avatar: string | null
  }

  admin: {
    id: number
    username: string
    avatar: string | null
  } | null
}

export type AdminUserDetails = {
  id: number
  discordId: string
  username: string
  avatar: string | null
  bullyPoints: number
  role: string
  active: boolean
  createdAt: string

  purchases: {
    id: number
    price: number
    status: string
    createdAt: string

    product: {
      id: number
      name: string
      imageUrl: string | null
    }
  }[]

  transactions: {
    id: number
    amount: number
    type: 'CREDIT' | 'DEBIT'
    reason: string
    createdAt: string

    admin: {
      id: number
      username: string
      avatar: string | null
    } | null
  }[]
}