import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";
import sequelize from "./config/db";
import "./models/lineGroup.model";
import "./models/user.model";
import "./models/messageTemplate.model";
import "./models/broadcast.model";
import "./models/broadcastRecipient.model";
import "./models/auditLog.model";
import "./models/mediaFile.model";
// require("./services/logCleanup");
const parsedPort = Number(process.env.PORTAPP);
const PORT = !isNaN(parsedPort) && parsedPort > 0 ? parsedPort : 3002;
const HOST = "0.0.0.0";

async function startServer() {
  app.listen(PORT, HOST, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`Server accessible at http://<YOUR_LOCAL_IP>:${PORT}`);
  });

  await connectDatabase();
}

async function connectDatabase(): Promise<void> {
  try {
    await sequelize.authenticate();
    console.log("Database connected");
  } catch (error) {
    console.error(
      "Database unavailable. API remains online and will retry in 30 seconds.",
      error instanceof Error ? error.message : error,
    );
    setTimeout(() => void connectDatabase(), 30_000);
  }
}

void startServer();
