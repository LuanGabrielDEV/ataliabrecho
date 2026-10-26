import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useSacola } from './Sacola'
import { formatarPreco } from '../../config'
import './sacola.css'

/** Sacola em gaveta lateral. Usa <dialog> para foco e tecla Esc nativos. */
export default function Gaveta() {
  const { itens, total, remover, gavetaAberta, fecharGaveta } = useSacola()
  const ref = useRef(null)

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (gavetaAberta && !d.open) d.showModal()
    if (!gavetaAberta && d.open) d.close()
  }, [gavetaAberta])

  return (
    <dialog
      ref={ref}
      className="gaveta"
      aria-labelledby="gaveta-titulo"
      onClose={fecharGaveta}
      onClick={(e) => e.target === ref.current && fecharGaveta()}
    >
      <div className="gaveta__painel">
        <header className="gaveta__topo">
          <h2 id="gaveta-titulo" className="titulo">Sua sacola</h2>
          <button type="button" className="gaveta__fechar" onClick={fecharGaveta} aria-label="Fechar sacola">
            <X size={24} strokeWidth={1.5} aria-hidden="true" />
          </button>
        </header>

        {itens.length === 0 ? (
          <div className="gaveta__vazia">
            <p>Sua sacola está vazia. Cada peça é única: quando gostar, leve antes que outra pessoa leve.</p>
            <Link to="/comprar" className="botao" onClick={fecharGaveta} viewTransition>
              Ver as peças
            </Link>
          </div>
        ) : (
          <>
            <ul className="gaveta__lista">
              {itens.map((p) => (
                <li key={p.id}>
                  <div className="gaveta__foto">
                    <img src={p.recorte || p.foto} alt="" />
                  </div>
                  <div>
                    <p className="gaveta__codigo">#{p.codigo} · Tam. {p.tamanho}</p>
                    <Link to={`/peca/${p.id}`} className="gaveta__titulo" onClick={fecharGaveta} viewTransition>
                      {p.titulo}
                    </Link>
                    <p className="gaveta__preco">{formatarPreco(p.preco)}</p>
                  </div>
                  <button type="button" className="gaveta__remover" onClick={() => remover(p.id)} aria-label={`Tirar ${p.titulo} da sacola`}>
                    <X size={18} strokeWidth={1.6} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>

            <footer className="gaveta__rodape">
              <p className="gaveta__total">
                <span>Total das peças</span>
                <strong>{formatarPreco(total)}</strong>
              </p>
              <p className="gaveta__nota">
                Retirada sem custo em ponto combinado, ou entrega por Uber com o valor da corrida combinado pelo WhatsApp.
              </p>
              {/* O checkout do Mercado Pago entra quando a conta da Atalia estiver pronta */}
              <button type="button" className="botao" disabled title="Checkout em configuração">
                Finalizar compra (em breve)
              </button>
            </footer>
          </>
        )}
      </div>
    </dialog>
  )
}
