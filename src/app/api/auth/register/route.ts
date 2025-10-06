import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    // Валидация входных данных
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны для заполнения' },
        { status: 400 }
      )
    }

    // Валидация длины username
    if (username.length < 3 || username.length > 50) {
      return NextResponse.json(
        { error: 'Имя пользователя должно содержать от 3 до 50 символов' },
        { status: 400 }
      )
    }

    // Валидация email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Неверный формат email' },
        { status: 400 }
      )
    }

    // Валидация пароля
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Пароль должен содержать минимум 6 символов' },
        { status: 400 }
      )
    }

    // Проверка существования пользователя
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email }
        ]
      }
    })

    if (existingUser) {
      const field = existingUser.username === username ? 'Пользователь' : 'Email'
      return NextResponse.json(
        { error: `${field} уже зарегистрирован` },
        { status: 409 }
      )
    }

    // Хеширование пароля
    const hashedPassword = await hash(password, 12)

    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: 'USER'
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true
      }
    })

    return NextResponse.json(
      {
        message: 'Регистрация успешна! Теперь вы можете войти в систему.',
        user
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Ошибка регистрации:', error)
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    )
  }
}
