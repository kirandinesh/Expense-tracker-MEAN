require("dotenv").config();
require("./utils/db");
const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
const path = require("path");
const indexRouter = require("./routes/index.routes");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "public")));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/", indexRouter);
app.use((err, req, res, next) => {
  res.status(500).json({
    success: false,
    message: "Something went wrong ",
    stack: err.stack,
  });
});
app.listen(port, () => console.log(`listening on http://localhost:${port}`));
