import {
  AppError,
  asyncHandler,
  generateToken,
  publishEvent,
  redisClient,
} from "@chat-app/shared";
import { User } from "../model/User.js";
import type { AuthenticatedRequest } from "@chat-app/shared";

export const loginUser = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const redis = redisClient();
  const rateLimitKey = `otp:rateLimit:${email}`;
  const rateLimit = await redis.get(rateLimitKey);

  if (rateLimit) {
    return res.status(429).json({
      success: false,
      message: "Too many requests. Please wait before requesting a new OTP.",
    });
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpKey = `otp:${email}`;

  await redis.set(otpKey, otp, {
    ex: 300,
  });

  await redis.set(rateLimitKey, "true", {
    ex: 60,
  });

  await publishEvent("Send-OTP", {
    email,
    otp,
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent to Your Email Successfully",
  });
});

export const VerifyUser = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    throw AppError.badRequest("Email and OTP is Required");
  }

  const redis = redisClient();
  const storedOTP = await redis.get(`otp:${email}`);
  if (!storedOTP || String(storedOTP) !== String(otp)) {
    throw AppError.badRequest("Invalid or Expired OTP Code");
  }
  await redis.del(`otp:${email}`);

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      name: email.split("@")[0],
      email,
    });
  }

  const token = generateToken(user);

  return res.status(200).json({
    message: "User Verified",
    user,
    token,
  });
});

export const myProfile = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const user = req.user;
    console.log(user);

    res.status(200).json({
      message: "Done",
      user,
    });
  },
);

export const updateName = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) {
      throw AppError.notFound("Please Login");
    }

    user.name = req.body.name;
    await user.save();

    const token = generateToken(user);
    res.status(200).json({
      message: "User Updated ",
      user,
      token,
    });
  },
);

export const getAllUser = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const users = await User.find();
    res.status(200).json({
      message: "Done",
      users,
    });
  },
);

export const getAUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  res.status(200).json({
    message: "Done",
    user,
  });
});
