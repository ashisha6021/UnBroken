import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAppStore } from '../../store/useAppStore';
import { getTaskLogs, isBreakDay } from '../../storage/storage-sqlite';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  subMonths,
  addMonths,
  getDay,
} from 'date-fns';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function StreakCalendarScreen({ navigation }) {
  const { streak, refreshData } = useAppStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completedDates, setCompletedDates] = useState(new Set());
  const [breakDates, setBreakDates] = useState(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCalendarData();
  }, [currentDate]);

  const loadCalendarData = async () => {
    setLoading(true);
    try {
      const logs = await getTaskLogs();
      const completed = new Set();
      const breaks = new Set();

      // Completed days
      logs.forEach(log => {
        if (Boolean(log.completed)) {
          completed.add(log.date);
        }
      });

      // Break days
      const allDates = new Set(logs.map(log => log.date));
      for (const date of allDates) {
        if (await isBreakDay(date)) {
          breaks.add(date);
        }
      }

      setCompletedDates(completed);
      setBreakDates(breaks);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Monday-first calendar
  const firstDayOfWeek = getDay(monthStart);
  const adjustedFirstDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const emptyCells = Array(adjustedFirstDay).fill(null);

  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const getDayStatus = (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    if (breakDates.has(dateStr)) return 'break';
    if (completedDates.has(dateStr)) return 'completed';
    if (isToday(date)) return 'today';
    return 'empty';
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={goToPreviousMonth} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{format(currentDate, 'MMMM yyyy')}</Text>
        <TouchableOpacity onPress={goToNextMonth} style={styles.monthButton}>
          <Text style={styles.monthButtonText}>›</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak?.currentStreak || 0}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{streak?.longestStreak || 0}</Text>
          <Text style={styles.statLabel}>Longest Streak</Text>
        </View>
      </View>

      <View style={styles.calendarContainer}>
        <View style={styles.dayNamesRow}>
          {dayNames.map((day, index) => (
            <View key={index} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{day}</Text>
            </View>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {emptyCells.map((_, index) => (
            <View key={`empty-${index}`} style={styles.dayCell} />
          ))}

          {daysInMonth.map((date) => {
            const status = getDayStatus(date);
            const dateStr = format(date, 'yyyy-MM-dd');
            const isCurrentDay = isToday(date);

            return (
              <View
                key={dateStr}
                style={[
                  styles.dayCell,
                  status === 'completed' && styles.dayCellCompleted,
                  status === 'break' && styles.dayCellBreak,
                  status === 'today' && styles.dayCellToday,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    status === 'completed' && styles.dayTextCompleted,
                    status === 'break' && styles.dayTextBreak,
                    isCurrentDay && styles.dayTextToday,
                    isCurrentDay && status === 'completed' && styles.dayCompleteTextToday,
                  ]}
                >
                  {format(date, 'd')}
                </Text>

                {status === 'completed' && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.legendCompleted]} />
          <Text style={styles.legendText}>Completed</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.legendBreak]} />
          <Text style={styles.legendText}>Break Day</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, styles.legendToday]} />
          <Text style={styles.legendText}>Today</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  monthTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  monthButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
  },
  monthButtonText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
    fontSize: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.accent,
    fontSize: 32,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  calendarContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dayNameText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dayCellCompleted: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
    
  },
  dayCellBreak: {
    backgroundColor: COLORS.warning + '40',
    borderRadius: BORDER_RADIUS.sm,
  },
  dayCellToday: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
  },
  dayText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  dayTextCompleted: {
    color: COLORS.background,
    fontWeight: '600',
  },
  dayTextBreak: {
    color: COLORS.warning,
  },
  dayTextToday: {
    color: COLORS.accent,
    fontWeight: '700',
  },
  dayCompleteTextToday:{
    color: COLORS.background,
    fontWeight: '700',
  },
  checkmark: {
    position: 'absolute',
    top: 2,
    right: 2,
    
  },
  checkmarkText: {
    fontSize: 10,
    color: COLORS.background,
    fontWeight: 'bold',
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: BORDER_RADIUS.sm,
  },
  legendCompleted: {
    backgroundColor: COLORS.accent,
  },
  legendBreak: {
    backgroundColor: COLORS.warning + '40',
    borderWidth: 1,
    borderColor: COLORS.warning,
  },
  legendToday: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: 'transparent',
  },
  legendText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
});
