import React from "react";
import {
  Terminal,
  Users,
  BrainCircuit,
  Play,
  Sparkles,
  MessageSquare,
  Infinity,
} from "lucide-react";
import { Link } from "react-router-dom";

const theme = {
  bg: "#0a0a0a",
  primary: "#00c875",
  secondary: "#22d3ee",
  textMain: "#f4f4f5",
  textMuted: "#a1a1aa",
};

const features = [
  {
    icon: <BrainCircuit className="w-6 h-6" />,
    title: "Unbounded Stories",
    description:
      "No scripts. No rails. Every decision rewrites the world in real-time with true narrative freedom.",
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: "Living Personalities",
    description:
      "Characters with memory, emotions, and evolving relationships that feel genuinely alive.",
  },
  {
    icon: <Infinity className="w-6 h-6" />,
    title: "Endless Worlds",
    description:
      "Dynamic environments and systems that adapt to your choices and create unique stories every time.",
  },
];

export default function LandingPage() {
  return (
    <div
      style={{ backgroundColor: theme.bg, color: theme.textMain }}
      className="min-h-screen font-sans overflow-x-hidden selection:bg-[#00c875]/20 selection:text-[#00c875]"
    >
      {/* Background subtle glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#00c875]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#00c875]/[0.03] rounded-full blur-[100px]" />
      </div>

      {/* Navbar */}
      <header className="fixed top-0 left-0 w-full z-50 h-16 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#00c875] flex items-center justify-center">
              <span className="text-black font-black text-sm">L</span>
            </div>
            <span className="text-lg font-bold tracking-tight">Leviyra</span>
          </div>

          <Link to="/login">
            <button className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#00c875] text-black text-sm font-semibold hover:bg-[#00d27a] transition-all duration-200 shadow-lg shadow-[#00c875]/20">
              <Play size={14} className="fill-current" />
              Start Playing
            </button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#00c875]/10 border border-[#00c875]/20 mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00c875] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00c875]"></span>
          </span>
          <span className="text-sm font-medium text-[#00c875]">
            340M+ Interactions
          </span>
        </div>

        {/* Main Heading */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6">
          Your story. <span className="text-[#00c875]">Your rules.</span>
          <br />
          Infinite possibilities.
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Dive into living narratives where every choice matters. Talk to
          unforgettable characters, shape worlds, and create stories that only
          you can experience.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/login">
            <button className="flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#00c875] text-black text-base font-semibold hover:bg-[#00d27a] transition-all duration-200 shadow-xl shadow-[#00c875]/25 hover:shadow-[#00c875]/40 hover:-translate-y-0.5">
              <Play size={18} className="fill-current" />
              Begin Your Adventure
            </button>
          </Link>
          <Link to="/explore">
            <button className="flex items-center gap-2 px-8 py-4 rounded-full border border-white/15 text-white text-base font-medium hover:bg-white/5 transition-all duration-200">
              <Sparkles size={18} />
              Explore Characters
            </button>
          </Link>
        </div>
      </main>

      {/* Features */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pb-28">
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl bg-[#111] border border-white/5 hover:border-[#00c875]/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-12 h-12 rounded-xl bg-[#00c875]/10 flex items-center justify-center text-[#00c875] mb-5 group-hover:bg-[#00c875]/15 transition-colors">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
              <p className="text-zinc-400 text-[15px] leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 pb-24 text-center">
        <div className="rounded-3xl bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/5 p-12 sm:p-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to write your legend?
          </h2>
          <p className="text-zinc-400 text-lg mb-8 max-w-xl mx-auto">
            Join thousands of players already living infinite stories.
          </p>
          <Link to="/login">
            <button className="inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-[#00c875] text-black text-base font-semibold hover:bg-[#00d27a] transition-all duration-200 shadow-xl shadow-[#00c875]/20">
              <Play size={18} className="fill-current" />
              Start Playing Free
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 relative z-10">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00c875] flex items-center justify-center">
              <span className="text-black font-bold text-xs">L</span>
            </div>
            <span className="text-sm font-medium text-zinc-400">Leviyra</span>
          </div>
          <p className="text-sm text-zinc-500">
            © {new Date().getFullYear()} Leviyra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
