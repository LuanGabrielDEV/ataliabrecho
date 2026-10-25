import { useEffect } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import Cabecalho from './components/Cabecalho'
import Rodape from './components/Rodape'
import { SacolaProvider } from './features/sacola/Sacola'
import AviseMeFaixa from './features/avise-me/AviseMeFaixa'
import AviseMePage from './pages/AviseMePage'
import Inicio from './pages/Inicio'
import SacolaPage from './pages/SacolaPage'
import Comprar from './pages/Comprar'
import Peca from './pages/Peca'

// Páginas que ainda vão ser construídas
function EmBreve({ titulo }) {
  useEffect(() => {
    document.title = `${titulo} · Atalia Brechó`
  }, [titulo])
  return (
    <main id="conteudo" className="em-breve conteiner">
      <h1>{titulo}</h1>
      <p>Esta página está sendo preparada.</p>
      <Link to="/">Voltar ao início</Link>
    </main>
  )
}

function Layout() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  const semMoldura = pathname === '/avise-me'

  return (
    <>
      <a href="#conteudo" className="pular">Pular para o conteúdo</a>
      {!semMoldura && <Cabecalho />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/sacola" element={<SacolaPage />} />
        <Route path="/avise-me" element={<AviseMePage />} />
        <Route path="/comprar" element={<Comprar />} />
        <Route path="/peca/:id" element={<Peca />} />
        <Route path="/consigne" element={<EmBreve titulo="Consigne suas peças" />} />
        <Route path="/duvidas" element={<EmBreve titulo="Dúvidas e contato" />} />
        <Route path="/politicas" element={<EmBreve titulo="Políticas e termos" />} />
        <Route path="/nossa-historia" element={<EmBreve titulo="Nossa história" />} />
        <Route path="*" element={<EmBreve titulo="Página não encontrada" />} />
      </Routes>
      {!semMoldura && <Rodape />}
      {!semMoldura && !pathname.startsWith('/admin') && <AviseMeFaixa />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <SacolaProvider>
        <Layout />
      </SacolaProvider>
    </BrowserRouter>
  )
}
