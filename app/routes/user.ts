import express from "express";
import passport from "passport";
import User, { type IUser } from "../schema/User";
import jwt from "jsonwebtoken";
import expressAsyncHandler from "express-async-handler";
import { createResponse } from "../helper/response";
import { catchError, validate } from "../middleware/validation";
import createHttpError from "http-errors";

const router = express.Router();

router.post(
  "/signup",
  validate("users:signup"),
  catchError,
  passport.authenticate("signup", { session: false }),
  expressAsyncHandler(async (req, res, next) => {
    const user = req.user as IUser;
    if (user != null) {
      const jwtSecret = process.env.JWT_SECRET ?? "";
      const token = jwt.sign({ user }, jwtSecret);
      res.send(createResponse({ user, token }, "Account created successfully"));
    }
    next(
      createHttpError(400, {
        message: "An error occurred.",
        data: { user: null },
      })
    );
  })
);

router.post(
  "/login",
  validate("users:login"),
  catchError,
  expressAsyncHandler(async (req, res, next) => {
    passport.authenticate("login", async (err: any, user: IUser) => {
      if (err != null || user == null) {
        next(
          createHttpError(400, {
            message: err?.message ?? "An error occurred.",
            data: { user: null },
          })
        );
        return;
      }
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      req.login(user, { session: false }, async (error) => {
        if (error != null) {
          next(
            createHttpError(400, {
              message: err.message ?? "An error occurred.",
              data: { user: null },
            })
          );
          return;
        }
        const jwtSecret = process.env.JWT_SECRET ?? "";
        const token = jwt.sign({ user }, jwtSecret);
        return res.send(
          createResponse({ user, token }, "User verified successfully!")
        );
      });
    })(req, res, next);
  })
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  validate("users:update"),
  catchError,
  expressAsyncHandler(async (req, res) => {
    const { name, email, active } = req.body as IUser;

    const user = req.params.id;

    const result = await User.findByIdAndUpdate(
      { _id: user },
      { name, email, active },
      { new: true }
    );
    res.send(createResponse({ user: result }, "User updated successfully!"));
  })
);

export default router;
