"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("broadcasts", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      message: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.ENUM("sending", "completed", "partial", "failed"), allowNull: false, defaultValue: "sending" },
      total_groups: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      success_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      failure_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, defaultValue: 0 },
      sent_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "users", key: "id" } },
      sent_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("broadcasts"); },
};

