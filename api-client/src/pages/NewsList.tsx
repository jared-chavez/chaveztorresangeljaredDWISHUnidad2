import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { deleteNews, getImageUrl, listNews, News } from '../services/newsService'
import toast from 'react-hot-toast'

export default function NewsList() {
  const [items, setItems] = useState<News[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sp, setSp] = useSearchParams()
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
  const pageSize = Math.max(1, parseInt(sp.get('pageSize') || '10', 10))
  const q = sp.get('q') || ''
  const [search, setSearch] = useState(q)

  // Keep local input in sync when URL param changes externally
  useEffect(() => {
    setSearch(q)
  }, [q])

  useEffect(() => {
    setLoading(true)
    listNews({ q, page, pageSize })
      .then(({ items, total }) => {
        setItems(items)
        setTotal(total)
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [q, page, pageSize])

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize])

  function onSearchSubmit(e: React.FormEvent) {
    e.preventDefault()
    const nq = search || ''
    setSp((prev) => {
      const nx = new URLSearchParams(prev)
      if (nq) nx.set('q', nq); else nx.delete('q')
      nx.set('page', '1')
      return nx
    })
  }

  function onDelete(id: number) {
    setConfirmId(id)
  }

  async function confirmDelete() {
    if (confirmId == null) return
    setDeleting(true)
    try {
      await toast.promise(deleteNews(confirmId), {
        loading: 'Eliminando...',
        success: 'Eliminada',
        error: 'Error al eliminar',
      })
      setItems((prev) => prev.filter((n) => n.id !== confirmId))
      setConfirmId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div style={{ maxWidth: 980, margin: '0 auto', padding: 16 }}>
      <h1>Noticias - 31 Minutos</h1>

      <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
        <form onSubmit={onSearchSubmit} style={{ display: 'flex', gap: 8 }}>
          <input name="q" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
          <button type="submit" disabled={!search || search.trim().length === 0}>Buscar</button>
          <button type="button" onClick={() => { setSearch(''); setSp({ page: '1', pageSize: String(pageSize) }) }} title="Load all">⟳</button>
        </form>
        <Link to="/create"><button>Crear</button></Link>
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {!loading && items.length === 0 && <p>Sin resultados.</p>}

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 12 }}>
        {items.map((n) => (
          <li key={n.id} style={{ border: '1px solid #2a2a2a', borderRadius: 8, padding: 12 }}>
            <div style={{ display: 'flex', gap: 12 }}>
              <img src={getImageUrl(n.id)} alt="thumb" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: 0 }}>{n.title}</h2>
                <p style={{ margin: '8px 0 0 0', color: '#bbb' }}>{n.content}</p>
                <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>Autor: {n.author} · Categoría: {n.category}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Link to={`/edit/${n.id}`}><button>Editar</button></Link>
              <button onClick={() => onDelete(n.id)} style={{ color: 'white', background: '#b00020' }}>Eliminar</button>
            </div>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button disabled={page <= 1} onClick={() => setSp({ q, page: String(page - 1), pageSize: String(pageSize) })}>Anterior</button>
        <span>Página {page} de {totalPages}</span>
        <button disabled={page >= totalPages} onClick={() => setSp({ q, page: String(page + 1), pageSize: String(pageSize) })}>Siguiente</button>
      </div>

      {confirmId != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'grid', placeItems: 'center' }}>
          <div style={{ background: '#111', color: '#fff', padding: 16, borderRadius: 8, width: 360 }}>
            <h3 style={{ marginTop: 0 }}>Confirmar eliminación</h3>
            <p>¿Eliminar esta noticia?</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() => setConfirmId(null)} disabled={deleting}>Cancelar</button>
              <button onClick={confirmDelete} disabled={deleting} style={{ color: 'white', background: '#b00020' }}>
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


