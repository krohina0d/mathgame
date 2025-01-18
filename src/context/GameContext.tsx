import { createContext, useState, useContext, useEffect } from 'react';
import { GameContextType, PlayerScore } from '../types/game.types';
import { db } from '../config/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  addDoc, 
  getDocs,
  serverTimestamp,
  deleteDoc,
  doc 
} from 'firebase/firestore';

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider = ({ children }: { children: React.ReactNode }) => {
  const [playerName, setPlayerName] = useState<string>(() => 
    localStorage.getItem('playerName') || ''
  );
  const [highScores, setHighScores] = useState<PlayerScore[]>([]);
  const [isAdmin] = useState(() => {
    const adminStatus = localStorage.getItem('isAdmin') === 'true';
    console.log('Admin status:', adminStatus);
    return adminStatus;
  });

  useEffect(() => {
    localStorage.setItem('playerName', playerName);
  }, [playerName]);

  useEffect(() => {
    fetchHighScores();
  }, []);

  const fetchHighScores = async () => {
    try {
      console.log('Fetching high scores...');
      const scoresRef = collection(db, 'scores');
      console.log('Collection reference created');
      
      const q = query(
        scoresRef,
        orderBy('score', 'desc'),
        limit(10)
      );
      console.log('Query created');
      
      const querySnapshot = await getDocs(q);
      console.log('Query executed, documents count:', querySnapshot.size);
      
      const scores: PlayerScore[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('Processing document:', { id: doc.id, data });
        scores.push({
          id: doc.id,
          name: data.name,
          score: data.score,
          timestamp: data.timestamp?.toMillis() || Date.now(),
        });
      });
      
      console.log('Final scores array:', scores);
      setHighScores(scores);
    } catch (error) {
      console.error('Error fetching high scores:', error);
      if (error instanceof Error) {
        console.error('Fetch error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }
  };

  const updateHighScores = async (score: number) => {
    if (!playerName || score === 0) {
      console.log('Skipping score update:', { playerName, score });
      return;
    }

    try {
      console.log('Starting high score update:', { playerName, score });
      const scoresRef = collection(db, 'scores');
      
      const newScore = {
        name: playerName,
        score: score,
        timestamp: serverTimestamp(),
      };
      
      console.log('Preparing to save score:', newScore);
      
      console.log('Firebase connection:', db ? 'Connected' : 'Not connected');
      
      const docRef = await addDoc(scoresRef, newScore);
      console.log('Score saved successfully with ID:', docRef.id);

      await fetchHighScores();
    } catch (error) {
      console.error('Error updating high scores:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }
  };

  const deleteScore = async (scoreId: string) => {
    if (!isAdmin) {
      console.log('Unauthorized delete attempt');
      return;
    }

    try {
      console.log('Deleting score:', scoreId);
      const scoreRef = doc(db, 'scores', scoreId);
      await deleteDoc(scoreRef);
      console.log('Score deleted successfully');
      await fetchHighScores();
    } catch (error) {
      console.error('Error deleting score:', error);
    }
  };

  const clearAllScores = async () => {
    if (!isAdmin) {
      console.log('Unauthorized clear attempt');
      return;
    }

    try {
      console.log('Starting database cleanup...');
      const scoresRef = collection(db, 'scores');
      const querySnapshot = await getDocs(scoresRef);
      
      const deletePromises = querySnapshot.docs.map(doc => 
        deleteDoc(doc.ref)
      );
      
      await Promise.all(deletePromises);
      console.log('Database cleared successfully');
      
      await fetchHighScores();
    } catch (error) {
      console.error('Error clearing database:', error);
    }
  };

  return (
    <GameContext.Provider value={{ 
      playerName, 
      setPlayerName, 
      highScores, 
      updateHighScores,
      isAdmin,
      deleteScore,
      clearAllScores
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}; 