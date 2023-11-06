import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import connection from "./db/connect";
import { serve as swaggerServe, setup as swaggerSetup } from "swagger-ui-express";
import * as swaggerJson from "./tsoa/tsoa.json"
import { RegisterRoutes } from "./routes/routes";

async function start() {
   // startup
   dotenv.config();
   const port = process.env.PORT;

   const app = express();
   app.use(urlencoded({ extended: true }));
   app.use(json());
   RegisterRoutes(app);
   app.use(
      ["/openapi", "/docs", "/swagger"],
      swaggerServe,
      swaggerSetup(swaggerJson)
   );

   app.get("/swagger.json", (_, res) => {
      res.setHeader("Content-Type", "application/json");
      res.sendFile(`${__dirname}/tsoa/tsoa.json`);
   });

   await connection(process.env.MONGO_URI!);

   app.listen(port, () => {
      console.log(`server running on port ${port}`);
   });
}

start();