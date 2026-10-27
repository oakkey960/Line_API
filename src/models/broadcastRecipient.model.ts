import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/db";

export class BroadcastRecipient extends Model<InferAttributes<BroadcastRecipient>, InferCreationAttributes<BroadcastRecipient>> {
  declare id: CreationOptional<number>;
  declare broadcastId: number;
  declare lineGroupId: number;
  declare status: CreationOptional<"pending" | "sent" | "failed">;
  declare lineMessageId: string | null;
  declare errorCode: string | null;
  declare errorMessage: string | null;
  declare attemptCount: CreationOptional<number>;
  declare sentAt: Date | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

BroadcastRecipient.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  broadcastId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "broadcast_id" },
  lineGroupId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "line_group_id" },
  status: { type: DataTypes.ENUM("pending", "sent", "failed"), allowNull: false, defaultValue: "pending" },
  lineMessageId: { type: DataTypes.STRING(100), allowNull: true, field: "line_message_id" },
  errorCode: { type: DataTypes.STRING(100), allowNull: true, field: "error_code" },
  errorMessage: { type: DataTypes.TEXT, allowNull: true, field: "error_message" },
  attemptCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0, field: "attempt_count" },
  sentAt: { type: DataTypes.DATE, allowNull: true, field: "sent_at" },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize, tableName: "broadcast_recipients", timestamps: true, underscored: true });

export default BroadcastRecipient;

