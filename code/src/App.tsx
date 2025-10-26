import { useState, useEffect } from "react"
import { Sidebar } from "./components/Sidebar"
import { Dashboard } from "./components/Dashboard"
import { TracksLibrary } from "./components/TracksLibrary"
import { TrackDetail } from "./components/TrackDetail"
import { Artists } from "./components/Artists"
import { Albums } from "./components/Albums"
import { Playlists } from "./components/Playlists"
import { ImportExport } from "./components/ImportExport"
import { Search } from "./components/Search"
import { MusicPlayer } from "./components/MusicPlayer"
import { Toaster } from "./components/ui/sonner"
import { toast } from "sonner"

// Типы
interface Track {
  id: string
  title: string
  artist: string
  album: string
  genre: string
  year: number
  duration: string
  bitrate: string
  liked: boolean
}

interface Artist {
  id: string
  name: string
  genre: string
  followers: number
  tracks: number
  albums: number
  totalDuration: string
  trending?: boolean
}

interface Album {
  id: string
  title: string
  artist: string
  genre: string
  year: number
  duration: string
  tracks: number
  rating: number
  liked: boolean
  cover?: string
}

interface Playlist {
  id: string
  name: string
  description: string
  tracks: number
  duration: string
  created: string
  isPublic: boolean
}

export default function App() {
  const [activeSection, setActiveSection] = useState("dashboard")
  const [showTrackDetail, setShowTrackDetail] = useState(false)
  const [selectedTrackId, setSelectedTrackId] = useState<string | null>(null)

  // Состояния данных
  const [tracks, setTracks] = useState<Track[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [albums, setAlbums] = useState<Album[]>([])
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)

  // Музыкальный плеер
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [likedTracks, setLikedTracks] = useState<Set<string>>(new Set())

  // Загрузка данных
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [tracksData, artistsData, albumsData, playlistsData] = await Promise.all([
        fetch('/api/tracks').then(r => r.json()),
        fetch('/api/artists').then(r => r.json()),
        fetch('/api/albums').then(r => r.json()),
        fetch('/api/playlists').then(r => r.json())
      ])

      setTracks(tracksData)
      setArtists(artistsData)
      setAlbums(albumsData)
      setPlaylists(playlistsData)

      // Инициализируем liked tracks
      const liked = new Set(tracksData.filter((t: Track) => t.liked).map((t: Track) => t.id))
      setLikedTracks(liked)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Ошибка загрузки данных')
    } finally {
      setLoading(false)
    }
  }

  const handleTrackSelect = (trackId: string) => {
    const track = tracks.find(t => t.id === trackId)
    if (track) {
      setCurrentTrack(track)
      setIsPlaying(true)
      toast.success(`Воспроизводится: ${track.title}`)
    }
  }

  const handleToggleLike = async (trackId: string) => {
    try {
      const response = await fetch(`/api/tracks/${trackId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      const result = await response.json()

      const newLiked = new Set(likedTracks)
      if (result.liked) {
        newLiked.add(trackId)
        toast.success("Добавлено в избранное")
      } else {
        newLiked.delete(trackId)
        toast.info("Удалено из избранного")
      }
      setLikedTracks(newLiked)

      // Обновляем локальные данные
      setTracks(prev => prev.map(track =>
          track.id === trackId ? { ...track, liked: result.liked } : track
      ))
    } catch (error) {
      toast.error('Ошибка обновления')
    }
  }

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
    if (!isPlaying && currentTrack) {
      toast.info(`Воспроизведение: ${currentTrack.title}`)
    } else if (isPlaying) {
      toast.info("Пауза")
    }
  }

  const handleNext = () => {
    if (currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id)
      const nextTrack = tracks[(currentIndex + 1) % tracks.length]
      setCurrentTrack(nextTrack)
      setIsPlaying(true)
      toast.info(`Следующий: ${nextTrack.title}`)
    }
  }

  const handlePrevious = () => {
    if (currentTrack) {
      const currentIndex = tracks.findIndex(t => t.id === currentTrack.id)
      const prevTrack = tracks[(currentIndex - 1 + tracks.length) % tracks.length]
      setCurrentTrack(prevTrack)
      setIsPlaying(true)
      toast.info(`Предыдущий: ${prevTrack.title}`)
    }
  }

  const handleTrackDetailOpen = (trackId: string) => {
    setSelectedTrackId(trackId)
    setShowTrackDetail(true)
  }

  const handlePlayArtist = (artistId: string) => {
    const artist = artists.find(a => a.id === artistId)
    if (artist) {
      const artistTracks = tracks.filter(t => t.artist === artist.name)
      if (artistTracks.length > 0) {
        handleTrackSelect(artistTracks[0].id)
      }
    }
  }

  const handlePlayAlbum = (albumId: string) => {
    const album = albums.find(a => a.id === albumId)
    if (album) {
      const albumTracks = tracks.filter(t => t.album === album.title)
      if (albumTracks.length > 0) {
        handleTrackSelect(albumTracks[0].id)
      }
    }
  }

  const renderContent = () => {
    if (showTrackDetail) {
      return (
          <TrackDetail
              trackId={selectedTrackId}
              onBack={() => {
                setShowTrackDetail(false)
                setSelectedTrackId(null)
              }}
              onPlay={handleTrackSelect}
          />
      )
    }

    switch (activeSection) {
      case 'dashboard':
        return (
            <Dashboard
                onPlayTrack={handleTrackSelect}
                tracks={tracks}
                artists={artists}
                albums={albums}
                playlists={playlists}
            />
        )
      case 'search':
        return (
            <Search
                onPlayTrack={handleTrackSelect}
                onPlayArtist={handlePlayArtist}
                onPlayAlbum={handlePlayAlbum}
                tracks={tracks}
                artists={artists}
                albums={albums}
            />
        )
      case 'tracks':
        return (
            <TracksLibrary
                onTrackSelect={handleTrackDetailOpen}
                onPlayTrack={handleTrackSelect}
                likedTracks={likedTracks}
                onToggleLike={handleToggleLike}
                tracks={tracks}
            />
        )
      case 'artists':
        return (
            <Artists
                onPlayArtist={handlePlayArtist}
                artists={artists}
            />
        )
      case 'albums':
        return (
            <Albums
                onPlayAlbum={handlePlayAlbum}
                albums={albums}
            />
        )
      case 'playlists':
        return (
            <Playlists
                onPlayTrack={handleTrackSelect}
                playlists={playlists}
                setPlaylists={setPlaylists}
            />
        )
      case 'import':
        return <ImportExport />
      default:
        return (
            <Dashboard
                onPlayTrack={handleTrackSelect}
                tracks={tracks}
                artists={artists}
                albums={albums}
                playlists={playlists}
            />
        )
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Загрузка...</div>
  }

  return (
      <div className="min-h-screen bg-background text-foreground dark">
        <div className="flex h-screen">
          <Sidebar
              activeSection={activeSection}
              onSectionChange={(section) => {
                setActiveSection(section)
                setShowTrackDetail(false)
              }}
          />
          <main className="flex-1 overflow-auto pb-24">
            {renderContent()}
          </main>
        </div>

        <MusicPlayer
            currentTrack={currentTrack}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onLike={() => currentTrack && handleToggleLike(currentTrack.id)}
            isLiked={currentTrack ? likedTracks.has(currentTrack.id) : false}
        />

        <Toaster position="top-right" />
      </div>
  )
}