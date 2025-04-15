const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  categoryText: {
    type: [String],
    default: [],
  },
});

module.exports = mongoose.model("Category", CategorySchema);
