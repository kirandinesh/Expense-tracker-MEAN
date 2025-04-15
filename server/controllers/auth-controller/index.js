const User = require("../../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userToken = require("../../models/userToken");
const nodemailer = require("nodemailer");

const registerUser = async (req, res) => {
  const { fullName, userName, email, password } = req.body;

  if (!fullName || !userName || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const existingUser = await User.findOne({ $or: [{ email }, { userName }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already Exists",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      fullName,
      userName,
      email,
      password: hashPassword,
    });
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registered Successfully",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkUserExist = await User.findOne({ email });
    if (!checkUserExist) {
      return res.status(404).json({
        success: false,
        message: "User Not Found",
      });
    }

    const checkPasswordMatch = await bcrypt.compare(
      password,
      checkUserExist.password
    );

    if (!checkPasswordMatch) {
      return res.json({
        success: false,
        message: "Incorrect password! Please try again",
      });
    }
    const accessToken = jwt.sign(
      {
        _id: checkUserExist._id,
        fullName: checkUserExist.fullName,
        userName: checkUserExist.userName,
        email: checkUserExist.email,
      },
      process.env.SECRET_KEY,
      { expiresIn: "120m" }
    );

    res.status(200).json({
      success: true,
      message: "Logged in SuccessFully",
      data: {
        accessToken,
        user: {
          _id: checkUserExist._id,
          fullName: checkUserExist.fullName,
          userName: checkUserExist.userName,
          email: checkUserExist.email,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const sendEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const userExist = await User.findOne({
      email: { $regex: new RegExp("^" + email + "$", "i") },
    });

    if (!userExist) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const payload = { email: userExist.email };
    const expiryTime = 300;
    const token = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: expiryTime,
    });

    const newToken = userToken({
      userId: userExist._id,
      token: token,
    });

    const mailTransport = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      host: "smtp.gmail.com",
      port: 465,
      auth: {
        user: "streamv123@gmail.com",
        pass: "vlslobzcnnnkonbs",
      },
    });

    let mailDetails = {
      from: '"FinMate Support" <streamv123@gmail.com>',
      to: email,
      subject: "Reset Your FinMate Password",
      text: `Hi ${userExist.fullName},\n\nReset your password here: ${process.env.CLIENT_URL}/reset-password/${token}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #333333;">🔐 Reset Your FinMate Password</h2>
            <p style="color: #555555;">Hi ${userExist.fullName},</p>
            <p style="color: #555555;">We received a request to reset your FinMate account password. Click the button below to proceed:</p>
            <a href=${process.env.CLIENT_URL}/reset-password/${token} 
               style="display: inline-block; padding: 12px 20px; margin: 20px 0; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
            <p style="color: #555555;">If you did not request this, you can safely ignore this email.</p>
            <hr style="margin: 30px 0;">
            <p style="font-size: 12px; color: #888888;">This link will expire in 5 minutes for security purposes.</p>
            <p style="font-size: 12px; color: #888888;">Need help? Reach out to us at support@finmate.com</p>
            <p style="text-align: center; font-size: 14px; margin-top: 30px; color: #999999;">&copy; 2025 FinMate</p>
          </div>
        </div>
      `,
    };

    mailTransport.sendMail(mailDetails, async (err, data) => {
      if (err) {
        return res.status(500).json({
          success: false,
          message: "Something went wrong on our end. Please try again later",
        });
      } else {
        await newToken.save();
        res.status(200).json({
          success: true,
          message: "Mail Send Successfully",
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const resetPassword = async (req, res) => {
  const token = req.body.token;
  const newPassword = req.body.password;

  jwt.verify(token, process.env.SECRET_KEY, async (err, data) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: "Reset Link is Expired",
      });
    } else {
      const response = data;
      const user = await User.findOne({
        email: { $regex: new RegExp("^" + response.email + "$", "i") },
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const hashPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashPassword;
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $set: user },
          { new: true }
        );
        res.status(200).json({
          success: true,
          message: "Password reset success!",
        });
      } catch (err) {
        res.status(500).json({
          success: false,
          message: "Something went wrong on our end. Please try again later",
        });
      }
    }
  });
};

const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);

    const updatedData = req.body;

    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      updatedData,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to update user information",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User information updated successfully",
      data: updatedUser,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);

    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    console.log(existingUser);

    const userData = {
      fullName: existingUser.fullName,
      userName: existingUser.userName,
      userSince: existingUser.createdAt,
      lastLogin: existingUser.updatedAt,
    };

    return res.status(200).json({
      success: true,
      message: "User information Fetched successfully",
      data: userData,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);

    const existingUser = await User.findOne({ _id: userId });
    if (!existingUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    const deleteUser = await User.findOneAndDelete({ _id: userId });
    if (!deleteUser) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete user information",
      });
    }

    res.status(200).json({
      success: true,
      message: "user successfully deleted",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong on our end. Please try again later",
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  sendEmail,
  resetPassword,
  updateUserInfo,
  getUserById,
  deleteAccount,
};
