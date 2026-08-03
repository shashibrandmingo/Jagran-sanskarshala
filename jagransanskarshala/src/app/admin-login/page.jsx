"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaShieldHalved,
  FaArrowLeft,
} from "react-icons/fa6";
import Logo from "@/assets/images/Logo-english.png";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if already logged in
  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    if (adminToken) {
      router.push("/admin/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      // Connect to Express Backend
      const res = await fetch(`${BACKEND_URL}/api/v1/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess("Login successful! Redirecting to Dashboard...");
        localStorage.setItem("adminToken", data.token);
        localStorage.setItem("adminData", JSON.stringify(data.admin));

        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 1000);
      } else {
        setError(data.message || "Invalid email or password.");
      }
    } catch (err) {
      console.error("Login fetch error:", err);
      setError(
        "Unable to connect to backend server. Please check if backend server is running on http://localhost:8000",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-[#feefe0] via-[#fdf2e7] to-[#f9e5d4] p-4 relative overflow-hidden">
      {/* Background Decorative Blur Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl border border-red-100/60 p-8 sm:p-10 transition-all">
        {/* Back to Home Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-gray-500 hover:text-[var(--primary)] mb-6 transition-colors"
        >
          <FaArrowLeft className="text-xs" />
          <span>Back to Main Website</span>
        </Link>

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="mb-4">
            <Image
              src={Logo}
              alt="Jagran Sanskarshala Logo"
              width={180}
              height={60}
              className="h-14 w-auto object-contain"
              priority
            />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-[var(--primary)] text-xs font-black uppercase tracking-wider mb-2 border border-red-100">
            <FaShieldHalved className="text-xs" />
            <span>Admin Portal</span>
          </div>

          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Admin Sign In
          </h1>
          <p className="text-xs text-gray-500 font-medium mt-1">
            Access Jagran Sanskarshala Control Center
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-bold animate-fadeIn flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3.5 rounded-2xl bg-green-50 border border-green-200 text-green-700 text-xs font-bold animate-fadeIn flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-600 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaEnvelope className="text-sm" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jagransanskarshala2026@gmail.com"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                <FaLock className="text-sm" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-sm font-semibold text-gray-800 focus:outline-none focus:border-[var(--primary)] focus:bg-white transition-all shadow-2xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <FaEyeSlash className="text-sm" />
                ) : (
                  <FaEye className="text-sm" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-6 rounded-2xl bg-[var(--primary)] hover:bg-red-700 active:scale-[0.99] text-white font-extrabold text-sm tracking-wide shadow-lg shadow-red-900/20 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
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
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="mt-8 text-center text-xs text-gray-400 font-medium">
          Protected Area • Jagran Sanskarshala Admin System
        </div>
      </div>
    </div>
  );
}
