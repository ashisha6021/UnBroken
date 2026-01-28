import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppStore } from '../../store/useAppStore';
import {
  getTasks,
  getRewardRulesByTask,
  getPunishmentRulesByTask,
  addRewardRule,
  addPunishmentRule,
  deleteRewardRule,
  deletePunishmentRule,
} from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function RulesScreen() {
  const { tasks: storeTasks } = useAppStore();

  const [tasks, setTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [rewardRules, setRewardRules] = useState([]);
  const [punishmentRules, setPunishmentRules] = useState([]);

  const [showRewardForm, setShowRewardForm] = useState(false);
  const [showPunishmentForm, setShowPunishmentForm] = useState(false);

  const [rewardCondition, setRewardCondition] = useState('');
  const [rewardText, setRewardText] = useState('');
  const [punishmentCondition, setPunishmentCondition] = useState('');
  const [punishmentText, setPunishmentText] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedTaskId) {
      loadRulesForTask(selectedTaskId);
    }
  }, [selectedTaskId]);

  const loadData = async () => {
    const allTasks = await getTasks();
    setTasks(allTasks);

    if (allTasks.length > 0 && !selectedTaskId) {
      setSelectedTaskId(allTasks[0].id);
    }
  };

  const loadRulesForTask = async (taskId) => {
    const rewards = await getRewardRulesByTask(taskId);
    const punishments = await getPunishmentRulesByTask(taskId);
    setRewardRules(rewards);
    setPunishmentRules(punishments);
  };

  const handleAddReward = async () => {
    if (!rewardCondition.trim() || !rewardText.trim()) {
      Alert.alert('Error', 'Please fill in both condition and reward');
      return;
    }

    const newRule = {
      id: Date.now().toString(),
      taskId: selectedTaskId,
      condition: rewardCondition.trim(),
      reward: rewardText.trim(),
      createdAt: new Date().toISOString(),
    };

    await addRewardRule(newRule);
    setRewardCondition('');
    setRewardText('');
    setShowRewardForm(false);
    loadRulesForTask(selectedTaskId);
  };

  const handleAddPunishment = async () => {
    if (!punishmentCondition.trim() || !punishmentText.trim()) {
      Alert.alert('Error', 'Please fill in both condition and punishment');
      return;
    }

    const newRule = {
      id: Date.now().toString(),
      taskId: selectedTaskId,
      condition: punishmentCondition.trim(),
      punishment: punishmentText.trim(),
      createdAt: new Date().toISOString(),
    };

    await addPunishmentRule(newRule);
    setPunishmentCondition('');
    setPunishmentText('');
    setShowPunishmentForm(false);
    loadRulesForTask(selectedTaskId);
  };

  const handleDeleteReward = (ruleId) => {
    Alert.alert(
      'Delete Reward Rule',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteRewardRule(ruleId);
            loadRulesForTask(selectedTaskId);
          },
        },
      ]
    );
  };

  const handleDeletePunishment = (ruleId) => {
    Alert.alert(
      'Delete Punishment Rule',
      'Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deletePunishmentRule(ruleId);
            loadRulesForTask(selectedTaskId);
          },
        },
      ]
    );
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Rewards & Punishments</Text>
        <Text style={styles.subtitle}>
          Define rules for each task to reward consistency and enforce discipline.
        </Text>

        {tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No tasks available</Text>
            <Text style={styles.emptySubtext}>
              Create tasks first to add rules
            </Text>
          </View>
        ) : (
          <>
            {/* TASK SELECTOR */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {tasks.map(task => (
                <TouchableOpacity
                  key={task.id}
                  style={[
                    styles.taskButton,
                    selectedTaskId === task.id && styles.taskButtonActive,
                  ]}
                  onPress={() => setSelectedTaskId(task.id)}
                >
                  <Text
                    style={[
                      styles.taskButtonText,
                      selectedTaskId === task.id &&
                        styles.taskButtonTextActive,
                    ]}
                  >
                    {task.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* REWARD RULES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>REWARD RULES</Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setShowRewardForm(!showRewardForm);
                  setShowPunishmentForm(false);
                }}
              >
                <Text style={styles.addButtonText}>
                  {showRewardForm ? '−' : '+ ADD'}
                </Text>
              </TouchableOpacity>

              {showRewardForm && (
                <View style={styles.formCard}>
                  <TextInput
                    style={styles.input}
                    placeholder="Condition"
                    value={rewardCondition}
                    onChangeText={setRewardCondition}
                    multiline
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Reward"
                    value={rewardText}
                    onChangeText={setRewardText}
                    multiline
                  />
                  <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleAddReward}
                  >
                    <Text style={styles.saveButtonText}>SAVE</Text>
                  </TouchableOpacity>
                </View>
              )}

              {rewardRules.map(rule => (
                <View key={rule.id} style={styles.ruleCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleCondition}>{rule.condition}</Text>
                    <Text style={styles.ruleReward}>→ {rule.reward}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleDeleteReward(rule.id)}>
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* PUNISHMENT RULES */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>PUNISHMENT RULES</Text>

              <TouchableOpacity
                style={styles.addButton}
                onPress={() => {
                  setShowPunishmentForm(!showPunishmentForm);
                  setShowRewardForm(false);
                }}
              >
                <Text style={styles.addButtonText}>
                  {showPunishmentForm ? '−' : '+ ADD'}
                </Text>
              </TouchableOpacity>

              {punishmentRules.map(rule => (
                <View key={rule.id} style={styles.ruleCard}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.ruleCondition}>{rule.condition}</Text>
                    <Text style={styles.rulePunishment}>→ {rule.punishment}</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeletePunishment(rule.id)}
                  >
                    <Text style={styles.deleteButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SPACING.lg,
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textPrimary,
    letterSpacing: 1,
  },
  taskSelector: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  taskButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: SPACING.sm,
  },
  taskButtonActive: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accent,
  },
  taskButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  taskButtonTextActive: {
    color: COLORS.background,
    fontWeight: '600',
  },
  addButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
  },
  addButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
  },
  formCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.md,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.md,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
  },
  cancelButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  cancelButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textSecondary,
  },
  saveButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.accent,
    borderRadius: BORDER_RADIUS.sm,
  },
  saveButtonText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.background,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
  ruleCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ruleContent: {
    flex: 1,
  },
  ruleCondition: {
    ...TYPOGRAPHY.body,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  ruleReward: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.accent,
  },
  rulePunishment: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.error,
  },
  deleteButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  deleteButtonText: {
    ...TYPOGRAPHY.h2,
    color: COLORS.error,
    fontSize: 24,
  },
});
