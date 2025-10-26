import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Search, Play, Heart, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface ArtistsProps {
  onPlayArtist: (artistId: string) => void
  artists: any[]
}

export function Artists({ onPlayArtist, artists }: ArtistsProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [likedArtists, setLikedArtists] = useState<Set<string>>(new Set())

  const filteredArtists = artists.filter(artist =>
      artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.genre.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const topArtists = [...artists].sort((a, b) => b.followers - a.followers).slice(0, 5)

  const handleToggleLike = (artistId: string) => {
    const newLiked = new Set(likedArtists)
    if (newLiked.has(artistId)) {
      newLiked.delete(artistId)
      toast.info("Удалено из избранного")
    } else {
      newLiked.add(artistId)
      toast.success("Добавлено в избранное")
    }
    setLikedArtists(newLiked)
  }

  return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Исполнители</h1>
            <p className="text-muted-foreground">{filteredArtists.length} исполнителей</p>
          </div>
        </div>

        {/* Панель поиска */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                  placeholder="Поиск исполнителей или жанров..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Топ исполнители */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Топ исполнители по популярности
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topArtists.map((artist, index) => (
                  <div key={artist.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-4 flex-1">
                  <span className="text-2xl font-bold text-muted-foreground w-8 text-center">
                    {index + 1}
                  </span>
                      <Avatar className="w-12 h-12">
                        <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white">
                          {artist.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-medium">{artist.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {artist.followers.toLocaleString()} подписчиков • {artist.tracks} треков
                        </p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                        {artist.genre}
                      </Badge>
                      <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            onPlayArtist(artist.id)
                            toast.success(`Воспроизводится ${artist.name}`)
                          }}
                      >
                        <Play className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Сетка исполнителей */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
              <Card key={artist.id} className="bg-card border-border hover:shadow-lg transition-shadow cursor-pointer group">
                <CardContent className="p-6">
                  <div className="text-center space-y-4">
                    <div className="relative">
                      <Avatar className="w-24 h-24 mx-auto">
                        <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-white text-2xl">
                          {artist.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                            size="sm"
                            className="bg-white/90 text-black hover:bg-white rounded-full w-12 h-12"
                            onClick={() => {
                              onPlayArtist(artist.id)
                              toast.success(`Воспроизводится ${artist.name}`)
                            }}
                        >
                          <Play className="w-5 h-5" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <h3 className="font-medium">{artist.name}</h3>
                        {artist.trending && (
                            <TrendingUp className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30 mb-3">
                        {artist.genre}
                      </Badge>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Альбомы:</span>
                        <span>{artist.albums}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Треки:</span>
                        <span>{artist.tracks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Длительность:</span>
                        <span>{artist.totalDuration}</span>
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="text-xs text-muted-foreground mb-1">
                        {artist.followers.toLocaleString()} подписчиков
                      </div>
                      <div className="flex justify-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className={likedArtists.has(artist.id) ? 'text-red-500 border-red-500' : ''}
                            onClick={() => handleToggleLike(artist.id)}
                        >
                          <Heart className={`w-3 h-3 ${likedArtists.has(artist.id) ? 'fill-current' : ''}`} />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              onPlayArtist(artist.id)
                              toast.success(`Воспроизводится ${artist.name}`)
                            }}
                        >
                          Все треки
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
          ))}
        </div>
      </div>
  )
}