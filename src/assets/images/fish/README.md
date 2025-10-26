# Изображения для мини-игры "Падающие рыбки"

## Необходимые файлы

Поместите следующие изображения в эту папку:

- `gray-fish.png` - серая рыбка
- `red-fish.png` - красная рыбка

## Размеры

Рекомендуемый размер: 60x60 пикселей (квадратные изображения)

## Обновление кода

После добавления файлов, раскомментируйте импорты в файле `src/components/FishRainGame.tsx`:

```typescript
import grayFishImage from '../assets/images/fish/gray-fish.png';
import redFishImage from '../assets/images/fish/red-fish.png';
```

И используйте их вместо эмодзи:

```typescript
component="img"
src={fish.color === 'gray' ? grayFishImage : redFishImage}
alt={`${fish.color} fish`}
sx={{ width: 60, height: 60 }}
```
