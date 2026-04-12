import { View, ActivityIndicator, Text, StyleSheet } from "react-native";

type LoadingIndicatorProps = {
    message?: string;
}

export default function LoadingIndicator({
  message = "Loading...",
}: LoadingIndicatorProps) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="small" />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    gap: 8,
  },
  text: {
    fontSize: 14,
    color: "#666",
  },
});