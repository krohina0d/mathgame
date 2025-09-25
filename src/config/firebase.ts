import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  
    apiKey: "AIzaSyCTJXzrliUGdUGQmvl4wtKVjiJgYyXqPGA",
    authDomain: "math-chat-app-32b58.firebaseapp.com",
    projectId: "math-chat-app-32b58",
    storageBucket: "math-chat-app-32b58.firebasestorage.app",
    messagingSenderId: "384055352603",
    appId: "1:384055352603:web:aea21a19cc2d4612dd87be"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Получаем экземпляры сервисов
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Настраиваем провайдер Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log('Firebase Firestore initialized successfully');
console.log('Firebase config:', {
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain,
  apiKey: firebaseConfig.apiKey ? '***' + firebaseConfig.apiKey.slice(-4) : 'not set'
}); 