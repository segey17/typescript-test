"use client"

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MessageCircle, ThumbsUp, ThumbsDown, Trash2, Loader2 } from 'lucide-react'

interface UserInfo {
  id: number
  username: string
  avatar?: string | null
}

interface CommentItem {
  id: number
  comment: string
  createdAt: string
  user: UserInfo
  likesCount: number
  dislikesCount: number
  userLikeType: 'LIKE' | 'DISLIKE' | null
}

interface Props {
  animeId: number
}

export function CommentsBox({ animeId }: Props) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<CommentItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [input, setInput] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadComments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/anime/${animeId}/comments`)
      const data = await res.json()
      if (res.ok) {
        setComments(data.comments || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadComments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animeId, session?.user?.id])

  const submitComment = async () => {
    if (!session) return
    if (!input.trim()) return

    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`/api/anime/${animeId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: input.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setComments((prev) => [data.comment, ...prev])
        setInput('')
      } else {
        setError(data.error || 'Не удалось добавить комментарий')
      }
    } catch (e) {
      console.error(e)
      setError('Произошла ошибка при добавлении комментария')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleLike = async (commentId: number, type: 'LIKE' | 'DISLIKE') => {
    if (!session) return
    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      })
      const data = await res.json()
      if (res.ok) {
        setComments((prev) => prev.map((c) => c.id === commentId ? {
          ...c,
          likesCount: data.likesCount,
          dislikesCount: data.dislikesCount,
          userLikeType: data.userLikeType,
        } : c))
      }
    } catch (e) {
      console.error(e)
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!session) return
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' })
      const data = await res.json()
      if (res.ok && data.success) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Комментарии ({comments.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {session ? (
          <div className="mb-6">
            {error && (
              <Alert variant="destructive" className="mb-3">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Оставьте комментарий..."
              />
              <Button onClick={submitComment} disabled={submitting}>
                {submitting ? (<Loader2 className="h-4 w-4 animate-spin" />) : 'Отправить'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            Войдите, чтобы оставить комментарий
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => {
              const canDelete = session && (session.user.id === String(comment.user.id) || (session.user as any).role === 'ADMIN')
              return (
                <div key={comment.id} className="flex gap-3 p-4 bg-muted/30 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={comment.user.avatar || undefined} />
                    <AvatarFallback>
                      {comment.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{comment.user.username}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(comment.createdAt).toLocaleDateString('ru-RU')}
                      </span>
                      {canDelete && (
                        <button
                          onClick={() => deleteComment(comment.id)}
                          className="ml-auto text-muted-foreground hover:text-destructive"
                          title="Удалить комментарий"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed">{comment.comment}</p>
                    <div className="mt-2 flex items-center gap-4">
                      <button
                        onClick={() => toggleLike(comment.id, 'LIKE')}
                        className={`inline-flex items-center gap-1 text-sm ${comment.userLikeType === 'LIKE' ? 'text-green-600' : 'text-muted-foreground'}`}
                      >
                        <ThumbsUp className="h-4 w-4" /> {comment.likesCount}
                      </button>
                      <button
                        onClick={() => toggleLike(comment.id, 'DISLIKE')}
                        className={`inline-flex items-center gap-1 text-sm ${comment.userLikeType === 'DISLIKE' ? 'text-red-600' : 'text-muted-foreground'}`}
                      >
                        <ThumbsDown className="h-4 w-4" /> {comment.dislikesCount}
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Пока нет комментариев</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
