"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("media_files", {
      id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
      original_name: { type: Sequelize.STRING(255), allowNull: false },
      mime_type: { type: Sequelize.STRING(100), allowNull: false },
      size_bytes: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false },
      checksum: { type: Sequelize.STRING(64), allowNull: false },
      data: { type: Sequelize.BLOB("long"), allowNull: false },
      created_by: { type: Sequelize.INTEGER.UNSIGNED, allowNull: false, references: { model: "users", key: "id" } },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    });
  },
  async down(queryInterface) { await queryInterface.dropTable("media_files"); },
};

