import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import app from "./app.js";

import {
  connectMongoDB,
  connectRabbitMQ,
  consumeEvent,
  otpTemplate,
  redisClient,
  sendEmail,
} from "@chat-app/shared";
import { startSendOTPConsumer } from "./consumer.js";

const PORT = process.env.MAIL_PORT;

async function bootstrap() {
  try {
    await connectMongoDB(process.env.MONGO_URI!);
    await connectRabbitMQ();
    await startSendOTPConsumer();
    await consumeEvent("user.registered", async (data) => {
      await sendEmail({
        to: process.env.EMAIL_USER!,
        subject: "Verify Your Email",
        html: otpTemplate(data.otp),
      });

      console.log(`OTP email sent to ${data.email}`);
    });

    const redis = redisClient();

    redis.set("service", "mail");

    app.listen(PORT, () => {
      console.log(`Mail Service is running on port ${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

bootstrap();
