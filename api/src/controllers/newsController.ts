import { Request, Response } from 'express';
import { News } from '../models/news';

// In-memory storage (will be replaced with PostgreSQL later)
let newsData: News[] = [
  {
    id: 1,
    title: "Tulio Triviño anuncia nueva campaña presidencial",
    content: "El reconocido periodista Tulio Triviño ha anunciado oficialmente su candidatura para las próximas elecciones presidenciales. En una conferencia de prensa realizada en los estudios de 31 Minutos, Triviño declaró que su principal propuesta será la implementación de noticias las 24 horas del día.",
    author: "Juan Carlos Bodoque",
    category: "Política",
    imageUrl: "https://example.com/tulio-presidente.jpg",
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-01-15').toISOString()
  },
  {
    id: 2,
    title: "Patana Tufillo gana premio al mejor chef del año",
    content: "La reconocida chef Patana Tufillo ha sido galardonada con el premio 'Chef del Año' por su innovadora receta de completos italianos con palta. El jurado destacó la creatividad y el sabor único de sus preparaciones.",
    author: "Juanín Juan Harry",
    category: "Gastronomía",
    imageUrl: "https://example.com/patana-chef.jpg",
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-01-10').toISOString()
  },
  {
    id: 3,
    title: "Mario Hugo denuncia robo de calcetines en el barrio",
    content: "El vecino Mario Hugo ha presentado una denuncia formal por el robo sistemático de calcetines en su barrio. Según su testimonio, los ladrones solo se llevan el calcetín izquierdo, dejando el derecho en su lugar.",
    author: "Policarpo Avendaño",
    category: "Seguridad",
    createdAt: new Date('2024-01-08').toISOString(),
    updatedAt: new Date('2024-01-08').toISOString()
  }
];

let nextId = 4;

export async function listNews(_req: Request, res: Response) {
  try {
    res.json(newsData);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving news', error });
  }
}

export async function getNewsById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newsId = parseInt(id, 10);
    
    if (isNaN(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const news = newsData.find(n => n.id === newsId);
    
    if (!news) {
      return res.status(404).json({ message: `News with ID ${id} not found` });
    }

    res.json(news);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving news', error });
  }
}

export async function createNews(req: Request, res: Response) {
  try {
    const { title, content, author, category, imageUrl } = req.body;

    // Basic validation
    if (!title || !content || !author || !category) {
      return res.status(400).json({ 
        message: 'Missing required fields: title, content, author, category' 
      });
    }

    const newNews: News = {
      id: nextId++,
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
      category: category.trim(),
      imageUrl: imageUrl?.trim() || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    newsData.push(newNews);
    res.status(201).json(newNews);
  } catch (error) {
    res.status(500).json({ message: 'Error creating news', error });
  }
}

export async function updateNews(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newsId = parseInt(id, 10);
    
    if (isNaN(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const newsIndex = newsData.findIndex(n => n.id === newsId);
    
    if (newsIndex === -1) {
      return res.status(404).json({ message: `News with ID ${id} not found` });
    }

    const { title, content, author, category, imageUrl } = req.body;
    const existingNews = newsData[newsIndex];

    // Update only provided fields
    const updatedNews: News = {
      ...existingNews,
      title: title?.trim() || existingNews.title,
      content: content?.trim() || existingNews.content,
      author: author?.trim() || existingNews.author,
      category: category?.trim() || existingNews.category,
      imageUrl: imageUrl !== undefined ? imageUrl?.trim() || undefined : existingNews.imageUrl,
      updatedAt: new Date().toISOString()
    };

    newsData[newsIndex] = updatedNews;
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ message: 'Error updating news', error });
  }
}

export async function deleteNews(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const newsId = parseInt(id, 10);
    
    if (isNaN(newsId)) {
      return res.status(400).json({ message: 'Invalid news ID' });
    }

    const newsIndex = newsData.findIndex(n => n.id === newsId);
    
    if (newsIndex === -1) {
      return res.status(404).json({ message: `News with ID ${id} not found` });
    }

    newsData.splice(newsIndex, 1);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Error deleting news', error });
  }
}
