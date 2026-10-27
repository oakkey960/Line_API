"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const tables = await queryInterface.showAllTables();
    const names = tables.map((table) => typeof table === "string" ? table : table.tableName);
    if (!names.includes("line_groups")) {
      await queryInterface.createTable("line_groups", {
        id: { type: Sequelize.INTEGER.UNSIGNED, autoIncrement: true, primaryKey: true },
        group_id: { type: Sequelize.STRING(64), allowNull: false, unique: true },
        name: { type: Sequelize.STRING(255), allowNull: true },
        internal_name: { type: Sequelize.STRING(255), allowNull: true },
        category: { type: Sequelize.STRING(100), allowNull: true },
        picture_url: { type: Sequelize.TEXT, allowNull: true },
        member_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
        status: { type: Sequelize.ENUM("active", "inactive"), allowNull: false, defaultValue: "active" },
        enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
        joined_at: { type: Sequelize.DATE, allowNull: false },
        left_at: { type: Sequelize.DATE, allowNull: true },
        last_seen_at: { type: Sequelize.DATE, allowNull: false },
        created_at: { type: Sequelize.DATE, allowNull: false },
        updated_at: { type: Sequelize.DATE, allowNull: false },
      });
      return;
    }

    const columns = await queryInterface.describeTable("line_groups");
    const additions = {
      internal_name: { type: Sequelize.STRING(255), allowNull: true },
      category: { type: Sequelize.STRING(100), allowNull: true },
      member_count: { type: Sequelize.INTEGER.UNSIGNED, allowNull: true },
      enabled: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
    };
    for (const [name, definition] of Object.entries(additions)) {
      if (!columns[name]) await queryInterface.addColumn("line_groups", name, definition);
    }
  },
  async down(queryInterface) {
    const columns = await queryInterface.describeTable("line_groups");
    for (const name of ["internal_name", "category", "member_count", "enabled"]) {
      if (columns[name]) await queryInterface.removeColumn("line_groups", name);
    }
  },
};

