import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog"
import { Textarea } from "./ui/textarea"
import { Label } from "./ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Plus, Search, Play, Heart, MoreHorizontal, Clock, Music, Trash2, Edit, GripVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { toast } from "sonner"

interface PlaylistsProps {
  onPlayTrack: (trackId: string) => void
  playlists: any[]
  setPlaylists: (playlists: any[]) => void
}

export function Playlists({ onPlayTrack, playlists, setPlaylists }: PlaylistsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newPlaylist, setNewPlaylist] = useState({ name: "", description: "" })

  // Заглушка для треков плейлиста
  const playlistTracks = [
    {
      id: "1",
      title: "Bohemian Rhapsody",
      artist: "Queen",
      album: "A Night at the Opera",
      duration: "5:55",
      addedDate: "20 октября 2024"
    },
    {
      id: "2",
      title: "Hotel California",
      artist: "Eagles",
      album: "Hotel California",
      duration: "6:30",
      addedDate: "19 октября 2024"
    }
  ]

  const filteredPlaylists = playlists.filter(playlist =>
      playlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreatePlaylist = () => {
    if (newPlaylist.name.trim()) {
      const newPlaylistData = {
        id: Date.now().toString(),
        name: newPlaylist.name,
        description: newPlaylist.description,
        tracks: 0,
        duration: '0m',
        created: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
        isPublic: false
      }
      setPlaylists([...playlists, newPlaylistData])
      toast.success(`Плейлист "${newPlaylist.name}" создан`)
      setIsCreateDialogOpen(false)
      setNewPlaylist({ name: "", description: "" })
    }
  }

  const handleDeletePlaylist = (playlistId: string) => {
    const playlist = playlists.find(p => p.id === playlistId)
    setPlaylists(playlists.filter(p => p.id !== playlistId))
    toast.info(`Плейлист "${playlist?.name}" удален`)
    setSelectedPlaylist(null)
  }

  const currentPlaylist = selectedPlaylist ? playlists.find(p => p.id === selectedPlaylist) : null

  if (selectedPlaylist && currentPlaylist) {
    return (
        <div className="p-6 space-y-6">
          {/* Заголовок плейлиста */}
          <div className="flex items-start gap-6">
            <Button variant="outline" onClick={() => setSelectedPlaylist(null)}>
              ← Назад к плейлистам
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl">{currentPlaylist.name}</h1>
                <Badge variant={currentPlaylist.isPublic ? "default" : "secondary"}>
                  {currentPlaylist.isPublic ? "Публичный" : "Приватный"}
                </Badge>
              </div>
              <p className="text-muted-foreground mb-4">{currentPlaylist.description}</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Music className="w-4 h-4" />
                {currentPlaylist.tracks} треков
              </span>
                <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                  {currentPlaylist.duration}
              </span>
                <span>Создан {currentPlaylist.created}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => {
                if (playlistTracks.length > 0) {
                  onPlayTrack(playlistTracks[0].id)
                  toast.success(`Воспроизводится плейлист: ${currentPlaylist.name}`)
                }
              }}>
                <Play className="w-4 h-4 mr-2" />
                Воспроизвести
              </Button>
              <Button variant="outline">
                <Heart className="w-4 h-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toast.info("Функция редактирования в разработке")}>
                    <Edit className="w-4 h-4 mr-2" />
                    Редактировать
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.info("Функция добавления треков в разработке")}>
                    Добавить треки
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Плейлист экспортирован")}>
                    Экспортировать
                  </DropdownMenuItem>
                  <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDeletePlaylist(selectedPlaylist!)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Удалить плейлист
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Треки плейлиста */}
          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Название</TableHead>
                  <TableHead>Исполнитель</TableHead>
                  <TableHead>Альбом</TableHead>
                  <TableHead>Добавлен</TableHead>
                  <TableHead>Длительность</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {playlistTracks.map((track, index) => (
                    <TableRow key={track.id} className="group hover:bg-muted/50 cursor-pointer">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 cursor-grab" />
                          <span className="text-muted-foreground w-6">{index + 1}</span>
                        </div>
                      </TableCell>
                      <TableCell
                          className="font-medium cursor-pointer hover:text-primary transition-colors"
                          onClick={() => onPlayTrack(track.id)}
                      >
                        {track.title}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{track.artist}</TableCell>
                      <TableCell className="text-muted-foreground">{track.album}</TableCell>
                      <TableCell className="text-muted-foreground">{track.addedDate}</TableCell>
                      <TableCell className="text-muted-foreground">{track.duration}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 opacity-0 group-hover:opacity-100">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              onPlayTrack(track.id)
                              toast.info("Добавлен следующим в очередь")
                            }}>
                              Воспроизвести следующим
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Добавлен в очередь")}>
                              Добавить в очередь
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toast.info("Функция в разработке")}>
                              Добавить в другой плейлист
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => toast.info("Трек убран из плейлиста")}
                            >
                              Убрать из плейлиста
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          {/* Зона для добавления треков */}
          <Card className="bg-card border-border border-dashed">
            <CardContent className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium mb-2">Добавить треки в плейлист</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Перетащите треки из библиотеки или используйте кнопку поиска
                  </p>
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Найти и добавить треки
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
    )
  }

  return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Плейлисты</h1>
            <p className="text-muted-foreground">{filteredPlaylists.length} плейлистов</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Создать плейлист
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создать новый плейлист</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Название плейлиста</Label>
                  <Input
                      id="name"
                      placeholder="Введите название..."
                      value={newPlaylist.name}
                      onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="description">Описание (необязательно)</Label>
                  <Textarea
                      id="description"
                      placeholder="Добавьте описание плейлиста..."
                      value={newPlaylist.description}
                      onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Отмена
                  </Button>
                  <Button onClick={handleCreatePlaylist} disabled={!newPlaylist.name.trim()}>
                    Создать плейлист
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Панель поиска */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                  placeholder="Поиск плейлистов..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Быстрые плейлисты */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Быстрое создание</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => toast.success("Создан плейлист из избранного")}
              >
                <Heart className="w-6 h-6 text-red-500" />
                <div className="text-center">
                  <div className="font-medium">Из избранного</div>
                  <div className="text-xs text-muted-foreground">47 треков</div>
                </div>
              </Button>
              <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => toast.success("Создан плейлист из недавно прослушанных")}
              >
                <Clock className="w-6 h-6 text-blue-500" />
                <div className="text-center">
                  <div className="font-medium">Недавно прослушанные</div>
                  <div className="text-xs text-muted-foreground">23 трека</div>
                </div>
              </Button>
              <Button
                  variant="outline"
                  className="h-auto p-4 flex-col gap-2"
                  onClick={() => toast.success("Создан случайный микс")}
              >
                <Music className="w-6 h-6 text-green-500" />
                <div className="text-center">
                  <div className="font-medium">Случайный микс</div>
                  <div className="text-xs text-muted-foreground">50 треков</div>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Список плейлистов */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaylists.map((playlist) => (
              <Card
                  key={playlist.id}
                  className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => setSelectedPlaylist(playlist.id)}
              >
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Обложка плейлиста */}
                    <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center relative group-hover:scale-105 transition-transform">
                      <div className="grid grid-cols-2 gap-1 w-12 h-12">
                        <div className="bg-white/20 rounded-sm flex items-center justify-center">
                          <Music className="w-3 h-3 text-white" />
                        </div>
                        <div className="bg-white/30 rounded-sm"></div>
                        <div className="bg-white/10 rounded-sm"></div>
                        <div className="bg-white/25 rounded-sm"></div>
                      </div>
                      <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button variant="secondary" size="sm" className="bg-white/90 text-black hover:bg-white">
                          <Play className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium line-clamp-1">{playlist.name}</h3>
                        <Badge variant={playlist.isPublic ? "default" : "secondary"} className="text-xs">
                          {playlist.isPublic ? "Публичный" : "Приватный"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {playlist.description}
                      </p>
                    </div>

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                        <span>{playlist.tracks} треков</span>
                        <span>{playlist.duration}</span>
                      </div>
                      <div className="text-xs">Создан {playlist.created}</div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            toast.success(`Воспроизводится плейлист: ${playlist.name}`)
                          }}
                      >
                        Воспроизвести
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => toast.info("Функция редактирования в разработке")}>
                            <Edit className="w-4 h-4 mr-2" />
                            Редактировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success(`Плейлист "${playlist.name}" дублирован`)}>
                            Дублировать
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toast.success("Плейлист экспортирован")}>
                            Экспортировать
                          </DropdownMenuItem>
                          <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDeletePlaylist(playlist.id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Удалить
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  )
}