import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyCJrJxZRudPh3l7CyfcXF7RLTE_H_xRRu0",
  authDomain: "mathgame-530a3.firebaseapp.com",
  databaseURL: "https://mathgame-530a3-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "mathgame-530a3",
  storageBucket: "mathgame-530a3.appspot.com",
  messagingSenderId: "786070135008",
  appId: "1:786070135008:web:d8bc978adaab5b4ef9b085"
};

// Инициализируем Firebase
const app = initializeApp(firebaseConfig);

// Получаем экземпляры сервисов
export const auth = getAuth(app);
export const db = getDatabase(app);
export const googleProvider = new GoogleAuthProvider();

// Настраиваем провайдер Google
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

console.log('Firebase Realtime Database initialized successfully'); 