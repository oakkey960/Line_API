"use strict";
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("broadcasts", "image_id", { type: Sequelize.INTEGER.UNSIGNED, allowNull: true, references: { model: "media_files", key: "id" }, onDelete: "SET NULL" });
  },
  async down(queryInterface) { await queryInterface.removeColumn("broadcasts", "image_id"); },
};

