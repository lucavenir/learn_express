import mongoose from "mongoose";

mongoose.set("strictQuery", false); // ??

function connection (url) {
  return mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};

export default connection;
