import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowDown, ArrowUp, BellRing, ChevronLeft, ImagePlus, Trash2 } from 'lucide-react'
import { CATEGORIAS, CONDICOES, CORES, TAMANHOS_ORDEM } from '../data/pecasDemo'
import { urlFoto } from '../data/catalogo'
import { mensagemErro, prepararFoto, supabaseAdmin } from './supabaseAdmin'
import { STATUS } from './status'

const hoje = () => new Date().toISOString().slice(0, 10)

const VAZIA = {
  titulo: '',
  categoria: 'vestidos',
  tamanho: 'M',
  preco: '',
  preco_original: '',
  condicao: 'otimo',
  cor: '',
  tecido: '',
  observacao: '',
  descricao: '',
  medidas: {},
  status: 'disponivel',
  origem: 'propria',
  consignadora: '',
  destaque: false,
  chegou_em: hoje(),
}

export default function FormPeca() {
  const { id } = useParams()
  const nova = !id
  const navegar = useNavigate()
  const entradaFotos = useRef(null)
  const [dados, setDados] = useState(VAZIA)
  const [codigo, setCodigo] = useState('')
  // fotos: { id?, caminho?, arquivo?, previa, recortada, gerada_por_ia }
  const [fotos, setFotos] = useState([])
  const [removidas, setRemovidas] = useState([])
  const [carregando, setCarregando] = useState(!nova)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')
  const [salvoId, setSalvoId] = useState(null)

  useEffect(() => {
    if (nova) return
    ;(async () => {
      try {
        const sb = await supabaseAdmin()
        const { data, error } = await sb.from('pecas').select('*, peca_fotos(*)').eq('id', id).single()
        if (error) throw error
        const { peca_fotos: fs, codigo: c, ...resto } = data
        setCodigo(c)
        setDados({
          ...VAZIA,
          ...Object.fromEntries(Object.entries(resto).map(([k, v]) => [k, v ?? VAZIA[k] ?? ''])),
          medidas: resto.medidas || {},
        })
        setFotos(
          [...fs]
            .sort((a, b) => a.ordem - b.ordem)
            .map((f) => ({ ...f, previa: urlFoto(f.caminho) })),
        )
      } catch (e) {
        setErro(mensagemErro(e))
      } finally {
        setCarregando(false)
      }
    })()
  }, [id, nova])

  const mudar = (campo, valor) => setDados((d) => ({ ...d, [campo]: valor }))

  function adicionarFotos(lista) {
    const novas = [...lista].map((arquivo) => ({
      arquivo,
      previa: URL.createObjectURL(arquivo),
      // PNG costuma ser foto já sem fundo
      recortada: arquivo.type === 'image/png',
      gerada_por_ia: false,
    }))
    setFotos((fs) => [...fs, ...novas])
  }

  function mover(i, delta) {
    setFotos((fs) => {
      const c = [...fs]
      const j = i + delta
      if (j < 0 || j >= c.length) return fs
      ;[c[i], c[j]] = [c[j], c[i]]
      return c
    })
  }

  function remover(i) {
    setFotos((fs) => {
      const f = fs[i]
      if (f.id) setRemovidas((r) => [...r, f])
      return fs.filter((_, k) => k !== i)
    })
  }

  const alternarFoto = (i, campo) =>
    setFotos((fs) => fs.map((f, k) => (k === i ? { ...f, [campo]: !f[campo] } : f)))

  async function salvar(e) {
    e.preventDefault()
    setErro('')
    if (!dados.titulo.trim()) return setErro('Dê um nome para a peça.')
    if (dados.preco === '' || Number(dados.preco) < 0) return setErro('Informe o preço.')
    if (fotos.filter((f) => !f.gerada_por_ia).length === 0) return setErro('Adicione pelo menos uma foto real da peça.')

    setSalvando(true)
    try {
      const sb = await supabaseAdmin()
      const linha = {
        titulo: dados.titulo.trim(),
        categoria: dados.categoria,
        tamanho: dados.tamanho,
        preco: Number(dados.preco),
        preco_original: dados.preco_original === '' ? null : Number(dados.preco_original),
        condicao: dados.condicao,
        cor: dados.cor || null,
        tecido: dados.tecido.trim() || null,
        observacao: dados.observacao.trim() || null,
        descricao: dados.descricao.trim() || null,
        medidas: Object.fromEntries(Object.entries(dados.medidas).filter(([, v]) => v !== undefined && !Number.isNaN(v))),
        status: dados.status,
        origem: dados.origem,
        consignadora: dados.origem === 'consignada' ? dados.consignadora.trim() || null : null,
        destaque: !!dados.destaque,
        chegou_em: dados.chegou_em || hoje(),
      }

      let pecaId = id
      if (nova) {
        const { data, error } = await sb.from('pecas').insert(linha).select('id, codigo').single()
        if (error) throw error
        pecaId = data.id
        setCodigo(data.codigo)
      } else {
        const { error } = await sb.from('pecas').update(linha).eq('id', id)
        if (error) throw error
      }

      // fotos removidas: apaga arquivo e registro
      for (const f of removidas) {
        await sb.storage.from('pecas').remove([f.caminho])
        await sb.from('peca_fotos').delete().eq('id', f.id)
      }
      setRemovidas([])

      // fotos novas: reduz, envia; todas: grava ordem e marcações
      const atualizadas = []
      for (const [ordem, f] of fotos.entries()) {
        if (f.arquivo) {
          const blob = await prepararFoto(f.arquivo)
          const ext = blob.type === 'image/webp' ? 'webp' : f.arquivo.name.split('.').pop()
          const caminho = `${pecaId}/${Date.now()}-${ordem}.${ext}`
          const { error: erroEnvio } = await sb.storage.from('pecas').upload(caminho, blob, {
            contentType: blob.type || f.arquivo.type,
            cacheControl: '31536000',
          })
          if (erroEnvio) throw erroEnvio
          const { data, error } = await sb
            .from('peca_fotos')
            .insert({ peca_id: pecaId, caminho, ordem, recortada: f.recortada, gerada_por_ia: f.gerada_por_ia, alt: linha.titulo })
            .select()
            .single()
          if (error) throw error
          atualizadas.push({ ...data, previa: urlFoto(caminho) })
        } else {
          const { error } = await sb
            .from('peca_fotos')
            .update({ ordem, recortada: f.recortada, gerada_por_ia: f.gerada_por_ia })
            .eq('id', f.id)
          if (error) throw error
          atualizadas.push({ ...f, ordem })
        }
      }
      setFotos(atualizadas)
      setSalvoId(pecaId)
      if (nova) navegar(`/admin/pecas/${pecaId}`, { replace: true })
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setSalvando(false)
    }
  }

  async function apagar() {
    if (!window.confirm('Apagar esta peça e as fotos dela? Isso não pode ser desfeito.')) return
    try {
      const sb = await supabaseAdmin()
      const caminhos = fotos.filter((f) => f.caminho).map((f) => f.caminho)
      if (caminhos.length) await sb.storage.from('pecas').remove(caminhos)
      const { error } = await sb.from('pecas').delete().eq('id', id)
      if (error) throw error
      navegar('/admin')
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }

  if (carregando) return <main className="adm-pagina">Carregando…</main>

  return (
    <main className="adm-pagina adm-pagina--form">
      <Link to="/admin" className="adm-voltar">
        <ChevronLeft size={18} aria-hidden="true" /> Peças
      </Link>
      <h1>{nova ? 'Nova peça' : `Editar #${codigo}`}</h1>

      <form className="adm-form" onSubmit={salvar} noValidate>
        {/* ---------- Fotos ---------- */}
        <fieldset className="adm-grupo">
          <legend>Fotos</legend>
          <p className="adm-dica">
            A primeira foto é a principal. Marque <strong>Sem fundo</strong> nas fotos recortadas e <strong>Provador IA</strong>{' '}
            nas fotos geradas por IA: elas aparecem com o selo de simulação.
          </p>
          <ul className="adm-fotos">
            {fotos.map((f, i) => (
              <li key={f.id || f.previa}>
                <img src={f.previa} alt="" />
                <div className="adm-fotos__marcas">
                  <label>
                    <input type="checkbox" checked={f.recortada} onChange={() => alternarFoto(i, 'recortada')} /> Sem fundo
                  </label>
                  <label>
                    <input type="checkbox" checked={f.gerada_por_ia} onChange={() => alternarFoto(i, 'gerada_por_ia')} /> Provador IA
                  </label>
                </div>
                <div className="adm-fotos__acoes">
                  <button type="button" onClick={() => mover(i, -1)} disabled={i === 0} aria-label="Mover foto para antes">
                    <ArrowUp size={16} />
                  </button>
                  <button type="button" onClick={() => mover(i, 1)} disabled={i === fotos.length - 1} aria-label="Mover foto para depois">
                    <ArrowDown size={16} />
                  </button>
                  <button type="button" onClick={() => remover(i)} aria-label="Remover foto">
                    <Trash2 size={16} />
                  </button>
                </div>
                {i === 0 && <span className="adm-fotos__principal">Principal</span>}
              </li>
            ))}
            <li>
              <button type="button" className="adm-fotos__adicionar" onClick={() => entradaFotos.current?.click()}>
                <ImagePlus size={26} aria-hidden="true" />
                Adicionar fotos
              </button>
              <input
                ref={entradaFotos}
                type="file"
                accept="image/*"
                multiple
                hidden
                onChange={(e) => {
                  adicionarFotos(e.target.files)
                  e.target.value = ''
                }}
              />
            </li>
          </ul>
        </fieldset>

        {/* ---------- Dados principais ---------- */}
        <fieldset className="adm-grupo">
          <legend>Peça</legend>
          <label className="adm-campo">
            <span>Nome da peça</span>
            <input value={dados.titulo} onChange={(e) => mudar('titulo', e.target.value)} placeholder="Ex.: Vestido floral midi" maxLength={90} required />
          </label>
          <div className="adm-linha">
            <label className="adm-campo">
              <span>Categoria</span>
              <select value={dados.categoria} onChange={(e) => mudar('categoria', e.target.value)}>
                {CATEGORIAS.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-campo">
              <span>Tamanho</span>
              <select value={dados.tamanho} onChange={(e) => mudar('tamanho', e.target.value)}>
                {TAMANHOS_ORDEM.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="adm-linha">
            <label className="adm-campo">
              <span>Preço (R$)</span>
              <input type="number" inputMode="decimal" min="0" step="0.01" value={dados.preco} onChange={(e) => mudar('preco', e.target.value)} required />
            </label>
            <label className="adm-campo">
              <span>Preço original (opcional)</span>
              <input type="number" inputMode="decimal" min="0" step="0.01" value={dados.preco_original} onChange={(e) => mudar('preco_original', e.target.value)} />
            </label>
          </div>
          <div className="adm-linha">
            <label className="adm-campo">
              <span>Estado</span>
              <select value={dados.condicao} onChange={(e) => mudar('condicao', e.target.value)}>
                {Object.entries(CONDICOES).map(([v, c]) => (
                  <option key={v} value={v}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-campo">
              <span>Cor</span>
              <select value={dados.cor} onChange={(e) => mudar('cor', e.target.value)}>
                <option value="">—</option>
                {CORES.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="adm-campo">
            <span>Tecido (opcional)</span>
            <input value={dados.tecido} onChange={(e) => mudar('tecido', e.target.value)} placeholder="Ex.: Linho, viscose" />
          </label>
          <label className="adm-campo">
            <span>Detalhe ou defeito (opcional)</span>
            <input value={dados.observacao} onChange={(e) => mudar('observacao', e.target.value)} placeholder="Ex.: Pequeno fio puxado na barra" />
          </label>
          <label className="adm-campo">
            <span>Descrição (opcional)</span>
            <textarea rows={3} value={dados.descricao} onChange={(e) => mudar('descricao', e.target.value)} />
          </label>
        </fieldset>


        {/* ---------- Venda ---------- */}
        <fieldset className="adm-grupo">
          <legend>Venda</legend>
          <div className="adm-linha">
            <label className="adm-campo">
              <span>Status</span>
              <select value={dados.status} onChange={(e) => mudar('status', e.target.value)}>
                {Object.entries(STATUS).map(([v, t]) => (
                  <option key={v} value={v}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label className="adm-campo">
              <span>Chegou em</span>
              <input type="date" value={dados.chegou_em} onChange={(e) => mudar('chegou_em', e.target.value)} />
            </label>
          </div>
          <div className="adm-linha">
            <label className="adm-campo">
              <span>Origem</span>
              <select value={dados.origem} onChange={(e) => mudar('origem', e.target.value)}>
                <option value="propria">Própria</option>
                <option value="consignada">Consignada</option>
              </select>
            </label>
            {dados.origem === 'consignada' && (
              <label className="adm-campo">
                <span>Consignadora</span>
                <input value={dados.consignadora} onChange={(e) => mudar('consignadora', e.target.value)} placeholder="Nome de quem consignou" />
              </label>
            )}
          </div>
          <label className="adm-check">
            <input type="checkbox" checked={dados.destaque} onChange={(e) => mudar('destaque', e.target.checked)} /> Destacar na página inicial
          </label>
        </fieldset>

        {erro && (
          <p className="adm-erro" role="alert">
            {erro}
          </p>
        )}
        {salvoId && !salvando && (
          <div className="adm-ok adm-salvo" role="status">
            <span>Peça salva.</span>
            <Link to={`/admin/avisos?peca=${salvoId}`}>
              <BellRing size={16} aria-hidden="true" /> Avisar quem pediu este tamanho
            </Link>
          </div>
        )}

        <div className="adm-rodape-form">
          {!nova && (
            <button type="button" className="adm-botao adm-botao--perigo" onClick={apagar}>
              Apagar
            </button>
          )}
          <button type="submit" className="adm-botao" disabled={salvando}>
            {salvando ? 'Salvando…' : nova ? 'Cadastrar peça' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </main>
  )
}
