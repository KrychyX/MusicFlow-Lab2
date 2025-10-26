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
app.use(express.static(join(__dirname, 'build')));
app.use('/audio', express.static(join(__dirname, 'audio'))); // Для аудио файлов

// Путь к данным
const dataPath = join(__dirname, 'data');
const audioPath = join(__dirname, 'audio');

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
        // Добавляем URL для аудио
        const tracksWithAudio = tracks.map(track => ({
            ...track,
            audioUrl: `/audio/${track.id}.mp3`
        }));
        res.json(tracksWithAudio);
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

        // Добавляем URL для аудио
        const trackWithAudio = {
            ...track,
            audioUrl: `/audio/${track.id}.mp3`
        };
        res.json(trackWithAudio);
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

// Получить аудио файл трека
app.get('/api/tracks/:id/audio', async (req, res) => {
    try {
        const audioFile = join(audioPath, `${req.params.id}.mp3`);
        try {
            await fs.access(audioFile);
            res.sendFile(audioFile);
        } catch {
            // Если файла нет, отдаем заглушку или ошибку
            res.status(404).json({ error: 'Audio file not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audio' });
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

// Получить треки исполнителя
app.get('/api/artists/:id/tracks', async (req, res) => {
    try {
        const [tracks, artists] = await Promise.all([
            readJSON('tracks.json'),
            readJSON('artists.json')
        ]);

        const artist = artists.find(a => a.id === req.params.id);
        if (!artist) return res.status(404).json({ error: 'Artist not found' });

        const artistTracks = tracks.filter(track => track.artist === artist.name)
            .map(track => ({
                ...track,
                audioUrl: `/audio/${track.id}.mp3`
            }));

        res.json(artistTracks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch artist tracks' });
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

// Получить треки альбома
app.get('/api/albums/:id/tracks', async (req, res) => {
    try {
        const [tracks, albums] = await Promise.all([
            readJSON('tracks.json'),
            readJSON('albums.json')
        ]);

        const album = albums.find(a => a.id === req.params.id);
        if (!album) return res.status(404).json({ error: 'Album not found' });

        const albumTracks = tracks.filter(track => track.album === album.title)
            .map(track => ({
                ...track,
                audioUrl: `/audio/${track.id}.mp3`
            }));

        res.json(albumTracks);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch album tracks' });
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

// Добавить трек в плейлист
app.post('/api/playlists/:playlistId/tracks/:trackId', async (req, res) => {
    try {
        // Здесь можно добавить логику добавления треков в плейлисты
        res.json({ message: 'Track added to playlist' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add track to playlist' });
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
            totalPlaylists: playlists.length,
            totalDuration: tracks.reduce((total, track) => {
                const [min, sec] = track.duration.split(':').map(Number);
                return total + min * 60 + sec;
            }, 0),
            likedTracks: tracks.filter(t => t.liked).length
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
});

// Поиск по всей библиотеке
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q?.toLowerCase();
        if (!query) return res.json({ tracks: [], artists: [], albums: [] });

        const [tracks, artists, albums] = await Promise.all([
            readJSON('tracks.json'),
            readJSON('artists.json'),
            readJSON('albums.json')
        ]);

        const searchResults = {
            tracks: tracks.filter(track =>
                track.title.toLowerCase().includes(query) ||
                track.artist.toLowerCase().includes(query) ||
                track.album.toLowerCase().includes(query)
            ).map(track => ({
                ...track,
                audioUrl: `/audio/${track.id}.mp3`
            })),
            artists: artists.filter(artist =>
                artist.name.toLowerCase().includes(query) ||
                artist.genre.toLowerCase().includes(query)
            ),
            albums: albums.filter(album =>
                album.title.toLowerCase().includes(query) ||
                album.artist.toLowerCase().includes(query)
            )
        };

        res.json(searchResults);
    } catch (error) {
        res.status(500).json({ error: 'Search failed' });
    }
});

// Для SPA - отдаем index.html для всех остальных routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🎵 MusicFlow server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`🎧 Audio files available at http://localhost:${PORT}/audio`);
});