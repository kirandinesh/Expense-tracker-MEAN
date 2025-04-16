const Category = require("../../models/Categories");
const User = require("../../models/user");

const cleanCategories = (categoryText) => {
  return categoryText
    .map((item) => item.trim().toLowerCase())
    .filter((item) => item !== "");
};

const addCategory = async (req, res) => {
  try {
    const { categoryText } = req.body;
    const userId = req.user._id;
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const uniqueCategories = cleanCategories(categoryText);
    let category = await Category.findOne({ userId });

    if (!category) {
      category = new Category({
        userId,
        categoryText: uniqueCategories,
      });
    } else {
      category.categoryText = [
        ...new Set([...category.categoryText, ...uniqueCategories]),
      ];
    }

    await category.save();

    res.status(201).json({
      success: true,
      message: "Categories added successfully",
      data: category,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateCategory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { categoryText } = req.body;

    if (!Array.isArray(categoryText)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category data",
      });
    }

    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    const category = await Category.findOne({ userId });
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "No categories found for the user",
      });
    }

    const uniqueCategories = cleanCategories(categoryText);
    category.categoryText = uniqueCategories;
    const updatedCategory = await category.save();
    res.status(200).json({
      success: true,
      message: "Categories updated successfully",
      data: updatedCategory,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const getCategories = async (req, res) => {
  try {
    const userId = req.user._id;

    const category = await Category.findOne({ userId });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "No categories found for the user",
      });
    }

    res.status(200).json({
      success: true,
      data: category.categoryText,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = { addCategory, updateCategory, getCategories };
