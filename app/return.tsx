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

export default function ReturnScreen() {
  const [passNumber, setPassNumber] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { returnPass } = usePassContext();

  async function handleReturn() {
    setError("");
    setSuccessMessage("");

    if (!passNumber.trim()) {
      setError("Please enter a pass number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await returnPass(passNumber.trim());
      if (!result.ok) {
        setError(result.error ?? "No matching borrowed pass found with that number.");
        return;
      }
      setSuccessMessage("Pass returned. Thank you!");
      setPassNumber("");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Return a pass"
        subtitle="Enter the pass number to check it back in"
        onBack={() => router.replace("/")}
      />

      <Card>
        <FormInput
          label="Pass number"
          placeholder="e.g. 12"
          value={passNumber}
          onChangeText={setPassNumber}
        />

        {error ? <Banner type="error" message={error} /> : null}
        {successMessage ? <Banner type="success" message={successMessage} /> : null}

        <AppButton title="Confirm return" onPress={handleReturn} loading={isSubmitting} size="lg" />
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
