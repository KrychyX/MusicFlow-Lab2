import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'build')));
app.use('/audio', express.static(join(__dirname, 'audio'))); // Для аудио файлов

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, join(__dirname, 'uploads/'));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedFormats = ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.json', '.csv', '.m3u'];
        const ext = require('path').extname(file.originalname).toLowerCase();
        if (allowedFormats.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Неподдерживаемый формат файла'));
        }
    },
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB
    }
});

// Путь к данным
const dataPath = join(__dirname, 'data');
const audioPath = join(__dirname, 'audio');
const uploadsPath = join(__dirname, 'uploads');

// Создаем необходимые папки
const createFolders = async () => {
    try {
        await fs.mkdir(dataPath, { recursive: true });
        await fs.mkdir(audioPath, { recursive: true });
        await fs.mkdir(uploadsPath, { recursive: true });
        console.log('✅ Папки созданы/проверены');
    } catch (error) {
        console.log('📁 Папки уже существуют');
    }
};
createFolders();

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

// Вспомогательные функции для импорта/экспорта
function parseCSV(csvData) {
    const lines = csvData.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));

    return lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''));
        const track = {};
        headers.forEach((header, index) => {
            track[header] = values[index] || '';
        });
        return track;
    }).filter(track => track.title && track.artist); // Фильтруем пустые строки
}

function convertToCSV(tracks) {
    if (tracks.length === 0) return '';

    const headers = ['id', 'title', 'artist', 'album', 'genre', 'year', 'duration', 'bitrate', 'liked'];
    const csvLines = [headers.join(',')];

    tracks.forEach(track => {
        const row = headers.map(header => {
            const value = track[header] || '';
            return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csvLines.push(row.join(','));
    });

    return csvLines.join('\n');
}

function convertToM3U(tracks) {
    const header = '#EXTM3U';
    const tracksList = tracks.map(track => {
        const duration = parseDuration(track.duration);
        return `#EXTINF:${duration},${track.artist} - ${track.title}\n${track.audioUrl || ''}`;
    });

    return [header, ...tracksList].join('\n');
}

function parseDuration(duration) {
    if (!duration) return 0;
    const [min, sec] = duration.split(':').map(Number);
    return (min || 0) * 60 + (sec || 0);
}

// ===== СИСТЕМА ПОЛЬЗОВАТЕЛЕЙ =====

const JWT_SECRET = process.env.JWT_SECRET || 'musicflow-secret-key';

// Загрузка пользователей
const loadUsers = async () => {
    try {
        const usersData = await fs.readFile(join(dataPath, 'users.json'), 'utf8');
        return JSON.parse(usersData);
    } catch (error) {
        return [];
    }
};

const saveUsers = async (users) => {
    await writeJSON('users.json', users);
};

// Загрузка истории прослушивания
const loadHistory = async () => {
    try {
        const historyData = await fs.readFile(join(dataPath, 'history.json'), 'utf8');
        return JSON.parse(historyData);
    } catch (error) {
        return [];
    }
};

const saveHistory = async (history) => {
    await writeJSON('history.json', history);
};

// Middleware для проверки JWT
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }

    try {
        const users = await loadUsers();
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = users.find(u => u.id === decoded.userId);

        if (!user) {
            return res.status(403).json({ error: 'Пользователь не найден' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(403).json({ error: 'Недействительный токен' });
    }
};

// Регистрация
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Все поля обязательны' });
        }

        const users = await loadUsers();

        if (users.find(u => u.email === email)) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = {
            id: Date.now().toString(),
            username,
            email,
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            preferences: {
                theme: 'dark',
                language: 'ru',
                audioQuality: 'high'
            }
        };

        const updatedUsers = [...users, user];
        await saveUsers(updatedUsers);

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

        res.json({
            message: 'Пользователь успешно зарегистрирован',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                preferences: user.preferences
            },
            token
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Ошибка регистрации' });
    }
});

// Вход
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const users = await loadUsers();
        const user = users.find(u => u.email === email);

        if (!user) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Неверный email или пароль' });
        }

        const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET);

        res.json({
            message: 'Вход выполнен успешно',
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                preferences: user.preferences
            },
            token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка входа' });
    }
});

// Получить профиль пользователя
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    res.json({
        id: req.user.id,
        username: req.user.username,
        email: req.user.email,
        preferences: req.user.preferences,
        createdAt: req.user.createdAt
    });
});

