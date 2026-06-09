export interface CheckIn {
  _id: string;
  habitId: string;
  userId: string;
  date: string; // 'YYYY-MM-DD' in user's local date
  createdAt: string;
}
