import { db } from '../config/firebase';
import { ref, push, get, query, orderByChild, limitToLast } from 'firebase/database';
import { User, LeaderboardEntry, UserAchievement } from '../types/types';

const STORAGE_KEYS = {
  USER: 'math_game_user'
};

// Локальное сохранение пользователя
export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEYS.USER);
  return userData ? JSON.parse(userData) : null;
};

// Firebase Realtime Database операции
export const saveLeaderboardEntry = async (entry: LeaderboardEntry): Promise<void> => {
  try {
    console.log('Attempting to save leaderboard entry:', entry);

    const leaderboardRef = ref(db, 'leaderboard');
    const newEntryRef = push(leaderboardRef);

    await push(leaderboardRef, {
      userId: entry.userId,
      displayName: entry.displayName,
      score: Number(entry.score),
      level: Number(entry.level),
      foundPairs: Number(entry.foundPairs),
      timestamp: Date.now()
    });

    console.log('Entry saved successfully');
  } catch (error) {
    console.error('Error saving leaderboard entry:', error);
    throw error;
  }
};

export const getLeaderboardEntries = async (): Promise<LeaderboardEntry[]> => {
  try {
    console.log('Fetching leaderboard entries...');
    
    const leaderboardRef = ref(db, 'leaderboard');
    const leaderboardQuery = query(
      leaderboardRef,
      orderByChild('score'),
      limitToLast(100)
    );
    
    const snapshot = await get(leaderboardQuery);
    const entries: LeaderboardEntry[] = [];
    
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        entries.push({
          id: childSnapshot.key,
          userId: data.userId,
          displayName: data.displayName,
          score: Number(data.score),
          level: Number(data.level),
          foundPairs: Number(data.foundPairs),
          timestamp: data.timestamp
        });
      });
    }

    // Сортируем по убыванию счета
    entries.sort((a, b) => b.score - a.score);
    
    console.log('Fetched entries:', entries);
    return entries;
  } catch (error) {
    console.error('Error getting leaderboard entries:', error);
    return [];
  }
};

export const saveUserAchievement = async (userId: string, achievement: UserAchievement): Promise<void> => {
  try {
    const userAchievementsRef = ref(db, `users/${userId}/achievements`);
    await push(userAchievementsRef, achievement);
  } catch (error) {
    console.error('Error saving achievement:', error);
    throw error;
  }
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    const userAchievementsRef = ref(db, `users/${userId}/achievements`);
    const snapshot = await get(userAchievementsRef);
    
    if (!snapshot.exists()) return [];

    const achievements: UserAchievement[] = [];
    snapshot.forEach((childSnapshot) => {
      achievements.push(childSnapshot.val());
    });

    return achievements;
  } catch (error) {
    console.error('Error getting achievements:', error);
    return [];
  }
}; 