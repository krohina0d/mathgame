// Конфигурация для API ключей
export const API_CONFIG = {
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY || '',
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
};

// Проверка наличия API ключа
export const isApiKeyConfigured = (): boolean => {
  return Boolean(API_CONFIG.OPENAI_API_KEY);
};
