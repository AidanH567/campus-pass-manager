import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

const STAFF_PASSCODE = "7842";

export default function StaffLoginScreen() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isAuithenticating, setIsAuthenticating] = useState(false);

  function handleNumberPress(number: string) {
    if (code.length >= 4) return;

    setError("");
    setCode((current) => current + number);
  }

  function handleDelete() {
    setCode((current) => current.slice(0, -1));
    setError("");
  }

  useEffect(() => {
    if (code.length === 4) {
      if (code === STAFF_PASSCODE) {
        router.replace("/staff");
        setIsAuthenticating(true);
      } else {
        setError("Incorrect passcode");
        setCode("");
      }
    }
  }, [code]);

  const keypadNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter Staff Passcode</Text>

      <View style={styles.codeContainer}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={index}
            style={[
              styles.codeDot,
              code.length > index ? styles.codeDotFilled : null,
            ]}
          />
        ))}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <View style={styles.keypad}>
        {keypadNumbers.map((number) => (
          <Pressable
            key={number}
            style={styles.key}
            onPress={() => handleNumberPress(number)}
          >
            <Text style={styles.keyText}>{number}</Text>
          </Pressable>
        ))}

        <View style={styles.keyPlaceholder} />

        <Pressable style={styles.key} onPress={() => handleNumberPress("0")}>
          <Text style={styles.keyText}>0</Text>
        </Pressable>

        <Pressable style={styles.key} onPress={handleDelete}>
          <Text style={styles.keyText}>⌫</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  codeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  codeDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: "#333",
  },
  codeDotFilled: {
    backgroundColor: "#333",
  },
  errorText: {
    color: "red",
    fontSize: 14,
  },
  keypad: {
    width: 240,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
  key: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
  },
  keyPlaceholder: {
    width: 64,
    height: 64,
  },
});