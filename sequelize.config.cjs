require("dotenv").config();

const shared = {
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  dialect: process.env.DB_DIALECT || "mysql",
  logging: false,
};

module.exports = {
  development: shared,
  test: shared,
  production: shared,
};

