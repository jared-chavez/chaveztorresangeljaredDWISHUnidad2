import { Request, Response } from 'express';
import { getClient, query } from '../config/database';
import { News } from '../models/news';

type NewsRow = {
  id: number;
  title: string;
  content: string;
  author: string;
  category: string;
  created_at: string;
  updated_at: string;
  image_data?: Buffer | null;
  image_mime?: string | null;
};

function mapRowToNews(row: NewsRow): News {
  return {
    id: row.id,
    title: row.title,
    content: row.content,
    author: row.author,
    category: row.category,
    // imageUrl: undefined, // comentado: usamos GET /api/news/:id/image para la miniatura
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listNews(req: Request, res: Response) {
  try {
    const pageParam = Array.isArray(req.query.page) ? req.query.page[0] : req.query.page;
    const pageSizeParam = Array.isArray(req.query.pageSize) ? req.query.pageSize[0] : req.query.pageSize;

    let page = Math.max(1, parseInt((pageParam as string) || '1', 10));
    let pageSize = Math.max(1, parseInt((pageSizeParam as string) || '10', 10));
    if (Number.isNaN(page)) page = 1;
    if (Number.isNaN(pageSize)) pageSize = 10;
    if (pageSize > 50) pageSize = 50; // cap page size

    const offset = (page - 1) * pageSize;
    const qParam = Array.isArray(req.query.q) ? req.query.q[0] : req.query.q;
    const q = (qParam as string | undefined)?.trim();

    let total = 0;
    if (q && q.length > 0) {
      const like = `%${q}%`;
      const totalResult = await query<any>(
        `SELECT COUNT(*) AS count FROM news
         WHERE title ILIKE $1 OR author ILIKE $1 OR category ILIKE $1 OR content ILIKE $1`,
        [like]
      );
      total = parseInt(totalResult.rows[0].count as unknown as string, 10) || 0;
    } else {
      const totalResult = await query<any>('SELECT COUNT(*) AS count FROM news');
      total = parseInt(totalResult.rows[0].count as unknown as string, 10) || 0;
    }
    const totalPages = total === 0 ? 1 : Math.max(1, Math.ceil(total / pageSize));

    let rows: NewsRow[] = [] as any;
    if (q && q.length > 0) {
      const like = `%${q}%`;
      const resQ = await query<NewsRow>(
        `SELECT id, title, content, author, category, created_at, updated_at
         FROM news
         WHERE title ILIKE $1 OR author ILIKE $1 OR category ILIKE $1 OR content ILIKE $1
         ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
        [like, pageSize, offset]
      );
      rows = resQ.rows;
    } else {
      const resAll = await query<NewsRow>(
        'SELECT id, title, content, author, category, created_at, updated_at FROM news ORDER BY created_at DESC LIMIT $1 OFFSET $2',
        [pageSize, offset]
      );
      rows = resAll.rows;
    }

    // Set pagination headers while keeping body as array for compatibility
    res.setHeader('X-Total-Count', String(total));
    res.setHeader('X-Page', String(page));
    res.setHeader('X-Page-Size', String(pageSize));
    res.setHeader('X-Total-Pages', String(totalPages));

    res.json(rows.map(mapRowToNews));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving news', error });
  }
}

export async function getNewsById(req: Request, res: Response) {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isInteger(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const { rows } = await query<NewsRow>(
      'SELECT id, title, content, author, category, created_at, updated_at FROM news WHERE id = $1',
      [newsId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: `News with ID ${newsId} not found` });
    }

    res.json(mapRowToNews(rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving news', error });
  }
}

export async function getNewsImage(req: Request, res: Response) {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isInteger(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const { rows } = await query<NewsRow>(
      'SELECT image_data, image_mime FROM news WHERE id = $1',
      [newsId]
    );

    if (rows.length === 0 || !rows[0].image_data) {
      return res.status(404).json({ message: 'Image not found' });
    }

    res.setHeader('Content-Type', rows[0].image_mime || 'application/octet-stream');
    res.status(200).send(rows[0].image_data);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving image', error });
  }
}

export async function updateNewsImage(req: Request, res: Response) {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isInteger(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }
    const file = (req as any).file as Express.Multer.File | undefined;
    if (!file) {
      return res.status(400).json({ message: 'Image file is required' });
    }

    const { rows } = await query<NewsRow>(
      `UPDATE news SET image_data = $1, image_mime = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, title, content, author, category, created_at, updated_at`,
      [file.buffer, file.mimetype, newsId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: `News with ID ${newsId} not found` });
    }
    return res.json(mapRowToNews(rows[0]));
  } catch (error) {
    res.status(500).json({ message: 'Error updating image', error });
  }
}

export async function deleteNewsImage(req: Request, res: Response) {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isInteger(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }
    const result = await query(
      `UPDATE news SET image_data = NULL, image_mime = NULL, updated_at = NOW() WHERE id = $1`,
      [newsId]
    );
    // If the record doesn't exist, report 404
    const { rows } = await query('SELECT 1 FROM news WHERE id = $1', [newsId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: `News with ID ${newsId} not found` });
    }
    return res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting image', error });
  }
}

export async function createNews(req: Request, res: Response) {
  try {
    const { title, content, author, category } = req.body as Partial<News>;
    if (!title || !content || !author || !category) {
      return res.status(400).json({ message: 'Missing required fields: title, content, author, category' });
    }
    if (title.trim().length < 3 || title.trim().length > 120) {
      return res.status(400).json({ message: 'Title must be between 3 and 120 characters' });
    }
    if (author.trim().length < 2 || author.trim().length > 60) {
      return res.status(400).json({ message: 'Author must be between 2 and 60 characters' });
    }
    if (category.trim().length < 2 || category.trim().length > 40) {
      return res.status(400).json({ message: 'Category must be between 2 and 40 characters' });
    }
    if (content.trim().length < 10) {
      return res.status(400).json({ message: 'Content must be at least 10 characters' });
    }

    const file = (req as any).file as Express.Multer.File | undefined;

    const client = await getClient();
    try {
      if (file) {
        const { rows } = await client.query<NewsRow>(
          `INSERT INTO news (title, content, author, category, image_data, image_mime)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, title, content, author, category, created_at, updated_at`,
          [title.trim(), content.trim(), author.trim(), category.trim(), file.buffer, file.mimetype]
        );
        return res.status(201).json(mapRowToNews(rows[0]));
      } else {
        const { rows } = await client.query<NewsRow>(
          `INSERT INTO news (title, content, author, category)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, content, author, category, created_at, updated_at`,
          [title.trim(), content.trim(), author.trim(), category.trim()]
        );
        return res.status(201).json(mapRowToNews(rows[0]));
      }
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error creating news', error });
  }
}

export async function updateNews(req: Request, res: Response) {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isInteger(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const { title, content, author, category } = req.body as Partial<News>;
    if (title && (title.trim().length < 3 || title.trim().length > 120)) {
      return res.status(400).json({ message: 'Title must be between 3 and 120 characters' });
    }
    if (author && (author.trim().length < 2 || author.trim().length > 60)) {
      return res.status(400).json({ message: 'Author must be between 2 and 60 characters' });
    }
    if (category && (category.trim().length < 2 || category.trim().length > 40)) {
      return res.status(400).json({ message: 'Category must be between 2 and 40 characters' });
    }
    if (content && content.trim().length < 10) {
      return res.status(400).json({ message: 'Content must be at least 10 characters' });
    }
    const file = (req as any).file as Express.Multer.File | undefined;

    const client = await getClient();
    try {
      if (file) {
        const { rows } = await client.query<NewsRow>(
          `UPDATE news
             SET title = COALESCE($1, title),
                 content = COALESCE($2, content),
                 author = COALESCE($3, author),
                 category = COALESCE($4, category),
                 image_data = $5,
                 image_mime = $6,
                 updated_at = NOW()
           WHERE id = $7
           RETURNING id, title, content, author, category, created_at, updated_at`,
          [title?.trim() ?? null, content?.trim() ?? null, author?.trim() ?? null, category?.trim() ?? null, file.buffer, file.mimetype, newsId]
        );
        if (rows.length === 0) return res.status(404).json({ message: `News with ID ${newsId} not found` });
        return res.json(mapRowToNews(rows[0]));
      } else {
        const { rows } = await client.query<NewsRow>(
          `UPDATE news
             SET title = COALESCE($1, title),
                 content = COALESCE($2, content),
                 author = COALESCE($3, author),
                 category = COALESCE($4, category),
                 updated_at = NOW()
           WHERE id = $5
           RETURNING id, title, content, author, category, created_at, updated_at`,
          [title?.trim() ?? null, content?.trim() ?? null, author?.trim() ?? null, category?.trim() ?? null, newsId]
        );
        if (rows.length === 0) return res.status(404).json({ message: `News with ID ${newsId} not found` });
        return res.json(mapRowToNews(rows[0]));
      }
    } finally {
      client.release();
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating news', error });
  }
}

export async function deleteNews(req: Request, res: Response) {
  try {
    const newsId = Number(req.params.id);
    if (!Number.isInteger(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const result = await query<NewsRow>('DELETE FROM news WHERE id = $1', [newsId]);
    // pg returns no rows for DELETE without RETURNING; use rowCount by querying again or rely on no error
    // To determine existence, attempt a select
    if ((await query<NewsRow>('SELECT 1 FROM news WHERE id = $1', [newsId])).rows.length > 0) {
      // If it still exists, something went wrong
      return res.status(500).json({ message: 'Failed to delete news' });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news', error });
  }
}
