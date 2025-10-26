import { Music, Home, User, Album, ListMusic, Download, Play, Search, History } from "lucide-react"
import { Button } from "./ui/button"

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export function Sidebar({ activeSection, onSectionChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Главная', icon: Home },
    { id: 'search', label: 'Поиск', icon: Search },
    { id: 'tracks', label: 'Треки', icon: Music },
    { id: 'artists', label: 'Исполнители', icon: User },
    { id: 'albums', label: 'Альбомы', icon: Album },
    { id: 'playlists', label: 'Плейлисты', icon: ListMusic },
    { id: 'history', label: 'История', icon: History },
    { id: 'profile', label: 'Профиль', icon: User },
    { id: 'import', label: 'Импорт/Экспорт', icon: Download },
  ]

  return (
      <div className="w-64 bg-sidebar border-r border-sidebar-border h-full p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-secondary rounded-lg flex items-center justify-center">
            <Play className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-lg font-bold text-sidebar-foreground">MusicFlow</h1>
        </div>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
                <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    className={`w-full justify-start gap-3 ${
                        activeSection === item.id
                            ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                            : 'text-sidebar-foreground hover:bg-sidebar-accent'
                    }`}
                    onClick={() => onSectionChange(item.id)}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
            )
          })}
        </nav>

        {/* Статистика в сайдбаре */}
        <div className="mt-8 p-4 bg-sidebar-accent rounded-lg">
          <h3 className="font-medium text-sm mb-2">Статистика</h3>
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Треков прослушано:</span>
              <span className="text-foreground">47</span>
            </div>
            <div className="flex justify-between">
              <span>Время прослушивания:</span>
              <span className="text-foreground">3.2ч</span>
            </div>
            <div className="flex justify-between">
              <span>Любимых треков:</span>
              <span className="text-foreground">12</span>
            </div>
          </div>
        </div>
      </div>
  )
}