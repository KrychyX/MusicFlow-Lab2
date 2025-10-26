import { useState, FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { User, LogIn, UserPlus, Music } from "lucide-react"
import { toast } from "sonner"

interface AuthProps {
    onLogin: (user: any, token: string) => void
    onLogout: () => void
    user: any
    token: string | null
}

export function Auth({ onLogin, onLogout, user, token }: AuthProps) {
    const [activeTab, setActiveTab] = useState("login")
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    })

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const endpoint = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register'
            const payload = activeTab === 'login'
                ? { email: formData.email, password: formData.password }
                : formData

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            })

            const data = await response.json()

            if (response.ok) {
                onLogin(data.user, data.token)
                toast.success(data.message)
                setFormData({ username: "", email: "", password: "" })
            } else {
                toast.error(data.error)
            }
        } catch (error) {
            toast.error('Ошибка соединения')
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = () => {
        onLogout()
        toast.info('Вы вышли из системы')
    }

    if (user && token) {
        return (
            <div className="p-6">
                <Card className="bg-card border-border">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            Профиль пользователя
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-medium text-xl">
                                {user.username.slice(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium text-lg">{user.username}</h3>
                                <p className="text-muted-foreground">{user.email}</p>
                                <p className="text-sm text-muted-foreground">
                                    Зарегистрирован: {new Date(user.createdAt).toLocaleDateString('ru-RU')}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="text-lg font-bold text-primary">47</div>
                                <div className="text-sm text-muted-foreground">Треков</div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="text-lg font-bold text-secondary">12</div>
                                <div className="text-sm text-muted-foreground">Часов</div>
                            </div>
                            <div className="p-3 bg-muted/30 rounded-lg">
                                <div className="text-lg font-bold text-purple-400">8</div>
                                <div className="text-sm text-muted-foreground">Жанров</div>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full" onClick={handleLogout}>
                            Выйти
                        </Button>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="p-6">
            <Card className="bg-card border-border max-w-md mx-auto">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                        <Music className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle>MusicFlow</CardTitle>
                    <p className="text-muted-foreground">Войдите в свою учетную запись</p>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="login" className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" />
                                Вход
                            </TabsTrigger>
                            <TabsTrigger value="register" className="flex items-center gap-2">
                                <UserPlus className="w-4 h-4" />
                                Регистрация
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="login-email">Email</Label>
                                    <Input
                                        id="login-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="login-password">Пароль</Label>
                                    <Input
                                        id="login-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Вход...' : 'Войти'}
                                </Button>
                            </form>
                        </TabsContent>

                        <TabsContent value="register">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="register-username">Имя пользователя</Label>
                                    <Input
                                        id="register-username"
                                        placeholder="Ваше имя"
                                        value={formData.username}
                                        onChange={(e) => setFormData({...formData, username: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-email">Email</Label>
                                    <Input
                                        id="register-email"
                                        type="email"
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="register-password">Пароль</Label>
                                    <Input
                                        id="register-password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        required
                                    />
                                </div>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                                </Button>
                            </form>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    )
}