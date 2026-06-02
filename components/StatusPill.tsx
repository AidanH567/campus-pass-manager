import { COLORS, RADII, SPACING, TYPE } from "@/lib/theme";
import { StyleSheet, Text, View } from "react-native";

type Status = "borrowed" | "returned" | "overdue";

const MAP: Record<Status, { bg: string; fg: string; label: string }> = {
  borrowed: { bg: COLORS.primarySoft, fg: COLORS.primary, label: "Borrowed" },
  returned: { bg: COLORS.successSoft, fg: COLORS.success, label: "Returned" },
  overdue: { bg: COLORS.dangerSoft, fg: COLORS.danger, label: "Overdue" },
};

export default function StatusPill({ status }: { status: Status }) {
  const s = MAP[status];
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.text, { color: s.fg }]}>{s.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADII.pill,
    alignSelf: "flex-start",
  },
  text: { ...TYPE.label, fontSize: 11, letterSpacing: 0.3 },
});
