export type PassRecord = {
  id: string;
  studentName: string;
  // email is intentionally NOT fetched to the client (locked down server-side);
  // it stays optional only for the write path.
  email?: string;
  passNumber: string;
  borrowedDate: string;
  borrowedAt: string;
  returnedAt?: string;
  status: "borrowed" | "returned" | "overdue";
  firstReminderSentAt?: string | null;
  secondReminderSentAt?: string | null;
};
