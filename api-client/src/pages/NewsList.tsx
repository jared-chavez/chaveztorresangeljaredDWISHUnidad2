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
    <div>
      {/* Header Section */}
      <div className="content-header">
        <h1 className="content-title">Dashboard</h1>
        <p className="content-subtitle">Gestiona y administra todas las noticias de 31 Minutos</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-card-title">Total de Noticias</h3>
          </div>
          <p className="stat-card-value">{total}</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-card-title">TV</h3>
          </div>
          <p className="stat-card-value">{items.filter(n => n.category === 'TV').length}</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-card-title">ENTRETENIMIENTO</h3>
          </div>
          <p className="stat-card-value">{items.filter(n => n.category === 'ENTRETENIMIENTO').length}</p>
        </div>
        
        <div className="stat-card">
          <div className="stat-card-header">
            <h3 className="stat-card-title">MÚSICA</h3>
          </div>
          <p className="stat-card-value">{items.filter(n => n.category === 'MUSICA').length}</p>
        </div>
      </div>

      {/* Search and Actions */}
      <div className="search-form">
        <form onSubmit={onSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
          <input 
            name="q" 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            placeholder="Buscar noticias..." 
          />
          <button type="submit" disabled={!search || search.trim().length === 0}>
            Buscar
          </button>
          <button 
            type="button" 
            onClick={() => { setSearch(''); setSp({ page: '1', pageSize: String(pageSize) }) }} 
            title="Cargar todas"
          >
            ⟳
          </button>
        </form>
        <Link to="/create" className="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Crear Noticia
        </Link>
      </div>

      {/* Content Section */}
      <div className="content-section">
        <div className="section-header">
          <h2 className="section-title">Noticias Recientes</h2>
        </div>
        
        {loading && <div className="loading">Cargando noticias...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && items.length === 0 && (
          <div className="empty-state">
            <h3>No hay noticias</h3>
            <p>Comienza creando tu primera noticia</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <table className="news-table">
            <thead>
              <tr>
                <th>Noticia</th>
                <th>Autor</th>
                <th>Categoría</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((n) => (
                <tr key={n.id}>
                  <td>
                    <div className="news-item">
                      <img 
                        src={getImageUrl(n.id)} 
                        alt="thumbnail" 
                        className="news-thumbnail"
                        onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} 
                      />
                      <div className="news-content">
                        <h3 className="news-title">{n.title}</h3>
                        <p className="news-meta">{n.content.substring(0, 100)}...</p>
                      </div>
                    </div>
                  </td>
                  <td>{n.author}</td>
                  <td>
                    <span className={`status-badge ${
                      n.category === 'TV' ? 'status-published' : 
                      n.category === 'ENTRETENIMIENTO' ? 'status-draft' : 'status-archived'
                    }`}>
                      {n.category}
                    </span>
                  </td>
                  <td>
                    <div className="news-actions">
                      <Link to={`/edit/${n.id}`} className="btn btn-sm">
                        Editar
                      </Link>
                      <button 
                        onClick={() => onDelete(n.id)} 
                        className="btn btn-sm btn-danger"
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && items.length > 0 && (
        <div className="pagination">
          <button 
            disabled={page <= 1} 
            onClick={() => setSp({ q, page: String(page - 1), pageSize: String(pageSize) })}
          >
            Anterior
          </button>
          <span>Página {page} de {totalPages}</span>
          <button 
            disabled={page >= totalPages} 
            onClick={() => setSp({ q, page: String(page + 1), pageSize: String(pageSize) })}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {confirmId != null && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 className="modal-title">Confirmar eliminación</h3>
            <p>¿Estás seguro de que quieres eliminar esta noticia? Esta acción no se puede deshacer.</p>
            <div className="modal-actions">
              <button 
                onClick={() => setConfirmId(null)} 
                disabled={deleting}
                className="btn"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete} 
                disabled={deleting} 
                className="btn btn-danger"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


