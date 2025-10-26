# Анимации котика для мини-игры

## Необходимые файлы

Поместите следующие GIF файлы в эту папку:

- `cat-eating.gif` - котик ест рыбку
- `cat-fishing.gif` - котик рыбачит (показывает, что рыбки нет)

## Размеры

Рекомендуемый размер: 100x100 пикселей (квадратное изображение для анимации)

## Обновление кода

После добавления файлов, раскомментируйте импорты в файле `src/components/FishRainGame.tsx`:

```typescript
import catEatingGif from '../assets/images/cat-animations/cat-eating.gif';
import catFishingGif from '../assets/images/cat-animations/cat-fishing.gif';
```

И используйте их в компоненте для отображения правильных анимаций вместо заглушек.
