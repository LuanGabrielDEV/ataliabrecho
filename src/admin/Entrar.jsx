import { useState } from 'react'
import { LogoHorizontal } from '../components/Marca'
import { mensagemErro, supabaseAdmin } from './supabaseAdmin'

export default function Entrar() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setAviso('')
    setEnviando(true)
    try {
      const sb = await supabaseAdmin()
      const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password: senha })
      if (error) throw error
    } catch (e) {
      setErro(mensagemErro(e))
    } finally {
      setEnviando(false)
    }
  }

  async function esqueci() {
    setErro('')
    if (!email.trim()) {
      setErro('Escreva seu e-mail acima para receber o link de nova senha.')
      return
    }
    try {
      const sb = await supabaseAdmin()
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${location.origin}/admin` })
      if (error) throw error
      setAviso('Enviamos um link para criar uma nova senha. Confira seu e-mail.')
    } catch (e) {
      setErro(mensagemErro(e))
    }
  }

  return (
    <main className="adm-centro">
      <form className="adm-cartao adm-entrar" onSubmit={entrar}>
        <div className="adm-entrar__marca">
          <LogoHorizontal titulo="Atalia Brechó" />
        </div>
        <h1>Painel da Atalia</h1>
        <label className="adm-campo">
          <span>E-mail</span>
          <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <label className="adm-campo">
          <span>Senha</span>
          <input type="password" autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>
        {erro && (
          <p className="adm-erro" role="alert">
            {erro}
          </p>
        )}
        {aviso && (
          <p className="adm-ok" role="status">
            {aviso}
          </p>
        )}
        <button type="submit" className="adm-botao" disabled={enviando}>
          {enviando ? 'Entrando…' : 'Entrar'}
        </button>
        <button type="button" className="adm-link" onClick={esqueci}>
          Esqueci a senha
        </button>
      </form>
    </main>
  )
}
