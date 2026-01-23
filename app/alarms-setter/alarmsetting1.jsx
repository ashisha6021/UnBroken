import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { useAppStore } from '../../store/useAppStore';
import {
  getAlarmSettingsByTask,
  saveAlarmSettings,
} from '../../storage/storage-sqlite';

import { COLORS, SPACING, TYPOGRAPHY } from '../../constants/theme';

/* --------------------
   OPTIONS
-------------------- */

const RING_OPTIONS = [
  { label: '30 sec', value: 30 },
  { label: '1 min', value: 60 },
  { label: '2 min', value: 120 },
];

const SNOOZE_OPTIONS = [
  { label: '5 min', value: 300 },
  { label: '10 min', value: 600 },
  { label: '15 min', value: 900 },
];

export default function AlarmSettings() {
  const params = useLocalSearchParams();
  const taskId = params?.taskId;
  const router = useRouter();

  const alarmSettings =
    useAppStore((s) => s.alarmSettings[taskId]);

  const setAlarmSettings =
    useAppStore((s) => s.setAlarmSettings);

  /* --------------------
     LOAD SETTINGS
  -------------------- */

  useEffect(() => {
    if (!taskId) return;

    (async () => {
      let settings = await getAlarmSettingsByTask(taskId);

      if (!settings) {
        settings = {
          taskId,
          ringDuration: 120,
          snoozeDuration: 300, // ✅ must match options
          requireBrainGame: false,
          motivationType: null,
          motivationSource: null,
          createdAt: new Date().toISOString(),
        };

        await saveAlarmSettings(settings);
      }

      setAlarmSettings(taskId, {
        ...settings,
        requireBrainGame: Boolean(settings.requireBrainGame),
      });
    })();
  }, [taskId]);

  if (!alarmSettings) return null;

  /* --------------------
     UPDATE HANDLER
  -------------------- */

  const updateSettings = (partial) => {
    const updated = {
      ...alarmSettings,
      ...partial,
    };

    setAlarmSettings(taskId, updated);
    saveAlarmSettings(updated);
  };

  /* --------------------
     UI
  -------------------- */

  return (
    <View style={styles.container}>
      {/* SCROLLABLE CONTENT */}
      {/* <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: SPACING.xl }}
      > */}
        <Text style={styles.title}>
          Non-Critical Alarm Settings
        </Text>

        {/* 🔔 Ring Duration */}
        <Text style={styles.sectionTitle}>
          Ring Duration
        </Text>

        {RING_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.option,
              alarmSettings.ringDuration === opt.value &&
                styles.optionActive,
            ]}
            onPress={() =>
              updateSettings({ ringDuration: opt.value })
            }
          >
            <Text
              style={[
                styles.optionText,
                alarmSettings.ringDuration === opt.value &&
                  styles.optionTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* 🔁 Snooze Duration */}
        <Text style={styles.sectionTitle}>
          Snooze Duration
        </Text>

        {SNOOZE_OPTIONS.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            style={[
              styles.option,
              alarmSettings.snoozeDuration === opt.value &&
                styles.optionActive,
            ]}
            onPress={() =>
              updateSettings({ snoozeDuration: opt.value })
            }
          >
            <Text
              style={[
                styles.optionText,
                alarmSettings.snoozeDuration === opt.value &&
                  styles.optionTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}

        {/* 🧠 Brain Game */}
        <Text style={styles.sectionTitle}>
          Brain Game
        </Text>

        <View style={styles.row}>
          <Text style={styles.label}>
            Require Brain Game
          </Text>
          <Switch
            value={alarmSettings.requireBrainGame}
            onValueChange={(v) =>
              updateSettings({ requireBrainGame: v })
            }
          />
        </View>

        {/* ℹ️ Instruction */}
        <Text style={styles.instruction}>
          Note:{'\n'}
          Critical alarms ignore ring duration and snooze
          settings. They ring continuously and require a
          brain game to stop.
        </Text>
      {/* </ScrollView> */}

      {/* FIXED DONE BUTTON */}
      <TouchableOpacity
        style={styles.doneButton}
        onPress={() => router.back()}
      >
        <Text style={styles.doneText}>DONE</Text>
      </TouchableOpacity>
    </View>
  );
}

/* --------------------
   STYLES
-------------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.md,
  },
  title: {
    ...TYPOGRAPHY.h2,
    color: COLORS.textPrimary,
  },
  sectionTitle: {
    ...TYPOGRAPHY.label,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
    fontSize: SPACING.md,
  },
  option: {
    // padding: SPACING.md,
    padding:12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  optionActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  optionText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  optionTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: SPACING.xs,
      borderColor: COLORS.textPrimary,
    borderRadius: 6,
    borderWidth:1,
    padding:SPACING.md,
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  instruction: {
    fomtSize: SPACING.sm,
    color: COLORS.accent,
    fontWeight: '500',
    marginTop: SPACING.sm
  },
  doneButton: {
    padding: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.md,
  },
  doneText: {
    color: COLORS.background,
    fontWeight: '600',
  },
});
