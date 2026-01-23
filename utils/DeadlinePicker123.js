import { useState } from 'react';
import { View, Text, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '../constants/theme';

export default function DeadlinePicker({ value, onChange }) {
  const [show, setShow] = useState(false);

  const dateValue = value ? new Date(value) : new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const handleChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      const iso = selectedDate.toISOString().slice(0, 10);
      onChange(iso);
    }
  };
 const formatDisplayDate = (date) => {
  const d = date.getDate().toString().padStart(2, '0');
  const m = date.toLocaleString('en-US', { month: 'short' });
  const y = date.getFullYear();
  return `${d} ${m} ${y}`;
};
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Deadline</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => setShow(true)}
      >
        <Text style={styles.buttonText}>
          {value ? formatDisplayDate(dateValue) : 'Select deadline'}
        </Text>
      </TouchableOpacity>

      {show && (
        <DateTimePicker
          value={dateValue}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
          minimumDate={today}
          onChange={handleChange}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
  },
});
