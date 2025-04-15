const mongoose = require("mongoose");
const MONGO_URI = process.env.MONGO_URI;
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("MongoDb Connected Successfully");
  })
  .catch((err) => {
    console.log(err, "MongoDB failed to connect ");
  });
