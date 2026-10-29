import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Download, FileSpreadsheet, FolderOpen, Images } from 'lucide-react'
import { formatarPreco } from '../config'
import { mensagemErro, prepararFoto, supabaseAdmin } from './supabaseAdmin'
import { EXTENSOES, classificar, lerPlanilha, ligarFotos } from './importacao'

const ROTULO = {
  pronta: 'Pronta',
  erro: 'Com erro',
  existe: 'Já existe',
  'sem-foto': 'Sem foto',
  importada: 'Importada',
  falhou: 'Falhou',
  importando: 'Enviando…',
}

/** Quantas peças sobem ao mesmo tempo. Cada peça envia as próprias fotos em sequência. */
const PECAS_EM_PARALELO = 3

async function buscarCodigosExistentes() {
  const sb = await supabaseAdmin()
  const codigos = new Set()
  for (let de = 0; ; de += 1000) {
    const { data, error } = await sb.from('pecas').select('codigo').range(de, de + 999)
    if (error) throw error
    data.forEach((p) => codigos.add(p.codigo.toLowerCase()))
    if (data.length < 1000) break
  }
  return codigos
}

/** Grava uma peça e as fotos dela. Se algo falhar no meio, desfaz tudo da peça. */
async function importarPeca(item) {
  const sb = await supabaseAdmin()
  const { data: peca, error } = await sb.from('pecas').insert(item.dados).select('id, codigo').single()
  if (error) {
    if (error.code === '23505') return { ok: false, motivo: 'Já existe uma peça com este ID.' }
    throw error
  }

  const enviados = []
  try {
    for (const [ordem, f] of item.fotos.entries()) {
      const blob = await prepararFoto(f.arquivo)
      const ext = blob.type === 'image/webp' ? 'webp' : f.extensao || 'jpg'
      const caminho = `${peca.id}/${Date.now()}-${ordem}.${ext}`
      const { error: erroEnvio } = await sb.storage.from('pecas').upload(caminho, blob, {
        contentType: blob.type || f.arquivo.type,
        cacheControl: '31536000',
      })
      if (erroEnvio) throw erroEnvio
      enviados.push(caminho)
      const { error: erroFoto } = await sb.from('peca_fotos').insert({
        peca_id: peca.id,
        caminho,
        ordem,
        recortada: f.recortada,
        gerada_por_ia: f.ia,
        alt: item.dados.titulo,
      })
      if (erroFoto) throw erroFoto
    }
    return { ok: true, codigo: peca.codigo }
  } catch (e) {
    // não deixa peça pela metade: apaga os arquivos e a peça (as linhas de foto caem junto)
    try {
      if (enviados.length) await sb.storage.from('pecas').remove(enviados)
      await sb.from('pecas').delete().eq('id', peca.id)
    } catch {
      /* se nem a limpeza funcionar, a peça fica oculta de qualquer jeito: a Wirlla vê e apaga no painel */
    }
    return { ok: false, motivo: `Falha ao enviar as fotos: ${mensagemErro(e)}` }
  }
}

