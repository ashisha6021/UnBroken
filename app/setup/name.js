import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppStore } from '../../store/useAppStore';
import { saveUser } from '../../storage/storage-sqlite';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../../constants/theme';

export default function NameScreen() {
  const router = useRouter();
  const { user, setUser } = useAppStore();
  const [name, setName] = useState(user?.name || '');

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    const updatedUser = {
      ...user,
      name: name.trim(),
    };

    await saveUser(updatedUser);
    setUser(updatedUser);
    router.push('/setup/long-goals');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.title}>What should we call you?</Text>
          <Text style={styles.subtitle}>
            Enter your name to personalize your Unbroken experience.
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Your name"
            placeholderTextColor={COLORS.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            autoCapitalize="words"
            returnKeyType="done"
          />

          <TouchableOpacity style={styles.button} onPress={handleContinue}>
            <Text style={styles.buttonText}>CONTINUE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    maxWidth: 400,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    ...TYPOGRAPHY.h1,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
    lineHeight: 24,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    color: COLORS.textPrimary,
    ...TYPOGRAPHY.body,
    marginBottom: SPACING.lg,
  },
  button: {
    backgroundColor: COLORS.accent,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.button,
    color: COLORS.background,
    textTransform: 'uppercase',
  },
});