// Обновить настройки пользователя
app.put('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const users = await loadUsers();
        const userIndex = users.findIndex(u => u.id === req.user.id);

        if (userIndex === -1) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        users[userIndex].preferences = { ...users[userIndex].preferences, ...req.body };
        await saveUsers(users);

        res.json({
            message: 'Настройки обновлены',
            preferences: users[userIndex].preferences
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ error: 'Ошибка обновления настроек' });
    }
});

// ===== ИСТОРИЯ ПРОСЛУШИВАНИЯ =====

// Добавить в историю прослушивания
app.post('/api/history', authenticateToken, async (req, res) => {
    try {
        const { trackId, duration } = req.body;

        const history = await loadHistory();

        const historyItem = {
            id: Date.now().toString(),
            userId: req.user.id,
            trackId,
            duration: duration || 0,
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [...history, historyItem];

        // Сохраняем только последние 1000 записей на пользователя
        const userHistory = updatedHistory.filter(h => h.userId === req.user.id);
        if (userHistory.length > 1000) {
            const recentHistory = userHistory.slice(-1000);
            const filteredHistory = updatedHistory.filter(h =>
                h.userId !== req.user.id || recentHistory.includes(h)
            );
            await saveHistory(filteredHistory);
        } else {
            await saveHistory(updatedHistory);
        }

        res.json({ message: 'История обновлена' });

    } catch (error) {
        console.error('History save error:', error);
        res.status(500).json({ error: 'Ошибка сохранения истории' });
    }
});

// Получить историю прослушивания
app.get('/api/history', authenticateToken, async (req, res) => {
    try {
        const history = await loadHistory();
        const tracks = await readJSON('tracks.json');

        const userHistory = history
            .filter(h => h.userId === req.user.id)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 50); // Последние 50 треков

        const historyWithTracks = userHistory.map(historyItem => {
            const track = tracks.find(t => t.id === historyItem.trackId);
            return {
                ...historyItem,
                track: track ? {
                    id: track.id,
                    title: track.title,
                    artist: track.artist,
                    album: track.album,
                    duration: track.duration,
                    audioUrl: `/audio/${track.id}.mp3`
                } : null
            };
        }).filter(item => item.track);

        res.json(historyWithTracks);

    } catch (error) {
        console.error('History load error:', error);
        res.status(500).json({ error: 'Ошибка получения истории' });
    }
});

// Рекомендации на основе истории прослушивания
app.get('/api/recommendations', authenticateToken, async (req, res) => {
    try {
        const history = await loadHistory();
        const tracks = await readJSON('tracks.json');

        const userHistory = history.filter(h => h.userId === req.user.id);

        if (userHistory.length === 0) {
            // Если истории нет, возвращаем популярные треки
            const popularTracks = tracks
                .sort(() => Math.random() - 0.5)
                .slice(0, 10)
                .map(track => ({
                    ...track,
                    audioUrl: `/audio/${track.id}.mp3`
                }));

            return res.json({
                type: 'popular',
                tracks: popularTracks
            });
        }

        // Анализируем предпочтения пользователя
        const userTrackIds = userHistory.map(h => h.trackId);
        const userTracks = tracks.filter(t => userTrackIds.includes(t.id));

        const favoriteGenres = {};
        userTracks.forEach(track => {
            favoriteGenres[track.genre] = (favoriteGenres[track.genre] || 0) + 1;
        });

        const topGenre = Object.keys(favoriteGenres)
            .sort((a, b) => favoriteGenres[b] - favoriteGenres[a])[0];

        // Рекомендуем треки того же жанра
        const recommendedTracks = tracks
            .filter(track =>
                track.genre === topGenre &&
                !userTrackIds.includes(track.id)
            )
            .sort(() => Math.random() - 0.5)
            .slice(0, 10)
            .map(track => ({
                ...track,
                audioUrl: `/audio/${track.id}.mp3`
            }));

        res.json({
            type: 'based_on_history',
            genre: topGenre,
            tracks: recommendedTracks
        });

    } catch (error) {
        console.error('Recommendations error:', error);
        res.status(500).json({ error: 'Ошибка получения рекомендаций' });
    }
});

// ===== ОСНОВНОЕ API =====

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
        console.error('Tracks fetch error:', error);
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
        console.error('Track fetch error:', error);
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
        console.error('Track update error:', error);
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
        console.error('Like error:', error);
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
        console.error('Audio fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch audio' });
    }
});

