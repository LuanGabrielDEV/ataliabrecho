import { useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  CATEGORIAS,
  TAMANHOS_LETRA,
  TAMANHOS_NUMERO,
  mascararWhatsapp,
  registrarAviso,
  validar,
} from './aviseMe'
import './avise-me.css'

const VAZIO = { nome: '', whatsapp: '', tamanhos: [], categorias: [], consentimento: false }

function alternar(lista, valor) {
  return lista.includes(valor) ? lista.filter((v) => v !== valor) : [...lista, valor]
}

function listarComE(itens) {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} ou ${itens.at(-1)}`
}

export default function AviseMeForm({ origem = 'site', onSucesso, tituloId }) {
  const id = useId()
  const formRef = useRef(null)
  const [dados, setDados] = useState(VAZIO)
  const [erros, setErros] = useState({})
  const [estado, setEstado] = useState('editando') // editando | enviando | sucesso
  const [resultado, setResultado] = useState(null)
  const [erroEnvio, setErroEnvio] = useState('')

  const atualizar = (campo, valor) => {
    setDados((d) => ({ ...d, [campo]: valor }))
    if (erros[campo]) setErros((e) => ({ ...e, [campo]: undefined }))
  }

  async function enviar(evento) {
    evento.preventDefault()
    setErroEnvio('')

    // armadilha para robôs: campo invisível que pessoas não preenchem
    if (new FormData(evento.currentTarget).get('empresa')) return

    const encontrados = validar(dados)
    setErros(encontrados)
    const primeiro = Object.keys(encontrados)[0]
    if (primeiro) {
      formRef.current?.querySelector(`[data-campo="${primeiro}"]`)?.focus()
      return
    }

    setEstado('enviando')
    try {
      const r = await registrarAviso({ ...dados, origem })
      setResultado(r)
      setEstado('sucesso')
      onSucesso?.(r)
    } catch (e) {
      setErroEnvio(e.message)
      setEstado('editando')
    }
  }

  if (estado === 'sucesso') {
    const primeiroNome = dados.nome.trim().split(/\s+/)[0]
    return (
      <div className="am-sucesso" role="status" tabIndex={-1} ref={(el) => el?.focus()}>
        <p className="am-sucesso__titulo">
          {resultado === 'atualizado' ? `Atualizado, ${primeiroNome}!` : `Combinado, ${primeiroNome}!`}
        </p>
        <p>
          Quando chegar peça no tamanho {listarComE(dados.tamanhos)}, você recebe o aviso no WhatsApp.
        </p>
        <p className="am-sucesso__nota">Para parar de receber, é só responder “sair” na conversa.</p>
        <Link className="am-botao am-botao--secundario" to="/comprar">
          Ver as peças de agora
        </Link>
      </div>
    )
  }

  const enviando = estado === 'enviando'
  const erroId = (campo) => (erros[campo] ? `${id}-${campo}-erro` : undefined)

  return (
    <form ref={formRef} className="am-form" onSubmit={enviar} noValidate aria-labelledby={tituloId}>
      <div className="am-campo">
        <label htmlFor={`${id}-nome`}>Seu nome</label>
        <input
          id={`${id}-nome`}
          data-campo="nome"
          name="nome"
          autoComplete="given-name"
          value={dados.nome}
          onChange={(e) => atualizar('nome', e.target.value)}
          aria-invalid={!!erros.nome}
          aria-describedby={erroId('nome')}
          maxLength={80}
        />
        {erros.nome && <p className="am-erro" id={erroId('nome')}>{erros.nome}</p>}
      </div>

      <div className="am-campo">
        <label htmlFor={`${id}-whats`}>WhatsApp com DDD</label>
        <input
          id={`${id}-whats`}
          data-campo="whatsapp"
          name="whatsapp"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="(81) 99999-8888"
          value={dados.whatsapp}
          onChange={(e) => atualizar('whatsapp', mascararWhatsapp(e.target.value))}
          aria-invalid={!!erros.whatsapp}
          aria-describedby={erroId('whatsapp')}
        />
        {erros.whatsapp && <p className="am-erro" id={erroId('whatsapp')}>{erros.whatsapp}</p>}
      </div>

      <fieldset className="am-grupo" aria-describedby={erroId('tamanhos')}>
        <legend>Seus tamanhos</legend>
        <p className="am-dica">Marque todos que te servem.</p>
        {[TAMANHOS_LETRA, TAMANHOS_NUMERO].map((grupo, i) => (
          <div className="am-chips" key={i}>
            {grupo.map((t, j) => (
              <label className="am-chip" key={t}>
                <input
                  type="checkbox"
                  data-campo={i === 0 && j === 0 ? 'tamanhos' : undefined}
                  checked={dados.tamanhos.includes(t)}
                  onChange={() => atualizar('tamanhos', alternar(dados.tamanhos, t))}
                />
                <span>{t}</span>
              </label>
            ))}
          </div>
        ))}
        {erros.tamanhos && <p className="am-erro" id={erroId('tamanhos')}>{erros.tamanhos}</p>}
      </fieldset>

      <fieldset className="am-grupo">
        <legend>
          O que você procura <span className="am-opcional">(opcional)</span>
        </legend>
        <div className="am-chips">
          {CATEGORIAS.map((c) => (
            <label className="am-chip" key={c.valor}>
              <input
                type="checkbox"
                checked={dados.categorias.includes(c.valor)}
                onChange={() => atualizar('categorias', alternar(dados.categorias, c.valor))}
              />
              <span>{c.rotulo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="am-campo am-campo--check">
        <input
          id={`${id}-lgpd`}
          data-campo="consentimento"
          type="checkbox"
          checked={dados.consentimento}
          onChange={(e) => atualizar('consentimento', e.target.checked)}
          aria-invalid={!!erros.consentimento}
          aria-describedby={erroId('consentimento')}
        />
        <label htmlFor={`${id}-lgpd`}>
          Autorizo a Atalia Brechó a me avisar pelo WhatsApp sobre peças novas. Posso cancelar quando quiser.{' '}
          <Link to="/politicas#privacidade">Política de privacidade</Link>
        </label>
        {erros.consentimento && <p className="am-erro" id={erroId('consentimento')}>{erros.consentimento}</p>}
      </div>

      {/* armadilha para robôs */}
      <div className="am-armadilha" aria-hidden="true">
        <label>
          Empresa <input name="empresa" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {erroEnvio && (
        <p className="am-erro am-erro--envio" role="alert">
          {erroEnvio}
        </p>
      )}

      <button className="am-botao" type="submit" disabled={enviando} aria-busy={enviando}>
        {enviando ? 'Salvando…' : 'Quero ser avisada'}
      </button>
    </form>
  )
}
