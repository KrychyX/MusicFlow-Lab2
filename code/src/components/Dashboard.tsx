import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { Button } from "./ui/button"
import { Music, User, Album, ListMusic, TrendingUp, Clock, Play } from "lucide-react"

interface DashboardProps {
  onPlayTrack: (trackId: string) => void
  tracks: any[]
  artists: any[]
  albums: any[]
  playlists: any[]
}

export function Dashboard({ onPlayTrack, tracks, artists, albums, playlists }: DashboardProps) {
  const [stats, setStats] = useState({
    totalTracks: 0,
    totalArtists: 0,
    totalAlbums: 0,
    totalPlaylists: 0,
    totalDuration: 0,
    likedTracks: 0
  })

  useEffect(() => {
    // Загружаем статистику с сервера
    fetch('/api/stats')
        .then(r => r.json())
        .then(data => setStats(data))
        .catch(() => {
          // Если API недоступно, считаем локально
          const totalDuration = tracks.reduce((total, track) => {
            const [min, sec] = track.duration.split(':').map(Number)
            return total + min * 60 + sec
          }, 0)

          setStats({
            totalTracks: tracks.length,
            totalArtists: artists.length,
            totalAlbums: albums.length,
            totalPlaylists: playlists.length,
            totalDuration,
            likedTracks: tracks.filter(t => t.liked).length
          })
        })
  }, [tracks, artists, albums, playlists])

  const statsData = [
    {
      title: 'Всего треков',
      value: stats.totalTracks.toString(),
      icon: Music,
      color: 'from-primary to-purple-400'
    },
    {
      title: 'Исполнителей',
      value: stats.totalArtists.toString(),
      icon: User,
      color: 'from-secondary to-blue-400'
    },
    {
      title: 'Альбомов',
      value: stats.totalAlbums.toString(),
      icon: Album,
      color: 'from-purple-500 to-pink-400'
    },
    {
      title: 'Плейлистов',
      value: stats.totalPlaylists.toString(),
      icon: ListMusic,
      color: 'from-blue-500 to-cyan-400'
    },
  ]

  const recentTracks = tracks.slice(0, 4).map((track, index) => ({
    ...track,
    addedDays: index + 2
  }))

  // Рассчитываем статистику по жанрам
  const genreStats = () => {
    const genreCount: Record<string, number> = {}

    tracks.forEach(track => {
      genreCount[track.genre] = (genreCount[track.genre] || 0) + 1
    })

    const totalTracks = tracks.length
    const genres = Object.entries(genreCount)
        .map(([genre, count]) => ({
          genre,
          percentage: Math.round((count / totalTracks) * 100),
          count
        }))
        .sort((a, b) => b.percentage - a.percentage)
        .slice(0, 5)

    return genres
  }

  // Форматируем общую длительность
  const formatTotalDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}ч ${minutes}м`
  }

  return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl mb-2">Добро пожаловать в MusicFlow</h1>
          <p className="text-muted-foreground">Ваша персональная музыкальная коллекция</p>
        </div>

        {/* Статистические карточки */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat) => {
            const Icon = stat.icon
            return (
                <Card key={stat.title} className="bg-card border-border hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm">{stat.title}</CardTitle>
                    <div className={`w-8 h-8 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +12% с прошлого месяца
                    </div>
                  </CardContent>
                </Card>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Недавно добавленные */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Недавно добавленные
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentTracks.length > 0 ? (
                  recentTracks.map((track) => (
                      <div
                          key={track.id}
                          className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                          onClick={() => onPlayTrack(track.id)}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center relative">
                          <Music className="w-6 h-6 text-white" />
                          <Button
                              size="sm"
                              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/70 w-full h-full"
                              onClick={(e) => {
                                e.stopPropagation()
                                onPlayTrack(track.id)
                              }}
                          >
                            <Play className="w-5 h-5 text-white" />
                          </Button>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{track.title}</p>
                          <p className="text-sm text-muted-foreground truncate">{track.artist} • {track.album}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{track.duration}</p>
                          <p className="text-xs text-muted-foreground">{track.addedDays}д назад</p>
                        </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Music className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет недавно добавленных треков</p>
                  </div>
              )}
            </CardContent>
          </Card>

          {/* Статистика по жанрам */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Статистика по жанрам</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {genreStats().length > 0 ? (
                  genreStats().map((genre, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{genre.genre}</span>
                          <span className="text-muted-foreground">{genre.count} треков</span>
                        </div>
                        <Progress value={genre.percentage} className="h-2" />
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Нет данных по жанрам</p>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Дополнительная статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Общая длительность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {formatTotalDuration(stats.totalDuration)}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Всех треков в библиотеке</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Любимые треки</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">
                {stats.likedTracks}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Добавлено в избранное</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-sm">Средняя длительность</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {tracks.length > 0
                    ? `${Math.round(stats.totalDuration / tracks.length / 60)}:${Math.round((stats.totalDuration / tracks.length) % 60).toString().padStart(2, '0')}`
                    : '0:00'
                }
              </div>
              <p className="text-sm text-muted-foreground mt-1">Средняя длина трека</p>
            </CardContent>
          </Card>
        </div>

        {/* Последняя активность */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Последняя активность</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-primary">47</div>
                <div className="text-sm text-muted-foreground">Треков прослушано</div>
                <div className="text-xs text-muted-foreground mt-1">за последние 7 дней</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-secondary">
                  {formatTotalDuration(11520)} {/* 3.2 часа в секундах */}
                </div>
                <div className="text-sm text-muted-foreground">Часов прослушано</div>
                <div className="text-xs text-muted-foreground mt-1">сегодня</div>
              </div>
              <div className="text-center p-4 bg-muted/30 rounded-lg">
                <div className="text-2xl font-bold text-purple-400">12</div>
                <div className="text-sm text-muted-foreground">Новых треков</div>
                <div className="text-xs text-muted-foreground mt-1">добавлено на этой неделе</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Быстрый доступ */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Быстрый доступ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => onPlayTrack(tracks[0]?.id)}
                  disabled={tracks.length === 0}
              >
                <Play className="w-6 h-6" />
                <span>Воспроизвести</span>
              </Button>

              <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    const randomTrack = tracks[Math.floor(Math.random() * tracks.length)]
                    if (randomTrack) onPlayTrack(randomTrack.id)
                  }}
                  disabled={tracks.length === 0}
              >
                <TrendingUp className="w-6 h-6" />
                <span>Случайный трек</span>
              </Button>

              <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
                  onClick={() => {
                    const likedTracks = tracks.filter(t => t.liked)
                    if (likedTracks.length > 0) {
                      onPlayTrack(likedTracks[0].id)
                    }
                  }}
                  disabled={stats.likedTracks === 0}
              >
                <Music className="w-6 h-6 text-red-500" />
                <span>Любимые</span>
              </Button>

              <Button
                  variant="outline"
                  className="h-20 flex-col gap-2"
              >
                <ListMusic className="w-6 h-6" />
                <span>Все плейлисты</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
  )
}