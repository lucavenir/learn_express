import express, { json, urlencoded } from "express";
import dotenv from "dotenv";
import connection from "./db/connect";
import { serve as swaggerServe, setup as swaggerSetup } from "swagger-ui-express";
import * as swaggerJson from "./tsoa/tsoa.json"
import { RegisterRoutes } from "./routes/routes";
import { handleErrors } from "./middleware/errors";
import fileUpload from "express-fileupload";

async function start() {
   dotenv.config();
   const port = process.env.PORT;

   const app = express();
   app.use(urlencoded({ extended: true }));
   app.use(json());
   const fileUploadConfig = { useTempFiles: true, tempFileDir: "/tmp/" };
   app.use(fileUpload(fileUploadConfig));
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

   app.use(handleErrors);

   await connection(process.env.MONGO_URI!);

   app.listen(port, () => {
      console.log(`server running on port ${port}`);
   });
}

start();
