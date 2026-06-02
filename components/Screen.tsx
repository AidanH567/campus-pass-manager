import { COLORS, SPACING } from "@/lib/theme";
import type { ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import { type Edge, SafeAreaView } from "react-native-safe-area-context";

type ScreenProps = {
  children: ReactNode;
  /** Wrap content in a ScrollView (for forms / long content). */
  scroll?: boolean;
  /** Vertically center content (for short landing/login screens). */
  center?: boolean;
  contentStyle?: ViewStyle;
  edges?: Edge[];
};

export default function Screen({
  children,
  scroll = false,
  center = false,
  contentStyle,
  edges = ["top", "bottom"],
}: ScreenProps) {
  const content = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.content, center && styles.center, contentStyle]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.content, center && styles.center, contentStyle]}>{children}</View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={edges}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    padding: SPACING.xl,
    gap: SPACING.lg,
  },
  center: { justifyContent: "center" },
});
