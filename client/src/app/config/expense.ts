export interface Expense {
  name: string;
  amount: number | string;
  expenseDate: string;
  category: string | null;
  paymentType: string | null;
  notes?: string;
}



export interface Category {
  categoryText: string;
}
export const displayedColumns: string[] = [
  'name',
  'amount',
  'expenseDate',
  'category',
  'paymentType',
  'notes',
];

export const EXPENSE_TABLE_DATA: any[] = [
  {
    name: 'Required',
    amount: 'Required',
    expenseDate: 'Required (MM/DD/YYYY)',
    category: 'Required',
    paymentType: 'Required(default-card)',
    notes: 'Optional',
  },
];

export const DEFAULT_CATEGORIES = [
  'food',
  'travel',
  'entertainment',
  'groceries',
];

export const paymentMode = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Others',
];
