const express = require("express");
const router = express.Router();
const categoryController = require("../../controllers/categories-controller/index");
const authMiddleware = require("../../middleware/auth-middleware");
router
  .route("/add-category")
  .post(authMiddleware, categoryController.addCategory);
router
  .route("/update-category")
  .put(authMiddleware, categoryController.updateCategory);
router
  .route("/get-category")
  .get(authMiddleware, categoryController.getCategories);
module.exports = router;
