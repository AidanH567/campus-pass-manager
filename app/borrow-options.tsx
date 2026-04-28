import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import AppButton from "@/components/AppButton";
import { COLORS } from "@/lib/theme";

export default function BorrowOptionsScreen() {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Borrow Pass</Text>
        <Text style={styles.subtitle}>Choose an option</Text>

        <View style={styles.buttonGroup}>
          <AppButton
            title="First-time borrower"
            onPress={() => router.push("/borrow")}
          />

          <AppButton
            title="Returning borrower"
            onPress={() => router.push("/borrow-existing")}
          />

          <AppButton
            title="Back to Home"
            onPress={() => router.replace("/")}
            variant="secondary"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 20,
    padding: 24,
    gap: 14,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: 8,
  },
  buttonGroup: {
    gap: 12,
    alignItems: "center",
  },
});
