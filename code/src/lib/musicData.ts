export interface Track {
  id: string
  title: string
  artist: string
  album: string
  genre: string
  duration: string
  year: number
  bitrate: string
  liked: boolean
}

export interface Artist {
  id: string
  name: string
  genre: string
  albums: number
  tracks: number
  totalDuration: string
  followers: number
  trending: boolean
  image?: string
}

export interface Album {
  id: string
  title: string
  artist: string
  year: number
  genre: string
  tracks: number
  duration: string
  rating: number
  liked: boolean
  cover?: string
}

export interface Playlist {
  id: string
  name: string
  description: string
  tracks: number
  duration: string
  created: string
  isPublic: boolean
}

export const tracks: Track[] = [
  { id: '1', title: 'Midnight City', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', genre: 'Electronic', duration: '4:04', year: 2011, bitrate: '320 kbps', liked: true },
  { id: '2', title: 'Strobe', artist: 'Deadmau5', album: 'For Lack of a Better Name', genre: 'Electronic', duration: '10:36', year: 2009, bitrate: '320 kbps', liked: false },
  { id: '3', title: 'Teardrop', artist: 'Massive Attack', album: 'Mezzanine', genre: 'Trip-Hop', duration: '5:29', year: 1998, bitrate: '256 kbps', liked: true },
  { id: '4', title: 'Born Slippy', artist: 'Underworld', album: 'Born Slippy', genre: 'Electronic', duration: '9:50', year: 1996, bitrate: '320 kbps', liked: false },
  { id: '5', title: 'Paranoid Android', artist: 'Radiohead', album: 'OK Computer', genre: 'Rock', duration: '6:23', year: 1997, bitrate: '320 kbps', liked: true },
  { id: '6', title: 'One More Time', artist: 'Daft Punk', album: 'Discovery', genre: 'Electronic', duration: '5:20', year: 2001, bitrate: '320 kbps', liked: true },
  { id: '7', title: 'Windowlicker', artist: 'Aphex Twin', album: 'Windowlicker', genre: 'IDM', duration: '6:07', year: 1999, bitrate: '320 kbps', liked: false },
  { id: '8', title: 'Blue Monday', artist: 'New Order', album: 'Power, Corruption & Lies', genre: 'New Wave', duration: '7:30', year: 1983, bitrate: '256 kbps', liked: true },
  { id: '9', title: 'Breathe', artist: 'The Prodigy', album: 'The Fat of the Land', genre: 'Electronic', duration: '5:35', year: 1997, bitrate: '320 kbps', liked: false },
  { id: '10', title: 'Porcelain', artist: 'Moby', album: 'Play', genre: 'Electronic', duration: '4:01', year: 1999, bitrate: '320 kbps', liked: true },
  { id: '11', title: 'Time', artist: 'Hans Zimmer', album: 'Inception OST', genre: 'Soundtrack', duration: '4:35', year: 2010, bitrate: '320 kbps', liked: true },
  { id: '12', title: 'Intro', artist: 'The xx', album: 'xx', genre: 'Indie', duration: '2:11', year: 2009, bitrate: '320 kbps', liked: false },
  { id: '13', title: 'Unfinished Sympathy', artist: 'Massive Attack', album: 'Blue Lines', genre: 'Trip-Hop', duration: '5:08', year: 1991, bitrate: '256 kbps', liked: true },
  { id: '14', title: 'Firestarter', artist: 'The Prodigy', album: 'The Fat of the Land', genre: 'Electronic', duration: '4:42', year: 1997, bitrate: '320 kbps', liked: false },
  { id: '15', title: 'Around the World', artist: 'Daft Punk', album: 'Homework', genre: 'Electronic', duration: '7:09', year: 1997, bitrate: '320 kbps', liked: true },
  { id: '16', title: 'Outro', artist: 'M83', album: 'Hurry Up, We\'re Dreaming', genre: 'Electronic', duration: '7:07', year: 2011, bitrate: '320 kbps', liked: true },
  { id: '17', title: 'Karma Police', artist: 'Radiohead', album: 'OK Computer', genre: 'Rock', duration: '4:21', year: 1997, bitrate: '320 kbps', liked: false },
  { id: '18', title: 'Shelter', artist: 'The xx', album: 'xx', genre: 'Indie', duration: '4:49', year: 2009, bitrate: '320 kbps', liked: true },
  { id: '19', title: 'Inner City Life', artist: 'Goldie', album: 'Timeless', genre: 'Drum and Bass', duration: '5:06', year: 1995, bitrate: '256 kbps', liked: false },
  { id: '20', title: 'Bizarre Love Triangle', artist: 'New Order', album: 'Brotherhood', genre: 'New Wave', duration: '4:21', year: 1986, bitrate: '256 kbps', liked: true },
]

export const artists: Artist[] = [
  { id: '1', name: 'M83', genre: 'Electronic', albums: 8, tracks: 94, totalDuration: '6h 23m', followers: 125000, trending: true },
  { id: '2', name: 'Deadmau5', genre: 'Electronic', albums: 12, tracks: 156, totalDuration: '11h 47m', followers: 890000, trending: true },
  { id: '3', name: 'Massive Attack', genre: 'Trip-Hop', albums: 5, tracks: 67, totalDuration: '4h 52m', followers: 345000, trending: false },
  { id: '4', name: 'Underworld', genre: 'Electronic', albums: 9, tracks: 123, totalDuration: '8h 15m', followers: 234000, trending: false },
  { id: '5', name: 'Radiohead', genre: 'Rock', albums: 9, tracks: 108, totalDuration: '7h 43m', followers: 1200000, trending: true },
  { id: '6', name: 'Daft Punk', genre: 'Electronic', albums: 4, tracks: 52, totalDuration: '3h 28m', followers: 2100000, trending: false },
  { id: '7', name: 'Aphex Twin', genre: 'IDM', albums: 15, tracks: 287, totalDuration: '18h 42m', followers: 167000, trending: false },
  { id: '8', name: 'New Order', genre: 'New Wave', albums: 10, tracks: 134, totalDuration: '9h 18m', followers: 456000, trending: false },
  { id: '9', name: 'The Prodigy', genre: 'Electronic', albums: 7, tracks: 89, totalDuration: '5h 33m', followers: 678000, trending: true },
  { id: '10', name: 'Moby', genre: 'Electronic', albums: 18, tracks: 245, totalDuration: '14h 12m', followers: 543000, trending: false },
  { id: '11', name: 'Hans Zimmer', genre: 'Soundtrack', albums: 45, tracks: 567, totalDuration: '32h 45m', followers: 1500000, trending: true },
  { id: '12', name: 'The xx', genre: 'Indie', albums: 3, tracks: 33, totalDuration: '2h 18m', followers: 432000, trending: false },
]

export const albums: Album[] = [
  { id: '1', title: 'Hurry Up, We\'re Dreaming', artist: 'M83', year: 2011, genre: 'Electronic', tracks: 22, duration: '1h 13m', rating: 4.8, liked: true, cover: 'https://images.unsplash.com/photo-1629923759854-156b88c433aa?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdXNpYyUyMGFsYnVtJTIwY292ZXJzJTIwdmlueWwlMjByZWNvcmRzfGVufDF8fHx8MTc1ODQ5ODE5MXww&ixlib=rb-4.1.0&q=80&w=1080' },
  { id: '2', title: 'For Lack of a Better Name', artist: 'Deadmau5', year: 2009, genre: 'Electronic', tracks: 12, duration: '1h 2m', rating: 4.6, liked: false },
  { id: '3', title: 'Mezzanine', artist: 'Massive Attack', year: 1998, genre: 'Trip-Hop', tracks: 11, duration: '63m', rating: 4.9, liked: true },
  { id: '4', title: 'Born Slippy', artist: 'Underworld', year: 1996, genre: 'Electronic', tracks: 8, duration: '52m', rating: 4.4, liked: false },
  { id: '5', title: 'OK Computer', artist: 'Radiohead', year: 1997, genre: 'Rock', tracks: 12, duration: '53m', rating: 4.9, liked: true },
  { id: '6', title: 'Discovery', artist: 'Daft Punk', year: 2001, genre: 'Electronic', tracks: 14, duration: '61m', rating: 4.7, liked: true },
  { id: '7', title: 'Selected Ambient Works 85-92', artist: 'Aphex Twin', year: 1992, genre: 'IDM', tracks: 13, duration: '74m', rating: 4.8, liked: false },
  { id: '8', title: 'Power, Corruption & Lies', artist: 'New Order', year: 1983, genre: 'New Wave', tracks: 8, duration: '38m', rating: 4.5, liked: true },
  { id: '9', title: 'The Fat of the Land', artist: 'The Prodigy', year: 1997, genre: 'Electronic', tracks: 10, duration: '55m', rating: 4.7, liked: true },
  { id: '10', title: 'Play', artist: 'Moby', year: 1999, genre: 'Electronic', tracks: 18, duration: '63m', rating: 4.6, liked: false },
  { id: '11', title: 'Inception OST', artist: 'Hans Zimmer', year: 2010, genre: 'Soundtrack', tracks: 12, duration: '49m', rating: 4.9, liked: true },
  { id: '12', title: 'xx', artist: 'The xx', year: 2009, genre: 'Indie', tracks: 11, duration: '38m', rating: 4.5, liked: true },
]

export const playlists: Playlist[] = [
  { id: '1', name: 'Лучшее из Electronic', description: 'Самые любимые электронные треки', tracks: 34, duration: '2h 18m', created: '15 сентября 2024', isPublic: false },
  { id: '2', name: 'Рабочая музыка', description: 'Фоновая музыка для концентрации', tracks: 67, duration: '4h 42m', created: '10 сентября 2024', isPublic: true },
  { id: '3', name: 'Вечерний чилл', description: 'Расслабляющие треки для вечера', tracks: 23, duration: '1h 35m', created: '5 сентября 2024', isPublic: false },
  { id: '4', name: '90s Nostalgia', description: 'Ностальгия по 90-м', tracks: 45, duration: '3h 12m', created: '28 августа 2024', isPublic: true },
  { id: '5', name: 'Trip-Hop Essentials', description: 'Лучшее из trip-hop', tracks: 28, duration: '2h 5m', created: '20 августа 2024', isPublic: false },
  { id: '6', name: 'Workout Mix', description: 'Энергичная музыка для тренировок', tracks: 42, duration: '2h 56m', created: '15 августа 2024', isPublic: true },
]
