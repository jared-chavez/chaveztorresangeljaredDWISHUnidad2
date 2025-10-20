import { Routes, Route, Link } from 'react-router-dom'
import NewsList from './pages/NewsList'
import NewsForm from './pages/NewsForm'

export default function App() {
  return (
    <div>
      <nav style={{ padding: 12, borderBottom: '1px solid #2a2a2a' }}>
        <Link to="/">Inicio</Link>
      </nav>
      <Routes>
        <Route path="/" element={<NewsList />} />
        <Route path="/create" element={<NewsForm />} />
        <Route path="/edit/:id" element={<NewsForm />} />
      </Routes>
    </div>
  )
}


