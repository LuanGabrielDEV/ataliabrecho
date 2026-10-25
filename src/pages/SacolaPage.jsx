import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import { useSacola } from '../features/sacola/Sacola'
import { formatarPreco } from '../config'
import './sacola.css'

export default function SacolaPage() {
  const { itens, total, remover } = useSacola()

  useEffect(() => {
    document.title = 'Sacola · Atalia Brechó'
  }, [])

  return (
    <main id="conteudo" className="sacola conteiner">
      <h1>Sua sacola</h1>

      {itens.length === 0 ? (
        <div className="sacola__vazia">
          <p>Sua sacola está vazia. As peças novas ficam penduradas na página inicial.</p>
          <Link to="/comprar" className="botao">Ver as peças</Link>
        </div>
      ) : (
        <>
          <ul className="sacola__lista">
            {itens.map((p) => (
              <li key={p.id}>
                <img src={p.foto} alt="" width="96" height="128" />
                <div>
                  <p className="sacola__codigo">#{p.codigo} · Tam. {p.tamanho}</p>
                  <p className="sacola__titulo">{p.titulo}</p>
                </div>
                <p className="sacola__preco">{formatarPreco(p.preco)}</p>
                <button type="button" className="sacola__remover" onClick={() => remover(p.id)} aria-label={`Tirar ${p.titulo} da sacola`}>
                  <X size={20} strokeWidth={1.6} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>

          <div className="sacola__resumo">
            <p>
              <span>Total das peças</span>
              <strong>{formatarPreco(total)}</strong>
            </p>
            <p className="sacola__nota">
              Retirada sem custo em ponto combinado, ou entrega por Uber com o valor da corrida combinado pelo WhatsApp.
            </p>
            {/* O checkout do Mercado Pago entra quando a conta da Atalia estiver pronta */}
            <button type="button" className="botao" disabled title="Checkout em configuração">
              Finalizar compra (em breve)
            </button>
          </div>
        </>
      )}
    </main>
  )
}
