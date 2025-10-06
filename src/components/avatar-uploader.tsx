"use client"

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'

export function AvatarUploader() {
  const { data: session } = useSession()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const submit = async () => {
    if (!session) return
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch('/api/profile/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: url.trim() })
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Аватар обновлен')
        setUrl('')
        setTimeout(() => setSuccess(''), 2000)
      } else {
        setError(data.error || 'Не удалось обновить аватар')
      }
    } catch (e) {
      console.error(e)
      setError('Ошибка запроса')
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  return (
    <div>
      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="mb-2">
          <AlertDescription className="text-green-700">{success}</AlertDescription>
        </Alert>
      )}
      <div className="flex gap-2">
        <Input
          placeholder="URL аватара"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button onClick={submit} disabled={loading}>
          {loading ? 'Сохранение...' : 'Сохранить'}
        </Button>
      </div>
    </div>
  )
}
