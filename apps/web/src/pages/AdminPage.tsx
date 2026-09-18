import {
  Coins,
  History,
  LayoutDashboard,
  Package,
  Pencil,
  Plus,
  ReceiptText,
  ShieldAlert,
  Users,
  X,
} from 'lucide-react'

import {
  useEffect,
  useMemo,
  useState,
} from 'react'

import {
  getMe,
  type User,
} from '../lib'

import {
  AdminPurchases,
} from '../components/admin/AdminPurchases'

import {
  AdminTransactions,
} from '../components/admin/AdminTransactions'

import {
  AdminUsers,
} from '../components/admin/AdminUsers'

import {
  ConfirmModal,
} from '../components/ConfirmModal'

import {
  ToastContainer,
} from '../components/ToastContainer'

import {
  useToast,
} from '../hooks/useToast'

import type {
  DashboardData,
  PointTransaction,
  Purchase,
} from '../components/admin/types'

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

type Product = {
  id: number
  name: string
  description: string
  imageUrl: string | null
  price: number
  stock: number | null
  active: boolean
  createdAt: string
}

type ProductForm = {
  name: string
  description: string
  price: string
  stock: string
  imageUrl: string
}

type AdminTab =
  | 'dashboard'
  | 'users'
  | 'products'
  | 'purchases'
  | 'transactions'

const API_URL =
  import.meta.env.VITE_API_URL ??
  'http://localhost:3001'

const EMPTY_PRODUCT_FORM: ProductForm = {
  name: '',
  description: '',
  price: '',
  stock: '',
  imageUrl: '',
}

