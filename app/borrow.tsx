import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import AppButton from "@/components/AppButton";
import FormInput from "@/components/FormInput";
import { router } from "expo-router";
import { usePassContext } from "@/context/PassContext";
import LoadingIndicator from "@/components/LoadingIndicator";
import { COLORS } from "@/lib/theme";

export default function BorrowScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passNumber, setPassNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { borrowPass, passRecords } = usePassContext();

  async function handleBorrow() {
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (!name.trim() || !email.trim() || !passNumber.trim()) {
        setError("Please fill in all fields.");
        return;
      }

      const passAlreadyBorrowed = passRecords.some(
        (record) =>
          record.passNumber === passNumber.trim() &&
          record.status === "borrowed"
      );

      if (passAlreadyBorrowed) {
        setError("That pass is already checked out.");
        return;
      }

      await borrowPass(name.trim(), email.trim(), passNumber.trim());

      setName("");
      setEmail("");
      setPassNumber("");
      setSuccessMessage("You have successfully borrowed a pass.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <Text style={styles.title}>Borrow Pass</Text>
        <Text style={styles.subtitle}>New borrower</Text>

        <FormInput
          placeholder="Enter your name"
          value={name}
          onChangeText={setName}
        />

        <FormInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <FormInput
          placeholder="Enter pass number"
          value={passNumber}
          onChangeText={setPassNumber}
        />

        {isSubmitting ? (
          <LoadingIndicator message="Borrowing pass..." />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : successMessage ? (
          <Text style={styles.successText}>{successMessage}</Text>
        ) : null}

        <View style={styles.buttonGroup}>
          <AppButton
            title={isSubmitting ? "Borrowing..." : "Confirm Borrow"}
            onPress={handleBorrow}
            disabled={isSubmitting}
          />

          <AppButton
            title="Back"
            disabled={isSubmitting}
            onPress={() => router.replace("/borrow-options")}
            variant="secondary"
          />

          <AppButton
            title="Back to Home"
            disabled={isSubmitting}
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
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
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
    gap: 12,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 17,
    textAlign: "center",
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  errorText: {
    color: COLORS.danger,
    textAlign: "center",
    fontSize: 14,
  },
  successText: {
    color: COLORS.success,
    textAlign: "center",
    fontSize: 14,
  },
  buttonGroup: {
    marginTop: 4,
    gap: 10,
    alignItems: "center",
  },
});
