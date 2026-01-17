import { format, getDay, parseISO } from 'date-fns';

// Convert day of week string to date-fns day index (0 = Sunday, 1 = Monday, etc.)
export const getDayIndex = (dayOfWeek) => {
  const dayMap = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6,
  };
  return dayMap[dayOfWeek.toLowerCase()];
};

// Check if a task should be active today
export const isTaskActiveToday = (task) => {
  const today = new Date();
  const todayDayIndex = getDay(today); // 0 = Sunday, 1 = Monday, etc.
  
  // Convert task days to indices
  const taskDayIndices = task.daysOfWeek.map(day => getDayIndex(day));
  
  return taskDayIndices.includes(todayDayIndex);
};

// Get today's date in YYYY-MM-DD format
export const getTodayDateString = () => {
  return format(new Date(), 'yyyy-MM-dd');
};

// Format date for display
export const formatDateDisplay = (dateString) => {
  const date = parseISO(dateString);
  return format(date, 'MMM dd, yyyy');
};
