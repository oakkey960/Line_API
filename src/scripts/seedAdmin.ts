import "dotenv/config";
import bcrypt from "bcryptjs";
import sequelize from "../config/db";
import User from "../models/user.model";

async function main() {
  const username = process.env.INITIAL_ADMIN_USERNAME?.trim();
  const password = process.env.INITIAL_ADMIN_PASSWORD;
  const displayName = process.env.INITIAL_ADMIN_DISPLAY_NAME?.trim() || "System Administrator";
  if (!username || !password || password.length < 12) {
    throw new Error("Set INITIAL_ADMIN_USERNAME and INITIAL_ADMIN_PASSWORD (minimum 12 characters) in .env");
  }
  await sequelize.authenticate();
  const passwordHash = await bcrypt.hash(password, 12);
  const [user, created] = await User.findOrCreate({
    where: { username },
    defaults: { username, passwordHash, displayName, department: null, role: "admin", status: "active", lastLoginAt: null },
  });
  if (!created) await user.update({ passwordHash, displayName, role: "admin", status: "active" });
  console.log(created ? "Initial admin created" : "Initial admin updated");
  await sequelize.close();
}

void main().catch((error) => { console.error(error.message); process.exit(1); });

