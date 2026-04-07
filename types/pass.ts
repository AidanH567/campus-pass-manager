export type PassRecord = {
  id: string;
  studentName: string;
  email: string;
  passNumber: string;
  borrowedAt: string;
  returnedAt?: string;
  status: "borrowed" | "returned" | "overdue";
};