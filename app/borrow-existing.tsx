import AppButton from "@/components/AppButton";
import Banner from "@/components/Banner";
import Card from "@/components/Card";
import FormInput from "@/components/FormInput";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import { usePassContext } from "@/context/PassContext";
import { SPACING } from "@/lib/theme";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";

export default function BorrowExistingScreen() {
  const [email, setEmail] = useState("");
  const [passNumber, setPassNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showNewBorrowerButton, setShowNewBorrowerButton] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { borrowPassWithExistingEmail } = usePassContext();

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

      const result = await borrowPassWithExistingEmail(
        email.trim().toLowerCase(),
        passNumber.trim()
      );

      if (!result.ok) {
        // Only offer the "new borrower" path for a genuine not-found/conflict,
        // not when a real system error occurred.
        if (!result.error) {
          setShowNewBorrowerButton(true);
        }
        setError(
          result.error ??
            "No previous borrower found with that email, or the borrower/pass already has an active checkout."
        );
        return;
      }

      setEmail("");
      setPassNumber("");
      setSuccessMessage("Pass borrowed. Please return it by 6:30 PM.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Borrow a pass"
        subtitle="Returning borrower"
        onBack={() => router.replace("/borrow-options")}
      />

      <Card>
        <FormInput
          label="Email"
          placeholder="you@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <FormInput
          label="Pass number"
          placeholder="e.g. 12"
          value={passNumber}
          onChangeText={setPassNumber}
        />

        {error ? <Banner type="error" message={error} /> : null}
        {successMessage ? <Banner type="success" message={successMessage} /> : null}

        <AppButton
          title="Confirm borrow"
          onPress={handleBorrowExisting}
          loading={isSubmitting}
          size="lg"
        />

        {showNewBorrowerButton ? (
          <AppButton
            title="Use new borrower form"
            variant="secondary"
            onPress={() => router.push("/borrow")}
            disabled={isSubmitting}
          />
        ) : null}
      </Card>

      <View style={styles.footer}>
        <AppButton
          title="Back to home"
          variant="ghost"
          onPress={() => router.replace("/")}
          disabled={isSubmitting}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { marginTop: SPACING.xs },
});
