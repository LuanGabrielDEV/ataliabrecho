import { Suspense, lazy, useEffect } from 'react'
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
import Gaveta from './features/sacola/Gaveta'
import NossaHistoria from './pages/NossaHistoria'
import Consigne from './pages/Consigne'
import Duvidas from './pages/Duvidas'
import Politicas from './pages/Politicas'
import { CatalogoProvider } from './data/catalogo'

// O painel só é baixado por quem acessa /admin
const AdminApp = lazy(() => import('./admin/AdminApp'))

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
    if (!window.location.hash) window.scrollTo(0, 0)
  }, [pathname])

  // Revelação suave das seções ao entrar na tela
  useEffect(() => {
    const io = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('revelado')
            io.unobserve(e.target)
          }
        }),
      { rootMargin: '0px 0px -8% 0px' },
    )
    const t = setTimeout(() => document.querySelectorAll('.revelar:not(.revelado)').forEach((el) => io.observe(el)), 50)
    return () => {
      clearTimeout(t)
      io.disconnect()
    }
  }, [pathname])

  const noAdmin = pathname.startsWith('/admin')
  const semMoldura = pathname === '/avise-me' || noAdmin

  if (noAdmin) {
    return (
      <Suspense fallback={<main className="em-breve conteiner">Carregando o painel…</main>}>
        <Routes>
          <Route path="/admin/*" element={<AdminApp />} />
        </Routes>
      </Suspense>
    )
  }

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
        <Route path="/consigne" element={<Consigne />} />
        <Route path="/duvidas" element={<Duvidas />} />
        <Route path="/politicas" element={<Politicas />} />
        <Route path="/nossa-historia" element={<NossaHistoria />} />
        <Route path="*" element={<EmBreve titulo="Página não encontrada" />} />
      </Routes>
      {!semMoldura && <Rodape />}
      <Gaveta />
      {!semMoldura && <AviseMeFaixa />}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <CatalogoProvider>
        <SacolaProvider>
          <Layout />
        </SacolaProvider>
      </CatalogoProvider>
    </BrowserRouter>
  )
}
