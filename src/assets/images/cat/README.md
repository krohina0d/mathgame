# Инструкция по добавлению изображений котика и рыбок

## Текущее состояние

Сейчас используются эмодзи вместо изображений для быстрого тестирования:
- 🐱 - котик в спокойном состоянии
- 😸 - котик радуется за правильную пару  
- 😿 - котик грустит из-за неправильной пары
- 🐟 - рыбки рядом с баллами

## Для замены на реальные изображения

### Структура файлов

Поместите ваши изображения в следующие папки:

#### Для котика:
- `src/assets/images/cat/cat-waiting.gif` - котик в спокойном состоянии (ждет ввода пары)
- `src/assets/images/cat/cat-happy.gif` - котик радуется за правильную пару
- `src/assets/images/cat/cat-sad.gif` - котик грустит из-за неправильной пары

#### Для рыбок:
- `src/assets/images/fish.png` - изображение рыбок для отображения рядом с баллами

### Обновление компонентов

После добавления файлов, обновите файл `src/components/CatCharacter.tsx`:

1. Раскомментируйте импорты:
```typescript
import catWaiting from '../assets/images/cat/cat-waiting.gif';
import catHappy from '../assets/images/cat/cat-happy.gif';
import catSad from '../assets/images/cat/cat-sad.gif';
```

2. Замените функцию `getCatEmoji()` на `getCatImage()`:
```typescript
const getCatImage = () => {
  switch (currentState) {
    case 'happy':
      return catHappy;
    case 'sad':
      return catSad;
    case 'waiting':
    default:
      return catWaiting;
  }
};
```

3. Замените эмодзи на изображение в JSX:
```typescript
<Box
  component="img"
  src={getCatImage()}
  alt={`Котик ${currentState === 'waiting' ? 'ждет' : currentState === 'happy' ? 'радуется' : 'грустит'}`}
  sx={{
    width: 80,
    height: 80,
    objectFit: 'contain',
    borderRadius: '50%',
    transition: 'all 0.3s ease-in-out',
    ...getAnimationStyle()
  }}
/>
```

### Обновление изображения рыбок

В файле `src/components/NumberGame.tsx`:

1. Добавьте импорт:
```typescript
import fishImage from '../assets/images/fish.png';
```

2. Замените эмодзи рыбки на изображение:
```typescript
<Box
  component="img"
  src={fishImage}
  alt="Рыбка"
  sx={{
    width: 20,
    height: 20,
    objectFit: 'contain'
  }}
/>
```

## Рекомендуемые размеры

- **Котик**: 120x120 пикселей (квадратное изображение)
- **Рыбки**: 20x20 пикселей (маленькая иконка)

## Форматы файлов

- **GIF** для котика (для анимации)
- **PNG** для рыбок (для прозрачности)

## Примечание

Если изображения не загружаются, проверьте:
1. Правильность путей к файлам
2. Наличие файлов в указанных папках
3. Корректность импортов в TypeScript
4. Настройки сборщика (Vite) для статических ресурсов