export const APP_CONFIG = {
    name: "MusicFlow",
    version: "1.0.0",
    api: {
        baseUrl: process.env.NODE_ENV === 'production' ? '/api' : '/api',
        timeout: 10000
    },
    features: {
        search: true,
        playlists: true,
        importExport: true,
        statistics: true
    },
    audio: {
        supportedFormats: ['mp3', 'wav', 'flac', 'aac', 'ogg'],
        maxFileSize: 100 * 1024 * 1024 // 100MB
    }
}