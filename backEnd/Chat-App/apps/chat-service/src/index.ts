import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import app from "./app.js";
const PORT = process.env.CHAT_PORT;

import { connectMongoDB, redisClient, connectRabbitMQ } from "@chat-app/shared";
import * as Routes from "./routes/index.route.js";
import { registerMessageConsumers } from "./rabbitmq/consumers/messageConsumer.js";

async function bootstrap() {
  try {
    await connectMongoDB(process.env.MONGO_URI!);
    await connectRabbitMQ();
    const redis = redisClient();
    await redis.set("service", "chat");
    registerMessageConsumers();
   
    // Routes
    app.use("/api/v1", Routes.CreateNewChat);
    app.use("/api/v1", Routes.getAllChats);

    app.listen(PORT, () => {
      console.log(`Chat-service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
  }
}

bootstrap();
