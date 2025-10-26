import { useState, useEffect } from "react"
import { Card } from "./ui/card"
import { Button } from "./ui/button"
import { Progress } from "./ui/progress"
import { Slider } from "./ui/slider"
import { Play, Pause, SkipBack, SkipForward, Heart, Volume2, Shuffle, Repeat } from "lucide-react"

interface Track {
  id: string
  title: string
  artist: string
  album: string
  duration: string
  cover?: string
}

interface MusicPlayerProps {
  currentTrack: Track | null
  isPlaying: boolean
  onPlayPause: () => void
  onNext: () => void
  onPrevious: () => void
  onLike: () => void
  isLiked: boolean
}

export function MusicPlayer({ 
  currentTrack, 
  isPlaying, 
  onPlayPause, 
  onNext, 
  onPrevious,
  onLike,
  isLiked
}: MusicPlayerProps) {
  const [progress, setProgress] = useState(0)
  const [volume, setVolume] = useState(75)
  const [isShuffle, setIsShuffle] = useState(false)
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off')

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            onNext()
            return 0
          }
          return prev + 0.5
        })
      }, 250)
      return () => clearInterval(interval)
    }
  }, [isPlaying, onNext])

  if (!currentTrack) return null

  const currentTime = Math.floor((progress / 100) * parseDuration(currentTrack.duration))
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border z-50">
      <div className="px-6 py-4">
        <div className="flex items-center gap-4">
          {/* Информация о треке */}
          <div className="flex items-center gap-3 w-64">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded flex items-center justify-center shrink-0">
              <span className="text-white text-lg">♪</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium truncate">{currentTrack.title}</p>
              <p className="text-sm text-muted-foreground truncate">{currentTrack.artist}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className={`w-8 h-8 p-0 shrink-0 ${isLiked ? 'text-red-500' : 'text-muted-foreground'}`}
              onClick={onLike}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            </Button>
          </div>

          {/* Управление воспроизведением */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className={`w-8 h-8 p-0 ${isShuffle ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setIsShuffle(!isShuffle)}
              >
                <Shuffle className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={onPrevious}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                className="w-10 h-10 rounded-full bg-white text-black hover:bg-white/90"
                onClick={onPlayPause}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={onNext}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`w-8 h-8 p-0 ${repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'}`}
                onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
              >
                <Repeat className="w-4 h-4" />
                {repeatMode === 'one' && <span className="absolute text-[10px] font-bold">1</span>}
              </Button>
            </div>
            
            {/* Прогресс-бар */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
              <div className="flex-1">
                <Progress value={progress} className="h-1 cursor-pointer" />
              </div>
              <span className="text-xs text-muted-foreground w-10">{currentTrack.duration}</span>
            </div>
          </div>

          {/* Громкость */}
          <div className="flex items-center gap-2 w-32">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <Slider
              value={[volume]}
              onValueChange={(value) => setVolume(value[0])}
              max={100}
              step={1}
              className="flex-1"
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

function parseDuration(duration: string): number {
  const parts = duration.split(':')
  const mins = parseInt(parts[0])
  const secs = parseInt(parts[1])
  return mins * 60 + secs
}
