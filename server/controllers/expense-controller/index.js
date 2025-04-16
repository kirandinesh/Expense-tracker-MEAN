const Expense = require("../../models/Expense");
const User = require("../../models/user");
const mongoose = require("mongoose");
const createExpense = async (req, res) => {
  try {
    const { name, amount, expenseDate, category, paymentType, notes } =
      req.body;
    const userId = req.user._id;

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const newExpense = new Expense({
      name,
      amount,
      expenseDate: new Date(expenseDate),
      category,
      paymentType,
      notes,
      userId,
    });

    await newExpense.save();
    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: newExpense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const fetchExpenseByUserId = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(userId.toString());

    const userExist = await User.findById(userId);
    if (!userExist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const allExpenses = await Expense.find({ userId: userObjectId });
    const totalExpenseAmount = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalExpense: { $sum: "$amount" },
        },
      },
    ]);

    const firstAndLastCreated = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$userId",
          firstCreatedAt: { $min: "$createdAt" },
          lastCreatedAt: { $max: "$createdAt" },
        },
      },
    ]);

    if (!totalExpenseAmount.length && !firstAndLastCreated.length) {
      return res.status(404).json({
        success: false,
        message: "No expense data found for the user.",
      });
    }

    res.status(200).json({
      success: true,
      data: {
        expenses: allExpenses,
        totalExpense: totalExpenseAmount[0]?.totalExpense || 0,
        firstExpenseCreatedAt: firstAndLastCreated[0]?.firstCreatedAt || null,
        lastExpenseCreatedAt: firstAndLastCreated[0]?.lastCreatedAt || null,
      },
      message: "User info fetched successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const updateExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const updatedData = req.body;

    const updatedExpense = await Expense.findByIdAndUpdate(
      expenseId,
      updatedData,
      {
        new: true,
      }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const deleteExpense = async (req, res) => {
  try {
    const { expenseId } = req.params;

    const deletedExpense = await Expense.findByIdAndDelete(expenseId);

    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const getCategotySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);

    const categorySummary = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: "$category",
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
          total: 1,
        },
      },
    ]);
    res.status(200).json({
      success: true,
      message: "category Fetched successfully",
      categories: categorySummary,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userObjectId = new mongoose.Types.ObjectId(req.user._id);
    const monthlySummary = await Expense.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: { $month: "$expenseDate" },
          total: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          month: "$_id",
          total: 1,
        },
      },
      { $sort: { month: 1 } },
    ]);
    const monthNames = [
      "",
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formatted = monthlySummary.map((m) => ({
      month: monthNames[m.month],
      total: m.total,
    }));

    res.status(200).json({
      success: true,
      months: formatted,
      message: "",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const getExpenseById = async (req, res) => {
  try {
    const { expenseId } = req.params;

    if (!expenseId) {
      return res.status(400).json({
        success: false,
        message: "Expense ID is required",
      });
    }

    const expense = await Expense.findById({ _id: expenseId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense record not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Expense fetched successfully",
      data: expense,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later.",
    });
  }
};

module.exports = {
  createExpense,
  fetchExpenseByUserId,
  updateExpense,
  deleteExpense,
  getCategotySummary,
  getMonthlySummary,
  getExpenseById,
};
