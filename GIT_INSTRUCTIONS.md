# Инструкции для загрузки в Git

## Команды для выполнения в терминале:

1. **Проверить статус Git:**
```bash
git status
```

2. **Добавить все файлы:**
```bash
git add .
```

3. **Сделать первый коммит:**
```bash
git commit -m "Initial commit: AI Chat App with Firebase Auth and Admin Panel"
```

4. **Создать репозиторий на GitHub** (если нужно):
   - Перейдите на https://github.com
   - Нажмите "New repository"
   - Назовите репозиторий (например: `ai-chat-app`)
   - НЕ добавляйте README, .gitignore или лицензию (они уже есть)

5. **Подключить к удаленному репозиторию:**
```bash
git remote add origin https://github.com/ВАШ_USERNAME/ai-chat-app.git
```

6. **Загрузить код:**
```bash
git push -u origin main
```

## Структура проекта:

```
ai-chat-app/
├── src/
│   ├── components/
│   │   ├── AuthDialog.tsx
│   │   ├── ChatApp.tsx
│   │   └── AdminPanel.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── config/
│   │   ├── firebase.ts
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── README.md
├── SETUP.md
└── .gitignore
```

## Что включено:

✅ **Система аутентификации** (Google + Email/Password)
✅ **Админ-панель** для управления промптами
✅ **Чат с ИИ** на основе GPT-4-turbo
✅ **Firebase интеграция** (Auth + Firestore)
✅ **Material UI интерфейс**
✅ **TypeScript поддержка**
