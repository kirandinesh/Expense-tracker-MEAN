const fs = require("fs");
const Papa = require("papaparse");
const Expense = require("../../models/Expense");
const User = require("../../models/user");
const Category = require("../../models/Categories");

const importExpenseData = async (req, res) => {
  try {
    const file = req.file;
    console.log(file, "csv");
    const uploadDir = path.join(__dirname, "..", "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const userId = req.user._id;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file found",
      });
    }

    const userExist = await User.findById(userId);

    if (!userExist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const fileContent = fs.readFileSync(file.path, "utf-8");

    const parsed = Papa.parse(fileContent, {
      header: true,
      skipEmptyLines: true,
    });

    const expenses = parsed.data;

    const insertedExpenses = [];

    let userCategoryDoc = await Category.findOne({ userId });

    if (!userCategoryDoc) {
      userCategoryDoc = new Category({
        userId,
        categoryText: [],
      });
      await userCategoryDoc.save();
    }

    const existingCategorySet = new Set(
      userCategoryDoc.categoryText.map((cat) => cat.trim().toLowerCase())
    );

    const newCategories = new Set(existingCategorySet);

    for (const row of expenses) {
      const categoryCleaned = row.category?.trim().toLowerCase();
      if (
        row.name &&
        row.amount &&
        row.expenseDate &&
        row.category &&
        row.paymentType
      ) {
        if (!existingCategorySet.has(categoryCleaned)) {
          newCategories.add(categoryCleaned);
        }
        const newExpense = new Expense({
          name: row.name,
          amount: parseFloat(row.amount),
          expenseDate: new Date(row.expenseDate),
          category: row.category,
          paymentType: row.paymentType,
          notes: row.notes || "",
          userId,
        });

        try {
          await newExpense.save();
          insertedExpenses.push(newExpense);
        } catch (saveError) {
          console.error("Error saving expense:", saveError);
        }
      }
    }

    userCategoryDoc.categoryText = Array.from(newCategories);
    await userCategoryDoc.save();

    res.status(201).json({
      success: true,
      message: `Expenses imported successfully.`,
      data: insertedExpenses,
    });
  } catch (err) {
    console.error("Error in importExpenseData:", err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while importing. Please try again later.",
    });
  }
};

module.exports = { importExpenseData };
