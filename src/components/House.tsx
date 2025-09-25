import { Box, Paper } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';
import React from 'react';

interface HouseProps {
    floors: number;
    hasError?: boolean;
}

const buildAnimation = keyframes`
    from {
        transform: translateY(20px);
        opacity: 0;
    }
    to {
        transform: translateY(0);
        opacity: 1;
    }
`;

const roofAnimation = keyframes`
    0% {
        transform: translateX(-10%) translateY(20px) rotate(-5deg);
        opacity: 0;
    }
    100% {
        transform: translateX(-10%) translateY(0) rotate(-5deg);
        opacity: 1;
    }
`;

const emojiAnimation = keyframes`
    0% { transform: scale(1) rotate(0deg); }
    25% { transform: scale(1.3) rotate(10deg); }
    50% { transform: scale(1.3) rotate(-10deg); }
    75% { transform: scale(1.3) rotate(10deg); }
    100% { transform: scale(1) rotate(0deg); }
`;

const peekAnimation = keyframes`
    0% { transform: translateY(100%); }
    100% { transform: translateY(0); }
`;

const hideAnimation = keyframes`
    0% { transform: translateY(0); }
    100% { transform: translateY(-100%); }
`;

const spinAnimation = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const fallAnimation = keyframes`
    0% {
        transform: translateY(0) rotate(0);
        opacity: 1;
    }
    100% {
        transform: translateY(500px) rotate(360deg);
        opacity: 0;
    }
`;

const destroyAnimation = keyframes`
    0% {
        transform: scale(1) rotate(0);
        opacity: 1;
    }
    25% {
        transform: scale(1.1) rotate(2deg);
    }
    100% {
        transform: scale(0.8) rotate(-15deg);
        opacity: 0;
    }
`;

// Массивы для разнообразия дизайна
const WALL_TYPES = [
    {
        type: 'brick',
        colors: ['#d32f2f', '#c62828', '#b71c1c'], // оттенки красного кирпича
        pattern: `
            linear-gradient(335deg, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(155deg, rgba(255,255,255,0.05) 1px, transparent 1px),
            linear-gradient(335deg, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(155deg, rgba(0,0,0,0.1) 1px, transparent 1px)
        `,
        size: '20px 20px',
        position: '0 0, 10px 0, 0 0, 10px 0'
    },
    {
        type: 'wood',
        colors: ['#795548', '#6d4c41', '#5d4037'], // оттенки дерева
        pattern: `
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
        `,
        size: '20px 100%',
        position: '0 0, 10px 0'
    },
    {
        type: 'tile',
        colors: ['#607d8b', '#546e7a', '#455a64'], // оттенки серого для плитки
        pattern: `
            linear-gradient(0deg, rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)
        `,
        size: '20px 20px',
        position: '0 0, 0 0'
    }
];

const FLOOR_COLORS = [
    '#2196f3', // синий
    '#1976d2', // темно-синий
    '#0d47a1', // очень темно-синий
    '#1e88e5', // другой оттенок синего
    '#42a5f5', // светло-синий
];

const EMOJIS = [
    '👶', '👧', '👦', '👩', '👨', '👴', '👵', // люди разного возраста
    '🐱', '🐶', '🐰', '🐼', '🐨', '🦊', '🐯', // животные
    '😊', '😴', '🤔', '😎', '🥰', '😺', '🦁'  // эмоциональные
];

const WINDOW_COLORS = [
    '#e3f2fd', // очень светло-синий
    '#bbdefb', // светло-голубой
    '#90caf9', // голубой
    '#64b5f6', // ярко-голубой
    '#42a5f5', // насыщенный голубой
];

const WINDOW_STYLES = [
    { borderRadius: '4px' },
    { borderRadius: '50%' },
    { borderRadius: '4px 4px 0 0' },
    { borderRadius: '8px' },
    { borderRadius: '4px 12px' },
];

const HouseContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    width: '200px',
    height: '400px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
}));

const FloorsContainer = styled(Box)(({ theme }) => ({
    position: 'relative',
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingBottom: '20px',
    '&::-webkit-scrollbar': {
        width: '8px',
    },
    '&::-webkit-scrollbar-track': {
        background: theme.palette.grey[200],
        borderRadius: '4px',
    },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.primary.main,
        borderRadius: '4px',
        '&:hover': {
            background: theme.palette.primary.dark,
        },
    },
}));

