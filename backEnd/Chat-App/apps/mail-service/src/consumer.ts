import { consumeEvent, sendEmail, otpTemplate } from "@chat-app/shared";

export const startSendOTPConsumer = async () => {
  try {
    const queue = "Send-OTP";
    console.log("Mail Service consumer started, listening for OTP emails");

    await consumeEvent(queue, async (data) => {
      try {
        await sendEmail({
          to: data.email,
          subject: "Verify Your Email",
          html: otpTemplate(data.otp),
        });
        console.log(`OTP email sent to ${data.email}`);
      } catch (error) {
        console.error("Failed to send email:", error);
      }
    });
  } catch (error) {
    console.log("Faild to Start RabbitMQ Consumer", error);
  }
};

