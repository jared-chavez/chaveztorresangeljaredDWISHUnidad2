import { useEffect, useState } from 'react'

type News = {
  id: number
  title: string
  content: string
  author: string
  category: string
  imageUrl?: string
  createdAt: string
  updatedAt: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

export default function App() {
  const [news, setNews] = useState<News[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const url = API_BASE_URL ? `${API_BASE_URL}/api/news` : '/api/news'
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setNews)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p style={{ padding: 16 }}>Cargando noticias...</p>
  if (error) return <p style={{ padding: 16, color: 'red' }}>Error: {error}</p>

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: 16 }}>
      <h1 style={{ marginBottom: 12 }}>Noticias - 31 Minutos</h1>
      {news.length === 0 ? (
        <p>No hay noticias</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
          {news.map((n) => (
            <li key={n.id} style={{ border: '1px solid #ddd', borderRadius: 8, padding: 12 }}>
              <h2 style={{ margin: 0 }}>{n.title}</h2>
              <p style={{ margin: '8px 0 0 0', color: '#555' }}>{n.content}</p>
              <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
                <span>Autor: {n.author}</span> · <span>Categoría: {n.category}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}