const FloorsWrapper = styled(Box)({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column-reverse',
    gap: '4px',
    alignItems: 'center',
});

interface FloorProps {
    index: number;
    width: number;
    color: string;
    windowColor: string;
    windowStyle: any;
    wallPattern: string;
    wallSize: string;
    wallPosition: string;
    isDestroyed?: boolean;
}

const FallingEmoji = styled(Box)<{ delay: number }>(({ delay }) => ({
    position: 'absolute',
    zIndex: 1,
    animation: `${fallAnimation} 2s ease-in forwards`,
    animationDelay: `${delay}s`,
}));

const Floor = styled(Paper)<FloorProps>(({ theme, index, width, color, windowColor, windowStyle, wallPattern, wallSize, wallPosition, isDestroyed }) => ({
    width: `${width}%`,
    height: '45px',
    backgroundColor: color,
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    animation: isDestroyed ? `${destroyAnimation} 1s ease-out forwards` : `${buildAnimation} 0.5s ease-out forwards`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    position: 'relative',
    transition: 'all 0.3s ease',
    backgroundImage: wallPattern,
    backgroundSize: wallSize,
    backgroundPosition: wallPosition,
    opacity: isDestroyed ? 0 : 1,
    pointerEvents: isDestroyed ? 'none' : 'auto',
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: '4px 4px 0 0',
    },
    '&:hover': {
        transform: isDestroyed ? 'none' : 'translateZ(10px)',
        boxShadow: isDestroyed ? 'none' : '0 4px 8px rgba(0,0,0,0.3)',
    },
}));

const EmojiContainer = styled(Box)({
    position: 'relative',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
        animation: `${emojiAnimation} 1s ease-in-out`,
    },
});

const Window = styled(Box)<{ color: string; style: any; isDark?: boolean }>(({ color, style, isDark }) => ({
    width: '24px',
    height: '24px',
    backgroundColor: isDark ? '#1a237e' : color,
    boxShadow: isDark ? 'inset 0 0 8px rgba(0,0,0,0.8)' : 'inset 0 0 4px rgba(0,0,0,0.2)',
    ...style,
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '2px',
        left: '2px',
        width: '6px',
        height: '6px',
        background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.4)',
        borderRadius: '50%',
        zIndex: 1,
    },
    '&:hover .peek-emoji': {
        animation: `${peekAnimation} 0.5s ease-out forwards`,
    },
    '&:hover .hide-emoji': {
        animation: `${hideAnimation} 0.5s ease-out forwards`,
    },
    '&:hover .spin-emoji': {
        animation: `${spinAnimation} 1s linear infinite`,
    },
}));

const Roof = styled(Paper)(({ theme }) => ({
    position: 'sticky',
    top: 0,
    width: '120%',
    height: '40px',
    backgroundColor: theme.palette.secondary.main,
    transform: 'translateX(-10%) rotate(-5deg)',
    borderRadius: '4px',
    animation: `${roofAnimation} 0.5s ease-out forwards`,
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    zIndex: 2,
    marginBottom: '8px',
    '&::after': {
        content: '""',
        position: 'absolute',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'inherit',
        transform: 'rotate(10deg)',
        borderRadius: '4px',
        boxShadow: 'inset 0 -2px 4px rgba(0,0,0,0.1)',
    },
}));

const Ground = styled(Paper)(({ theme }) => ({
    position: 'sticky',
    bottom: 0,
    width: '140%',
    height: '20px',
    backgroundColor: theme.palette.success.light,
    transform: 'translateX(-14%)',
    borderRadius: '50%',
    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
    zIndex: 2,
    marginTop: '8px',
}));

