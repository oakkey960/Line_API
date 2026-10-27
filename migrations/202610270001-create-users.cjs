"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("users", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      username: { type: Sequelize.STRING(100), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      display_name: { type: Sequelize.STRING(255), allowNull: false },
      department: { type: Sequelize.STRING(255), allowNull: true },
      role: { type: Sequelize.ENUM("admin", "sender"), allowNull: false, defaultValue: "sender" },
      status: { type: Sequelize.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("users"); },
};

