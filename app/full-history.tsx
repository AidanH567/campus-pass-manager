import AppButton from "@/components/AppButton";
import FormInput from "@/components/FormInput";
import { usePassContext } from "@/context/PassContext";
import { useStaffAuthContext } from "@/context/StaffAuthContext";
import { COLORS } from "@/lib/theme";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";

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
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Full History</Text>
      <Text style={styles.subtitle}>All borrow records</Text>

      <View style={styles.filterCard}>
        <Text style={styles.filterLabel}>Filter by borrowed date (DD/MM/YYYY)</Text>
        <FormInput
          placeholder="Example: 13/05/2026"
          value={filterDate}
          onChangeText={setFilterDate}
        />
        <AppButton
          title="Clear Filter"
          variant="secondary"
          onPress={() => setFilterDate("")}
        />
      </View>

      <View style={styles.tableCard}>
        <View style={styles.headerRow}>
          <Text style={[styles.headerCell, styles.studentCol]}>Student</Text>
          <Text style={[styles.headerCell, styles.passCol]}>Pass</Text>
          <Text style={[styles.headerCell, styles.dateCol]}>Borrowed Date</Text>
          <Text style={[styles.headerCell, styles.timeCol]}>Borrowed Time</Text>
          <Text style={[styles.headerCell, styles.timeCol]}>Returned Time</Text>
          <Text style={[styles.headerCell, styles.statusCol]}>Status</Text>
        </View>

        {filteredRecords.length === 0 ? (
          <Text style={styles.emptyText}>No records match this date.</Text>
        ) : (
          filteredRecords.map((record) => (
            <View key={record.id} style={styles.dataRow}>
              <Text style={[styles.dataCell, styles.studentCol]}>
                {record.studentName}
              </Text>
              <Text style={[styles.dataCell, styles.passCol]}>
                {record.passNumber}
              </Text>
              <Text style={[styles.dataCell, styles.dateCol]}>
                {record.borrowedDate}
              </Text>
              <Text style={[styles.dataCell, styles.timeCol]}>
                {record.borrowedAt}
              </Text>
              <Text style={[styles.dataCell, styles.timeCol]}>
                {record.returnedAt || "-"}
              </Text>
              <Text style={[styles.dataCell, styles.statusCol]}>
                {record.status}
              </Text>
            </View>
          ))
        )}
      </View>

      <AppButton
        title="Back to Staff"
        variant="secondary"
        onPress={() => router.replace("/staff")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 17,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  filterCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    padding: 16,
    gap: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  tableCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: COLORS.primarySoft,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dataRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textPrimary,
    padding: 10,
  },
  dataCell: {
    fontSize: 12,
    color: COLORS.textSecondary,
    padding: 10,
  },
  studentCol: {
    flex: 2,
  },
  passCol: {
    flex: 1,
  },
  dateCol: {
    flex: 1.4,
  },
  timeCol: {
    flex: 1.2,
  },
  statusCol: {
    flex: 1,
    textTransform: "capitalize",
  },
  emptyText: {
    padding: 16,
    textAlign: "center",
    color: COLORS.textSecondary,
  },
});