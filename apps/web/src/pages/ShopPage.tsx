import {
  Coins,
  LockKeyhole,
  ShoppingBag,
  X,
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

import {
  ToastContainer,
} from '../components/ToastContainer'

import {
  useToast,
} from '../hooks/useToast'

type Product = {
  id: number
  name: string
  description: string
  imageUrl: string | null
  price: number
  stock: number | null
  active: boolean
}

export function ShopPage() {
  const [
    user,
    setUser,
  ] =
    useState<
      User |
      null |
      undefined
    >(undefined)

  const [
    products,
    setProducts,
  ] =
    useState<Product[]>([])

  const [
    loadingProducts,
    setLoadingProducts,
  ] =
    useState(true)

  const [
    selectedProduct,
    setSelectedProduct,
  ] =
    useState<Product | null>(
      null
    )

  const [
    buying,
    setBuying,
  ] =
    useState(false)

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null
    )

  const {
    toasts,
    showToast,
    removeToast,
  } = useToast()

  useEffect(() => {
    void loadPage()
  }, [])

  async function loadPage() {
    await Promise.all([
      loadUser(),
      loadProducts(),
    ])
  }

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

  async function loadProducts() {
    try {
      setLoadingProducts(true)

      const response =
        await fetch(
          `${API_URL}/api/products`,
          {
            credentials:
              'include',
          }
        )

      if (!response.ok) {
        setProducts([])

        return
      }

      const data =
        await response.json()

      setProducts(data)
    } catch (error) {
      console.error(error)

      setProducts([])

      showToast(
        'Não foi possível carregar os produtos da loja.',
        'error'
      )
    } finally {
      setLoadingProducts(false)
    }
  }

  function openPurchase(
    product: Product
  ) {
    setErrorMessage(null)

    setSelectedProduct(
      product
    )
  }

  function closePurchase() {
    if (buying) {
      return
    }

    setSelectedProduct(null)
    setErrorMessage(null)
  }

  async function buyProduct() {
    if (
      !selectedProduct ||
      !user
    ) {
      return
    }

    if (
      user.bullyPoints <
      selectedProduct.price
    ) {
      setErrorMessage(
        'Você não possui Bully Points suficientes.'
      )

      return
    }

    if (
      selectedProduct.stock !==
        null &&
      selectedProduct.stock <= 0
    ) {
      setErrorMessage(
        'Este produto está esgotado.'
      )

      return
    }

    const productName =
      selectedProduct.name

    try {
      setBuying(true)
      setErrorMessage(null)

      const response =
        await fetch(
          `${API_URL}/api/products/${selectedProduct.id}/buy`,
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
        setErrorMessage(
          data.message ??
            'Não foi possível realizar a compra.'
        )

        return
      }

      setUser(
        (current) =>
          current
            ? {
                ...current,

                bullyPoints:
                  data.bullyPoints,
              }
            : current
      )

      setSelectedProduct(
        null
      )

      setErrorMessage(null)

      showToast(
        `${productName} adquirido com sucesso!`,
        'success'
      )

      await loadProducts()
    } catch (error) {
      console.error(error)

      setErrorMessage(
        'Erro de conexão ao realizar a compra.'
      )

      showToast(
        'Não foi possível concluir a compra.',
        'error'
      )
    } finally {
      setBuying(false)
    }
  }

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

  if (!user) {
    return (
      <main className="page centered">
        <div className="locked-card paper-card">
          <LockKeyhole
            size={42}
          />

          <h1>
            Área exclusiva
            para alunos
          </h1>

          <p>
            Entre com sua conta
            do Discord. O sistema
            verificará se você
            pertence ao servidor
            do RP.
          </p>

          <a
            className="btn primary"
            href={`${API_URL}/api/auth/discord`}
          >
            Entrar com Discord
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="page">
      <div className="page-heading shop-heading">
        <div>
          <p className="eyebrow">
            BULLWORTH STORE
          </p>

          <h1>
            Loja de
            Bully Points
          </h1>

          <p className="shop-subtitle">
            Use seus Bully
            Points para adquirir
            itens e benefícios
            dentro do RP.
          </p>
        </div>

        <div className="balance">
          <Coins
            size={18}
          />

          <span>
            Saldo
          </span>

          <strong>
            {user.bullyPoints.toLocaleString(
              'pt-BR'
            )}{' '}
            BP
          </strong>
        </div>
      </div>

      {loadingProducts ? (
        <div className="paper-card shop-loading">
          Carregando produtos...
        </div>
      ) : products.length ===
        0 ? (
        <div className="empty paper-card">
          <ShoppingBag
            size={38}
          />

          <h3>
            Nenhum produto
            disponível
          </h3>

          <p>
            Assim que a
            administração
            cadastrar itens,
            eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map(
            (product) => {
              const outOfStock =
                product.stock !==
                  null &&
                product.stock <=
                  0

              const insufficientBalance =
                user.bullyPoints <
                product.price

              return (
                <article
                  className="product-card paper-card"
                  key={
                    product.id
                  }
                >
                  <div className="product-image">
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
                      <ShoppingBag
                        size={38}
                      />
                    )}

                    {outOfStock && (
                      <span className="stock-badge sold-out">
                        ESGOTADO
                      </span>
                    )}
                  </div>

                  <div className="product-card-content">
                    <h3>
                      {
                        product.name
                      }
                    </h3>

                    <p>
                      {
                        product.description
                      }
                    </p>

                    <div className="product-stock">
                      {product.stock ===
                      null
                        ? 'Disponibilidade ilimitada'
                        : product.stock ===
                            0
                          ? 'Sem unidades disponíveis'
                          : `${product.stock} ${
                              product.stock ===
                              1
                                ? 'unidade disponível'
                                : 'unidades disponíveis'
                            }`}
                    </div>
                  </div>

                  <div className="product-footer">
                    <div className="product-price">
                      <Coins
                        size={17}
                      />

                      <strong>
                        {product.price.toLocaleString(
                          'pt-BR'
                        )}{' '}
                        BP
                      </strong>
                    </div>

                    <button
                      className="btn primary"
                      type="button"
                      disabled={
                        outOfStock ||
                        insufficientBalance
                      }
                      onClick={() =>
                        openPurchase(
                          product
                        )
                      }
                    >
                      {outOfStock
                        ? 'Esgotado'
                        : insufficientBalance
                          ? 'Saldo insuficiente'
                          : 'Comprar'}
                    </button>
                  </div>
                </article>
              )
            }
          )}
        </div>
      )}

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closePurchase
          }
        >
          <div
            className="purchase-modal paper-card"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="purchase-modal-header">
              <div>
                <p className="eyebrow">
                  CONFIRMAR
                  COMPRA
                </p>

                <h2>
                  {
                    selectedProduct.name
                  }
                </h2>
              </div>

              <button
                className="modal-close"
                type="button"
                onClick={
                  closePurchase
                }
                disabled={
                  buying
                }
              >
                <X
                  size={22}
                />
              </button>
            </div>

            {selectedProduct.imageUrl && (
              <img
                className="purchase-product-image"
                src={
                  selectedProduct.imageUrl
                }
                alt={
                  selectedProduct.name
                }
              />
            )}

            <p className="purchase-description">
              {
                selectedProduct.description
              }
            </p>

            <div className="purchase-summary">
              <div>
                <span>
                  Seu saldo
                </span>

                <strong>
                  {user.bullyPoints.toLocaleString(
                    'pt-BR'
                  )}{' '}
                  BP
                </strong>
              </div>

              <div>
                <span>
                  Valor
                </span>

                <strong>
                  -{' '}
                  {selectedProduct.price.toLocaleString(
                    'pt-BR'
                  )}{' '}
                  BP
                </strong>
              </div>

              <div className="purchase-result">
                <span>
                  Saldo após
                  a compra
                </span>

                <strong>
                  {(
                    user.bullyPoints -
                    selectedProduct.price
                  ).toLocaleString(
                    'pt-BR'
                  )}{' '}
                  BP
                </strong>
              </div>
            </div>

            {selectedProduct.stock !==
              null && (
              <div className="purchase-stock">
                {selectedProduct.stock >
                0
                  ? `Restam ${selectedProduct.stock} ${
                      selectedProduct.stock ===
                      1
                        ? 'unidade'
                        : 'unidades'
                    }`
                  : 'Produto esgotado'}
              </div>
            )}

            {errorMessage && (
              <div className="purchase-error">
                {errorMessage}
              </div>
            )}

            <div className="purchase-actions">
              <button
                className="btn"
                type="button"
                onClick={
                  closePurchase
                }
                disabled={
                  buying
                }
              >
                Cancelar
              </button>

              <button
                className="btn primary"
                type="button"
                onClick={
                  buyProduct
                }
                disabled={
                  buying ||
                  user.bullyPoints <
                    selectedProduct.price ||
                  (
                    selectedProduct.stock !==
                      null &&
                    selectedProduct.stock <=
                      0
                  )
                }
              >
                {buying
                  ? 'Processando compra...'
                  : `Confirmar compra • ${selectedProduct.price.toLocaleString(
                      'pt-BR'
                    )} BP`}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        toasts={
          toasts
        }
        onClose={
          removeToast
        }
      />
    </main>
  )
}