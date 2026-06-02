import { COLORS, RADII, SPACING, TYPE } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

type BannerType = "success" | "error" | "info";

type BannerProps = {
  type: BannerType;
  message: string;
};

const CONFIG: Record<
  BannerType,
  { bg: string; fg: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  success: { bg: COLORS.successSoft, fg: COLORS.success, icon: "checkmark-circle" },
  error: { bg: COLORS.dangerSoft, fg: COLORS.danger, icon: "alert-circle" },
  info: { bg: COLORS.primarySoft, fg: COLORS.primary, icon: "information-circle" },
};

export default function Banner({ type, message }: BannerProps) {
  const c = CONFIG[type];
  return (
    <View style={[styles.wrap, { backgroundColor: c.bg }]}>
      <Ionicons name={c.icon} size={20} color={c.fg} />
      <Text style={[styles.text, { color: c.fg }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    gap: SPACING.sm,
    padding: SPACING.md,
    borderRadius: RADII.md,
    alignItems: "flex-start",
  },
  text: { ...TYPE.caption, flex: 1, lineHeight: 18 },
});