// Получить всех исполнителей
app.get('/api/artists', async (req, res) => {
    try {
        const artists = await readJSON('artists.json');
        res.json(artists);
    } catch (error) {
        console.error('Artists fetch error:', error);
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
        console.error('Artist tracks error:', error);
        res.status(500).json({ error: 'Failed to fetch artist tracks' });
    }
});

// Получить все альбомы
app.get('/api/albums', async (req, res) => {
    try {
        const albums = await readJSON('albums.json');
        res.json(albums);
    } catch (error) {
        console.error('Albums fetch error:', error);
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
        console.error('Album tracks error:', error);
        res.status(500).json({ error: 'Failed to fetch album tracks' });
    }
});

// Получить все плейлисты
app.get('/api/playlists', async (req, res) => {
    try {
        const playlists = await readJSON('playlists.json');
        res.json(playlists);
    } catch (error) {
        console.error('Playlists fetch error:', error);
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
        console.error('Playlist create error:', error);
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
        console.error('Playlist delete error:', error);
        res.status(500).json({ error: 'Failed to delete playlist' });
    }
});

// ===== ИМПОРТ/ЭКСПОРТ API =====

// Импорт треков из JSON/CSV
app.post('/api/import/tracks', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const filePath = req.file.path;
        const fileExt = require('path').extname(req.file.originalname).toLowerCase();

        let importedTracks = [];

        if (fileExt === '.json') {
            const fileData = await fs.readFile(filePath, 'utf8');
            importedTracks = JSON.parse(fileData);
            if (!Array.isArray(importedTracks)) {
                importedTracks = [importedTracks];
            }
        } else if (fileExt === '.csv') {
            const fileData = await fs.readFile(filePath, 'utf8');
            importedTracks = parseCSV(fileData);
        } else {
            await fs.unlink(filePath);
            return res.status(400).json({ error: 'Неподдерживаемый формат файла' });
        }

        // Валидация и добавление ID
        const validTracks = importedTracks
            .filter(track => track.title && track.artist)
            .map(track => ({
                id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
                title: track.title,
                artist: track.artist,
                album: track.album || 'Unknown Album',
                genre: track.genre || 'Unknown',
                year: parseInt(track.year) || 2024,
                duration: track.duration || '3:00',
                bitrate: track.bitrate || '320 kbps',
                liked: track.liked === true || track.liked === 'true' || false
            }));

        // Добавляем в существующие треки
        const existingTracks = await readJSON('tracks.json');
        const updatedTracks = [...existingTracks, ...validTracks];

        await writeJSON('tracks.json', updatedTracks);

        // Удаляем временный файл
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.log('Error deleting temp file:', error);
        }

        res.json({
            message: `Успешно импортировано ${validTracks.length} треков`,
            imported: validTracks.length,
            duplicates: importedTracks.length - validTracks.length,
            total: updatedTracks.length
        });

    } catch (error) {
        console.error('Import error:', error);
        res.status(500).json({ error: 'Ошибка импорта: ' + error.message });
    }
});

// Импорт плейлистов
app.post('/api/import/playlists', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const fileData = await fs.readFile(req.file.path, 'utf8');
        let importedPlaylists = JSON.parse(fileData);
        if (!Array.isArray(importedPlaylists)) {
            importedPlaylists = [importedPlaylists];
        }

        const existingPlaylists = await readJSON('playlists.json');

        // Добавляем ID к новым плейлистам
        const playlistsWithIds = importedPlaylists.map(playlist => ({
            ...playlist,
            id: playlist.id || Date.now().toString() + Math.random().toString(36).substr(2, 9)
        }));

        const updatedPlaylists = [...existingPlaylists, ...playlistsWithIds];

        await writeJSON('playlists.json', updatedPlaylists);

        try {
            await fs.unlink(req.file.path);
        } catch (error) {
            console.log('Error deleting temp file:', error);
        }

        res.json({
            message: `Успешно импортировано ${importedPlaylists.length} плейлистов`,
            imported: importedPlaylists.length,
            total: updatedPlaylists.length
        });

    } catch (error) {
        console.error('Playlist import error:', error);
        res.status(500).json({ error: 'Ошибка импорта плейлистов: ' + error.message });
    }
});

