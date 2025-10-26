import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { History as HistoryIcon, Play, Clock, TrendingUp, Music } from "lucide-react"
import { toast } from "sonner"

interface HistoryProps {
    onPlayTrack: (trackId: string) => void
    token: string | null
}

interface HistoryItem {
    id: string
    trackId: string
    duration: number
    timestamp: string
    track: {
        id: string
        title: string
        artist: string
        album: string
        duration: string
        audioUrl: string
    }
}

interface Recommendation {
    type: string
    genre?: string
    tracks: any[]
}

export function History({ onPlayTrack, token }: HistoryProps) {
    const [history, setHistory] = useState<HistoryItem[]>([])
    const [recommendations, setRecommendations] = useState<Recommendation | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (token) {
            loadHistory()
            loadRecommendations()
        } else {
            setLoading(false)
        }
    }, [token])

    const loadHistory = async () => {
        try {
            const response = await fetch('/api/history', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setHistory(data)
            }
        } catch (error) {
            console.error('Error loading history:', error)
        }
    }

    const loadRecommendations = async () => {
        try {
            const response = await fetch('/api/recommendations', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setRecommendations(data)
            }
        } catch (error) {
            console.error('Error loading recommendations:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp)
        const now = new Date()
        const diff = now.getTime() - date.getTime()

        if (diff < 60 * 60 * 1000) {
            return 'Только что'
        } else if (diff < 24 * 60 * 60 * 1000) {
            const hours = Math.floor(diff / (60 * 60 * 1000))
            return `${hours} ч назад`
        } else {
            return date.toLocaleDateString('ru-RU')
        }
    }

    if (!token) {
        return (
            <div className="p-6">
                <Card className="bg-card border-border">
                    <CardContent className="p-8 text-center">
                        <HistoryIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-medium mb-2">История прослушивания</h3>
                        <p className="text-muted-foreground mb-4">
                            Войдите в систему, чтобы видеть историю прослушивания и получать рекомендации
                        </p>
                        <Button onClick={() => window.location.reload()}>
                            Обновить страницу
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="p-6">
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Загрузка истории...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl mb-2">История прослушивания</h1>
                <p className="text-muted-foreground">Ваши недавно прослушанные треки</p>
            </div>

            {/* Рекомендации */}
            {recommendations && recommendations.tracks.length > 0 && (
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5" />
                            Рекомендации для вас
                            {recommendations.genre && (
                                <Badge variant="secondary" className="bg-primary/20 text-primary">
                                    {recommendations.genre}
                                </Badge>
                            )}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            {recommendations.tracks.map((track) => (
                                <div
                                    key={track.id}
                                    className="text-center cursor-pointer group"
                                    onClick={() => onPlayTrack(track.id)}
                                >
                                    <div className="aspect-square bg-gradient-to-br from-primary to-secondary rounded-lg mb-2 relative">
                                        <div className="w-full h-full flex items-center justify-center text-white text-xl opacity-60">
                                            ♪
                                        </div>
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Play className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                    <p className="font-medium text-sm line-clamp-1">{track.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{track.artist}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* История прослушивания */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HistoryIcon className="w-5 h-5" />
                        Недавно прослушано
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {history.length > 0 ? (
                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group"
                                    onClick={() => onPlayTrack(item.track.id)}
                                >
                                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center relative">
                                        <Music className="w-6 h-6 text-white" />
                                        <Button
                                            size="sm"
                                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 hover:bg-black/70 w-full h-full"
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onPlayTrack(item.track.id)
                                            }}
                                        >
                                            <Play className="w-4 h-4 text-white" />
                                        </Button>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{item.track.title}</p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            {item.track.artist} • {item.track.album}
                                        </p>
                                    </div>

                                    <div className="text-right text-sm text-muted-foreground">
                                        <div>{formatDate(item.timestamp)}</div>
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {item.track.duration}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            <HistoryIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>История прослушивания пуста</p>
                            <p className="text-sm">Начните слушать музыку, чтобы заполнить историю</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}