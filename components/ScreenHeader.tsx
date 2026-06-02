import { COLORS, RADII, SPACING, TYPE } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export default function ScreenHeader({ title, subtitle, onBack }: ScreenHeaderProps) {
  function handleBack() {
    Haptics.selectionAsync().catch(() => {});
    onBack?.();
  }

  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable
          onPress={handleBack}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel="Go back"
          style={({ pressed }) => [styles.back, pressed ? styles.backPressed : null]}
        >
          <Ionicons name="chevron-back" size={22} color={COLORS.textPrimary} />
        </Pressable>
      ) : null}
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: SPACING.xs },
  back: {
    width: 40,
    height: 40,
    borderRadius: RADII.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  backPressed: { backgroundColor: COLORS.surfaceAlt },
  title: { ...TYPE.title, color: COLORS.textPrimary },
  subtitle: { ...TYPE.body, color: COLORS.textSecondary },
});
