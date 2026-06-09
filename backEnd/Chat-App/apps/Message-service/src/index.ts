import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import app from "./app.js";
import {
  connectCloudinary,
  connectMongoDB,
  connectRabbitMQ,
  errorHandler,
  redisClient,
} from "@chat-app/shared";
import { unseenCountConsumer } from "./rabbitmq/consumers/unseenCountConsumer.js";
import * as Router from "./routes/index.routes.js";
async function bootstarp() {
  try {
    await connectMongoDB(process.env.MONGO_URI!);
    const redis = redisClient();
    await redis.set("service", "Message");
    await connectRabbitMQ();
    await unseenCountConsumer();
    connectCloudinary();

    app.use("/api/v1", Router.MessageRoute);
    app.use(errorHandler);
    const port = process.env.MESSAGE_PORT;
    app.listen(port, () => {
      console.log(`Message Service is running on prot ${port}`);
    });
  } catch (error) {
    console.error(error);
  }
}

bootstarp();
