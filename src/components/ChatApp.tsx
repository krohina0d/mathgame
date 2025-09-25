import { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Paper,
  Typography,
  Container,
  Alert,
  CircularProgress,
  AppBar,
  Toolbar,
  Button,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { API_CONFIG, isApiKeyConfigured } from '../config/api';
import { useAuth } from '../context/AuthContext';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface SystemPrompt {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatApp = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user, userProfile, logout, isAdmin } = useAuth();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Загрузка системного промпта
  useEffect(() => {
    const loadSystemPrompt = async () => {
      try {
        const promptsRef = doc(db, 'system', 'prompts');
        const promptsSnap = await getDoc(promptsRef);
        
        if (promptsSnap.exists()) {
          const data = promptsSnap.data();
          const prompts: SystemPrompt[] = data.prompts || [];
          const activePrompt = prompts.find(p => p.isActive);
          if (activePrompt) {
            setSystemPrompt(activePrompt.content);
          }
        }
      } catch (error) {
        console.error('Ошибка загрузки системного промпта:', error);
      }
    };

    if (user) {
      loadSystemPrompt();
    }
  }, [user]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    if (!isApiKeyConfigured()) {
      setError('API ключ OpenAI не настроен. Пожалуйста, добавьте VITE_OPENAI_API_KEY в переменные окружения.');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    try {
      // Подготавливаем сообщения с системным промптом
      const chatMessages = [
        ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
        ...messages.map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text,
        })),
        {
          role: 'user',
          content: inputText,
        },
      ];

      const response = await fetch(API_CONFIG.OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_CONFIG.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo',
          messages: chatMessages,
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`);
      }

      const data = await response.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.choices[0].message.content,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Произошла ошибка при отправке сообщения');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Ошибка выхода:', error);
    }
  };

  if (showAdminPanel && isAdmin) {
    return (
      <Box>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Админ-панель
            </Typography>
            <Button color="inherit" onClick={() => setShowAdminPanel(false)}>
              Вернуться к чату
            </Button>
            <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
              Выйти
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="md" sx={{ mt: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Управление промптом
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={6}
            label="Системный промпт"
            value={systemPrompt}
            onChange={(e) => setSystemPrompt(e.target.value)}
            helperText="Опишите, как должен вести себя ИИ"
            sx={{ mt: 2 }}
          />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Чат с ИИ
          </Typography>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {userProfile?.displayName || userProfile?.email}
          </Typography>
          {isAdmin && (
            <Button 
              color="inherit" 
              onClick={() => setShowAdminPanel(true)}
              startIcon={<AdminPanelSettingsIcon />}
            >
              Админ
            </Button>
          )}
          <Button color="inherit" onClick={handleLogout} startIcon={<LogoutIcon />}>
            Выйти
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flex: 1, display: 'flex', flexDirection: 'column', py: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        <Paper
          elevation={3}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            {messages.length === 0 && (
              <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
                Начните диалог с ИИ, отправив первое сообщение
              </Typography>
            )}
            
            {messages.map((message) => (
              <Box
                key={message.id}
                sx={{
                  display: 'flex',
                  justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                }}
              >
                <Paper
                  elevation={1}
                  sx={{
                    p: 2,
                    maxWidth: '70%',
                    backgroundColor: message.isUser ? 'primary.main' : 'grey.100',
                    color: message.isUser ? 'primary.contrastText' : 'text.primary',
                  }}
                >
                  <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                    {message.text}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      display: 'block',
                      mt: 1,
                      opacity: 0.7,
                      textAlign: 'right',
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            ))}
            
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Paper elevation={1} sx={{ p: 2, backgroundColor: 'grey.100' }}>
                  <CircularProgress size={20} />
                  <Typography variant="body2" sx={{ ml: 1, display: 'inline' }}>
                    ИИ печатает...
                  </Typography>
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </Box>

          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth
                multiline
                maxRows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Введите ваше сообщение..."
                disabled={isLoading}
                variant="outlined"
                size="small"
              />
              <IconButton
                color="primary"
                onClick={sendMessage}
                disabled={!inputText.trim() || isLoading}
                sx={{ alignSelf: 'flex-end' }}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChatApp;