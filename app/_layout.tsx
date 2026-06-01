import { PassProvider } from "@/context/PassContext";
import { StaffAuthProvider } from "@/context/StaffAuthContext";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <StaffAuthProvider>
      <PassProvider>
        <Stack />
      </PassProvider>
    </StaffAuthProvider>
  );
}
