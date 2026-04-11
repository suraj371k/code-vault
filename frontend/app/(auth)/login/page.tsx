"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { motion, AnimatePresence, Variants, Easing } from "framer-motion";
import { Eye, EyeOff, Mail, Lock, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { LoginInput, useLogin } from "@/hooks/auth/useLogin";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import GoogleLogin from "@/components/GoogleLogin";

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as Easing,
    },
  }),
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { slug } = useParams();
  const { mutate, isPending: loading } = useLogin();
  const router = useRouter();

  const [data, setData] = useState<LoginInput>({
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(data, {
      onSuccess: () => {
        toast.success("Welcome back! 👋");
        router.push(`/organization/${slug}/dashboard`);
      },
      onError: (err: Error) => {
        toast.error(err.message || "Invalid credentials. Please try again.");
      },
    });
    setData({ email: "", password: "" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
      {/* Radial glow — center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(20, 184, 166, 0.18) 0%, transparent 70%)",
        }}
      />
      {/* Secondary glow — bottom left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 50% 40% at 10% 90%, rgba(6, 182, 212, 0.1) 0%, transparent 70%)",
        }}
      />
      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-120 mx-4"
      >
        {/* Card glow */}
        <div className="absolute -inset-px rounded-[28px] bg-linear-to-br from-indigo-500/30 via-transparent to-sky-500/20 blur-sm" />

        <div className="relative bg-[#111118]/90 backdrop-blur-xl rounded-[26px] border border-white/[0.07] shadow-2xl overflow-hidden">
          {/* Top shimmer line */}
          <div className="absolute top-0 left-[10%] right-[10%] h-px bg-linear-to-r from-transparent via-indigo-400/60 to-transparent" />

          <div className="px-8 pt-10 pb-9">
            {/* Header */}
            <motion.div
              custom={0}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-8 text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 mb-5">
                <Sparkles className="w-5 h-5 text-indigo-400" />
              </div>
              <h1
                className="text-[1.75rem] font-bold text-white tracking-tight leading-tight"
                style={{ fontFamily: "'Sora', 'DM Sans', sans-serif" }}
              >
                Login your account
              </h1>
              <p className="mt-2 text-sm text-white/40">
                Join thousands of teams shipping faster
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
                initial="hidden"
                animate="visible"
              >
                {/* Email */}
                <motion.div custom={2} variants={fadeUp} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                        focused === "email"
                          ? "text-indigo-400"
                          : "text-white/20"
                      }`}
                    />
                    <Input
                      className="h-12 pl-10 bg-white/4 border border-white/8 text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/40 transition-all duration-200"
                      type="email"
                      name="email"
                      value={data.email}
                      onChange={handleChange}
                      placeholder="alex@company.com"
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                </motion.div>

                {/* Password */}
                <motion.div custom={3} variants={fadeUp} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${
                        focused === "password"
                          ? "text-indigo-400"
                          : "text-white/20"
                      }`}
                    />
                    <Input
                      className="h-12 pl-10 pr-11 bg-white/4 border border-white/8 text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/40 transition-all duration-200"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      onFocus={() => setFocused("password")}
                      onBlur={() => setFocused(null)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/60 transition-colors duration-200"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Submit */}
                <motion.div custom={4} variants={fadeUp} className="mt-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 bg-teal-500 hover:bg-teal-400 text-black font-semibold tracking-wide transition-all duration-200 disabled:bg-white/5 disabled:text-white/20 disabled:border disabled:border-white/10 group"
                  >
                    <AnimatePresence mode="wait">
                      {loading ? (
                        <motion.span
                          key="loading"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          <svg
                            className="animate-spin w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            />
                          </svg>
                          Logging in…
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Login
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-200" />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </Button>
                </motion.div>

                {/* Divider */}
                <motion.div
                  custom={5}
                  variants={fadeUp}
                  className="flex items-center gap-3 my-1"
                >
                  <div className="flex-1 h-px bg-white/6" />
                  <span className="text-xs text-white/20 font-medium">or</span>
                  <div className="flex-1 h-px bg-white/6" />
                </motion.div>

                {/* Google SSO */}
                <GoogleLogin />
              </motion.form>
            </AnimatePresence>

            {/* Sign up link */}
            <motion.p
              custom={7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-7 text-center text-xs text-white/30"
            >
              Don't have an account?{" "}
              <Link
                href="/signup"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign up
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
