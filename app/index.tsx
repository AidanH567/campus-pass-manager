import AppButton from "@/components/AppButton";
import { COLORS } from "@/lib/theme";
import { router } from "expo-router";
import { View, Text, Button, StyleSheet, Pressable } from "react-native";

export default function HomeScreen() {
    return (
        <View style={styles.screen}>

            <Text style={styles.title}>Campus Pass Manager</Text>
            <Text style={styles.subtitle}>Choose an option</Text>

            <AppButton
                title="Borrow Pass"
                onPress={() => router.push("/borrow-options")}
            />

            <AppButton
                title="Return Pass"
                onPress={() => router.push("/return")}
            />

             <AppButton
                title="Staff"
                onPress={() => router.push("/staff-login" as any)}
            />

        </View>
    )
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: COLORS.background,
  },
  card: {
    width: "100%",
    maxWidth: 560,
    backgroundColor: COLORS.surface,
    borderColor: COLORS.border,
    borderWidth: 1,
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