// Экспорт треков в разных форматах
app.get('/api/export/tracks', async (req, res) => {
    try {
        const format = req.query.format || 'json';
        const tracks = await readJSON('tracks.json');

        let data, contentType, filename;

        switch (format) {
            case 'json':
                data = JSON.stringify(tracks, null, 2);
                contentType = 'application/json';
                filename = `musicflow-tracks-${Date.now()}.json`;
                break;

            case 'csv':
                data = convertToCSV(tracks);
                contentType = 'text/csv';
                filename = `musicflow-tracks-${Date.now()}.csv`;
                break;

            case 'm3u':
                data = convertToM3U(tracks);
                contentType = 'audio/x-mpegurl';
                filename = `musicflow-playlist-${Date.now()}.m3u`;
                break;

            default:
                return res.status(400).json({ error: 'Неподдерживаемый формат' });
        }

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(data);

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ error: 'Ошибка экспорта' });
    }
});

// Резервное копирование всей библиотеки
app.get('/api/backup', async (req, res) => {
    try {
        const [tracks, artists, albums, playlists] = await Promise.all([
            readJSON('tracks.json'),
            readJSON('artists.json'),
            readJSON('albums.json'),
            readJSON('playlists.json')
        ]);

        const backupData = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: { tracks, artists, albums, playlists }
        };

        const filename = `musicflow-backup-${Date.now()}.json`;

        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(JSON.stringify(backupData, null, 2));

    } catch (error) {
        console.error('Backup error:', error);
        res.status(500).json({ error: 'Ошибка создания бэкапа' });
    }
});

// Восстановление из бэкапа
app.post('/api/restore', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'Файл не загружен' });
        }

        const fileData = await fs.readFile(req.file.path, 'utf8');
        const backup = JSON.parse(fileData);

        // Проверяем структуру бэкапа
        if (!backup.data || (!backup.data.tracks && !backup.data.artists && !backup.data.albums && !backup.data.playlists)) {
            await fs.unlink(req.file.path);
            return res.status(400).json({ error: 'Неверный формат файла бэкапа' });
        }

        if (backup.data.tracks) await writeJSON('tracks.json', backup.data.tracks);
        if (backup.data.artists) await writeJSON('artists.json', backup.data.artists);
        if (backup.data.albums) await writeJSON('albums.json', backup.data.albums);
        if (backup.data.playlists) await writeJSON('playlists.json', backup.data.playlists);

        try {
            await fs.unlink(req.file.path);
        } catch (error) {
            console.log('Error deleting temp file:', error);
        }

        res.json({
            message: 'Библиотека успешно восстановлена из бэкапа',
            restored: {
                tracks: backup.data.tracks?.length || 0,
                artists: backup.data.artists?.length || 0,
                albums: backup.data.albums?.length || 0,
                playlists: backup.data.playlists?.length || 0
            }
        });

    } catch (error) {
        console.error('Restore error:', error);
        res.status(500).json({ error: 'Ошибка восстановления: ' + error.message });
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

        const totalDuration = tracks.reduce((total, track) => {
            return total + parseDuration(track.duration);
        }, 0);

        res.json({
            totalTracks: tracks.length,
            totalArtists: artists.length,
            totalAlbums: albums.length,
            totalPlaylists: playlists.length,
            totalDuration: totalDuration,
            likedTracks: tracks.filter(t => t.liked).length
        });
    } catch (error) {
        console.error('Stats error:', error);
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
        console.error('Search error:', error);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Информация о сервере
app.get('/api/info', (req, res) => {
    res.json({
        name: 'MusicFlow API',
        version: '1.0.0',
        status: 'running',
        endpoints: [
            '/api/tracks - Получить все треки',
            '/api/artists - Получить всех исполнителей',
            '/api/albums - Получить все альбомы',
            '/api/playlists - Получить все плейлисты',
            '/api/import/tracks - Импорт треков',
            '/api/export/tracks - Экспорт треков',
            '/api/backup - Резервное копирование',
            '/api/stats - Статистика',
            '/api/auth/* - Аутентификация',
            '/api/history - История прослушивания',
            '/api/recommendations - Рекомендации'
        ]
    });
});

// Для SPA - отдаем index.html для всех остальных routes
app.get('*', (req, res) => {
    res.sendFile(join(__dirname, 'build', 'index.html'));
});

// Обработка ошибок multer
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Файл слишком большой. Максимальный размер: 100MB' });
        }
    }
    res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
    console.log(`🎵 MusicFlow server running on http://localhost:${PORT}`);
});