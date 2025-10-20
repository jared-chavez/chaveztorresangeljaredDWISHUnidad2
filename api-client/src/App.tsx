import { Routes, Route, Link, useLocation } from 'react-router-dom'
import NewsList from './pages/NewsList'
import NewsForm from './pages/NewsForm'

// Iconos SVG simples
const HomeIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9,22 9,12 15,12 15,22"/>
  </svg>
)

const PlusIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)


export default function App() {
  const location = useLocation()

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div style={{ padding: '1.5rem 0 0 0' }}>
          <Link to="/" className="dashboard-logo" style={{ display: 'block', padding: '0 1.5rem', marginBottom: '2rem' }}>
            31 Minutos
          </Link>
        </div>

        <nav>
          <ul className="sidebar-nav">
            <li>
              <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
                <HomeIcon />
                Dashboard
              </Link>
            </li>
            <li>
              <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>
                <PlusIcon />
                Crear Noticia
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-main">
        {/* Content */}
        <div className="dashboard-content">
          <Routes>
            <Route path="/" element={<NewsList />} />
            <Route path="/create" element={<NewsForm />} />
            <Route path="/edit/:id" element={<NewsForm />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}


