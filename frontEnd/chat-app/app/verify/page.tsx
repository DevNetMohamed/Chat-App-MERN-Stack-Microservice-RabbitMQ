"use client";
import axios from "axios";
import { ArrowRight, Loader2, Lock } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

export default function Verify() {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [error, setError] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(60);

  const searchParams = useSearchParams();
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();

  const email: string = searchParams.get("email") || "";

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleInputChange = (index: number, value: string): void => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ): void => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>): void => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text");
    const digits = pastedData.replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      const newOtp = digits.split("");
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setError("Please enter all 6 digits");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/v1/verify", {
        email,
        otp: otpCode,
      });
      toast.success(response.data.message);
      router.push("/chat");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async (): Promise<void> => {
    setResendLoading(true);
    try {
      await axios.post("http://localhost:5000/api/v1/login", { email });
      setTimer(60);
      toast.success("Code resent successfully");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to resend code");
      }
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-blue-600 rounded-lg flex items-center justify-center mb-6">
              <Lock size={40} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-3">
              Verify Your Email
            </h1>
            <p className="text-gray-300 text-lg">
              We have sent a 6-digit code to
            </p>
            <p className="text-blue-400 font-medium">{email}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-4 text-center">
                Enter your 6 digit OTP
              </label>
              <div className="flex justify-center space-x-3">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el: HTMLInputElement | null) => {
                      inputRefs.current[index] = el;
                    }}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleInputChange(index, e.target.value)} // ✅ كان e.handeleInputChange
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-12 text-center text-xl font-bold border-2 border-gray-600 rounded-lg bg-gray-700 text-white focus:border-blue-500 focus:outline-none"
                  />
                ))}
              </div>
              {error && (
                <p className="text-red-400 text-sm text-center mt-2">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <span>Verify Code</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </button>

            <div className="text-center">
              {timer > 0 ? (
                <p className="text-gray-400 text-sm">
                  Resend code in{" "}
                  <span className="text-blue-400 font-medium">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="text-blue-400 hover:text-blue-300 text-sm disabled:opacity-50"
                >
                  {resendLoading ? "Sending..." : "Resend Code"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
