const express = require("express");
const authController = require("../../controllers/auth-controller/index");
const authMiddleware = require("../../middleware/auth-middleware");
const router = express.Router();

router.route("/register").post(authController.registerUser);
router.route("/login").post(authController.loginUser);
router.route("/check-auth").get(authMiddleware, (req, res) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    message: "Authenticated user!",
    data: { user },
  });
});
router.route("/send-email").post(authController.sendEmail);
router.route("/password-reset").post(authController.resetPassword);
router.route("/update-user").put(authMiddleware, authController.updateUserInfo);
router.route("/get-user").get(authMiddleware, authController.getUserById);
router.route("/add-income").put(authMiddleware, authController.insertIncome);
router
  .route("/delete-user")
  .delete(authMiddleware, authController.deleteAccount);

module.exports = router;
