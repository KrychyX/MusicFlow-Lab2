import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Search, Filter, Play, Calendar, Clock, Heart } from "lucide-react"
import { toast } from "sonner"

interface AlbumsProps {
  onPlayAlbum: (albumId: string) => void
  albums: any[]
}

export function Albums({ onPlayAlbum, albums }: AlbumsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [likedAlbums, setLikedAlbums] = useState<Set<string>>(new Set())

  const genres = ['all', ...Array.from(new Set(albums.map(a => a.genre)))]

  const handleToggleLike = (albumId: string) => {
    const newLiked = new Set(likedAlbums)
    if (newLiked.has(albumId)) {
      newLiked.delete(albumId)
      toast.info("Удалено из избранного")
    } else {
      newLiked.add(albumId)
      toast.success("Добавлено в избранное")
    }
    setLikedAlbums(newLiked)
  }

  const filteredAlbums = albums.filter(album => {
    const matchesSearch = album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        album.artist.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || album.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  const sortedAlbums = [...filteredAlbums].sort((a, b) => {
    switch (sortBy) {
      case 'year':
        return b.year - a.year
      case 'rating':
        return b.rating - a.rating
      case 'artist':
        return a.artist.localeCompare(b.artist)
      default:
        return a.title.localeCompare(b.title)
    }
  })

  const recentAlbums = [...albums].sort((a, b) => b.year - a.year).slice(0, 6)

  return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Альбомы</h1>
            <p className="text-muted-foreground">{filteredAlbums.length} альбомов</p>
          </div>
        </div>

        {/* Панель фильтров */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по названию альбома или исполнителю..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
              </div>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Жанр" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все жанры</SelectItem>
                  {genres.slice(1).map(genre => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Сортировка" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">По названию</SelectItem>
                  <SelectItem value="artist">По исполнителю</SelectItem>
                  <SelectItem value="year">По году</SelectItem>
                  <SelectItem value="rating">По рейтингу</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Недавно добавленные альбомы */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Недавно добавленные
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentAlbums.map((album) => (
                  <div key={album.id} className="group cursor-pointer">
                    <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-lg mb-3 relative overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl opacity-60">
                        ♪
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white rounded-full w-12 h-12"
                            onClick={() => {
                              onPlayAlbum(album.id)
                              toast.success(`Воспроизводится: ${album.title}`)
                            }}
                        >
                          <Play className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>
                    <h4 className="text-sm font-medium line-clamp-1">{album.title}</h4>
                    <p className="text-xs text-muted-foreground line-clamp-1">{album.artist}</p>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Сетка альбомов */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {sortedAlbums.map((album) => (
              <Card key={album.id} className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-4">
                  <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-lg mb-4 relative overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-white text-3xl opacity-60">
                      ♪
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                          size="sm"
                          className="bg-white/90 text-black hover:bg-white rounded-full w-14 h-14"
                          onClick={() => {
                            onPlayAlbum(album.id)
                            toast.success(`Воспроизводится: ${album.title}`)
                          }}
                      >
                        <Play className="w-6 h-6" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <h3 className="font-medium line-clamp-1 mb-1">{album.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-1">{album.artist}</p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{album.year}</span>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                        {album.genre}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {album.duration}
                  </span>
                      <span>•</span>
                      <span>{album.tracks} треков</span>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-yellow-500">★</span>
                        <span className="text-xs">{album.rating}</span>
                      </div>
                      <Button
                          variant="ghost"
                          size="sm"
                          className={`w-8 h-8 p-0 ${likedAlbums.has(album.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                          onClick={() => handleToggleLike(album.id)}
                      >
                        <Heart className={`w-4 h-4 ${likedAlbums.has(album.id) ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  )
}