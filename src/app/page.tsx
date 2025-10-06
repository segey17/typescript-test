import { prisma } from '@/lib/prisma'
import { AnimeCard } from '@/components/anime-card'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp, Users, Film, MessageCircle } from 'lucide-react'

async function getAnimeWithStats() {
  const anime = await prisma.anime.findMany({
    include: {
      ratings: true,
      comments: true,
      userStatuses: true,
      creator: {
        select: {
          username: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return anime.map(item => {
    const averageRating = item.ratings.length > 0
      ? item.ratings.reduce((acc, rating) => acc + rating.overallRating, 0) / item.ratings.length
      : 0

    return {
      ...item,
      averageRating,
      ratingsCount: item.ratings.length,
      commentsCount: item.comments.length,
      viewsCount: item.userStatuses.length
    }
  })
}

async function getStats() {
  const totalAnime = await prisma.anime.count()
  const totalUsers = await prisma.user.count()
  const totalRatings = await prisma.rating.count()
  const totalComments = await prisma.comment.count()

  return {
    totalAnime,
    totalUsers,
    totalRatings,
    totalComments
  }
}

export default async function HomePage() {
  const [animeList, stats] = await Promise.all([
    getAnimeWithStats(),
    getStats()
  ])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      {/* Hero секция */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <TrendingUp className="h-4 w-4" />
            Добро пожаловать в мир аниме
          </div>

          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6">
            Waka-Waka Anime
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Откройте для себя лучшие аниме, делитесь мнениями и находите новые шедевры в нашем сообществе
          </p>

          {/* Статистика */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-200/20">
              <CardContent className="p-4 text-center">
                <Film className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{stats.totalAnime}</div>
                <div className="text-sm text-muted-foreground">Аниме</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500/10 to-green-600/10 border-green-200/20">
              <CardContent className="p-4 text-center">
                <Users className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">{stats.totalUsers}</div>
                <div className="text-sm text-muted-foreground">Пользователей</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-yellow-500/10 to-yellow-600/10 border-yellow-200/20">
              <CardContent className="p-4 text-center">
                <Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-yellow-600">{stats.totalRatings}</div>
                <div className="text-sm text-muted-foreground">Оценок</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500/10 to-purple-600/10 border-purple-200/20">
              <CardContent className="p-4 text-center">
                <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">{stats.totalComments}</div>
                <div className="text-sm text-muted-foreground">Комментариев</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Каталог аниме */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">Каталог аниме</h2>
              <p className="text-muted-foreground">
                Исследуйте нашу коллекцию из {stats.totalAnime} аниме
              </p>
            </div>

            <Badge variant="outline" className="text-sm">
              {animeList.length} показано
            </Badge>
          </div>

          {animeList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {animeList.map((anime) => (
                <AnimeCard
                  key={anime.id}
                  id={anime.id}
                  title={anime.title}
                  description={anime.description}
                  genre={anime.genre}
                  year={anime.year}
                  studio={anime.studio}
                  imageUrl={anime.imageUrl}
                  averageRating={anime.averageRating}
                  ratingsCount={anime.ratingsCount}
                  commentsCount={anime.commentsCount}
                  viewsCount={anime.viewsCount}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <Film className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Пока нет аниме</h3>
              <p className="text-muted-foreground">
                Станьте первым, кто добавит аниме в каталог!
              </p>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
