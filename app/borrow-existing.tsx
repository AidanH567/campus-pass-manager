import { View, Text, StyleSheet } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import FormInput from "@/components/FormInput";
import AppButton from "@/components/AppButton";
import { usePassContext } from "@/context/PassContext";
import LoadingIndicator from "@/components/LoadingIndicator";
import { COLORS } from "@/lib/theme";

export default function BorrowExistingScreen() {
  const [email, setEmail] = useState("");
  const [passNumber, setPassNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNewBorrowerButton, setShowNewBorrowerButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { borrowPassWithExistingEmail, passRecords } = usePassContext();

  async function handleBorrowExisting() {
    setError("");
    setSuccessMessage("");
    setShowNewBorrowerButton(false);
    setIsSubmitting(true);

    try {
      if (!email.trim() || !passNumber.trim()) {
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

      const didBorrow = await borrowPassWithExistingEmail(
        email.trim(),
        passNumber.trim()
      );

      if (!didBorrow) {
        setShowNewBorrowerButton(true);
        setError(
          "No previous borrower found with that email. Please use the new borrower form."
        );
        return;
      }

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
        <Text style={styles.subtitle}>Returning borrower</Text>

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
            onPress={handleBorrowExisting}
            disabled={isSubmitting}
          />

          {showNewBorrowerButton ? (
            <AppButton
              title="Use New Borrower Form"
              onPress={() => router.push("/borrow")}
              disabled={isSubmitting}
            />
          ) : null}

          <AppButton
            title="Back"
            onPress={() => router.replace("/borrow-options")}
            variant="secondary"
            disabled={isSubmitting}
          />

          <AppButton
            title="Back to Home"
            onPress={() => router.replace("/")}
            variant="secondary"
            disabled={isSubmitting}
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
