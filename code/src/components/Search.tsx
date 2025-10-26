import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Input } from "./ui/input"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Search as SearchIcon, Play, Music, User, Album } from "lucide-react"
import { toast } from "sonner"

interface SearchProps {
    onPlayTrack: (trackId: string) => void
    onPlayArtist: (artistId: string) => void
    onPlayAlbum: (albumId: string) => void
    tracks: any[]
    artists: any[]
    albums: any[]
}

export function Search({ onPlayTrack, onPlayArtist, onPlayAlbum, tracks, artists, albums }: SearchProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState({
        tracks: [],
        artists: [],
        albums: []
    })

    useEffect(() => {
        if (searchQuery.trim()) {
            const filteredTracks = tracks.filter(track =>
                track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                track.artist.toLowerCase().includes(searchQuery.toLowerCase())
            )

            const filteredArtists = artists.filter(artist =>
                artist.name.toLowerCase().includes(searchQuery.toLowerCase())
            )

            const filteredAlbums = albums.filter(album =>
                album.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                album.artist.toLowerCase().includes(searchQuery.toLowerCase())
            )

            setSearchResults({
                tracks: filteredTracks.slice(0, 5),
                artists: filteredArtists.slice(0, 5),
                albums: filteredAlbums.slice(0, 5)
            })
        } else {
            setSearchResults({ tracks: [], artists: [], albums: [] })
        }
    }, [searchQuery, tracks, artists, albums])

    const hasResults = searchResults.tracks.length > 0 ||
        searchResults.artists.length > 0 ||
        searchResults.albums.length > 0

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl mb-2">Поиск</h1>
                <p className="text-muted-foreground">Найдите музыку по названию, исполнителю или альбому</p>
            </div>

            {/* Поисковая строка */}
            <Card className="bg-card border-border">
                <CardContent className="p-4">
                    <div className="relative">
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Поиск музыки..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 text-lg py-6"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Результаты поиска */}
            {searchQuery.trim() && (
                <div className="space-y-6">
                    {/* Треки */}
                    {searchResults.tracks.length > 0 && (
                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <h3 className="font-medium mb-4 flex items-center gap-2">
                                    <Music className="w-4 h-4" />
                                    Треки ({searchResults.tracks.length})
                                </h3>
                                <div className="space-y-2">
                                    {searchResults.tracks.map((track) => (
                                        <div
                                            key={track.id}
                                            className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                            onClick={() => onPlayTrack(track.id)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-primary/20 rounded flex items-center justify-center">
                                                    <Music className="w-4 h-4 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{track.title}</p>
                                                    <p className="text-sm text-muted-foreground">{track.artist} • {track.album}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    onPlayTrack(track.id)
                                                }}
                                            >
                                                <Play className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Исполнители */}
                    {searchResults.artists.length > 0 && (
                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <h3 className="font-medium mb-4 flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Исполнители ({searchResults.artists.length})
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {searchResults.artists.map((artist) => (
                                        <div
                                            key={artist.id}
                                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                            onClick={() => onPlayArtist(artist.id)}
                                        >
                                            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-medium">
                                                {artist.name.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium">{artist.name}</p>
                                                <p className="text-sm text-muted-foreground">{artist.genre} • {artist.tracks} треков</p>
                                            </div>
                                            <Badge variant="secondary" className="bg-primary/20 text-primary">
                                                {artist.followers.toLocaleString()} подписчиков
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Альбомы */}
                    {searchResults.albums.length > 0 && (
                        <Card className="bg-card border-border">
                            <CardContent className="p-6">
                                <h3 className="font-medium mb-4 flex items-center gap-2">
                                    <Album className="w-4 h-4" />
                                    Альбомы ({searchResults.albums.length})
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {searchResults.albums.map((album) => (
                                        <div
                                            key={album.id}
                                            className="text-center cursor-pointer group"
                                            onClick={() => onPlayAlbum(album.id)}
                                        >
                                            <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-lg mb-2 relative">
                                                <div className="w-full h-full flex items-center justify-center text-white text-xl opacity-60">
                                                    ♪
                                                </div>
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Play className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                            <p className="font-medium text-sm line-clamp-1">{album.title}</p>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{album.artist}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Нет результатов */}
                    {!hasResults && (
                        <Card className="bg-card border-border">
                            <CardContent className="p-8 text-center">
                                <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                                <h3 className="font-medium mb-2">Ничего не найдено</h3>
                                <p className="text-muted-foreground">
                                    Попробуйте изменить запрос или поискать по другому названию
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* Подсказка при пустом поиске */}
            {!searchQuery.trim() && (
                <Card className="bg-card border-border">
                    <CardContent className="p-8 text-center">
                        <SearchIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="font-medium mb-2">Начните поиск</h3>
                        <p className="text-muted-foreground mb-4">
                            Введите название трека, имя исполнителя или альбома для поиска
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <Music className="w-6 h-6 mx-auto mb-2 text-primary" />
                                <div>Поиск треков</div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <User className="w-6 h-6 mx-auto mb-2 text-secondary" />
                                <div>Поиск исполнителей</div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <Album className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                <div>Поиск альбомов</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}