export default function Importar() {
  const entradaPlanilha = useRef(null)
  const entradaFotos = useRef(null)
  const entradaPasta = useRef(null)

  const [planilha, setPlanilha] = useState(null) // { nome, linhas }
  const [fotos, setFotos] = useState([]) // File[]
  const [existentes, setExistentes] = useState(new Set())
  const [lendo, setLendo] = useState(false)
  const [erro, setErro] = useState('')
  const [fase, setFase] = useState('preparar') // preparar | importando | pronto
  const [resultado, setResultado] = useState({}) // linha -> { situacao, motivo, codigo }
  const [mostrarOrfas, setMostrarOrfas] = useState(false)

  // a pasta precisa do atributo não padrão webkitdirectory
  useEffect(() => {
    entradaPasta.current?.setAttribute('webkitdirectory', '')
  }, [])

  const analise = useMemo(() => {
    if (!planilha) return null
    const lida = lerPlanilha(planilha.linhas, { codigosExistentes: existentes })
    if (lida.erroGeral) return { erroGeral: lida.erroGeral, itens: [], orfas: [] }
    const { fotosPorLinha, orfas } = ligarFotos(lida.itens, fotos)
    return { erroGeral: null, itens: classificar(lida.itens, fotosPorLinha), orfas }
  }, [planilha, fotos, existentes])

  const itens = useMemo(() => analise?.itens ?? [], [analise])
  const contagem = useMemo(() => {
    const c = { pronta: 0, erro: 0, existe: 0, 'sem-foto': 0 }
    itens.forEach((i) => (c[i.situacao] += 1))
    return c
  }, [itens])

  async function escolherPlanilha(e) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    setErro('')
    setLendo(true)
    try {
      const { readSheet } = await import('read-excel-file/browser')
      const linhas = await readSheet(arquivo)
      const codigos = await buscarCodigosExistentes()
      setExistentes(codigos)
      setPlanilha({ nome: arquivo.name, linhas })
      setResultado({})
      setFase('preparar')
    } catch (err) {
      setPlanilha(null)
      setErro(
        /xlsx|zip|corrupt|not a valid|Invalid|central directory/i.test(err?.message || '')
          ? 'Não consegui abrir este arquivo. Use uma planilha do Excel (.xlsx), de preferência a partir do modelo.'
          : mensagemErro(err),
      )
    } finally {
      setLendo(false)
    }
  }

  function escolherFotos(e) {
    // a pasta pode trazer arquivos que não são foto (Thumbs.db, .DS_Store...): ficam de fora
    const novos = Array.from(e.target.files || []).filter((f) => EXTENSOES.includes(f.name.split('.').pop().toLowerCase()))
    e.target.value = ''
    if (novos.length === 0) return
    setFotos((atuais) => {
      // junta sem repetir o mesmo arquivo escolhido duas vezes
      const vistos = new Set(atuais.map((f) => `${f.name}|${f.size}|${f.lastModified}`))
      return [...atuais, ...novos.filter((f) => !vistos.has(`${f.name}|${f.size}|${f.lastModified}`))]
    })
    setResultado({})
    setFase('preparar')
  }

  async function importar() {
    const fila = itens.filter((i) => i.situacao === 'pronta')
    if (fila.length === 0) return
    setErro('')
    setFase('importando')
    setResultado(Object.fromEntries(fila.map((i) => [i.linha, { situacao: 'importando' }])))

    let proximo = 0
    async function trabalhador() {
      while (proximo < fila.length) {
        const item = fila[proximo++]
        let r
        try {
          r = await importarPeca(item)
        } catch (e) {
          r = { ok: false, motivo: mensagemErro(e) }
        }
        setResultado((atual) => ({
          ...atual,
          [item.linha]: r.ok ? { situacao: 'importada', codigo: r.codigo } : { situacao: 'falhou', motivo: r.motivo },
        }))
      }
    }
    await Promise.all(Array.from({ length: Math.min(PECAS_EM_PARALELO, fila.length) }, trabalhador))
    setFase('pronto')
  }

  function recomecar() {
    setPlanilha(null)
    setFotos([])
    setResultado({})
    setErro('')
    setFase('preparar')
  }

  const emAndamento = fase === 'importando'
  const feitas = Object.values(resultado).filter((r) => r.situacao === 'importada' || r.situacao === 'falhou').length
  const totalFila = Object.keys(resultado).length
  const importadas = Object.values(resultado).filter((r) => r.situacao === 'importada').length
  const falhas = Object.values(resultado).filter((r) => r.situacao === 'falhou').length

  return (
    <main className="adm-pagina">
      <div className="adm-cabeca">
        <div>
          <h1>Importar peças</h1>
          <p>Cadastre várias peças de uma vez com uma planilha do Excel e as fotos.</p>
        </div>
        <a className="adm-botao adm-botao--vazado" href="/modelo-importacao-pecas.xlsx" download>
          <Download size={18} aria-hidden="true" /> Baixar modelo
        </a>
      </div>

      <section className="adm-imp-passos" aria-label="Escolha os arquivos">
        <div className="adm-cartao adm-imp-passo">
          <h2>
            <span>1</span> Planilha
          </h2>
          <p className="adm-dica">Use o modelo. Uma peça por linha; as instruções estão na segunda aba.</p>
          <input ref={entradaPlanilha} type="file" accept=".xlsx" hidden onChange={escolherPlanilha} />
          <button
            type="button"
            className="adm-botao adm-botao--vazado"
            onClick={() => entradaPlanilha.current?.click()}
            disabled={emAndamento || lendo}
          >
            <FileSpreadsheet size={18} aria-hidden="true" /> {planilha ? 'Trocar planilha' : 'Escolher planilha'}
          </button>
          {lendo && <p className="adm-dica" role="status">Lendo a planilha…</p>}
          {planilha && !lendo && <p className="adm-imp-arquivo">{planilha.nome}</p>}
        </div>

        <div className="adm-cartao adm-imp-passo">
          <h2>
            <span>2</span> Fotos
          </h2>
          <p className="adm-dica">
            O nome da foto é o ID da peça: <code>A127.jpg</code>, <code>A127_2.jpg</code>. Peça sem ID: <code>linha5.jpg</code>.
          </p>
          <input ref={entradaFotos} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={escolherFotos} />
          <input ref={entradaPasta} type="file" multiple hidden onChange={escolherFotos} />
          <div className="adm-imp-botoes">
            <button type="button" className="adm-botao adm-botao--vazado" onClick={() => entradaFotos.current?.click()} disabled={emAndamento}>
              <Images size={18} aria-hidden="true" /> Escolher fotos
            </button>
            <button type="button" className="adm-botao adm-botao--vazado" onClick={() => entradaPasta.current?.click()} disabled={emAndamento}>
              <FolderOpen size={18} aria-hidden="true" /> Escolher pasta
            </button>
          </div>
          {fotos.length > 0 && (
            <p className="adm-imp-arquivo">
              {fotos.length} {fotos.length === 1 ? 'arquivo' : 'arquivos'}
              {!emAndamento && (
                <>
                  {' · '}
                  <button type="button" className="adm-link" onClick={() => setFotos([])}>
                    limpar
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      </section>

      {erro && (
        <p className="adm-erro" role="alert">
          {erro}
        </p>
      )}
      {analise?.erroGeral && (
        <p className="adm-erro" role="alert">
          {analise.erroGeral}
        </p>
      )}

      {analise && !analise.erroGeral && (
        <section aria-label="Prévia da importação" className="adm-imp-previa">
          <div className="adm-imp-resumo" role="status">
            <strong>{itens.length} {itens.length === 1 ? 'peça' : 'peças'} na planilha</strong>
            <span data-tipo="pronta">{contagem.pronta} prontas</span>
            {contagem['sem-foto'] > 0 && <span data-tipo="sem-foto">{contagem['sem-foto']} sem foto</span>}
            {contagem.erro > 0 && <span data-tipo="erro">{contagem.erro} com erro</span>}
            {contagem.existe > 0 && <span data-tipo="existe">{contagem.existe} já existem</span>}
          </div>

          {analise.orfas.length > 0 && (
            <div className="adm-imp-orfas">
              <p>
                <strong>{analise.orfas.length}</strong> {analise.orfas.length === 1 ? 'foto não foi ligada' : 'fotos não foram ligadas'} a nenhuma
                peça (nome diferente do ID).{' '}
                <button type="button" className="adm-link" onClick={() => setMostrarOrfas((v) => !v)}>
                  {mostrarOrfas ? 'esconder' : 'ver quais'}
                </button>
              </p>
              {mostrarOrfas && (
                <ul>
                  {analise.orfas.slice(0, 100).map((f, i) => (
                    <li key={`${f.name}-${i}`}>{f.name}</li>
                  ))}
                  {analise.orfas.length > 100 && <li>… e mais {analise.orfas.length - 100}</li>}
                </ul>
              )}
            </div>
          )}

          <div className="adm-imp-tabela" role="region" aria-label="Peças da planilha" tabIndex={0}>
            <table>
              <thead>
                <tr>
                  <th>Linha</th>
                  <th>ID</th>
                  <th>Peça</th>
                  <th>Tam.</th>
                  <th>Preço</th>
                  <th>Fotos</th>
                  <th>Situação</th>
                </tr>
              </thead>
              <tbody>
                {itens.map((i) => {
                  const r = resultado[i.linha]
                  const situacao = r?.situacao || i.situacao
                  return (
                    <tr key={i.linha} data-situacao={situacao}>
                      <td>{i.linha}</td>
                      <td>{r?.codigo || i.codigo || <span className="adm-dica">auto</span>}</td>
                      <td>{i.dados.titulo || '—'}</td>
                      <td>{i.dados.tamanho || '—'}</td>
                      <td>{i.dados.preco != null && !Number.isNaN(i.dados.preco) ? formatarPreco(i.dados.preco) : '—'}</td>
                      <td>{i.fotos.length}</td>
                      <td>
                        <span className="adm-imp-selo" data-situacao={situacao}>
                          {ROTULO[situacao]}
                        </span>
                        {r?.motivo && <span className="adm-imp-motivo">{r.motivo}</span>}
                        {!r && i.situacao === 'sem-foto' && <span className="adm-imp-motivo">Nenhuma foto real com este nome.</span>}
                        {!r && i.situacao === 'existe' && <span className="adm-imp-motivo">Este ID já está no site; será pulada.</span>}
                        {!r && i.erros.map((m) => (
                          <span key={m} className="adm-imp-motivo">{m}</span>
                        ))}
                        {!r && i.avisos.map((m) => (
                          <span key={m} className="adm-imp-motivo adm-imp-motivo--aviso">{m}</span>
                        ))}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {fase !== 'pronto' && (
            <div className="adm-imp-rodape">
              {emAndamento ? (
                <div className="adm-imp-progresso" role="status" aria-live="polite">
                  <progress max={totalFila} value={feitas} />
                  <span>
                    {feitas} de {totalFila} peças. Não feche esta tela.
                  </span>
                </div>
              ) : (
                <>
                  <button type="button" className="adm-botao" onClick={importar} disabled={contagem.pronta === 0}>
                    Importar {contagem.pronta} {contagem.pronta === 1 ? 'peça' : 'peças'}
                  </button>
                  <p className="adm-dica">
                    {contagem.pronta === 0
                      ? 'Nenhuma linha está pronta ainda. Corrija a planilha ou escolha as fotos.'
                      : 'Linhas com erro, sem foto ou que já existem ficam de fora. As peças entram com o status da planilha.'}
                  </p>
                </>
              )}
            </div>
          )}

          {fase === 'pronto' && (
            <div className="adm-imp-fim">
              <p className={falhas ? 'adm-erro' : 'adm-ok'} role="status">
                {importadas} {importadas === 1 ? 'peça importada' : 'peças importadas'}
                {falhas > 0 && `, ${falhas} ${falhas === 1 ? 'falhou' : 'falharam'} (veja o motivo na tabela)`}.
              </p>
              <div className="adm-imp-botoes">
                <Link to="/admin" className="adm-botao">
                  Ver as peças
                </Link>
                <button type="button" className="adm-botao adm-botao--vazado" onClick={recomecar}>
                  Importar outra planilha
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
