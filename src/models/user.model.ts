import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/db";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: CreationOptional<number>;
  declare username: string;
  declare passwordHash: string;
  declare displayName: string;
  declare department: string | null;
  declare role: CreationOptional<"admin" | "sender">;
  declare status: CreationOptional<"active" | "inactive">;
  declare lastLoginAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

User.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  username: { type: DataTypes.STRING(100), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: "password_hash" },
  displayName: { type: DataTypes.STRING(255), allowNull: false, field: "display_name" },
  department: { type: DataTypes.STRING(255), allowNull: true },
  role: { type: DataTypes.ENUM("admin", "sender"), allowNull: false, defaultValue: "sender" },
  status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  lastLoginAt: { type: DataTypes.DATE, allowNull: true, field: "last_login_at" },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize, tableName: "users", timestamps: true, underscored: true });

export default User;

