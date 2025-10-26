import { useState, useEffect, useRef, MouseEvent } from "react"
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
  audioUrl?: string
  liked?: boolean
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
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(console.error)
      } else {
        audioRef.current.pause()
      }
    }
  }, [isPlaying, currentTrack])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100
    }
  }, [volume])

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    onNext()
  }

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    if (audioRef.current) {
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioRef.current.currentTime = percent * audioRef.current.duration
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!currentTrack) return null

  return (
      <>
        <audio
            ref={audioRef}
            src={currentTrack.audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
        />

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
                      className={`w-8 h-8 p-0 relative ${repeatMode !== 'off' ? 'text-primary' : 'text-muted-foreground'}`}
                      onClick={() => setRepeatMode(repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off')}
                  >
                    <Repeat className="w-4 h-4" />
                    {repeatMode === 'one' && (
                        <span className="absolute -top-1 -right-1 text-[8px] font-bold bg-primary text-primary-foreground rounded-full w-3 h-3 flex items-center justify-center">
                      1
                    </span>
                    )}
                  </Button>
                </div>

                {/* Прогресс-бар */}
                <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-10 text-right">
                  {formatTime(currentTime)}
                </span>
                  <div
                      className="flex-1 cursor-pointer"
                      onClick={handleProgressClick}
                  >
                    <Progress value={progress} className="h-1" />
                  </div>
                  <span className="text-xs text-muted-foreground w-10">
                  {formatTime(duration)}
                </span>
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
      </>
  )
}