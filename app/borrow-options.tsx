import ActionCard from "@/components/ActionCard";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import { COLORS, SPACING } from "@/lib/theme";
import { router } from "expo-router";
import { StyleSheet, View } from "react-native";

export default function BorrowOptionsScreen() {
  return (
    <Screen scroll>
      <ScreenHeader
        title="Borrow a pass"
        subtitle="First time, or have you borrowed before?"
        onBack={() => router.replace("/")}
      />

      <View style={styles.actions}>
        <ActionCard
          icon="person-add-outline"
          title="First-time borrower"
          subtitle="Enter your name, email and pass"
          onPress={() => router.push("/borrow")}
        />
        <ActionCard
          icon="repeat-outline"
          title="Returning borrower"
          subtitle="Look you up by email"
          tint={COLORS.accent}
          onPress={() => router.push("/borrow-existing")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: { gap: SPACING.md, marginTop: SPACING.sm },
});
