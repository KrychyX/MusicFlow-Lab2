import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// В продакшене раздаем статику из папки build
app.use(express.static(join(__dirname, 'build')));

// Путь к данным
const dataPath = join(__dirname, 'data');

// Вспомогательные функции для работы с JSON
const readJSON = async (file) => {
    try {
        const data = await fs.readFile(join(dataPath, file), 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading ${file}:`, error);
        return [];
    }
};

const writeJSON = async (file, data) => {
    try {
        await fs.writeFile(join(dataPath, file), JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(`Error writing ${file}:`, error);
    }
};

// ===== API ROUTES =====

// Получить все треки
app.get('/api/tracks', async (req, res) => {
    try {
        const tracks = await readJSON('tracks.json');
        res.json(tracks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch tracks' });
    }
});

// Получить трек по ID
app.get('/api/tracks/:id', async (req, res) => {
    try {
        const tracks = await readJSON('tracks.json');
        const track = tracks.find(t => t.id === req.params.id);
        if (!track) return res.status(404).json({ error: 'Track not found' });
        res.json(track);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch track' });
    }
});

// Обновить трек
app.put('/api/tracks/:id', async (req, res) => {
    try {
        const tracks = await readJSON('tracks.json');
        const index = tracks.findIndex(t => t.id === req.params.id);
        if (index === -1) return res.status(404).json({ error: 'Track not found' });

        tracks[index] = { ...tracks[index], ...req.body };
        await writeJSON('tracks.json', tracks);
        res.json(tracks[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update track' });
    }
});

// Лайк/анлайк трека
app.post('/api/tracks/:id/like', async (req, res) => {
    try {
        const tracks = await readJSON('tracks.json');
        const track = tracks.find(t => t.id === req.params.id);
        if (!track) return res.status(404).json({ error: 'Track not found' });

        track.liked = !track.liked;
        await writeJSON('tracks.json', tracks);
        res.json({ liked: track.liked });
    } catch (error) {
        res.status(500).json({ error: 'Failed to toggle like' });
    }
});

// Получить всех исполнителей
app.get('/api/artists', async (req, res) => {
    try {
        const artists = await readJSON('artists.json');
        res.json(artists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch artists' });
    }
});

// Получить все альбомы
app.get('/api/albums', async (req, res) => {
    try {
        const albums = await readJSON('albums.json');
        res.json(albums);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch albums' });
    }
});

// Получить все плейлисты
app.get('/api/playlists', async (req, res) => {
    try {
        const playlists = await readJSON('playlists.json');
        res.json(playlists);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch playlists' });
    }
});

// Создать плейлист
app.post('/api/playlists', async (req, res) => {
    try {
        const playlists = await readJSON('playlists.json');
        const newPlaylist = {
            id: Date.now().toString(),
            ...req.body,
            tracks: 0,
            duration: '0m',
            created: new Date().toLocaleDateString('ru-RU'),
            isPublic: false
        };

        playlists.push(newPlaylist);
        await writeJSON('playlists.json', playlists);
        res.status(201).json(newPlaylist);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create playlist' });
    }
});

// Удалить плейлист
app.delete('/api/playlists/:id', async (req, res) => {
    try {
        const playlists = await readJSON('playlists.json');
        const filtered = playlists.filter(p => p.id !== req.params.id);
        await writeJSON('playlists.json', filtered);
        res.json({ message: 'Playlist deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

// Статистика
app.get('/api/stats', async (req, res) => {
    try {
        const [tracks, artists, albums, playlists] = await Promise.all([
            readJSON('tracks.json'),
            readJSON('artists.json'),
            readJSON('albums.json'),
            readJSON('playlists.json')
        ]);

        res.json({
            totalTracks: tracks.length,
            totalArtists: artists.length,
            totalAlbums: albums.length,
            totalPlaylists: playlists.length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Для SPA - отдаем index.html для всех остальных routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎵 MusicFlow server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
});