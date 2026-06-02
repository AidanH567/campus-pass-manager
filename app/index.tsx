import ActionCard from "@/components/ActionCard";
import Screen from "@/components/Screen";
import { COLORS, RADII, SPACING, TYPE } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function HomeScreen() {
  return (
    <Screen scroll>
      <View style={styles.header}>
        <View style={styles.logo}>
          <Ionicons name="card" size={30} color={COLORS.textOnPrimary} />
        </View>
        <Text style={styles.brand}>Campus Pass Manager</Text>
        <Text style={styles.tagline}>Spiced Academy · daily card desk</Text>
      </View>

      <View style={styles.actions}>
        <ActionCard
          icon="albums-outline"
          title="Borrow a pass"
          subtitle="Check out a campus card"
          onPress={() => router.push("/borrow-options")}
        />
        <ActionCard
          icon="arrow-undo-outline"
          title="Return a pass"
          subtitle="Check a card back in"
          tint={COLORS.accent}
          onPress={() => router.push("/return")}
        />
        <ActionCard
          icon="lock-closed-outline"
          title="Staff"
          subtitle="Dashboard & history"
          tint={COLORS.textSecondary}
          onPress={() => router.push("/staff-login")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    gap: SPACING.sm,
    marginTop: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  logo: {
    width: 72,
    height: 72,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  brand: { ...TYPE.display, color: COLORS.textPrimary, textAlign: "center" },
  tagline: { ...TYPE.caption, color: COLORS.textSecondary, textAlign: "center" },
  actions: { gap: SPACING.md },
});
