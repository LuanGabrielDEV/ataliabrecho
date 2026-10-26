import { useCallback, useEffect, useState } from 'react'
import { NavLink, Route, Routes } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { LogoHorizontal } from '../components/Marca'
import { modoDemonstracao } from '../lib/supabase'
import { mensagemErro, supabaseAdmin } from './supabaseAdmin'
import Entrar from './Entrar'
import ListaPecas from './ListaPecas'
import FormPeca from './FormPeca'
import Avisos from './Avisos'
import './admin.css'

function NovaSenha({ aoTerminar }) {
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  async function salvar(e) {
    e.preventDefault()
    if (senha.length < 8) return setErro('Use pelo menos 8 caracteres.')
    try {
      const sb = await supabaseAdmin()
      const { error } = await sb.auth.updateUser({ password: senha })
      if (error) throw error
      aoTerminar()
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }
  return (
    <main className="adm-centro">
      <form className="adm-cartao adm-entrar" onSubmit={salvar}>
        <h1>Criar nova senha</h1>
        <label className="adm-campo">
          <span>Nova senha</span>
          <input type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} />
        </label>
        {erro && <p className="adm-erro" role="alert">{erro}</p>}
        <button type="submit" className="adm-botao">Salvar senha</button>
      </form>
    </main>
  )
}

function useSessao() {
  const [estado, setEstado] = useState({ carregando: true, usuario: null, admin: false, erro: null })
  const [recuperando, setRecuperando] = useState(false)

  const verificar = useCallback(async (sessao) => {
    if (!sessao) {
      setEstado({ carregando: false, usuario: null, admin: false, erro: null })
      return
    }
    try {
      const sb = await supabaseAdmin()
      const { data, error } = await sb.rpc('is_admin')
      if (error) throw error
      setEstado({ carregando: false, usuario: sessao.user, admin: !!data, erro: null })
    } catch (e) {
      setEstado({ carregando: false, usuario: sessao.user, admin: false, erro: mensagemErro(e) })
    }
  }, [])

  useEffect(() => {
    if (modoDemonstracao) {
      setEstado({ carregando: false, usuario: null, admin: false, erro: 'Supabase não configurado.' })
      return
    }
    let inscricao
    supabaseAdmin().then(async (sb) => {
      const { data } = await sb.auth.getSession()
      verificar(data.session)
      inscricao = sb.auth.onAuthStateChange((evento, sessao) => {
        if (evento === 'PASSWORD_RECOVERY') setRecuperando(true)
        verificar(sessao)
      }).data.subscription
    })
    return () => inscricao?.unsubscribe()
  }, [verificar])

  return { ...estado, recuperando, fimRecuperacao: () => setRecuperando(false) }
}

export default function AdminApp() {
  const { carregando, usuario, admin, erro, recuperando, fimRecuperacao } = useSessao()

  useEffect(() => {
    document.title = 'Painel · Atalia Brechó'
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])

  if (carregando) return <main className="adm-centro">Carregando…</main>
  if (recuperando) return <NovaSenha aoTerminar={fimRecuperacao} />
  if (!usuario) return <Entrar />
  if (!admin) {
    return (
      <main className="adm-centro">
        <div className="adm-cartao">
          <h1>Sem acesso</h1>
          <p>
            O usuário <strong>{usuario.email}</strong> entrou, mas não está cadastrado como administradora.
            {erro && <> ({erro})</>}
          </p>
          <p className="adm-dica">
            No Supabase, rode o comando de cadastro de administradora que está no fim da migração 001.
          </p>
          <button type="button" className="adm-botao adm-botao--vazado" onClick={async () => (await supabaseAdmin()).auth.signOut()}>
            Sair
          </button>
        </div>
      </main>
    )
  }

  return (
    <div className="adm">
      <header className="adm-topo">
        <div className="adm-topo__marca">
          <LogoHorizontal />
          <span>Painel</span>
        </div>
        <nav className="adm-abas" aria-label="Painel">
          <NavLink to="/admin" end>
            Peças
          </NavLink>
          <NavLink to="/admin/avisos">Avise-me</NavLink>
          <a href="/" target="_blank" rel="noreferrer">
            Ver site
          </a>
        </nav>
        <button
          type="button"
          className="adm-sair"
          onClick={async () => (await supabaseAdmin()).auth.signOut()}
          aria-label="Sair do painel"
        >
          <LogOut size={18} aria-hidden="true" />
          <span>Sair</span>
        </button>
      </header>
      <Routes>
        <Route index element={<ListaPecas />} />
        <Route path="pecas/nova" element={<FormPeca />} />
        <Route path="pecas/:id" element={<FormPeca />} />
        <Route path="avisos" element={<Avisos />} />
      </Routes>
    </div>
  )
}
