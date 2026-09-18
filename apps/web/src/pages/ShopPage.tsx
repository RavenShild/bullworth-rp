import {
  Coins,
  LockKeyhole,
  PackageOpen,
  ShoppingBag,
  Store,
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

      setSelectedProduct(null)
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
      <main className="school-store-page">
        <div className="store-loading">
          <div className="store-loading-icon">
            <ShoppingBag
              size={30}
            />
          </div>

          <p>
            Abrindo a Bullworth Store...
          </p>
        </div>
      </main>
    )
  }

  if (!user) {
    return (
      <main className="school-store-page store-centered">
        <section className="store-login-panel">
          <div className="store-login-icon">
            <LockKeyhole
              size={34}
            />
          </div>

          <p className="eyebrow">
            BULLWORTH STORE
          </p>

          <h1>
            School Store
          </h1>

          <p>
            A loja é exclusiva
            para membros da academia.
            Entre com sua conta do Discord
            para consultar seu saldo
            e adquirir itens.
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
    <main className="school-store-page">

      <section className="store-hero">

        <div className="store-hero-copy">
          <p className="eyebrow">
            BULLWORTH ACADEMY
          </p>

          <h1>
            School Store
          </h1>

          <p>
            Benefícios, permissões
            e itens especiais para
            sua experiência dentro
            de Bullworth.
          </p>
        </div>

        <div className="store-wallet">
          <div className="store-wallet-icon">
            <Coins
              size={24}
            />
          </div>

          <div>
            <span>
              Saldo disponível
            </span>

            <strong>
              {user.bullyPoints.toLocaleString(
                'pt-BR'
              )}{' '}
              BP
            </strong>
          </div>
        </div>

      </section>

      <div className="store-divider">
        <span />
        <strong>
          BULLWORTH STORE
        </strong>
        <span />
      </div>

      <section className="store-catalog">

        <div className="store-catalog-heading">
          <div>
            <p className="eyebrow">
              SCHOOL CATALOG
            </p>

            <h2>
              Itens disponíveis
            </h2>
          </div>

          <div className="store-catalog-count">
            <Store
              size={18}
            />

            <span>
              {products.length}{' '}
              {products.length === 1
                ? 'item'
                : 'itens'}
            </span>
          </div>
        </div>

        {loadingProducts ? (
          <div className="store-state-panel">
            <ShoppingBag
              size={34}
            />

            <strong>
              Carregando catálogo
            </strong>

            <p>
              Consultando itens disponíveis...
            </p>
          </div>
        ) : products.length ===
          0 ? (
          <div className="store-state-panel">
            <PackageOpen
              size={38}
            />

            <strong>
              Loja temporariamente vazia
            </strong>

            <p>
              Assim que novos itens forem
              disponibilizados pela direção,
              eles aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="store-product-grid">
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
                    className={`store-product-card ${
                      outOfStock
                        ? 'is-sold-out'
                        : ''
                    }`}
                    key={
                      product.id
                    }
                  >
                    <div className="store-product-image">
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
                        <div className="store-product-placeholder">
                          <ShoppingBag
                            size={40}
                          />
                        </div>
                      )}

                      <div className="store-product-number">
                        #{String(
                          product.id
                        ).padStart(
                          3,
                          '0'
                        )}
                      </div>

                      {outOfStock && (
                        <span className="store-sold-out-badge">
                          ESGOTADO
                        </span>
                      )}
                    </div>

                    <div className="store-product-body">

                      <div className="store-product-title">
                        <span>
                          SCHOOL STORE ITEM
                        </span>

                        <h3>
                          {product.name}
                        </h3>
                      </div>

                      <p>
                        {product.description}
                      </p>

                      <div className="store-product-meta">
                        <span>
                          Disponibilidade
                        </span>

                        <strong>
                          {product.stock ===
                          null
                            ? 'Ilimitada'
                            : product.stock ===
                                0
                              ? 'Indisponível'
                              : `${product.stock} ${
                                  product.stock ===
                                  1
                                    ? 'unidade'
                                    : 'unidades'
                                }`}
                        </strong>
                      </div>

                    </div>

                    <footer className="store-product-footer">

                      <div className="store-product-price">
                        <Coins
                          size={18}
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
                            : 'Adquirir'}
                      </button>

                    </footer>
                  </article>
                )
              }
            )}
          </div>
        )}

      </section>

      <section className="store-policy">
          <div className="brand-mark">
            <img
              src="https://media.discordapp.net/attachments/1519195029640318996/1550602565979218020/ICONERPG.png?ex=6aaeeeac&is=6aad9d2c&hm=b40b48cb33071ee5201c044f5a83689d8e6ace3e5966cedef27761af7651b9a1&=&format=webp&quality=lossless"
              alt="Bullworth Academy"
              className="brand-mark-image"
            />
          </div>

        <div>
          <span>
            BULLWORTH ACADEMY
          </span>

          <h3>
            Student Store Policy
          </h3>

          <p>
            Compras realizadas com
            Bully Points são registradas
            automaticamente no histórico
            do aluno.
          </p>
        </div>
      </section>

      {selectedProduct && (
        <div
          className="modal-backdrop"
          onMouseDown={
            closePurchase
          }
        >
          <div
            className="store-purchase-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <header className="store-purchase-header">
              <div>
                <p className="eyebrow">
                  PURCHASE REQUEST
                </p>

                <h2>
                  Confirmar aquisição
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
                  size={21}
                />
              </button>
            </header>

            <div className="store-purchase-product">

              <div className="store-purchase-image">
                {selectedProduct.imageUrl ? (
                  <img
                    src={
                      selectedProduct.imageUrl
                    }
                    alt={
                      selectedProduct.name
                    }
                  />
                ) : (
                  <ShoppingBag
                    size={34}
                  />
                )}
              </div>

              <div>
                <span>
                  ITEM
                </span>

                <h3>
                  {selectedProduct.name}
                </h3>

                <p>
                  {
                    selectedProduct.description
                  }
                </p>
              </div>

            </div>

            <div className="store-purchase-ledger">

              <div>
                <span>
                  Saldo atual
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
                  Valor do item
                </span>

                <strong className="negative">
                  -
                  {selectedProduct.price.toLocaleString(
                    'pt-BR'
                  )}{' '}
                  BP
                </strong>
              </div>

              <div className="store-purchase-total">
                <span>
                  Saldo restante
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
              <div className="store-purchase-stock">
                {selectedProduct.stock >
                0
                  ? `${selectedProduct.stock} ${
                      selectedProduct.stock ===
                      1
                        ? 'unidade disponível'
                        : 'unidades disponíveis'
                    }`
                  : 'Produto esgotado'}
              </div>
            )}

            {errorMessage && (
              <div className="store-purchase-error">
                {errorMessage}
              </div>
            )}

            <div className="store-purchase-actions">

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
                  ? 'Processando...'
                  : `Confirmar • ${selectedProduct.price.toLocaleString(
                      'pt-BR'
                    )} BP`}
              </button>

            </div>

          </div>
        </div>
      )}

      <ToastContainer
        toasts={toasts}
        onClose={
          removeToast
        }
      />

    </main>
  )
}