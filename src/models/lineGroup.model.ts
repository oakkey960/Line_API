import {
  CreationOptional,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  Model,
} from "sequelize";
import sequelize from "../config/db";

export class LineGroup extends Model<
  InferAttributes<LineGroup>,
  InferCreationAttributes<LineGroup>
> {
  declare id: CreationOptional<number>;
  declare groupId: string;
  declare name: string | null;
  declare internalName: string | null;
  declare category: string | null;
  declare pictureUrl: string | null;
  declare memberCount: number | null;
  declare status: CreationOptional<"active" | "inactive">;
  declare enabled: CreationOptional<boolean>;
  declare joinedAt: CreationOptional<Date>;
  declare leftAt: Date | null;
  declare lastSeenAt: CreationOptional<Date>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;
}

LineGroup.init(
  {
    id: { type: DataTypes.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
    groupId: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: "group_id" },
    name: { type: DataTypes.STRING(255), allowNull: true },
    internalName: { type: DataTypes.STRING(255), allowNull: true, field: "internal_name" },
    category: { type: DataTypes.STRING(100), allowNull: true },
    pictureUrl: { type: DataTypes.TEXT, allowNull: true, field: "picture_url" },
    memberCount: { type: DataTypes.INTEGER.UNSIGNED, allowNull: true, field: "member_count" },
    status: {
      type: DataTypes.ENUM("active", "inactive"),
      allowNull: false,
      defaultValue: "active",
    },
    enabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    joinedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "joined_at",
    },
    leftAt: { type: DataTypes.DATE, allowNull: true, field: "left_at" },
    lastSeenAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "last_seen_at",
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  },
  { sequelize, tableName: "line_groups", timestamps: true, underscored: true },
);

export default LineGroup;

