import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/db";

export class Broadcast extends Model<InferAttributes<Broadcast>, InferCreationAttributes<Broadcast>> {
  declare id: CreationOptional<number>;
  declare message: string;
  declare status: CreationOptional<"sending" | "completed" | "partial" | "failed">;
  declare totalGroups: CreationOptional<number>;
  declare successCount: CreationOptional<number>;
  declare failureCount: CreationOptional<number>;
  declare sentBy: number;
  declare imageId: number | null;
  declare sentAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

Broadcast.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  message: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM("sending", "completed", "partial", "failed"), allowNull: false, defaultValue: "sending" },
  totalGroups: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: "total_groups" },
  successCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: "success_count" },
  failureCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: "failure_count" },
  sentBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "sent_by" },
  imageId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "image_id" },
  sentAt: { type: DataTypes.DATE, allowNull: true, field: "sent_at" },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize, tableName: "broadcasts", timestamps: true, underscored: true });

export default Broadcast;

