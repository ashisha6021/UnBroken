import { getTaskLogs, isBreakDay } from '../storage/storage-sqlite';
import { format, isToday, parseISO, differenceInDays, addDays, subDays } from 'date-fns';

export const calculateStreak = async () => {
  const logs = await getTaskLogs();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Get all unique dates with at least one completed task
  const datesWithCompletions = new Set();
  logs.forEach(log => {
    if (log.completed) {
      datesWithCompletions.add(log.date);
    }
  });

  if (datesWithCompletions.size === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
    };
  }

  // Sort dates
  const sortedDates = Array.from(datesWithCompletions).sort((a, b) => 
    new Date(a) - new Date(b)
  );

  // Calculate longest streak
  let longestStreak = 1;
  let currentLongest = 1;
  
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = parseISO(sortedDates[i - 1]);
    const currDate = parseISO(sortedDates[i]);
    const daysDiff = differenceInDays(currDate, prevDate);
    
    if (daysDiff === 1) {
      currentLongest++;
      longestStreak = Math.max(longestStreak, currentLongest);
    } else {
      currentLongest = 1;
    }
  }

  // Calculate current streak from today backwards
  let currentStreak = 0;
  let checkDate = parseISO(today);
  let lastActiveDate = null;

  while (true) {
    const dateStr = format(checkDate, 'yyyy-MM-dd');
    const isBreak = await isBreakDay(dateStr);
    
    if (isBreak) {
      // Break days don't break the streak but don't count either
      checkDate = subDays(checkDate, 1);
      continue;
    }

    if (datesWithCompletions.has(dateStr)) {
      currentStreak++;
      if (!lastActiveDate) {
        lastActiveDate = dateStr;
      }
      checkDate = subDays(checkDate, 1);
    } else {
      // If today has no completions, check yesterday
      if (isToday(checkDate) && currentStreak === 0) {
        checkDate = subDays(checkDate, 1);
        continue;
      }
      break;
    }
  }

  return {
    currentStreak,
    longestStreak,
    lastActiveDate,
  };
};
