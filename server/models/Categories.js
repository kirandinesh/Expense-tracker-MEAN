const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  categoryText: {
    type: [String],
    default: ["food", "travel", "entertainment", "groceries"],
  },
});

module.exports = mongoose.model("Category", CategorySchema);
