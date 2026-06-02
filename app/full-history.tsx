import AppButton from "@/components/AppButton";
import Card from "@/components/Card";
import FormInput from "@/components/FormInput";
import Screen from "@/components/Screen";
import ScreenHeader from "@/components/ScreenHeader";
import StatusPill from "@/components/StatusPill";
import { usePassContext } from "@/context/PassContext";
import { useStaffAuthContext } from "@/context/StaffAuthContext";
import { COLORS, SPACING, TYPE } from "@/lib/theme";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

function normalizeDateKey(value: string) {
  // Tolerant date matching: unify separators and strip leading zeros so
  // "01/06/2026" and "1/6/2026" compare equal regardless of how they were stored.
  return value
    .trim()
    .replace(/[.\-]/g, "/")
    .split("/")
    .map((part) => part.replace(/^0+(?=\d)/, ""))
    .join("/");
}

export default function FullHistoryScreen() {
  const [filterDate, setFilterDate] = useState("");
  const { passRecords } = usePassContext();
  const { isStaffAuthenticated } = useStaffAuthContext();

  useEffect(() => {
    if (!isStaffAuthenticated) {
      router.replace("/staff-login");
    }
  }, [isStaffAuthenticated]);

  const filteredRecords = useMemo(() => {
    const normalizedDate = filterDate.trim();

    if (!normalizedDate) {
      return passRecords;
    }

    return passRecords.filter(
      (record) => normalizeDateKey(record.borrowedDate) === normalizeDateKey(normalizedDate)
    );
  }, [filterDate, passRecords]);

  if (!isStaffAuthenticated) {
    return null;
  }

  return (
    <Screen scroll>
      <ScreenHeader
        title="Full history"
        subtitle="All borrow records"
        onBack={() => router.replace("/staff")}
      />

      <Card>
        <FormInput
          label="Filter by date (DD/MM/YYYY)"
          placeholder="e.g. 13/05/2026"
          value={filterDate}
          onChangeText={setFilterDate}
        />
        {filterDate ? (
          <AppButton title="Clear filter" variant="ghost" onPress={() => setFilterDate("")} />
        ) : null}
      </Card>

      {filteredRecords.length === 0 ? (
        <Text style={styles.empty}>No records {filterDate ? "match this date" : "yet"}.</Text>
      ) : (
        <View style={styles.list}>
          {filteredRecords.map((record) => (
            <Card key={record.id} variant="outlined" style={styles.row}>
              <View style={styles.top}>
                <Text style={styles.name}>{record.studentName}</Text>
                <StatusPill status={record.status} />
              </View>
              <Text style={styles.meta}>
                Pass {record.passNumber} · {record.borrowedDate} at {record.borrowedAt}
              </Text>
              {record.returnedAt ? (
                <Text style={styles.meta}>Returned at {record.returnedAt}</Text>
              ) : null}
            </Card>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <AppButton
          title="Back to staff"
          variant="secondary"
          onPress={() => router.replace("/staff")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: { ...TYPE.body, color: COLORS.textMuted, textAlign: "center", paddingVertical: SPACING.lg },
  list: { gap: SPACING.sm },
  row: { gap: SPACING.xs, padding: SPACING.lg },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: SPACING.sm,
  },
  name: { ...TYPE.bodyStrong, color: COLORS.textPrimary, flex: 1 },
  meta: { ...TYPE.caption, color: COLORS.textSecondary },
  footer: { marginTop: SPACING.sm, marginBottom: SPACING.xl },
});
