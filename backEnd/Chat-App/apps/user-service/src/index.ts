import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import { connectMongoDB, connectRabbitMQ, redis } from "@chat-app/shared";

const PORT = process.env.USER_PORT;

async function bootstrap() {
  try {
    await connectMongoDB(process.env.MONGO_URI!);

    await connectRabbitMQ();

    await redis.set("service", "user");

    app.listen(PORT, () => {
      console.log(`User Service running on ${PORT}`);
    });
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
}

bootstrap();
