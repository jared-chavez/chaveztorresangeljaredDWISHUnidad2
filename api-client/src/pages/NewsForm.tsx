import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { createNews, getImageUrl, getNews, updateNews } from '../services/newsService'
import toast from 'react-hot-toast'

export default function NewsForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    if (!isEdit) return
    setLoading(true)
    getNews(Number(id))
      .then((n) => {
        (document.getElementById('title') as HTMLInputElement).value = n.title
        ;(document.getElementById('content') as HTMLTextAreaElement).value = n.content
        ;(document.getElementById('author') as HTMLInputElement).value = n.author
        ;(document.getElementById('category') as HTMLInputElement).value = n.category
        setPreviewUrl(getImageUrl(n.id))
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isEdit, id])

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (f) setPreviewUrl(URL.createObjectURL(f))
    else setPreviewUrl(null)
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const fd = new FormData(e.target as HTMLFormElement)
    const dto = {
      title: String(fd.get('title') || ''),
      content: String(fd.get('content') || ''),
      author: String(fd.get('author') || ''),
      category: String(fd.get('category') || ''),
      image: (fileRef.current?.files?.[0] as File | undefined) || null,
    }
    try {
      if (isEdit) {
        await toast.promise(updateNews(Number(id), dto), {
          loading: 'Guardando...',
          success: 'Actualizado',
          error: 'Error al actualizar',
        })
      } else {
        await toast.promise(createNews(dto), {
          loading: 'Creando...',
          success: 'Creado',
          error: 'Error al crear',
        })
      }
      navigate('/')
    } catch (e: any) {
      setError(e.message || 'Error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header Section */}
      <div className="content-header">
        <h1 className="content-title">{isEdit ? 'Editar Noticia' : 'Crear Nueva Noticia'}</h1>
        <p className="content-subtitle">
          {isEdit ? 'Modifica los detalles de la noticia' : 'Completa la información para crear una nueva noticia'}
        </p>
      </div>

      {/* Form Section */}
      <div className="content-section">
        <div style={{ padding: '2rem' }}>
          {error && <div className="error">{error}</div>}
          
          <form onSubmit={onSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="title">Título de la Noticia</label>
              <input 
                id="title" 
                name="title" 
                placeholder="Ingresa un título atractivo para tu noticia" 
                required 
                minLength={3} 
                maxLength={120} 
                disabled={loading} 
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Contenido</label>
              <textarea 
                id="content" 
                name="content" 
                placeholder="Escribe el contenido completo de la noticia..." 
                required 
                minLength={10} 
                disabled={loading} 
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label htmlFor="author">Autor</label>
                <input 
                  id="author" 
                  name="author" 
                  placeholder="Nombre del autor" 
                  required 
                  minLength={2} 
                  maxLength={60} 
                  disabled={loading} 
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Categoría</label>
                <select 
                  id="category" 
                  name="category" 
                  required 
                  disabled={loading}
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem', 
                    border: '1px solid var(--border-color)', 
                    borderRadius: 'var(--radius)', 
                    fontSize: '0.875rem', 
                    fontFamily: 'inherit' 
                  }}
                >
                  <option value="">Selecciona una categoría</option>
                  <option value="TV">TV</option>
                  <option value="ENTRETENIMIENTO">ENTRETENIMIENTO</option>
                  <option value="MUSICA">MÚSICA</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Imagen de la Noticia</label>
              <input 
                ref={fileRef} 
                type="file" 
                accept="image/png,image/jpeg,image/webp" 
                onChange={onFileChange} 
                disabled={loading}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: 'var(--radius)', 
                  fontSize: '0.875rem' 
                }}
              />
              {previewUrl && (
                <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                  <img 
                    src={previewUrl} 
                    alt="preview" 
                    style={{ 
                      maxWidth: '300px', 
                      maxHeight: '200px', 
                      objectFit: 'cover', 
                      borderRadius: 'var(--radius-lg)',
                      border: '1px solid var(--border-color)',
                      boxShadow: 'var(--shadow-sm)'
                    }} 
                  />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                disabled={loading}
                className="btn btn-primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                {loading ? (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    {isEdit ? 'Guardando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                      <polyline points="17,21 17,13 7,13 7,21"/>
                      <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    {isEdit ? 'Guardar Cambios' : 'Crear Noticia'}
                  </>
                )}
              </button>
              
              <Link to="/" className="btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
                Cancelar
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}


