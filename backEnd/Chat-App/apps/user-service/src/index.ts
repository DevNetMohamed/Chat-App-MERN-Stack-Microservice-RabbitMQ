import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import app from "./app.js";
import { connectMongoDB, connectRabbitMQ, redisClient } from "@chat-app/shared";
import cors from "cors";
import * as Routes from "./routes/index.Routes.js";
const PORT = process.env.USER_PORT;

async function bootstrap() {
  try {
    await connectMongoDB(process.env.MONGO_URI!);
    await connectRabbitMQ();
    const redis = redisClient();

    await redis.set("service", "user");

    app.use(cors());
    
    app.use("/api/v1", Routes.UserRoute);

    app.listen(PORT, () => {
      console.log(`User Service running on ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