const House = ({ floors, hasError = false }: HouseProps) => {
    const getRandomFromArray = (array: any[]) => array[Math.floor(Math.random() * array.length)];
    
    // Состояние для отслеживания выпавших смайликов
    const [fallenEmojis, setFallenEmojis] = React.useState<{[key: string]: boolean}>({});
    const [destroyedFloors, setDestroyedFloors] = React.useState<number[]>([]);
    const [fallingEmojis, setFallingEmojis] = React.useState<Array<{emoji: string, delay: number}>>([]);
    
    // Выбираем окно на верхнем этаже для индикации ошибки
    const errorWindow = React.useMemo(() => {
        if (!hasError) return null;
        
        const errorFloor = floors - 1; // Верхний этаж
        const errorWindowIndex = Math.floor(Math.random() * 3); // Случайное окно из первых трех
        
        return { floor: errorFloor, window: errorWindowIndex };
    }, [hasError, floors]);

    // Обработка выпадения смайлика
    React.useEffect(() => {
        if (errorWindow) {
            const key = `${errorWindow.floor}-${errorWindow.window}`;
            const delay = Math.random() * 0.5;
            
            // Добавляем падающий смайлик
            setFallingEmojis(prev => [...prev, { 
                emoji: getRandomFromArray(EMOJIS),
                delay 
            }]);
            
            // Отмечаем смайлик как выпавший
            setFallenEmojis(prev => ({
                ...prev,
                [key]: true
            }));

            // Проверяем, все ли смайлики выпали на этаже
            setTimeout(() => {
                const floorEmojis = Object.keys(fallenEmojis).filter(k => k.startsWith(`${errorWindow.floor}-`));
                if (floorEmojis.length === 3) { // если все 3 смайлика выпали
                    setDestroyedFloors(prev => [...prev, errorWindow.floor]);
                }
            }, 2000);
        }
    }, [errorWindow]);

    // Сохраняем конфигурацию этажей при первом рендере
    const floorsConfig = React.useMemo(() => {
        return Array.from({ length: floors }).map(() => {
            const wallType = getRandomFromArray(WALL_TYPES);
            const windowCount = 3 + Math.floor(Math.random() * 3);
            
            const windowEmojis = Array.from({ length: windowCount }).map(() => ({
                hasEmoji: Math.random() > 0.3,
                emoji: getRandomFromArray(EMOJIS),
                animationClass: getRandomFromArray(['peek-emoji', 'hide-emoji', 'spin-emoji'])
            }));
            
            return {
                wallType,
                floorColor: getRandomFromArray(wallType.colors),
                windowColor: getRandomFromArray(WINDOW_COLORS),
                windowStyle: getRandomFromArray(WINDOW_STYLES),
                width: 85 + Math.random() * 15,
                windowCount,
                windowEmojis
            };
        });
    }, [floors]);
    
    const [hoveredWindows, setHoveredWindows] = React.useState<{[key: string]: string}>({});
    
    const handleWindowHover = (floorIndex: number, windowIndex: number) => {
        const key = `${floorIndex}-${windowIndex}`;
        if (!hoveredWindows[key]) {
            setHoveredWindows(prev => ({
                ...prev,
                [key]: getRandomFromArray(EMOJIS)
            }));
        }
    };

    return (
        <HouseContainer>
            <Roof />
            <FloorsContainer>
                {fallingEmojis.map((fall, index) => (
                    <FallingEmoji key={index} delay={fall.delay}>
                        {fall.emoji}
                    </FallingEmoji>
                ))}
                <FloorsWrapper>
                    {floorsConfig.map((config, floorIndex) => (
                        <Floor
                            key={floorIndex}
                            index={floorIndex}
                            width={config.width}
                            color={config.floorColor}
                            windowColor={config.windowColor}
                            windowStyle={config.windowStyle}
                            wallPattern={config.wallType.pattern}
                            wallSize={config.wallType.size}
                            wallPosition={config.wallType.position}
                            isDestroyed={destroyedFloors.includes(floorIndex)}
                        >
                            {config.windowEmojis.map((windowConfig, windowIndex) => {
                                const windowKey = `${floorIndex}-${windowIndex}`;
                                const isDark = errorWindow && 
                                    errorWindow.floor === floorIndex && 
                                    errorWindow.window === windowIndex;
                                const hasFallen = fallenEmojis[windowKey];
                                
                                return (
                                    <Window
                                        key={windowIndex}
                                        color={config.windowColor}
                                        style={config.windowStyle}
                                        isDark={isDark}
                                        onMouseEnter={() => handleWindowHover(floorIndex, windowIndex)}
                                    >
                                        {!isDark && !hasFallen && windowConfig.hasEmoji ? (
                                            <EmojiContainer className={windowConfig.animationClass}>
                                                {windowConfig.emoji}
                                            </EmojiContainer>
                                        ) : (
                                            !isDark && !hasFallen && hoveredWindows[windowKey] && (
                                                <EmojiContainer className="peek-emoji">
                                                    {hoveredWindows[windowKey]}
                                                </EmojiContainer>
                                            )
                                        )}
                                    </Window>
                                );
                            })}
                        </Floor>
                    ))}
                </FloorsWrapper>
                <Ground />
            </FloorsContainer>
        </HouseContainer>
    );
};

export default House; 