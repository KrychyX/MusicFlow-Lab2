import { useState } from "react"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Search, Filter, Play, Heart, MoreHorizontal, Grid, List } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"

interface TracksLibraryProps {
  onTrackSelect: (trackId: string) => void
  onPlayTrack: (trackId: string) => void
  likedTracks: Set<string>
  onToggleLike: (trackId: string) => void
  tracks: any[]
}

export function TracksLibrary({ onTrackSelect, onPlayTrack, likedTracks, onToggleLike, tracks }: TracksLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "table">("table")
  const [hoveredTrack, setHoveredTrack] = useState<string | null>(null)

  const genres = ['all', ...Array.from(new Set(tracks.map(t => t.genre)))]

  const filteredTracks = tracks.filter(track => {
    const matchesSearch = track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.album.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesGenre = selectedGenre === 'all' || track.genre === selectedGenre
    return matchesSearch && matchesGenre
  })

  return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl mb-2">Библиотека треков</h1>
            <p className="text-muted-foreground">{filteredTracks.length} из {tracks.length} треков</p>
          </div>

          <div className="flex items-center gap-2">
            <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Панель фильтров */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Поиск по названию, исполнителю или альбому..."
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
            </div>
          </CardContent>
        </Card>

        {/* Список треков */}
        {viewMode === 'table' ? (
            <Card className="bg-card border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">#</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Исполнитель</TableHead>
                    <TableHead>Альбом</TableHead>
                    <TableHead>Жанр</TableHead>
                    <TableHead>Год</TableHead>
                    <TableHead>Длительность</TableHead>
                    <TableHead>Качество</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTracks.map((track, index) => (
                      <TableRow
                          key={track.id}
                          className="group cursor-pointer hover:bg-muted/50 transition-colors"
                          onMouseEnter={() => setHoveredTrack(track.id)}
                          onMouseLeave={() => setHoveredTrack(null)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {hoveredTrack === track.id ? (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-8 h-8 p-0"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      onPlayTrack(track.id)
                                    }}
                                >
                                  <Play className="w-3 h-3" />
                                </Button>
                            ) : (
                                <span className="text-muted-foreground w-8 text-center">{index + 1}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          <button
                              onClick={() => onTrackSelect(track.id)}
                              className="hover:text-primary transition-colors text-left"
                          >
                            {track.title}
                          </button>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{track.artist}</TableCell>
                        <TableCell className="text-muted-foreground">{track.album}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                            {track.genre}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{track.year}</TableCell>
                        <TableCell className="text-muted-foreground">{track.duration}</TableCell>
                        <TableCell className="text-muted-foreground">{track.bitrate}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="sm"
                                className={`w-8 h-8 p-0 ${likedTracks.has(track.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onToggleLike(track.id)
                                }}
                            >
                              <Heart className={`w-4 h-4 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => onPlayTrack(track.id)}>Воспроизвести</DropdownMenuItem>
                                <DropdownMenuItem>Добавить в плейлист</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onTrackSelect(track.id)}>Подробная информация</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">Удалить</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredTracks.map((track) => (
                  <Card
                      key={track.id}
                      className="bg-card border-border hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <CardContent className="p-4">
                      <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-3 relative group-hover:scale-105 transition-transform">
                        <Play className="w-8 h-8 text-white" />
                        <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                              variant="secondary"
                              size="sm"
                              className="bg-white/90 text-black hover:bg-white rounded-full w-12 h-12"
                              onClick={() => onPlayTrack(track.id)}
                          >
                            <Play className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                      <div
                          className="mb-2 cursor-pointer hover:text-primary transition-colors"
                          onClick={() => onTrackSelect(track.id)}
                      >
                        <h3 className="font-medium line-clamp-1">{track.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">{track.artist}</p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 text-xs">
                          {track.genre}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <span>{track.duration}</span>
                          <Button
                              variant="ghost"
                              size="sm"
                              className={`w-6 h-6 p-0 ${likedTracks.has(track.id) ? 'text-red-500' : 'text-muted-foreground'}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                onToggleLike(track.id)
                              }}
                          >
                            <Heart className={`w-3 h-3 ${likedTracks.has(track.id) ? 'fill-current' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
        )}
      </div>
  )
}