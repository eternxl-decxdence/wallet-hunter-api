import { IUser } from "../models/User.ts";
import { IAdmin } from "../models/Admin.ts";
import { CookieParseOptions } from "cookie-parser";
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      admin?: IAdmin;
    }
  }
}
