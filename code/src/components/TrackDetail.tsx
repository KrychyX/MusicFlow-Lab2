import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Separator } from "./ui/separator"
import { Progress } from "./ui/progress"
import { ArrowLeft, Play, Pause, Heart, Share, Edit3, Save, X } from "lucide-react"
import { tracks } from "../lib/musicData"
import { toast } from "sonner@2.0.3"

interface TrackDetailProps {
  trackId: string | null
  onBack: () => void
  onPlay: (trackId: string) => void
}

export function TrackDetail({ trackId, onBack, onPlay }: TrackDetailProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [playProgress, setPlayProgress] = useState(42)

  const track = tracks.find(t => t.id === trackId) || tracks[0]

  const [trackData, setTrackData] = useState({
    title: track.title,
    artist: track.artist,
    album: track.album,
    genre: track.genre,
    year: track.year.toString(),
    duration: track.duration,
    bitrate: track.bitrate,
    sampleRate: "44.1 kHz",
    fileSize: "9.2 MB",
    format: "MP3",
    bpm: "104",
    key: "C# minor",
    comments: `Замечательный трек от ${track.artist}. Из альбома ${track.album}.`,
    tags: [track.genre.toLowerCase(), track.year.toString().slice(2) + "s", "classic"],
    addedDate: "15 октября 2024",
    playCount: Math.floor(Math.random() * 100),
    lastPlayed: "3 дня назад"
  })
  
  useEffect(() => {
    setIsLiked(track.liked)
  }, [track])
  
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            return 0
          }
          return prev + 1
        })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [isPlaying])

  const handleSave = () => {
    setIsEditing(false)
    toast.success("Изменения сохранены")
  }

  const handleCancel = () => {
    setIsEditing(false)
    toast.info("Изменения отменены")
  }
  
  const handlePlayPause = () => {
    if (!isPlaying && trackId) {
      onPlay(trackId)
    }
    setIsPlaying(!isPlaying)
  }
  
  const handleToggleLike = () => {
    setIsLiked(!isLiked)
    toast[!isLiked ? 'success' : 'info'](!isLiked ? "Добавлено в избранное" : "Удалено из избранного")
  }

  return (
    <div className="p-6 space-y-6">
      {/* Верхняя панель */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Назад к библиотеке
        </Button>
        <div className="flex-1" />
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
          {isEditing ? 'Отменить' : 'Редактировать'}
        </Button>
        {isEditing && (
          <Button size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Сохранить
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Обложка и управление воспроизведением */}
        <Card className="bg-card border-border">
          <CardContent className="p-6">
            <div className="aspect-square bg-gradient-to-br from-primary via-secondary to-purple-600 rounded-xl mb-6 flex items-center justify-center relative group">
              <div className="text-white text-6xl opacity-20">♪</div>
              <div className="absolute inset-0 bg-black/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  size="lg"
                  className="bg-white/90 text-black hover:bg-white w-16 h-16 rounded-full"
                  onClick={handlePlayPause}
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8" />}
                </Button>
              </div>
            </div>

            {/* Прогресс воспроизведения */}
            <div className="space-y-2 mb-4">
              <Progress value={playProgress} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1:42</span>
                <span>{trackData.duration}</span>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className={isLiked ? "text-red-500 border-red-500" : ""}
                onClick={handleToggleLike}
              >
                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => toast.success("Ссылка скопирована в буфер обмена")}
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Основная информация */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Информация о треке</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Название</label>
                {isEditing ? (
                  <Input
                    value={trackData.title}
                    onChange={(e) => setTrackData({...trackData, title: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{trackData.title}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Исполнитель</label>
                {isEditing ? (
                  <Input
                    value={trackData.artist}
                    onChange={(e) => setTrackData({...trackData, artist: e.target.value})}
                  />
                ) : (
                  <p className="font-medium">{trackData.artist}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Альбом</label>
                {isEditing ? (
                  <Input
                    value={trackData.album}
                    onChange={(e) => setTrackData({...trackData, album: e.target.value})}
                  />
                ) : (
                  <p>{trackData.album}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Жанр</label>
                {isEditing ? (
                  <Input
                    value={trackData.genre}
                    onChange={(e) => setTrackData({...trackData, genre: e.target.value})}
                  />
                ) : (
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                    {trackData.genre}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Год</label>
                {isEditing ? (
                  <Input
                    value={trackData.year}
                    onChange={(e) => setTrackData({...trackData, year: e.target.value})}
                  />
                ) : (
                  <p>{trackData.year}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">Тональность</label>
                {isEditing ? (
                  <Input
                    value={trackData.key}
                    onChange={(e) => setTrackData({...trackData, key: e.target.value})}
                  />
                ) : (
                  <p>{trackData.key}</p>
                )}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Комментарии</label>
              {isEditing ? (
                <Textarea
                  value={trackData.comments}
                  onChange={(e) => setTrackData({...trackData, comments: e.target.value})}
                  rows={3}
                />
              ) : (
                <p className="text-sm">{trackData.comments}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Теги</label>
              <div className="flex flex-wrap gap-2">
                {trackData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="bg-secondary/20 text-secondary border-secondary/30">
                    #{tag}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Технические характеристики */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Технические характеристики</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Длительность</p>
                <p className="font-medium">{trackData.duration}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Битрейт</p>
                <p className="font-medium">{trackData.bitrate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Частота дискретизации</p>
                <p className="font-medium">{trackData.sampleRate}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Размер файла</p>
                <p className="font-medium">{trackData.fileSize}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Формат</p>
                <p className="font-medium">{trackData.format}</p>
              </div>
              <div>
                <p className="text-muted-foreground">BPM</p>
                <p className="font-medium">{trackData.bpm}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Статистика */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Статистика прослушивания</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">{trackData.playCount}</div>
                <div className="text-sm text-muted-foreground">Воспроизведений</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-secondary">{trackData.addedDate}</div>
                <div className="text-sm text-muted-foreground">Добавлен</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">{trackData.lastPlayed}</div>
                <div className="text-sm text-muted-foreground">Последнее воспроизведение</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}