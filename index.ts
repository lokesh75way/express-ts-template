import dotenv from "dotenv";
import express, { type Express, type Request, type Response } from "express";
import bodyParser from "body-parser";
import morgan from "morgan";
import http from "http";

import errorHandler from "./app/middleware/errorHandler";
import { initDB } from "./app/services/initDB";
import userRoutes from "./app/routes/user";
import { initPassport } from "./app/services/passport-jwt";

dotenv.config();

const port = Number(process.env.PORT) ?? 5000;

const app: Express = express();
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(morgan("dev"));

const initApp = async (): Promise<void> => {
  // init mongodb
  await initDB();

  // passport init
  initPassport();

  // set base path to /api
  app.use("/api", router);

  app.get("/", (req: Request, res: Response) => {
    res.send({ status: "ok" });
  });

  // routes
  router.use("/user", userRoutes);

  // error handler
  app.use(errorHandler);

  http.createServer(app).listen(port);
};

void initApp();
