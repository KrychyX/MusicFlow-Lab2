import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

console.log('🚀 Запуск MusicFlow...')

// Запускаем сервер
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    cwd: __dirname
})

server.on('error', (error) => {
    console.error('❌ Ошибка запуска сервера:', error)
})

server.on('close', (code) => {
    console.log(`✅ Сервер завершил работу с кодом: ${code}`)
})