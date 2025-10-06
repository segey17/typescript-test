import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Film, Star, MessageCircle } from 'lucide-react'
import { AvatarUploader } from '@/components/avatar-uploader'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect('/auth/signin')
  }
  const userId = parseInt(session.user.id)

  const [user, ratingsCount, commentsCount, statuses] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, avatar: true, role: true }
    }),
    prisma.rating.count({ where: { userId } }),
    prisma.comment.count({ where: { userId } }),
    prisma.userAnimeStatus.groupBy({
      by: ['status'],
      where: { userId },
      _count: { status: true },
    })
  ])

  const statusMap: Record<string, number> = { PLANNED: 0, WATCHING: 0, COMPLETED: 0, DROPPED: 0 }
  for (const s of statuses) {
    statusMap[s.status] = s._count.status
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Профиль пользователя</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div>
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback>{user?.username?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="mt-4">
                <AvatarUploader />
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="text-2xl font-bold">{user?.username}</div>
              <div className="text-muted-foreground">{user?.email}</div>
              <div>
                Роль: <Badge variant="outline">{(user?.role || '').toString().toUpperCase()}</Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <Card>
                  <CardContent className="p-4 text-center">
                    <Film className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-xl font-bold">{statusMap.WATCHING + statusMap.PLANNED + statusMap.COMPLETED + statusMap.DROPPED}</div>
                    <div className="text-sm text-muted-foreground">Всего в списке</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Star className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-xl font-bold">{ratingsCount}</div>
                    <div className="text-sm text-muted-foreground">Оценок</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <MessageCircle className="h-6 w-6 mx-auto mb-1" />
                    <div className="text-xl font-bold">{commentsCount}</div>
                    <div className="text-sm text-muted-foreground">Комментариев</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-xl font-bold">{statusMap.COMPLETED}</div>
                    <div className="text-sm text-muted-foreground">Завершено</div>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6 text-sm text-muted-foreground">
                <Link href="/">Вернуться на главную</Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
