import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Container,
  Alert,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface SystemPrompt {
  id: string;
  title: string;
  content: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AdminPanel = () => {
  const [prompts, setPrompts] = useState<SystemPrompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingPrompt, setEditingPrompt] = useState<SystemPrompt | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Загрузка промптов
  const loadPrompts = async () => {
    try {
      const promptsRef = doc(db, 'system', 'prompts');
      const promptsSnap = await getDoc(promptsRef);
      
      if (promptsSnap.exists()) {
        const data = promptsSnap.data();
        setPrompts(data.prompts || []);
      } else {
        // Создаем дефолтный промпт
        const defaultPrompt: SystemPrompt = {
          id: 'default',
          title: 'Основной промпт',
          content: 'Ты полезный ИИ-ассистент. Отвечай на русском языке, будь вежливым и полезным.',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await setDoc(promptsRef, { prompts: [defaultPrompt] });
        setPrompts([defaultPrompt]);
      }
    } catch (error) {
      console.error('Ошибка загрузки промптов:', error);
      setError('Ошибка загрузки промптов');
    } finally {
      setLoading(false);
    }
  };

  // Сохранение промптов
  const savePrompts = async (updatedPrompts: SystemPrompt[]) => {
    setSaving(true);
    setError(null);
    
    try {
      const promptsRef = doc(db, 'system', 'prompts');
      await setDoc(promptsRef, { prompts: updatedPrompts });
      setPrompts(updatedPrompts);
      setSuccess('Промпты успешно сохранены');
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error('Ошибка сохранения промптов:', error);
      setError('Ошибка сохранения промптов');
    } finally {
      setSaving(false);
    }
  };

  // Обновление промпта
  const updatePrompt = (updatedPrompt: SystemPrompt) => {
    const updatedPrompts = prompts.map(p => 
      p.id === updatedPrompt.id ? { ...updatedPrompt, updatedAt: new Date() } : p
    );
    savePrompts(updatedPrompts);
    setEditDialogOpen(false);
    setEditingPrompt(null);
  };

  // Переключение активного промпта
  const toggleActivePrompt = (promptId: string) => {
    const updatedPrompts = prompts.map(p => ({
      ...p,
      isActive: p.id === promptId ? !p.isActive : false, // Только один может быть активным
      updatedAt: new Date(),
    }));
    savePrompts(updatedPrompts);
  };

  // Открытие диалога редактирования
  const openEditDialog = (prompt: SystemPrompt) => {
    setEditingPrompt(prompt);
    setEditDialogOpen(true);
  };

  useEffect(() => {
    loadPrompts();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Админ-панель
      </Typography>
      <Typography variant="body1" color="text.secondary" gutterBottom>
        Управление системными промптами для ИИ
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {prompts.map((prompt) => (
          <Paper key={prompt.id} elevation={2} sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6" gutterBottom>
                  {prompt.title}
                  {prompt.isActive && (
                    <Typography component="span" color="primary" sx={{ ml: 1 }}>
                      (Активный)
                    </Typography>
                  )}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  Обновлен: {prompt.updatedAt.toLocaleString()}
                </Typography>
                <Typography variant="body1" sx={{ 
                  backgroundColor: 'grey.100', 
                  p: 1, 
                  borderRadius: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  whiteSpace: 'pre-wrap',
                  maxHeight: '100px',
                  overflow: 'auto'
                }}>
                  {prompt.content}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                <IconButton
                  color="primary"
                  onClick={() => openEditDialog(prompt)}
                  disabled={saving}
                >
                  <EditIcon />
                </IconButton>
                <Button
                  variant={prompt.isActive ? "contained" : "outlined"}
                  size="small"
                  onClick={() => toggleActivePrompt(prompt.id)}
                  disabled={saving}
                >
                  {prompt.isActive ? 'Деактивировать' : 'Активировать'}
                </Button>
              </Box>
            </Box>
          </Paper>
        ))}
      </Box>

      {/* Диалог редактирования */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Редактировать промпт</DialogTitle>
        <DialogContent>
          {editingPrompt && (
            <Box sx={{ pt: 1 }}>
              <TextField
                fullWidth
                label="Название"
                value={editingPrompt.title}
                onChange={(e) => setEditingPrompt({ ...editingPrompt, title: e.target.value })}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Содержание промпта"
                multiline
                rows={8}
                value={editingPrompt.content}
                onChange={(e) => setEditingPrompt({ ...editingPrompt, content: e.target.value })}
                margin="normal"
                helperText="Опишите, как должен вести себя ИИ. Это будет добавлено к каждому сообщению пользователя."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Отмена</Button>
          <Button 
            onClick={() => editingPrompt && updatePrompt(editingPrompt)}
            variant="contained"
            startIcon={<SaveIcon />}
            disabled={saving}
          >
            {saving ? <CircularProgress size={20} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;