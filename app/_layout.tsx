import { PassProvider } from "@/context/PassContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <PassProvider>
      <Stack />
    </PassProvider>
    );
}