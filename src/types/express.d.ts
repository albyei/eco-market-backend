import { JwtPayload } from "jsonwebtoken";

declare module "express-serve-static-core" {
  interface Request {
    user?:
      | JwtPayload
      | {
          id: number;
          name: string;
          email: string;
          role: string;
          iat: number;
          exp: number;
        };
  }
}
