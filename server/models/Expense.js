const mongoose = require("mongoose");

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    amount: { type: Number, required: true },
    expenseDate: { type: Date, required: true },
    category: { type: String, required: true },
    paymentType: {
      type: String,
      default: "Cash",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", ExpenseSchema);
