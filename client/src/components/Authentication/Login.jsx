import React, { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { auth } from "../../firebase.js";
import { useAuth } from "../../context/Authcontext.jsx";
import { toast } from "sonner";
import { Eye, EyeOff, Play } from "lucide-react";

const LoginPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  const handleChange = (e) =>
    setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userCred = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );

      if (!userCred.user.emailVerified) {
        await auth.signOut();
        toast.error("Please verify your email before logging in.");
        setLoading(false);
        return;
      }
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account found with this email."
          : err.code === "auth/wrong-password"
            ? "Incorrect password. Try again."
            : err.code === "auth/invalid-email"
              ? "Invalid email address."
              : err.code === "auth/too-many-requests"
                ? "Too many attempts. Try again later."
                : "Invalid email or password.";
      toast.error(msg);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      toast.error("Google login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#0a0a0a] text-white">
      {/* ── Left Panel ── */}
      <div className="hidden lg:flex w-[48%] relative overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0c1510] via-[#0a0a0a] to-[#0a0a0a]" />

        {/* Soft green glow */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#00c875]/[0.07] rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-[300px] h-[300px] bg-[#00c875]/[0.05] rounded-full blur-[80px]" />

        {/* Decorative grid (very subtle) */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,200,117,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,200,117,0.3) 1px, transparent 1px)
            `,
            backgroundSize: "60px 60px",
          }}
        />

        {/* Floating orbs */}
        <div className="absolute top-32 left-20 w-3 h-3 rounded-full bg-[#00c875]/40 blur-[1px]" />
        <div className="absolute top-48 left-40 w-2 h-2 rounded-full bg-[#00c875]/30" />
        <div className="absolute bottom-40 left-32 w-4 h-4 rounded-full bg-[#00c875]/20 blur-[2px]" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-end p-14 pb-20 h-full">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 w-fit mb-8 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-[#00c875] animate-pulse" />
            <span className="text-xs font-medium text-zinc-300 tracking-wide">
              LIVE UNIVERSE
            </span>
          </div>

          <h2 className="text-4xl xl:text-5xl font-bold leading-[1.15] mb-5">
            Welcome back.
            <br />
            <span className="text-[#00c875]">Your story awaits.</span>
          </h2>

          <p className="text-zinc-400 text-base max-w-sm leading-relaxed">
            Sign in to continue your adventures and pick up right where you left
            off.
          </p>
        </div>
      </div>

      {/* ── Right Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-[#00c875]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-[380px] relative z-10">
          {/* Header */}
          <div className="mb-10">
            <div className="w-11 h-11 rounded-xl bg-[#00c875]/15 border border-[#00c875]/25 flex items-center justify-center mb-6">
              <span className="text-[#00c875] font-bold text-lg">L</span>
            </div>
            <h1 className="text-2xl font-bold mb-1.5">Welcome back</h1>
            <p className="text-zinc-400 text-sm">
              Sign in to continue your adventure
            </p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-6"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-medium">Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-zinc-500 font-medium tracking-widest">
              OR
            </span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#00c875]/50 focus:ring-1 focus:ring-[#00c875]/30 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-zinc-500 hover:text-[#00c875] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-[#00c875]/50 focus:ring-1 focus:ring-[#00c875]/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((p) => !p)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#00c875] text-black font-semibold text-sm hover:bg-[#00d27a] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-[#00c875]/20"
            >
              {loading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <Play size={15} className="fill-current" />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-zinc-500">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-[#00c875] font-medium hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
