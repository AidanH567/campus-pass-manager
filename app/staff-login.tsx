import Screen from "@/components/Screen";
import { useStaffAuthContext } from "@/context/StaffAuthContext";
import { COLORS, FONTS, RADII, SPACING, TYPE } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const STAFF_PASSCODE = "7842";

export default function StaffLoginScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const { authenticateStaff } = useStaffAuthContext();

  function handleNumberPress(number: string) {
    if (code.length >= 4) return;
    Haptics.selectionAsync().catch(() => {});
    setError("");
    setCode((current) => current + number);
  }

  function handleDelete() {
    Haptics.selectionAsync().catch(() => {});
    setCode((current) => current.slice(0, -1));
    setError("");
  }

  useEffect(() => {
    if (code.length === 4) {
      if (code === STAFF_PASSCODE) {
        authenticateStaff();
        router.replace("/staff");
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
        setError("Incorrect passcode. Try again.");
        setCode("");
      }
    }
  }, [authenticateStaff, code]);

  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <Screen scroll center>
      <View style={styles.wrap}>
        <View style={styles.lock}>
          <Ionicons name="lock-closed" size={28} color={COLORS.primary} />
        </View>
        <Text style={styles.title}>Staff access</Text>
        <Text style={styles.subtitle}>Enter your 4-digit passcode</Text>

        <View style={styles.dots}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                code.length > i ? styles.dotFilled : null,
                error ? styles.dotError : null,
              ]}
            />
          ))}
        </View>

        <Text style={[styles.error, error ? null : styles.errorHidden]}>{error || " "}</Text>

        <View style={styles.keypad}>
          {keys.map((n) => (
            <Pressable
              key={n}
              onPress={() => handleNumberPress(n)}
              style={({ pressed }) => [styles.key, pressed ? styles.keyPressed : null]}
            >
              <Text style={styles.keyText}>{n}</Text>
            </Pressable>
          ))}

          <View style={styles.keyPlaceholder} />

          <Pressable
            onPress={() => handleNumberPress("0")}
            style={({ pressed }) => [styles.key, pressed ? styles.keyPressed : null]}
          >
            <Text style={styles.keyText}>0</Text>
          </Pressable>

          <Pressable
            onPress={handleDelete}
            accessibilityLabel="Delete"
            style={({ pressed }) => [styles.key, pressed ? styles.keyPressed : null]}
          >
            <Ionicons name="backspace-outline" size={26} color={COLORS.textPrimary} />
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center", gap: SPACING.md },
  lock: {
    width: 64,
    height: 64,
    borderRadius: RADII.xl,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  title: { ...TYPE.title, color: COLORS.textPrimary, textAlign: "center" },
  subtitle: { ...TYPE.body, color: COLORS.textSecondary, textAlign: "center" },
  dots: { flexDirection: "row", gap: SPACING.md, marginTop: SPACING.sm },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.borderStrong,
  },
  dotFilled: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  dotError: { borderColor: COLORS.danger },
  error: { ...TYPE.caption, color: COLORS.danger, textAlign: "center", minHeight: 18 },
  errorHidden: { opacity: 0 },
  keypad: {
    width: 264,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: SPACING.md,
    marginTop: SPACING.sm,
  },
  key: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: "center",
    alignItems: "center",
  },
  keyPressed: { backgroundColor: COLORS.surfaceAlt },
  keyText: { fontFamily: FONTS.semibold, fontSize: 26, color: COLORS.textPrimary },
  keyPlaceholder: { width: 72, height: 72 },
});
