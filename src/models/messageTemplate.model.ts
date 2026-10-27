import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/db";

export class MessageTemplate extends Model<InferAttributes<MessageTemplate>, InferCreationAttributes<MessageTemplate>> {
  declare id: CreationOptional<number>;
  declare name: string;
  declare content: string;
  declare status: CreationOptional<"active" | "inactive">;
  declare createdBy: number;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

MessageTemplate.init({
  id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
  name: { type: DataTypes.STRING(255), allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  status: { type: DataTypes.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
  createdBy: { type: DataTypes.INTEGER.UNSIGNED, allowNull: false, field: "created_by" },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize, tableName: "message_templates", timestamps: true, underscored: true });

export default MessageTemplate;

