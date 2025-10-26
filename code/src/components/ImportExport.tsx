import { useState, useRef, ChangeEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Upload, Download, FolderOpen, FileMusic, Database, Settings, CheckCircle, AlertTriangle, X, Music, Play, User, Album } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"
import { toast } from "sonner"

export function ImportExport() {
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("json")
  const [importResults, setImportResults] = useState<{success: number, failed: number, duplicates: number} | null>(null)
  const [activeTab, setActiveTab] = useState<'import' | 'export' | 'backup'>('import')

  const fileInputRef = useRef<HTMLInputElement>(null)

  const recentImports = [
    { date: '20 сентября 2024', files: 45, successful: 43, failed: 2, type: 'Треки', source: 'Локальная папка' },
    { date: '18 сентября 2024', files: 23, successful: 23, failed: 0, type: 'Плейлисты', source: 'iTunes Library' },
    { date: '15 сентября 2024', files: 67, successful: 65, failed: 2, type: 'Треки', source: 'Spotify Export' },
  ]

  const exportFormats = [
    { id: 'json', name: 'JSON файл', description: 'Полные данные в JSON формате', icon: Database },
    { id: 'csv', name: 'CSV файл', description: 'Таблица для Excel/Google Sheets', icon: FileMusic },
    { id: 'm3u', name: 'M3U плейлист', description: 'Совместим с большинством плееров', icon: Play },
  ]

  const handleFileImport = async (event: ChangeEvent<HTMLInputElement>, type: 'tracks' | 'playlists' | 'backup') => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setImportProgress(0)
    setImportResults(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      let endpoint = ''
      switch (type) {
        case 'tracks': endpoint = '/api/import/tracks'; break
        case 'playlists': endpoint = '/api/import/playlists'; break
        case 'backup': endpoint = '/api/restore'; break
      }

      // Симуляция прогресса
      const progressInterval = setInterval(() => {
        setImportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)

      if (!response.ok) throw new Error(await response.text())

      const result = await response.json()
      setImportProgress(100)
      setImportResults(result)
      toast.success(result.message)

    } catch (error) {
      console.error('Import error:', error)
      toast.error('Ошибка импорта файла')
    } finally {
      setIsImporting(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleExport = async (type: 'tracks' | 'backup' = 'tracks') => {
    try {
      let url = ''
      let filename = ''

      if (type === 'tracks') {
        url = `/api/export/tracks?format=${exportFormat}`
        filename = `musicflow-${exportFormat}-${Date.now()}.${exportFormat}`
      } else {
        url = '/api/backup'
        filename = `musicflow-backup-${Date.now()}.json`
      }

      const response = await fetch(url)
      if (!response.ok) throw new Error('Export failed')

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)

      toast.success(`Файл ${filename} успешно экспортирован`)

    } catch (error) {
      toast.error('Ошибка экспорта')
    }
  }

  const handleFileSelect = (type: 'tracks' | 'playlists' | 'backup') => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = type === 'backup' ? '.json' : '.json,.csv,.m3u'
      fileInputRef.current.click()
      // Сохраняем тип для обработки в onChange
      fileInputRef.current.dataset.importType = type
    }
  }

  return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Импорт и экспорт</h1>
          <p className="text-muted-foreground">Управление музыкальной библиотекой</p>
        </div>

        {/* Табы */}
        <div className="flex space-x-1 bg-muted/30 p-1 rounded-lg">
          {[
            { id: 'import', label: 'Импорт', icon: Upload },
            { id: 'export', label: 'Экспорт', icon: Download },
            { id: 'backup', label: 'Резервная копия', icon: Database }
          ].map((tab) => {
            const Icon = tab.icon
            return (
                <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? "default" : "ghost"}
                    className="flex-1 justify-center gap-2"
                    onClick={() => setActiveTab(tab.id as any)}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </Button>
            )
          })}
        </div>

        <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const type = e.currentTarget.dataset.importType as 'tracks' | 'playlists' | 'backup'
              if (type) {
                handleFileImport(e, type)
              }
            }}
        />

        {activeTab === 'import' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Импорт треков */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Music className="w-5 h-5" />
                    Импорт треков
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="w-full h-20 border-dashed"
                        onClick={() => handleFileSelect('tracks')}
                    >
                      <div className="text-center">
                        <Upload className="w-8 h-8 mx-auto mb-2" />
                        <div>Загрузить JSON/CSV файл</div>
                        <div className="text-xs text-muted-foreground">Поддерживаются JSON, CSV форматы</div>
                      </div>
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Импорт из Spotify в разработке")}
                      >
                        <FileMusic className="w-4 h-4 mr-2" />
                        Spotify
                      </Button>
                      <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toast.info("Импорт из iTunes в разработке")}
                      >
                        <Music className="w-4 h-4 mr-2" />
                        iTunes
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <h4 className="font-medium">Поддерживаемые форматы:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <Badge variant="secondary" className="justify-center">
                        JSON
                      </Badge>
                      <Badge variant="secondary" className="justify-center">
                        CSV
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Импорт плейлистов */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Импорт плейлистов
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                      variant="outline"
                      className="w-full h-20 border-dashed"
                      onClick={() => handleFileSelect('playlists')}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <div>Загрузить JSON файл</div>
                      <div className="text-xs text-muted-foreground">Формат MusicFlow</div>
                    </div>
                  </Button>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Поддерживается импорт плейлистов в JSON формате MusicFlow.</p>
                    <p>Каждый плейлист должен содержать название, описание и список треков.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        {activeTab === 'export' && (
            <div className="space-y-6">
              {/* Формат экспорта */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Экспорт треков</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {exportFormats.map((format) => {
                      const Icon = format.icon
                      return (
                          <div
                              key={format.id}
                              className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                                  exportFormat === format.id
                                      ? 'border-primary bg-primary/10'
                                      : 'border-border hover:border-primary/50'
                              }`}
                              onClick={() => setExportFormat(format.id)}
                          >
                            <Icon className="w-8 h-8 mb-2" />
                            <h3 className="font-medium">{format.name}</h3>
                            <p className="text-sm text-muted-foreground">{format.description}</p>
                          </div>
                      )
                    })}
                  </div>

                  <Button
                      className="w-full"
                      onClick={() => handleExport('tracks')}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Экспортировать в {exportFormats.find(f => f.id === exportFormat)?.name}
                  </Button>
                </CardContent>
              </Card>

              {/* Быстрый экспорт */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle>Быстрый экспорт</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Button
                        variant="outline"
                        className="h-auto p-4 flex-col gap-2"
                        onClick={() => handleExport('tracks')}
                    >
                      <Music className="w-6 h-6 text-primary" />
                      <div className="text-center">
                        <div className="font-medium">Все треки</div>
                        <div className="text-xs text-muted-foreground">JSON формат</div>
                      </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto p-4 flex-col gap-2"
                        onClick={() => toast.success("Экспорт избранного в разработке")}
                    >
                      <User className="w-6 h-6 text-secondary" />
                      <div className="text-center">
                        <div className="font-medium">Исполнители</div>
                        <div className="text-xs text-muted-foreground">JSON формат</div>
                      </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto p-4 flex-col gap-2"
                        onClick={() => toast.success("Экспорт альбомов в разработке")}
                    >
                      <Album className="w-6 h-6 text-purple-400" />
                      <div className="text-center">
                        <div className="font-medium">Альбомы</div>
                        <div className="text-xs text-muted-foreground">JSON формат</div>
                      </div>
                    </Button>

                    <Button
                        variant="outline"
                        className="h-auto p-4 flex-col gap-2"
                        onClick={() => toast.success("Экспорт плейлистов в разработке")}
                    >
                      <Play className="w-6 h-6 text-green-400" />
                      <div className="text-center">
                        <div className="font-medium">Плейлисты</div>
                        <div className="text-xs text-muted-foreground">JSON формат</div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        {activeTab === 'backup' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Создание бэкапа */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Создать резервную копию
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-6 border-2 border-dashed border-border rounded-lg text-center">
                    <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="font-medium mb-2">Полная резервная копия</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Сохраните всю вашу музыкальную библиотеку в одном файле
                    </p>
                    <Button onClick={() => handleExport('backup')}>
                      <Download className="w-4 h-4 mr-2" />
                      Создать бэкап
                    </Button>
                  </div>

                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>Бэкап включает:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Все треки и метаданные</li>
                      <li>Исполнителей и альбомы</li>
                      <li>Плейлисты и настройки</li>
                      <li>Историю прослушивания</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              {/* Восстановление из бэкапа */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Восстановить из копии
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                      variant="outline"
                      className="w-full h-20 border-dashed"
                      onClick={() => handleFileSelect('backup')}
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 mx-auto mb-2" />
                      <div>Загрузить файл бэкапа</div>
                      <div className="text-xs text-muted-foreground">JSON формат MusicFlow</div>
                    </div>
                  </Button>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-yellow-600">Внимание</p>
                        <p className="text-yellow-700">Восстановление из бэкапа перезапишет текущую библиотеку.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
        )}

        {/* Прогресс импорта */}
        {isImporting && (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Upload className="w-5 h-5 animate-pulse" />
                    <h3 className="font-medium">Импорт файла...</h3>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Обработка...</span>
                      <span>{importProgress}%</span>
                    </div>
                    <Progress value={importProgress} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
        )}

        {/* Результаты импорта */}
        {importResults && !isImporting && (
            <Card className="bg-card border-border">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium">Импорт завершен</h3>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-green-500/10 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{importResults.success}</div>
                    <div className="text-sm text-muted-foreground">Успешно</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-500/10 rounded-lg">
                    <div className="text-lg font-bold text-yellow-600">{importResults.duplicates}</div>
                    <div className="text-sm text-muted-foreground">Дубликаты</div>
                  </div>
                  <div className="text-center p-3 bg-red-500/10 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-sm text-muted-foreground">Ошибки</div>
                  </div>
                </div>

                <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setImportResults(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Закрыть
                </Button>
              </CardContent>
            </Card>
        )}

        {/* История импорта */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>История операций</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentImports.map((import_, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{import_.date}</span>
                        <Badge variant="secondary" className="text-xs">
                          {import_.source}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {import_.type}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {import_.successful} успешно
                    </span>
                        {import_.failed > 0 && (
                            <span className="flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-red-500" />
                              {import_.failed} ошибок
                      </span>
                        )}
                        <span>из {import_.files} файлов</span>
                      </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toast.info("Детали импорта: " + import_.date)}
                    >
                      Детали
                    </Button>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}