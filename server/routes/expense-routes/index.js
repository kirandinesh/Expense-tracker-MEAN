const express = require("express");
const multer = require("multer");
const router = express.Router();
const path = require("path");
const expenseController = require("../../controllers/expense-controller/index");
const fileController = require("../../controllers/file-controller/index");
const authMiddleware = require("../../middleware/auth-middleware");

const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log("✅ uploads folder created:", uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});

const csvFilter = (req, file, cb) => {
  if (file.mimetype.includes("csv")) {
    cb(null, true);
  } else {
    cb("Please upload only CSV file.", false);
  }
};

const upload = multer({ storage: storage, fileFilter: csvFilter });

router
  .route("/add-expense")
  .post(authMiddleware, expenseController.createExpense);
router.route("/edit-expense/:expenseId").put(expenseController.updateExpense);
router
  .route("/get-expense")
  .get(authMiddleware, expenseController.fetchExpenseByUserId);
router
  .route("/delete-expense/:expenseId")
  .delete(expenseController.deleteExpense);
router.route("/get-expense/:expenseId").get(expenseController.getExpenseById);

router
  .route("/import-expense")
  .post(authMiddleware, upload.single("csv"), fileController.importExpenseData);

router
  .route("/summary/category")
  .get(authMiddleware, expenseController.getCategotySummary);
router
  .route("/summary/monthly")
  .get(authMiddleware, expenseController.getMonthlySummary);

module.exports = router;
