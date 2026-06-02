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

export default function BorrowScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [passNumber, setPassNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { borrowPass } = usePassContext();

  async function handleBorrow() {
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (!name.trim() || !email.trim() || !passNumber.trim()) {
        setError("Please fill in all fields.");
        return;
      }

      const result = await borrowPass(
        name.trim(),
        email.trim().toLowerCase(),
        passNumber.trim()
      );

      if (!result.ok) {
        setError(
          result.error ??
            "Unable to borrow pass. The pass or borrower may already have an active pass."
        );
        return;
      }

      setName("");
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
        subtitle="New borrower"
        onBack={() => router.replace("/borrow-options")}
      />

      <Card>
        <FormInput
          label="Full name"
          placeholder="e.g. Alex Müller"
          value={name}
          onChangeText={setName}
        />
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
          onPress={handleBorrow}
          loading={isSubmitting}
          size="lg"
        />
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
