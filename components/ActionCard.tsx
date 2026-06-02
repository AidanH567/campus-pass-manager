import Card from "@/components/Card";
import { COLORS, RADII, SPACING, TYPE } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActionCardProps = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle?: string;
  onPress: () => void;
  tint?: string;
};

export default function ActionCard({
  icon,
  title,
  subtitle,
  onPress,
  tint = COLORS.primary,
}: ActionCardProps) {
  function handlePress() {
    Haptics.selectionAsync().catch(() => {});
    onPress();
  }

  return (
    <Pressable onPress={handlePress} style={({ pressed }) => (pressed ? styles.pressed : null)}>
      <Card style={styles.row}>
        <View style={[styles.iconWrap, { backgroundColor: tint + "1A" }]}>
          <Ionicons name={icon} size={24} color={tint} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
    padding: SPACING.lg,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: RADII.md,
    alignItems: "center",
    justifyContent: "center",
  },
  textWrap: { flex: 1, gap: 2 },
  title: { ...TYPE.bodyStrong, color: COLORS.textPrimary },
  subtitle: { ...TYPE.caption, color: COLORS.textSecondary },
  pressed: { opacity: 0.9, transform: [{ scale: 0.99 }] },
});
