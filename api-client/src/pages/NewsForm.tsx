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
    <div style={{ maxWidth: 720, margin: '0 auto', padding: 16 }}>
      <h1>{isEdit ? 'Editar' : 'Crear'} noticia</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <input id="title" name="title" placeholder="Título" required minLength={3} maxLength={120} disabled={loading} />
        <textarea id="content" name="content" placeholder="Contenido" required minLength={10} disabled={loading} />
        <input id="author" name="author" placeholder="Autor" required minLength={2} maxLength={60} disabled={loading} />
        <input id="category" name="category" placeholder="Categoría" required minLength={2} maxLength={40} disabled={loading} />

        <div style={{ display: 'grid', gap: 8 }}>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={onFileChange} disabled={loading} />
          {previewUrl && (
            <img src={previewUrl} alt="preview" style={{ width: 200, height: 200, objectFit: 'cover', borderRadius: 8 }} />
          )}
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading}>{isEdit ? 'Guardar cambios' : 'Crear'}</button>
          <Link to="/"><button type="button" disabled={loading}>Cancelar</button></Link>
        </div>
      </form>
    </div>
  )
}


