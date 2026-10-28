import { CreationOptional, DataTypes, InferAttributes, InferCreationAttributes, Model } from "sequelize";
import sequelize from "../config/db";

export class AuditLog extends Model<InferAttributes<AuditLog>, InferCreationAttributes<AuditLog>> {
  declare id: CreationOptional<number>;
  declare userId: number | null;
  declare action: string;
  declare entityType: string | null;
  declare entityId: string | null;
  declare metadata: Record<string, unknown> | null;
  declare ipAddress: string | null;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

AuditLog.init({
  id: { type: DataTypes.BIGINT.UNSIGNED, autoIncrement: true, primaryKey: true },
  userId: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "user_id" },
  action: { type: DataTypes.STRING(100), allowNull: false },
  entityType: { type: DataTypes.STRING(100), allowNull: true, field: "entity_type" },
  entityId: { type: DataTypes.STRING(100), allowNull: true, field: "entity_id" },
  metadata: {
    type: DataTypes.TEXT("long"),
    allowNull: true,
    get() {
      const value = this.getDataValue("metadata") as unknown;
      if (value == null) return null;
      // Existing installations may still use a native JSON column.
      return typeof value === "string" ? JSON.parse(value) : value;
    },
    set(value: Record<string, unknown> | null) {
      this.setDataValue(
        "metadata",
        (value == null ? null : JSON.stringify(value)) as unknown as Record<string, unknown> | null,
      );
    },
  },
  ipAddress: { type: DataTypes.STRING(64), allowNull: true, field: "ip_address" },
  createdAt: DataTypes.DATE,
  updatedAt: DataTypes.DATE,
}, { sequelize, tableName: "audit_logs", timestamps: true, underscored: true });

export default AuditLog;

