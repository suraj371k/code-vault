import { User } from "../generated/prisma/client.ts";

declare global {
  namespace Express {
    interface User {
      id: number;
      email: string;
      name: string;
    }
  }
}
