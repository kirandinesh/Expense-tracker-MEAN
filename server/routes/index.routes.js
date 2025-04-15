const express = require("express");
const router = express.Router();
const authRouter = require("./auth-routes/index");
const expenseRouter = require("./expense-routes/index");
const categoryRouter = require("./category-routes/index");

router.use("/auth", authRouter);
router.use("/expense", expenseRouter);
router.use("/category", categoryRouter);

module.exports = router;
