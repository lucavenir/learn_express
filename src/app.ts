import express from "express";
import dotenv from "dotenv";
import connection from "./db/connect";

async function start() {
   // startup
   dotenv.config();
   const app = express();
   const port = process.env.PORT;

   console.log("db connection..");
   await connection(process.env.MONGO_URI!);
   console.log("db connected");
   console.log("starting our server..");

   app.listen(port, () => {
      console.log(`server running on port ${port}`);
   });
}

start();