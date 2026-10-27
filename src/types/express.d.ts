declare namespace Express {
  interface Request {
    auth?: { userId: number; username: string; role: "admin" | "sender" };
  }
}

