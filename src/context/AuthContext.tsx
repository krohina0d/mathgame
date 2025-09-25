import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userProfile?.role === 'admin';

  // Создание или получение профиля пользователя
  const createOrGetUserProfile = async (user: User): Promise<UserProfile> => {
    try {
      const userRef = doc(db, 'users', user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || data.displayName || '',
          role: data.role || 'user',
          createdAt: data.createdAt?.toDate() || new Date(),
        };
      } else {
        // Создаем новый профиль
        const newProfile: UserProfile = {
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || '',
          role: 'user', // По умолчанию обычный пользователь
          createdAt: new Date(),
        };

        await setDoc(userRef, {
          ...newProfile,
          createdAt: newProfile.createdAt,
        });

        // Если это первый пользователь, делаем его админом
        const usersSnapshot = await getDoc(doc(db, 'users', 'count'));
        if (!usersSnapshot.exists()) {
          console.log('Первый пользователь - делаем админом');
          await setDoc(userRef, {
            ...newProfile,
            role: 'admin',
            createdAt: newProfile.createdAt,
          });
          newProfile.role = 'admin';
        }

        return newProfile;
      }
    } catch (error) {
      console.error('Ошибка работы с профилем:', error);
      // Возвращаем базовый профиль при ошибке
      return {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        role: 'user',
        createdAt: new Date(),
      };
    }
  };

  // Создание дефолтных промптов
  const createDefaultPrompts = async () => {
    try {
      const promptsRef = doc(db, 'system', 'prompts');
      const promptsSnap = await getDoc(promptsRef);
      
      if (!promptsSnap.exists()) {
        const defaultPrompts = [{
          id: 'default',
          title: 'Основной промпт',
          content: 'Ты полезный ИИ-ассистент. Отвечай на русском языке, будь вежливым и полезным.',
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }];
        
        await setDoc(promptsRef, { prompts: defaultPrompts });
        console.log('Дефолтные промпты созданы');
      }
    } catch (error) {
      console.error('Ошибка создания дефолтных промптов:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const profile = await createOrGetUserProfile(result.user);
      setUserProfile(profile);
    } catch (error) {
      console.error('Ошибка входа:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await result.user.updateProfile({ displayName });
      const profile = await createOrGetUserProfile(result.user);
      setUserProfile(profile);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await createOrGetUserProfile(result.user);
      setUserProfile(profile);
    } catch (error) {
      console.error('Ошибка входа через Google:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
    } catch (error) {
      console.error('Ошибка выхода:', error);
      throw error;
    }
  };

  useEffect(() => {
    console.log('AuthProvider: Инициализация аутентификации');
    
    // Таймаут для предотвращения бесконечной загрузки
    const timeoutId = setTimeout(() => {
      console.log('AuthProvider: Таймаут загрузки - принудительное завершение');
      setLoading(false);
    }, 10000); // 10 секунд
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('AuthProvider: Изменение состояния аутентификации', user ? 'пользователь найден' : 'пользователь не найден');
      
      // Очищаем таймаут, так как получили ответ
      clearTimeout(timeoutId);
      
      if (user) {
        setUser(user);
        try {
          console.log('AuthProvider: Загрузка профиля пользователя...');
          const profile = await createOrGetUserProfile(user);
          console.log('AuthProvider: Профиль загружен:', profile);
          setUserProfile(profile);
          
          // Создаем дефолтные промпты при первом входе
          await createDefaultPrompts();
        } catch (error) {
          console.error('AuthProvider: Ошибка загрузки профиля:', error);
          // Устанавливаем базовый профиль даже при ошибке
          setUserProfile({
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            role: 'user',
            createdAt: new Date(),
          });
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      
      console.log('AuthProvider: Завершение загрузки');
      setLoading(false);
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    logout,
    isAdmin,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};