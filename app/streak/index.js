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
  /* ===========================
     SCREEN BASE
  ============================ */

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },

  /* ===========================
     MONTH HEADER
  ============================ */

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.xl,
  },

  monthTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },

  monthButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.surfaceElevated,

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 5,
  },

  monthButtonText: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: -2,
  },

  /* ===========================
     STREAK STATS CARDS
  ============================ */

  statsContainer: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },

  statCard: {
    flex: 1,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    paddingVertical: SPACING.lg,
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },

  statValue: {
    fontSize: 36,
    fontWeight: "900",
    color: COLORS.accent,
    marginBottom: 6,
  },

  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  /* ===========================
     CALENDAR CARD CONTAINER
  ============================ */

  calendarContainer: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.xl,

    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 7,
  },

  /* ===========================
     DAY NAME HEADER
  ============================ */

  dayNamesRow: {
    flexDirection: "row",
    marginBottom: SPACING.md,
  },

  dayNameCell: {
    flex: 1,
    alignItems: "center",
  },

  dayNameText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textMuted,
    letterSpacing: 0.5,
  },

  /* ===========================
     CALENDAR GRID
  ============================ */

  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },

  /* ===========================
     DAY CELL BASE
  ============================ */

  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 6,
  },

  dayText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },

  /* ===========================
     COMPLETED DAY (Premium Pill)
  ============================ */

  dayCellCompleted: {
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,

    shadowColor: COLORS.accent,
    shadowOpacity: 0.55,
    shadowRadius: 10,
    elevation: 6,
  },

  dayTextCompleted: {
    color: COLORS.background,
    fontWeight: "800",
  },

  /* ===========================
     BREAK DAY (Soft Amber Outline)
  ============================ */

  dayCellBreak: {
    borderWidth: 1.5,
    borderColor: COLORS.warning,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(255,180,0,0.08)",
  },

  dayTextBreak: {
    color: COLORS.warning,
    fontWeight: "700",
  },

  /* ===========================
     TODAY (Glow Ring)
  ============================ */

  dayCellToday: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: "rgba(0,255,150,0.05)",
  },

  dayTextToday: {
    color: COLORS.accent,
    fontWeight: "900",
  },

  dayCompleteTextToday: {
    color: COLORS.background,
    fontWeight: "900",
  },

  /* ===========================
     CHECK ICON
  ============================ */

checkmark: {
  marginTop: 2,
},

checkmarkText: {
  fontSize: 10,
  fontWeight: "900",
  color: COLORS.background,
},


  /* ===========================
     LEGEND (Premium Chips)
  ============================ */

  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: SPACING.md,
    flexWrap: "wrap",
    marginTop: SPACING.md,
  },

  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.surfaceElevated,

    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },

  legendColor: {
    width: 14,
    height: 14,
    borderRadius: BORDER_RADIUS.full,
  },

  legendCompleted: {
    backgroundColor: COLORS.accent,
  },

  legendBreak: {
    borderWidth: 1.5,
    borderColor: COLORS.warning,
    backgroundColor: "rgba(255,180,0,0.15)",
  },

  legendToday: {
    borderWidth: 2,
    borderColor: COLORS.accent,
    backgroundColor: "transparent",
  },

  legendText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
});
