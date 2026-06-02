import AppButton from "@/components/AppButton";
import Banner from "@/components/Banner";
import Card from "@/components/Card";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import StatusPill from "@/components/StatusPill";
import { usePassContext } from "@/context/PassContext";
import { useStaffAuthContext } from "@/context/StaffAuthContext";
import { COLORS, RADII, SPACING, TYPE } from "@/lib/theme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

function formatReminderTimestamp(timestamp?: string | null) {
  if (!timestamp) return "Not sent";
  return new Date(timestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function StaffScreen() {
  const { passRecords, markPassOverdue, returnPass, checkForOverduePasses } =
    usePassContext();
  const { isStaffAuthenticated, clearStaffAuthentication } = useStaffAuthContext();
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!isStaffAuthenticated) {
      router.replace("/staff-login");
      return;
    }

    async function runOverdueCheck() {
      await checkForOverduePasses();
    }

    runOverdueCheck();
  }, [checkForOverduePasses, isStaffAuthenticated]);

  useEffect(() => {
    return () => {
      clearStaffAuthentication();
    };
  }, [clearStaffAuthentication]);

  if (!isStaffAuthenticated) {
    return null;
  }

  const borrowedPasses = passRecords.filter((r) => r.status === "borrowed");
  const returnedPasses = passRecords.filter((r) => r.status === "returned");
  const overduePasses = passRecords.filter((r) => r.status === "overdue");

  async function handleMarkOverdue(passNumber: string) {
    setActionError("");
    const result = await markPassOverdue(passNumber);
    if (!result.ok && result.error) {
      setActionError(result.error);
    }
  }

  async function handleMarkReturned(passNumber: string) {
    setActionError("");
    const result = await returnPass(passNumber);
    if (!result.ok && result.error) {
      setActionError(result.error);
    }
  }

  function logout() {
    clearStaffAuthentication();
    router.replace("/");
  }

  return (
    <Screen scroll>
      <ScreenHeader title="Staff" subtitle="Card overview" onBack={logout} />

      {actionError ? <Banner type="error" message={actionError} /> : null}

      <Section title="Currently borrowed" count={borrowedPasses.length} emptyText="No borrowed passes right now.">
        {borrowedPasses.map((record) => (
          <Card key={record.id} variant="outlined" style={styles.passCard}>
            <View style={styles.passTop}>
              <Text style={styles.passName}>{record.studentName}</Text>
              <StatusPill status="borrowed" />
            </View>
            <Text style={styles.passMeta}>Pass {record.passNumber}</Text>
            <Text style={styles.passMeta}>
              Borrowed {record.borrowedDate} at {record.borrowedAt}
            </Text>
            <View style={styles.actions}>
              <Pressable
                onPress={() => handleMarkOverdue(record.passNumber)}
                style={({ pressed }) => [styles.markBtn, pressed ? styles.markBtnPressed : null]}
              >
                <Ionicons name="alert-circle-outline" size={16} color={COLORS.danger} />
                <Text style={styles.markText}>Mark overdue</Text>
              </Pressable>
              <Pressable
                onPress={() => handleMarkReturned(record.passNumber)}
                style={({ pressed }) => [styles.returnBtn, pressed ? styles.markBtnPressed : null]}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                <Text style={styles.returnText}>Mark returned</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </Section>

      <Section title="Returned" count={returnedPasses.length} emptyText="No returned passes.">
        {returnedPasses.map((record) => (
          <Card key={record.id} variant="outlined" style={styles.passCard}>
            <View style={styles.passTop}>
              <Text style={styles.passName}>{record.studentName}</Text>
              <StatusPill status="returned" />
            </View>
            <Text style={styles.passMeta}>Pass {record.passNumber}</Text>
            <Text style={styles.passMeta}>Returned at {record.returnedAt ?? "—"}</Text>
          </Card>
        ))}
      </Section>

      <Section title="Overdue" count={overduePasses.length} emptyText="No overdue passes.">
        {overduePasses.map((record) => (
          <Card key={record.id} variant="outlined" style={styles.passCard}>
            <View style={styles.passTop}>
              <Text style={styles.passName}>{record.studentName}</Text>
              <StatusPill status="overdue" />
            </View>
            <Text style={styles.passMeta}>Pass {record.passNumber}</Text>
            <Text style={styles.passMeta}>
              Borrowed {record.borrowedDate} at {record.borrowedAt}
            </Text>
            <View style={styles.reminderRow}>
              <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.reminderText}>
                1st reminder: {formatReminderTimestamp(record.firstReminderSentAt)}
              </Text>
            </View>
            <View style={styles.reminderRow}>
              <Ionicons name="mail-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.reminderText}>
                2nd reminder: {formatReminderTimestamp(record.secondReminderSentAt)}
              </Text>
            </View>
            <View style={styles.actions}>
              <Pressable
                onPress={() => handleMarkReturned(record.passNumber)}
                style={({ pressed }) => [styles.returnBtn, pressed ? styles.markBtnPressed : null]}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.success} />
                <Text style={styles.returnText}>Mark returned</Text>
              </Pressable>
            </View>
          </Card>
        ))}
      </Section>

      <View style={styles.footer}>
        <AppButton
          title="Full history"
          variant="secondary"
          onPress={() => router.push("/full-history")}
        />
        <AppButton title="Back to home" variant="ghost" onPress={logout} />
      </View>
    </Screen>
  );
}

function Section({
  title,
  count,
  emptyText,
  children,
}: {
  title: string;
  count: number;
  emptyText: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <View style={styles.countPill}>
          <Text style={styles.countText}>{count}</Text>
        </View>
      </View>
      {count === 0 ? <Text style={styles.empty}>{emptyText}</Text> : children}
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: SPACING.md },
  sectionHeader: { flexDirection: "row", alignItems: "center", gap: SPACING.sm },
  sectionTitle: { ...TYPE.subtitle, color: COLORS.textPrimary },
  countPill: {
    minWidth: 24,
    height: 24,
    paddingHorizontal: SPACING.sm,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  countText: { ...TYPE.label, color: COLORS.primary },
  passCard: { gap: SPACING.xs, padding: SPACING.lg },
  passTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.sm,
  },
  passName: { ...TYPE.bodyStrong, color: COLORS.textPrimary, flex: 1 },
  passMeta: { ...TYPE.caption, color: COLORS.textSecondary },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  markBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.dangerSoft,
  },
  returnBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    paddingVertical: 6,
    paddingHorizontal: SPACING.md,
    borderRadius: RADII.pill,
    backgroundColor: COLORS.successSoft,
  },
  markBtnPressed: { opacity: 0.7 },
  markText: { ...TYPE.label, color: COLORS.danger },
  returnText: { ...TYPE.label, color: COLORS.success },
  reminderRow: { flexDirection: "row", alignItems: "center", gap: SPACING.xs },
  reminderText: { ...TYPE.caption, color: COLORS.textMuted },
  empty: { ...TYPE.body, color: COLORS.textMuted },
  footer: { gap: SPACING.sm, marginTop: SPACING.sm, marginBottom: SPACING.xl },
});
