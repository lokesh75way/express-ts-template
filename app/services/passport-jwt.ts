import passport from "passport";
import { Strategy, ExtractJwt } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import User, { type IUser } from "../schema/User";
import createError from "http-errors";

export const initPassport = (): void => {
  passport.use(
    new Strategy(
      {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      },
      async (token, done) => {
        try {
          done(null, token.user);
        } catch (error) {
          done(error);
        }
      }
    )
  );

  // user signup
  passport.use(
    "signup",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
        passReqToCallback: true,
      },
      async (request, email, password, done) => {
        try {
          const { name } = request.body as IUser;
          const existUser = await User.findOne({ email });
          if (existUser != null) {
            done(createError(403, "User already exist!"));
            return;
          }
          const user = await User.create({ name, email, password });
          done(null, user);
        } catch (error: any) {
          done(createError(500, error.message));
        }
      }
    )
  );

  // user login
  passport.use(
    "login",
    new LocalStrategy(
      {
        usernameField: "email",
        passwordField: "password",
      },
      async (email, password, done) => {
        try {
          const user = await User.findOne({ email });
          if (user == null) {
            done(createError(401, "User not found!"), false);
            return;
          }

          const validate = await user.isValidPassword(password);
          if (!validate) {
            done(createError(401, "Invalid email or password"), false);
            return;
          }

          done(null, user, { message: "Logged in Successfully" });
        } catch (error: any) {
          done(createError(500, error.message));
        }
      }
    )
  );
};
