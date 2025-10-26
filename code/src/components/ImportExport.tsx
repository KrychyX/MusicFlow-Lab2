import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Progress } from "./ui/progress"
import { Badge } from "./ui/badge"
import { Separator } from "./ui/separator"
import { Upload, Download, FolderOpen, FileMusic, Database, Settings, CheckCircle, AlertTriangle, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Checkbox } from "./ui/checkbox"
import { toast } from "sonner@2.0.3"

export function ImportExport() {
  const [importProgress, setImportProgress] = useState(0)
  const [isImporting, setIsImporting] = useState(false)
  const [exportFormat, setExportFormat] = useState("csv")
  const [importResults, setImportResults] = useState<{success: number, failed: number, duplicates: number} | null>(null)

  const recentImports = [
    { date: '20 сентября 2024', files: 45, successful: 43, failed: 2, source: 'Локальная папка' },
    { date: '18 сентября 2024', files: 23, successful: 23, failed: 0, source: 'iTunes Library' },
    { date: '15 сентября 2024', files: 67, successful: 65, failed: 2, source: 'Spotify Export' },
  ]

  const exportFormats = [
    { id: 'csv', name: 'CSV файл', description: 'Таблица с метаданными' },
    { id: 'json', name: 'JSON файл', description: 'Структурированные данные' },
    { id: 'playlist', name: 'M3U плейлист', description: 'Список путей к файлам' },
    { id: 'library', name: 'Архив библиотеки', description: 'Полный экспорт с файлами' },
  ]

  const handleImport = () => {
    if (isImporting) return
    
    setIsImporting(true)
    setImportProgress(0)
    setImportResults(null)
    toast.info("Начинается импорт файлов...")
    
    // Симуляция импорта
    const interval = setInterval(() => {
      setImportProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsImporting(false)
          const results = { 
            success: Math.floor(Math.random() * 30) + 20, 
            failed: Math.floor(Math.random() * 3), 
            duplicates: Math.floor(Math.random() * 5) 
          }
          setImportResults(results)
          toast.success(`Импорт завершен! Успешно: ${results.success}`)
          return 100
        }
        return prev + 10
      })
    }, 500)
  }
  
  const handleExport = () => {
    toast.success(`Экспорт начат в формате ${exportFormat.toUpperCase()}`)
    setTimeout(() => {
      toast.success("Файл экспорта готов к загрузке")
    }, 2000)
  }
  
  const handleFileSelect = () => {
    toast.info("Откройте диалог выбора файлов")
  }
  
  const handleSourceImport = (source: string) => {
    toast.info(`Импорт из ${source} в разработке`)
  }
  
  const handleQuickExport = (type: string) => {
    toast.success(`Экспортируется ${type}...`)
  }
  
  const handleSaveSettings = () => {
    toast.success("Настройки сохранены")
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl mb-2">Импорт и экспорт</h1>
        <p className="text-muted-foreground">Управление музыкальной библиотекой</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Импорт музыки */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Импорт музыки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Зона перетаскивания */}
            <div 
              className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
              onClick={handleFileSelect}
            >
              <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-medium mb-2">Перетащите файлы или папки сюда</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Поддерживаются: MP3, FLAC, WAV, AAC, OGG
              </p>
              <Button variant="outline" onClick={(e) => {
                e.stopPropagation()
                handleFileSelect()
              }}>
                <FolderOpen className="w-4 h-4 mr-2" />
                Выбрать файлы
              </Button>
            </div>

            {/* Настройки импорта */}
            <div className="space-y-4">
              <Label>Настройки импорта</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox id="duplicate-check" defaultChecked />
                  <Label htmlFor="duplicate-check" className="text-sm">
                    Проверять дубликаты
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="auto-tags" defaultChecked />
                  <Label htmlFor="auto-tags" className="text-sm">
                    Автоматически извлекать метаданные
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="organize-folders" />
                  <Label htmlFor="organize-folders" className="text-sm">
                    Организовать по папкам (Исполнитель/Альбом)
                  </Label>
                </div>
              </div>
            </div>

            {/* Прогресс импорта */}
            {isImporting && (
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Импорт в процессе...</span>
                  <span>{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="h-2" />
              </div>
            )}

            {/* Результаты импорта */}
            {importResults && !isImporting && (
              <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">Импорт завершен</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{importResults.success}</div>
                    <div className="text-muted-foreground">Успешно</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-yellow-600">{importResults.duplicates}</div>
                    <div className="text-muted-foreground">Дубликаты</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{importResults.failed}</div>
                    <div className="text-muted-foreground">Ошибки</div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setImportResults(null)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Закрыть
                </Button>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleImport}
              disabled={isImporting}
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Импорт...' : 'Начать импорт'}
            </Button>
          </CardContent>
        </Card>

        {/* Экспорт библиотеки */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Экспорт библиотеки
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="export-format">Формат экспорта</Label>
                <Select defaultValue="csv">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {exportFormats.map(format => (
                      <SelectItem key={format.id} value={format.id}>
                        <div>
                          <div className="font-medium">{format.name}</div>
                          <div className="text-xs text-muted-foreground">{format.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Что экспортировать</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-tracks" defaultChecked />
                    <Label htmlFor="export-tracks" className="text-sm">
                      Все треки (1,247)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-playlists" defaultChecked />
                    <Label htmlFor="export-playlists" className="text-sm">
                      Плейлисты (4)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-metadata" defaultChecked />
                    <Label htmlFor="export-metadata" className="text-sm">
                      Метаданные и теги
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="export-stats" />
                    <Label htmlFor="export-stats" className="text-sm">
                      Статистика прослушивания
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-medium">Быстрый экспорт</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickExport("Избранное")}
                >
                  <FileMusic className="w-4 h-4 mr-2" />
                  Избранное
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickExport("Вся библиотека")}
                >
                  <Database className="w-4 h-4 mr-2" />
                  Вся библиотека
                </Button>
              </div>
            </div>

            <Button className="w-full" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Создать экспорт
            </Button>
          </CardContent>
        </Card>

        {/* Источники импорта */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Импорт из других источников
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => handleSourceImport("Spotify")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <FileMusic className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Spotify плейлисты</div>
                    <div className="text-xs text-muted-foreground">Импорт через API</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => handleSourceImport("iTunes")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <FileMusic className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">iTunes Library</div>
                    <div className="text-xs text-muted-foreground">Загрузить XML файл</div>
                  </div>
                </div>
              </Button>

              <Button 
                variant="outline" 
                className="justify-start h-auto p-4"
                onClick={() => handleSourceImport("Last.fm")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                    <FileMusic className="w-4 h-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium">Last.fm данные</div>
                    <div className="text-xs text-muted-foreground">История прослушивания</div>
                  </div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* История импорта */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Последние импорты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentImports.map((import_, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{import_.date}</span>
                      <Badge variant="secondary" className="text-xs">
                        {import_.source}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-green-500" />
                        {import_.successful}
                      </span>
                      {import_.failed > 0 && (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                          {import_.failed}
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

        {/* Настройки */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Настройки импорта/экспорта
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-medium">Путь для импорта</h4>
                <div className="space-y-2">
                  <Label htmlFor="import-path">Папка по умолчанию</Label>
                  <div className="flex gap-2">
                    <Input
                      id="import-path"
                      value="/Users/music/library"
                      readOnly
                      className="flex-1"
                    />
                    <Button variant="outline" size="sm">
                      <FolderOpen className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Качество импорта</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="high-quality" defaultChecked />
                    <Label htmlFor="high-quality" className="text-sm">
                      Принимать только высокое качество (320+ kbps)
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="convert-format" />
                    <Label htmlFor="convert-format" className="text-sm">
                      Конвертировать в единый формат
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-end gap-2">
              <Button 
                variant="outline"
                onClick={() => toast.info("Настройки сброшены")}
              >
                Сбросить настройки
              </Button>
              <Button onClick={handleSaveSettings}>
                Сохранить настройки
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}