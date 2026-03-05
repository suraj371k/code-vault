"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import React, { useState } from "react";
import { motion, AnimatePresence, Variants, Easing } from "framer-motion";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { SignupInput, useSignup } from "@/hooks/auth/useSignup";

const fadeUp: Variants = {
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

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);
  const { mutate, isPending: loading, isError } = useSignup();

  const [data, setData] = useState<SignupInput>({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate(data);
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#0a0a0f]">
      {/* Ambient blobs */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 50% at 20% 30%, rgba(99,102,241,0.18) 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 70%, rgba(14,165,233,0.15) 0%, transparent 70%)",
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
                Create your account
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
                {/* Name */}
                <motion.div custom={1} variants={fadeUp} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === "name" ? "text-indigo-400" : "text-white/20"}`}
                    />
                    <Input
                      className="h-12 pl-10 bg-white/4 border border-white/8 text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/40 transition-all duration-200"
                      type="text"
                      name="name"
                      value={data.name}
                      onChange={handleChange}
                      placeholder="Alex Johnson"
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused(null)}
                    />
                  </div>
                </motion.div>

                {/* Email */}
                <motion.div custom={2} variants={fadeUp} className="space-y-2">
                  <Label className="text-xs font-semibold uppercase tracking-widest text-white/40">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === "email" ? "text-indigo-400" : "text-white/20"}`}
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
                      className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 ${focused === "password" ? "text-indigo-400" : "text-white/20"}`}
                    />
                    <Input
                      className="h-12 pl-10 pr-11 bg-white/[0.04] border border-white/[0.08] text-white placeholder:text-white/20 text-sm rounded-xl focus-visible:ring-1 focus-visible:ring-indigo-500/50 focus-visible:border-indigo-500/40 transition-all duration-200"
                      name="password"
                      value={data.password}
                      onChange={handleChange}
                      type={showPassword ? "text" : "password"}
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

                {/* CTA */}
                <motion.div custom={4} variants={fadeUp} className="mt-1">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white border-0 transition-all duration-200 relative overflow-hidden group"
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
                          Creating account…
                        </motion.span>
                      ) : (
                        <motion.span
                          key="idle"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="flex items-center gap-2"
                        >
                          Get started
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
                <motion.div custom={6} variants={fadeUp}>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 rounded-xl bg-white/3 border border-white/8 text-white/60 hover:bg-white/[0.07] hover:text-white text-sm font-medium transition-all duration-200 gap-2.5"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Continue with Google
                  </Button>
                </motion.div>
              </motion.form>
            </AnimatePresence>

            {/* Sign in link */}

            <motion.p
              custom={7}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mt-7 text-center text-xs text-white/30"
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Sign in
              </Link>
            </motion.p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
