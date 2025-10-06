import { db } from "@/lib/db";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Calendar, Users } from "lucide-react";

async function getAnimeList() {
  try {
    const anime = await db.anime.findMany({
      include: {
        ratings: true,
        comments: true,
        creator: {
          select: {
            username: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return anime.map((item) => ({
      ...item,
      averageRating: item.ratings.length > 0
        ? item.ratings.reduce((sum, rating) => sum + (rating.overallRating || 0), 0) / item.ratings.length
        : 0,
      ratingsCount: item.ratings.length,
      commentsCount: item.comments.length,
    }));
  } catch (error) {
    console.error("Error fetching anime:", error);
    return [];
  }
}

export default async function HomePage() {
  const animeList = await getAnimeList();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-primary">AnimeHub</h1>
              <Badge variant="secondary" className="text-sm">
                {animeList.length} аниме
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" asChild>
                <Link href="/login">Вход</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Регистрация</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего аниме</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{animeList.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Средний рейтинг</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {animeList.length > 0
                  ? (animeList.reduce((sum, anime) => sum + anime.averageRating, 0) / animeList.length).toFixed(1)
                  : "0.0"
                }
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего оценок</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {animeList.reduce((sum, anime) => sum + anime.ratingsCount, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Anime Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {animeList.map((anime) => (
            <Card key={anime.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="relative aspect-[3/4] overflow-hidden">
                <Image
                  src={anime.imageUrl || "/placeholder-anime.jpg"}
                  alt={anime.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-background/80 backdrop-blur">
                    {anime.year}
                  </Badge>
                </div>
                {anime.averageRating > 0 && (
                  <div className="absolute top-2 left-2">
                    <Badge className="bg-primary/80 backdrop-blur flex items-center gap-1">
                      <Star className="h-3 w-3 fill-current" />
                      {anime.averageRating.toFixed(1)}
                    </Badge>
                  </div>
                )}
              </div>

              <CardHeader className="pb-3">
                <CardTitle className="text-lg leading-tight line-clamp-2">
                  {anime.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {anime.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {anime.genre && (
                    <div className="flex flex-wrap gap-1">
                      {anime.genre.split(",").map((genre, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {genre.trim()}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3" />
                      {anime.ratingsCount} оценок
                    </span>
                    <span className="flex items-center gap-1">
                      💬 {anime.commentsCount}
                    </span>
                  </div>

                  <Button className="w-full" variant="outline" asChild>
                    <Link href={`/anime/${anime.id}`}>
                      Подробнее
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {animeList.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Аниме не найдено</h2>
            <p className="text-muted-foreground mb-6">
              Пока что в каталоге нет аниме. Добавьте первое!
            </p>
            <Button>Добавить аниме</Button>
          </div>
        )}
      </main>
    </div>
  );
}
