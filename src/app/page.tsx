"use client";

import React, { useState } from "react";
import Link from "next/link";
import { LANGUAGES, getTranslation, Language } from "@/lib/i18n";
import { Check, Globe, ArrowRight, Star, Shield, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const [lang, setLang] = useState<Language>("sk");
  const t = getTranslation(lang);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
              <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
            </div>
            BizTree
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm font-medium hover:bg-gray-100 px-3 py-2 rounded-full transition-colors">
                <Globe size={16} />
                <span className="uppercase">{lang}</span>
              </button>
              <div className="absolute right-0 top-full mt-2 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden hidden group-hover:block animate-fade-up">
                {LANGUAGES.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => setLang(l.code)}
                    className={cn(
                      "w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center justify-between",
                      lang === l.code && "bg-blue-50 text-blue-600 font-medium"
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span>{l.flag}</span> {l.name}
                    </span>
                    {lang === l.code && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <Link
              href="/login"
              className="hidden sm:block text-sm font-medium hover:text-blue-600 transition-colors"
            >
              {t.landing.login}
            </Link>
            <Link
              href="/register"
              className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition-all hover:scale-105 active:scale-95"
            >
              {t.landing.ctaStart}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6 animate-fade-up">
          <Star size={12} fill="currentColor" /> New v1.0
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 text-gray-900 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {t.landing.heroTitle}
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {t.landing.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/register"
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {t.landing.ctaStart} <ArrowRight size={20} />
          </Link>
          <a
            href="http://elektrikar.localhost:3001"
            target="_blank"
            className="w-full sm:w-auto bg-white text-gray-900 border border-gray-200 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            Live Demo
          </a>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Globe, title: "Subdomain", desc: "elektrikar.biztree.sk" },
              { icon: Zap, title: "Fast", desc: "Next.js 14 Speed" },
              { icon: Shield, title: "Secure", desc: "SSL & Data Privacy" },
            ].map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm">
        <p>&copy; 2024 BizTree. All rights reserved.</p>
      </footer>
    </div>
  );
}
