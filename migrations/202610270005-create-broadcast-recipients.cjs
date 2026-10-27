"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("broadcast_recipients", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      broadcast_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "broadcasts", key: "id" }, onDelete: "CASCADE" },
      line_group_id: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "line_groups", key: "id" } },
      status: { type: Sequelize.ENUM("pending", "sent", "failed"), allowNull: false, defaultValue: "pending" },
      line_message_id: { type: Sequelize.STRING(100), allowNull: true },
      error_code: { type: Sequelize.STRING(100), allowNull: true },
      error_message: { type: Sequelize.TEXT, allowNull: true },
      attempt_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      sent_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
    await queryInterface.addIndex("broadcast_recipients", ["broadcast_id", "line_group_id"], { unique: true, name: "broadcast_recipient_unique" });
  },
  async down(queryInterface) { await queryInterface.dropTable("broadcast_recipients"); },
};

