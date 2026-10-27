"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("message_templates", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      name: { type: Sequelize.STRING(255), allowNull: false },
      content: { type: Sequelize.TEXT, allowNull: false },
      status: { type: Sequelize.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
      created_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "users", key: "id" } },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("message_templates"); },
};

