const API_BASE = import.meta.env.VITE_API_BASE_URL || ''

export type News = {
  id: number
  title: string
  content: string
  author: string
  category: string
  createdAt: string
  updatedAt: string
}

export function getImageUrl(id: number) {
  const base = API_BASE || ''
  return `${base}/api/news/${id}/image`
}

export async function listNews(params: { q?: string; page?: number; pageSize?: number } = {}) {
  const usp = new URLSearchParams()
  if (params.q) usp.set('q', params.q)
  if (params.page) usp.set('page', String(params.page))
  if (params.pageSize) usp.set('pageSize', String(params.pageSize))
  const url = `${API_BASE}/api/news${usp.toString() ? `?${usp.toString()}` : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const items: News[] = await res.json()
  const total = Number(res.headers.get('X-Total-Count') || items.length)
  const page = Number(res.headers.get('X-Page') || params.page || 1)
  const pageSize = Number(res.headers.get('X-Page-Size') || params.pageSize || items.length)
  const totalPages = Number(res.headers.get('X-Total-Pages') || 1)
  return { items, total, page, pageSize, totalPages }
}

export async function getNews(id: number) {
  const res = await fetch(`${API_BASE}/api/news/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return (await res.json()) as News
}

function toFormData(data: Record<string, unknown>) {
  const fd = new FormData()
  Object.entries(data).forEach(([k, v]) => {
    if (v === undefined || v === null) return
    if (v instanceof File) fd.append(k, v)
    else fd.append(k, String(v))
  })
  return fd
}

export async function createNews(data: {
  title: string
  content: string
  author: string
  category: string
  image?: File | null
}) {
  const res = await fetch(`${API_BASE}/api/news`, {
    method: 'POST',
    body: toFormData({ ...data, image: data.image || undefined }),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as News
}

export async function updateNews(id: number, data: {
  title?: string
  content?: string
  author?: string
  category?: string
  image?: File | null
}) {
  // If only image should change, call updateImage instead
  const res = await fetch(`${API_BASE}/api/news/${id}`, {
    method: 'PUT',
    body: toFormData({ ...data, image: data.image || undefined }),
  })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as News
}

export async function updateNewsImage(id: number, image: File) {
  const fd = new FormData()
  fd.append('image', image)
  const res = await fetch(`${API_BASE}/api/news/${id}/image`, { method: 'PUT', body: fd })
  if (!res.ok) throw new Error(await res.text())
  return (await res.json()) as News
}

export async function deleteNews(id: number) {
  const res = await fetch(`${API_BASE}/api/news/${id}`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) throw new Error(await res.text())
}

export async function deleteNewsImage(id: number) {
  const res = await fetch(`${API_BASE}/api/news/${id}/image`, { method: 'DELETE' })
  if (!res.ok && res.status !== 204) throw new Error(await res.text())
}


