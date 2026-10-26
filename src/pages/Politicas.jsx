import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { CONTATO } from '../config'
import './politicas.css'

// ⚠️ RASCUNHO para revisão da Atalia (e, se possível, de um advogado).
// Reúne só regras já informadas pela Atalia e o que o site de fato faz com os dados.
const ATUALIZADO_EM = '26 de outubro de 2026'

const SECOES = [
  { id: 'privacidade', titulo: 'Política de privacidade' },
  { id: 'compras', titulo: 'Compras, entrega e trocas' },
  { id: 'consignacao', titulo: 'Termos de consignação' },
]

export default function Politicas() {
  const { hash } = useLocation()

  useEffect(() => {
    document.title = 'Políticas e termos · Atalia Brechó'
  }, [])

  useEffect(() => {
    if (!hash) return
    const t = setTimeout(() => document.querySelector(hash)?.scrollIntoView({ block: 'start' }), 60)
    return () => clearTimeout(t)
  }, [hash])

  return (
    <main id="conteudo" className="conteiner politicas">
      <header className="pl-topo">
        <h1 className="titulo">Políticas e termos</h1>
        <p>Atualizado em {ATUALIZADO_EM}. Dúvidas sobre qualquer item: {CONTATO.email}.</p>
        <nav aria-label="Nesta página">
          <ul>
            {SECOES.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`}>{s.titulo}</a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <section id="privacidade" className="pl-secao" aria-labelledby="pl-privacidade">
        <h2 id="pl-privacidade">Política de privacidade</h2>
        <p>
          A Atalia Brechó leva a sério os seus dados e segue a Lei Geral de Proteção de Dados (Lei nº 13.709/2018). Aqui
          explicamos o que coletamos, por que e o que você pode pedir.
        </p>
        <h3>Quais dados coletamos</h3>
        <ul>
          <li>
            <strong>Avise-me:</strong> nome, WhatsApp, tamanhos e tipos de peça que você procura.
          </li>
          <li>
            <strong>Formulários de consignação, parceria e contato:</strong> nome, WhatsApp, e-mail (se informado), cidade,
            dados da loja (se for parceira) e a mensagem que você escrever.
          </li>
          <li>
            <strong>Compras:</strong> os dados necessários para o pedido e a entrega. O pagamento é feito no ambiente do
            Mercado Pago; a Atalia não recebe nem guarda dados do seu cartão.
          </li>
          <li>
            <strong>Sacola:</strong> as peças que você adiciona ficam guardadas só no seu aparelho, para você não perdê-las ao
            voltar ao site.
          </li>
        </ul>
        <h3>Para que usamos</h3>
        <ul>
          <li>Avisar quando chegar uma peça no seu tamanho, se você pediu.</li>
          <li>Responder mensagens e combinar consignações, parcerias, pagamentos e entregas.</li>
        </ul>
        <p>Não vendemos nem compartilhamos seus dados para publicidade de terceiros.</p>
        <h3>Com quem os dados ficam</h3>
        <p>
          Os dados ficam guardados no Supabase (banco de dados do site). Pagamentos são processados pelo Mercado Pago e o site
          é hospedado na Netlify. Esses serviços tratam os dados apenas para fazer o site funcionar.
        </p>
        <h3>Seus direitos</h3>
        <p>
          Você pode pedir a qualquer momento para ver, corrigir ou apagar seus dados, ou deixar de receber avisos. Para parar
          os avisos do Avise-me, basta responder “sair” na conversa do WhatsApp. Para os demais pedidos, escreva para{' '}
          <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>.
        </p>
      </section>

      <section id="compras" className="pl-secao" aria-labelledby="pl-compras">
        <h2 id="pl-compras">Compras, entrega e trocas</h2>
        <h3>Peças únicas</h3>
        <p>
          Todas as peças são de segunda mão e únicas. O estado de cada uma (nova com etiqueta, ótimo ou bom estado) e
          eventuais detalhes aparecem na página da peça, junto com fotos reais e o tamanho. Algumas peças também têm fotos de
          “Provador IA”, uma simulação feita por inteligência artificial que aparece sempre identificada.
        </p>
        <h3>Pagamento e reserva</h3>
        <p>
          O pagamento é feito por Pix, cartão ou boleto, pelo Mercado Pago. Enquanto o pagamento está sendo concluído, a peça
          fica reservada. Se ele não for confirmado, a peça volta a ficar disponível no site.
        </p>
        <h3>Entrega</h3>
        <p>
          A retirada em ponto combinado em {CONTATO.cidade} não tem custo. A entrega por Uber tem o valor da corrida combinado
          pelo WhatsApp no momento do envio e é paga à parte.
        </p>
        <h3>Desistência e trocas</h3>
        <p>
          Nas compras feitas pelo site, você pode desistir em até 7 dias a partir do recebimento, como prevê o artigo 49 do
          Código de Defesa do Consumidor. Para isso, ou se a peça chegar com algum problema não informado, fale com a gente
          pelo WhatsApp ou pelo e-mail <a href={`mailto:${CONTATO.email}`}>{CONTATO.email}</a>.
        </p>
      </section>

      <section id="consignacao" className="pl-secao" aria-labelledby="pl-consignacao">
        <h2 id="pl-consignacao">Termos de consignação</h2>
        <p>
          Estes são os pontos principais da consignação e da parceria com a Atalia Brechó. Os detalhes de cada consignação são
          combinados diretamente com você.
        </p>
        <ul>
          <li>
            <strong>Divisão:</strong> 50% do valor de cada peça vendida fica com quem consignou e 50% com a Atalia.
          </li>
          <li>
            <strong>Exposição:</strong> cada peça aceita fica exposta por 60 dias.
          </li>
          <li>
            <strong>Repasse:</strong> o valor é repassado em até 7 dias úteis depois da venda.
          </li>
          <li>
            <strong>Parcerias:</strong> lojas e empreendedoras participam pelo mesmo modelo.
          </li>
        </ul>
      </section>
    </main>
  )
}