export function AdminPage() {
  const [user, setUser] =
    useState<
      User |
      null |
      undefined
    >(undefined)

  const [users, setUsers] =
    useState<AdminUser[]>([])

  const [
    loadingUsers,
    setLoadingUsers,
  ] = useState(true)

  const [
    products,
    setProducts,
  ] = useState<Product[]>([])

  const [
    loadingProducts,
    setLoadingProducts,
  ] = useState(true)

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null
    )

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<AdminTab>(
      'dashboard'
    )

  const [
    dashboard,
    setDashboard,
  ] =
    useState<
      DashboardData | null
    >(null)

  const [
    purchases,
    setPurchases,
  ] =
    useState<Purchase[]>([])

  const [
    transactions,
    setTransactions,
  ] =
    useState<
      PointTransaction[]
    >([])

  const [
    loadingAudit,
    setLoadingAudit,
  ] = useState(true)

  const [
    productModalOpen,
    setProductModalOpen,
  ] = useState(false)

  const [
    editingProduct,
    setEditingProduct,
  ] =
    useState<Product | null>(
      null
    )

  const [
    productForm,
    setProductForm,
  ] =
    useState<ProductForm>(
      EMPTY_PRODUCT_FORM
    )

  const [
    savingProduct,
    setSavingProduct,
  ] = useState(false)

  const [
    productToToggle,
    setProductToToggle,
  ] =
    useState<Product | null>(
      null
    )

  const [
    togglingProduct,
    setTogglingProduct,
  ] = useState(false)

  const {
    toasts,
    showToast,
    removeToast,
  } = useToast()

  useEffect(() => {
    getMe()
      .then(setUser)
      .catch(() =>
        setUser(null)
      )
  }, [])

  useEffect(() => {
    if (
      user?.role ===
      'ADMIN'
    ) {
      void loadUsers()
      void loadProducts()
      void loadAdminAudit()
    }
  }, [user])

  async function loadUsers() {
    try {
      setLoadingUsers(true)
      setError(null)

      const response =
        await fetch(
          `${API_URL}/api/admin/users`,
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
            'Erro ao carregar usuários'
        )
      }

      setUsers(data)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Não foi possível carregar os usuários'
      )
    } finally {
      setLoadingUsers(false)
    }
  }

  async function loadProducts() {
    try {
      setLoadingProducts(true)

      const response =
        await fetch(
          `${API_URL}/api/admin/products`,
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
            'Erro ao carregar produtos'
        )
      }

      setProducts(data)
    } catch (err) {
      console.error(err)

      showToast(
        'Não foi possível carregar os produtos.',
        'error'
      )
    } finally {
      setLoadingProducts(false)
    }
  }

  async function loadAdminAudit() {
    try {
      setLoadingAudit(true)

      const [
        dashboardResponse,
        purchasesResponse,
        transactionsResponse,
      ] =
        await Promise.all([
          fetch(
            `${API_URL}/api/admin/dashboard`,
            {
              credentials:
                'include',
            }
          ),

          fetch(
            `${API_URL}/api/admin/purchases`,
            {
              credentials:
                'include',
            }
          ),

          fetch(
            `${API_URL}/api/admin/transactions`,
            {
              credentials:
                'include',
            }
          ),
        ])

      if (
        !dashboardResponse.ok ||
        !purchasesResponse.ok ||
        !transactionsResponse.ok
      ) {
        throw new Error(
          'Não foi possível carregar os dados administrativos'
        )
      }

      const [
        dashboardData,
        purchasesData,
        transactionsData,
      ] =
        await Promise.all([
          dashboardResponse.json(),
          purchasesResponse.json(),
          transactionsResponse.json(),
        ])

      setDashboard(
        dashboardData
      )

      setPurchases(
        purchasesData
      )

      setTransactions(
        transactionsData
      )
    } catch (err) {
      console.error(err)

      showToast(
        'Não foi possível carregar todos os dados administrativos.',
        'error'
      )
    } finally {
      setLoadingAudit(false)
    }
  }

  function openCreateProduct() {
    setEditingProduct(null)

    setProductForm(
      EMPTY_PRODUCT_FORM
    )

    setProductModalOpen(true)
  }

  function openEditProduct(
    product: Product
  ) {
    setEditingProduct(product)

    setProductForm({
      name:
        product.name,

      description:
        product.description,

      price:
        String(
          product.price
        ),

      stock:
        product.stock ===
        null
          ? ''
          : String(
              product.stock
            ),

      imageUrl:
        product.imageUrl ??
        '',
    })

    setProductModalOpen(true)
  }

  function closeProductModal() {
    if (savingProduct) {
      return
    }

    setProductModalOpen(false)
    setEditingProduct(null)

    setProductForm(
      EMPTY_PRODUCT_FORM
    )
  }

  async function saveProduct() {
    const name =
      productForm.name.trim()

    const description =
      productForm.description.trim()

    const price =
      Number(
        productForm.price
      )

    const stock =
      productForm.stock.trim() ===
      ''
        ? null
        : Number(
            productForm.stock
          )

    if (!name) {
      showToast(
        'Informe o nome do produto.',
        'error'
      )

      return
    }

    if (!description) {
      showToast(
        'Informe a descrição do produto.',
        'error'
      )

      return
    }

    if (
      !Number.isInteger(
        price
      ) ||
      price <= 0
    ) {
      showToast(
        'Informe um preço válido.',
        'error'
      )

      return
    }

    if (
      stock !== null &&
      (
        !Number.isInteger(
          stock
        ) ||
        stock < 0
      )
    ) {
      showToast(
        'Informe um estoque válido.',
        'error'
      )

      return
    }

    const isEditing =
      editingProduct !==
      null

    try {
      setSavingProduct(true)

      const url =
        isEditing
          ? `${API_URL}/api/admin/products/${editingProduct.id}`
          : `${API_URL}/api/admin/products`

      const response =
        await fetch(
          url,
          {
            method:
              isEditing
                ? 'PUT'
                : 'POST',

            credentials:
              'include',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify(
                {
                  name,
                  description,
                  price,
                  stock,

                  imageUrl:
                    productForm.imageUrl.trim() ||
                    null,
                }
              ),
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message ??
            `Erro ao ${
              isEditing
                ? 'editar'
                : 'criar'
            } produto.`,
          'error'
        )

        return
      }

      showToast(
        isEditing
          ? `${name} foi atualizado com sucesso.`
          : `${name} foi cadastrado com sucesso.`,
        'success'
      )

      setProductModalOpen(false)
      setEditingProduct(null)

      setProductForm(
        EMPTY_PRODUCT_FORM
      )

      await Promise.all([
        loadProducts(),
        loadAdminAudit(),
      ])
    } catch (err) {
      console.error(err)

      showToast(
        'Não foi possível salvar o produto.',
        'error'
      )
    } finally {
      setSavingProduct(false)
    }
  }

  async function confirmToggleProduct() {
    if (!productToToggle) {
      return
    }

    const target =
      productToToggle

    try {
      setTogglingProduct(true)

      const response =
        await fetch(
          `${API_URL}/api/admin/products/${target.id}/toggle`,
          {
            method:
              'PATCH',

            credentials:
              'include',
          }
        )

      const data =
        await response.json()

      if (!response.ok) {
        showToast(
          data.message ??
            'Não foi possível alterar o produto.',
          'error'
        )

        return
      }

      showToast(
        target.active
          ? `${target.name} foi removido da loja.`
          : `${target.name} foi disponibilizado na loja.`,
        'success'
      )

      setProductToToggle(null)

      await Promise.all([
        loadProducts(),
        loadAdminAudit(),
      ])
    } catch (err) {
      console.error(err)

      showToast(
        'Erro ao alterar o produto.',
        'error'
      )
    } finally {
      setTogglingProduct(false)
    }
  }

  const totalPoints =
    useMemo(
      () =>
        users.reduce(
          (
            total,
            item
          ) =>
            total +
            item.bullyPoints,
          0
        ),
      [users]
    )

  const activeProducts =
    useMemo(
      () =>
        products.filter(
          (product) =>
            product.active
        ).length,
      [products]
    )

  if (
    user === undefined
  ) {
    return (
      <main className="page">
        <p>
          Carregando...
        </p>
      </main>
    )
  }

  if (
    !user ||
    user.role !== 'ADMIN'
  ) {
    return (
      <main className="page centered">
        <div className="paper-card locked-card">
          <ShieldAlert
            size={42}
          />

          <h1>
            Acesso administrativo
          </h1>

          <p>
            Esta área é restrita
            aos administradores
            do RP.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            ADMINISTRAÇÃO
          </p>

          <h1>
            Painel da Diretoria
          </h1>
        </div>
      </div>

      <nav className="admin-tabs">
        <button
          type="button"
          className={
            activeTab ===
            'dashboard'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'dashboard'
            )
          }
        >
          <LayoutDashboard
            size={17}
          />

          Visão geral
        </button>

        <button
          type="button"
          className={
            activeTab ===
            'users'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'users'
            )
          }
        >
          <Users
            size={17}
          />

          Jogadores
        </button>

        <button
          type="button"
          className={
            activeTab ===
            'products'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'products'
            )
          }
        >
          <Package
            size={17}
          />

          Produtos
        </button>

        <button
          type="button"
          className={
            activeTab ===
            'purchases'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'purchases'
            )
          }
        >
          <ReceiptText
            size={17}
          />

          Compras
        </button>

        <button
          type="button"
          className={
            activeTab ===
            'transactions'
              ? 'active'
              : ''
          }
          onClick={() =>
            setActiveTab(
              'transactions'
            )
          }
        >
          <History
            size={17}
          />

          Movimentações
        </button>
      </nav>

      {activeTab ===
        'dashboard' && (
        <>
          <div className="admin-grid">
            <div className="stat paper-card">
              <Users
                size={22}
              />

              <span>
                Usuários
              </span>

              <strong>
                {dashboard?.users ??
                  users.length}
              </strong>

              <small>
                membros cadastrados
              </small>
            </div>

            <div className="stat paper-card">
              <Coins
                size={22}
              />

              <span>
                BP em circulação
              </span>

              <strong>
                {(
                  dashboard
                    ?.bullyPoints ??
                  totalPoints
                ).toLocaleString(
                  'pt-BR'
                )}
              </strong>

              <small>
                Bully Points
              </small>
            </div>

            <div className="stat paper-card">
              <Package
                size={22}
              />

              <span>
                Produtos ativos
              </span>

              <strong>
                {dashboard
                  ?.activeProducts ??
                  activeProducts}
              </strong>

              <small>
                na loja
              </small>
            </div>

            <div className="stat paper-card">
              <ReceiptText
                size={22}
              />

              <span>
                Compras
              </span>

              <strong>
                {dashboard
                  ?.purchases ??
                  0}
              </strong>

              <small>
                realizadas
              </small>
            </div>
          </div>

          <div className="admin-dashboard-columns">
            <section className="paper-card dashboard-panel">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">
                    RECENTES
                  </p>

                  <h2>
                    Últimas compras
                  </h2>
                </div>
              </div>

              {loadingAudit ? (
                <p>
                  Carregando...
                </p>
              ) : purchases.length ===
                0 ? (
                <p>
                  Nenhuma compra
                  registrada.
                </p>
              ) : (
                purchases
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      purchase
                    ) => (
                      <div
                        className="dashboard-activity"
                        key={
                          purchase.id
                        }
                      >
                        <div>
                          <strong>
                            {
                              purchase
                                .user
                                .username
                            }
                          </strong>

                          <span>
                            {
                              purchase
                                .product
                                .name
                            }
                          </span>
                        </div>

                        <strong>
                          {purchase.price.toLocaleString(
                            'pt-BR'
                          )}{' '}
                          BP
                        </strong>
                      </div>
                    )
                  )
              )}
            </section>

            <section className="paper-card dashboard-panel">
              <div className="admin-section-heading">
                <div>
                  <p className="eyebrow">
                    EXTRATO
                  </p>

                  <h2>
                    Últimas
                    movimentações
                  </h2>
                </div>
              </div>

              {loadingAudit ? (
                <p>
                  Carregando...
                </p>
              ) : transactions.length ===
                0 ? (
                <p>
                  Nenhuma
                  movimentação
                  registrada.
                </p>
              ) : (
                transactions
                  .slice(
                    0,
                    5
                  )
                  .map(
                    (
                      transaction
                    ) => (
                      <div
                        className="dashboard-activity"
                        key={
                          transaction.id
                        }
                      >
                        <div>
                          <strong>
                            {
                              transaction
                                .user
                                .username
                            }
                          </strong>

                          <span>
                            {
                              transaction.reason
                            }
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
                  )
              )}
            </section>
          </div>
        </>
      )}

      {activeTab ===
        'users' && (
        <AdminUsers
          users={users}
          loading={
            loadingUsers
          }
          error={error}
          apiUrl={API_URL}
          reloadUsers={
            loadUsers
          }
          reloadAudit={
            loadAdminAudit
          }
        />
      )}

      {activeTab ===
        'products' && (
        <section className="paper-card admin-products-section">
          <div className="admin-products-header">
            <div>
              <p className="eyebrow">
                LOJA
              </p>

              <h2>
                Gerenciar produtos
              </h2>
            </div>

            <button
              type="button"
              className="btn primary"
              onClick={
                openCreateProduct
              }
            >
              <Plus
                size={17}
              />

              Novo produto
            </button>
          </div>

          {loadingProducts ? (
            <p>
              Carregando
              produtos...
            </p>
          ) : products.length ===
            0 ? (
            <p>
              Nenhum produto
              cadastrado.
            </p>
          ) : (
            <div className="admin-product-list">
              {products.map(
                (product) => (
                  <div
                    className="admin-product-row"
                    key={
                      product.id
                    }
                  >
                    <div className="admin-product-image">
                      {product.imageUrl ? (
                        <img
                          src={
                            product.imageUrl
                          }
                          alt={
                            product.name
                          }
                        />
                      ) : (
                        <span>
                          Sem imagem
                        </span>
                      )}
                    </div>

                    <div className="admin-product-info">
                      <strong>
                        {
                          product.name
                        }
                      </strong>

                      <p>
                        {
                          product.description
                        }
                      </p>

                      <small>
                        {product.stock ===
                        null
                          ? 'Estoque ilimitado'
                          : `Estoque: ${product.stock}`}
                      </small>
                    </div>

                    <div className="admin-product-price">
                      <strong>
                        {product.price.toLocaleString(
                          'pt-BR'
                        )}{' '}
                        BP
                      </strong>

                      <span>
                        {product.active
                          ? 'Ativo'
                          : 'Inativo'}
                      </span>
                    </div>

                    <div className="admin-product-actions">
                      <button
                        type="button"
                        className="admin-action edit"
                        onClick={() =>
                          openEditProduct(
                            product
                          )
                        }
                      >
                        <Pencil
                          size={16}
                        />

                        Editar
                      </button>

                      <button
                        type="button"
                        className={`admin-action ${
                          product.active
                            ? 'remove'
                            : 'add'
                        }`}
                        onClick={() =>
                          setProductToToggle(
                            product
                          )
                        }
                      >
                        {product.active
                          ? 'Desativar'
                          : 'Ativar'}
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </section>
      )}

      {activeTab ===
        'purchases' && (
        <AdminPurchases
          purchases={
            purchases
          }
          loading={
            loadingAudit
          }
        />
      )}

      {activeTab ===
        'transactions' && (
        <AdminTransactions
          transactions={
            transactions
          }
          loading={
            loadingAudit
          }
        />
      )}

      {productModalOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closeProductModal
          }
        >
          <div
            className="product-modal paper-card"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="product-modal-header">
              <div>
                <p className="eyebrow">
                  {editingProduct
                    ? 'EDITAR'
                    : 'NOVO ITEM'}
                </p>

                <h2>
                  {editingProduct
                    ? 'Editar produto'
                    : 'Cadastrar produto'}
                </h2>
              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeProductModal
                }
                disabled={
                  savingProduct
                }
              >
                <X
                  size={24}
                />
              </button>
            </div>

            <div className="product-form">
              <label>
                Nome

                <input
                  type="text"
                  value={
                    productForm.name
                  }
                  onChange={(
                    event
                  ) =>
                    setProductForm(
                      (
                        current
                      ) => ({
                        ...current,

                        name:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Ex.: Passe livre de uniforme"
                />
              </label>

              <label>
                Descrição

                <textarea
                  value={
                    productForm.description
                  }
                  onChange={(
                    event
                  ) =>
                    setProductForm(
                      (
                        current
                      ) => ({
                        ...current,

                        description:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="Explique o item ou benefício..."
                  rows={4}
                />
              </label>

              <div className="product-form-row">
                <label>
                  Preço em BP

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={
                      productForm.price
                    }
                    onChange={(
                      event
                    ) =>
                      setProductForm(
                        (
                          current
                        ) => ({
                          ...current,

                          price:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="500"
                  />
                </label>

                <label>
                  Estoque

                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      productForm.stock
                    }
                    onChange={(
                      event
                    ) =>
                      setProductForm(
                        (
                          current
                        ) => ({
                          ...current,

                          stock:
                            event
                              .target
                              .value,
                        })
                      )
                    }
                    placeholder="Vazio = ilimitado"
                  />
                </label>
              </div>

              <label>
                URL da imagem

                <input
                  type="url"
                  value={
                    productForm.imageUrl
                  }
                  onChange={(
                    event
                  ) =>
                    setProductForm(
                      (
                        current
                      ) => ({
                        ...current,

                        imageUrl:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder="https://..."
                />
              </label>

              {productForm.imageUrl.trim() && (
                <div className="product-image-preview">
                  <span>
                    Pré-visualização
                  </span>

                  <img
                    src={
                      productForm.imageUrl
                    }
                    alt="Pré-visualização do produto"
                    onError={(
                      event
                    ) => {
                      event.currentTarget.style.display =
                        'none'
                    }}
                    onLoad={(
                      event
                    ) => {
                      event.currentTarget.style.display =
                        'block'
                    }}
                  />
                </div>
              )}

              <div className="product-modal-actions">
                <button
                  type="button"
                  className="btn"
                  onClick={
                    closeProductModal
                  }
                  disabled={
                    savingProduct
                  }
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  className="btn primary"
                  onClick={
                    saveProduct
                  }
                  disabled={
                    savingProduct
                  }
                >
                  {savingProduct
                    ? 'Salvando...'
                    : editingProduct
                      ? 'Salvar alterações'
                      : 'Cadastrar produto'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={
          productToToggle !==
          null
        }
        title={
          productToToggle?.active
            ? 'Desativar produto'
            : 'Ativar produto'
        }
        message={
          productToToggle
            ? productToToggle.active
              ? `Deseja retirar "${productToToggle.name}" da loja? Os jogadores não poderão comprá-lo enquanto estiver desativado.`
              : `Deseja disponibilizar "${productToToggle.name}" novamente na loja?`
            : ''
        }
        confirmLabel={
          productToToggle?.active
            ? 'Desativar'
            : 'Ativar'
        }
        danger={
          productToToggle?.active ??
          false
        }
        loading={
          togglingProduct
        }
        onCancel={() => {
          if (
            !togglingProduct
          ) {
            setProductToToggle(
              null
            )
          }
        }}
        onConfirm={
          confirmToggleProduct
        }
      />

      <ToastContainer
        toasts={toasts}
        onClose={
          removeToast
        }
      />
    </main>
  )
}