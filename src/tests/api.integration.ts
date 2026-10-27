import "dotenv/config";
import bcrypt from "bcryptjs";
import request from "supertest";
import app from "../app";
import sequelize from "../config/db";
import AuditLog from "../models/auditLog.model";
import MessageTemplate from "../models/messageTemplate.model";
import User from "../models/user.model";

async function main() {
  process.env.JWT_SECRET ||= "integration-test-secret-with-at-least-32-characters";
  await sequelize.authenticate();
  const username = `api_test_${Date.now()}`;
  const password = "ApiTest!234567";
  const admin = await User.create({ username, passwordHash: await bcrypt.hash(password, 4), displayName: "API Test", department: "IT", role: "admin", status: "active", lastLoginAt: null });
  const createdUserIds: number[] = [admin.id];
  const createdTemplateIds: number[] = [];

  try {
    const unauthorized = await request(app).get("/api/line/groups");
    assert(unauthorized.status === 401, "protected route rejects missing token");

    const login = await request(app).post("/api/login").send({ username, password });
    assert(login.status === 200 && login.body.token, "login returns JWT");
    const auth = { Authorization: `Bearer ${login.body.token}` };

    const me = await request(app).get("/api/me").set(auth);
    assert(me.status === 200 && me.body.user.username === username, "me returns current user");

    const groups = await request(app).get("/api/line/groups").set(auth);
    assert(groups.status === 200 && Array.isArray(groups.body.data), "groups list returns data");

    const template = await request(app).post("/api/templates").set(auth).send({ name: "API test template", content: "ข้อความทดสอบ" });
    assert(template.status === 201, "template can be created");
    createdTemplateIds.push(template.body.data.id);

    const templateUpdate = await request(app).patch(`/api/templates/${template.body.data.id}`).set(auth).send({ content: "ข้อความทดสอบที่แก้ไข" });
    assert(templateUpdate.status === 200, "template can be updated");

    const newUser = await request(app).post("/api/admin/users").set(auth).send({ username: `${username}_sender`, password: "Sender!234567", displayName: "Test Sender", department: "IT", role: "sender" });
    assert(newUser.status === 201, "admin can create user");
    createdUserIds.push(newUser.body.data.id);

    const userList = await request(app).get("/api/admin/users").set(auth);
    assert(userList.status === 200 && Array.isArray(userList.body.data), "admin can list users");

    const invalidBroadcast = await request(app).post("/api/broadcasts").set(auth).send({ message: "", groupIds: [] });
    assert(invalidBroadcast.status === 400, "broadcast validation rejects empty request");

    const history = await request(app).get("/api/broadcasts").set(auth);
    assert(history.status === 200 && Array.isArray(history.body.data), "broadcast history returns data");

    const disabled = await request(app).delete(`/api/templates/${template.body.data.id}`).set(auth);
    assert(disabled.status === 204, "template can be disabled");
    console.log("API integration tests passed");
  } finally {
    await AuditLog.destroy({ where: { userId: createdUserIds } });
    await MessageTemplate.destroy({ where: { id: createdTemplateIds } });
    await User.destroy({ where: { id: createdUserIds } });
    await sequelize.close();
  }
}

function assert(condition: unknown, label: string): asserts condition {
  if (!condition) throw new Error(`FAILED: ${label}`);
  console.log(`PASS: ${label}`);
}

void main().catch((error) => { console.error(error); process.exit(1); });

