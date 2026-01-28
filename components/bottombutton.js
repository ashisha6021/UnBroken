import { View, Text, TouchableOpacity,StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, TYPOGRAPHY, SPACING, BORDER_RADIUS } from '../constants/theme';

export default function BottomSaveButton({ onPress }) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        bottom: insets.bottom + 16, // 🔥 THIS REMOVES GREY
        left: 16,
        right: 16,
      }}
    >
      <TouchableOpacity style={styles.saveButton} onPress={onPress}>
        <Text style={styles.saveButtonText}>SAVE PROGRESS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles=StyleSheet.create(

    {
          saveButton: {
            backgroundColor: COLORS.accent,
            paddingVertical: SPACING.md,
            borderRadius: BORDER_RADIUS.md,
            alignItems: 'center',
            marginTop: SPACING.lg,
          },
          saveButtonText: {
            ...TYPOGRAPHY.button,
            color: COLORS.background,
            textTransform: 'uppercase',
          },
    }
)