import React from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n";
import { ArrowRight, Star, Sparkles, Calendar, Globe2, Zap } from "lucide-react";
import prisma from "@/lib/prisma";
import ShowcaseCarousel from "@/components/showcase-carousel";
import LandingNav from "@/components/landing-nav";

export default async function LandingPage() {
  // Fetch active showcases from database with layers
  const showcases = await prisma.showcase.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
    include: {
      layers: {
        orderBy: { order: "asc" },
      },
    },
  });

  const t = getTranslation("sk");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <LandingNav />

      {/* Hero Section - Linktree Inspired */}
      <section className="pt-24 sm:pt-32 pb-12 px-4">
        <div className="max-w-2xl mx-auto text-center">
          {/* Logo/Brand */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-xl mb-8 opacity-0 animate-fade-up">
            <img src="/logo.svg" alt="BizTree" className="w-12 h-12" />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6 opacity-0 animate-fade-up border border-blue-100" style={{ animationDelay: "0.1s" }}>
            <Star size={12} fill="currentColor" /> Nová verzia v1.0
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 text-gray-900 opacity-0 animate-fade-up leading-tight" style={{ animationDelay: "0.2s" }}>
            {t.landing.heroTitle}
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
            {t.landing.heroSubtitle}
          </p>

          {/* CTA Button - Full width on mobile */}
          <div className="opacity-0 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Link
              href="/register"
              className="inline-flex items-center justify-center w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-full text-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 gap-2"
            >
              {t.landing.ctaStart} <ArrowRight size={20} />
            </Link>
          </div>

          {/* Social Proof */}
          <p className="mt-6 text-sm text-gray-500 opacity-0 animate-fade-up" style={{ animationDelay: "0.5s" }}>
            ✨ Používajú nás stovky podnikateľov
          </p>
        </div>
      </section>

      {/* Features Section - Simple & Clean */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Všetko čo potrebujete</h2>
            <p className="text-gray-600 text-lg">Profesionálna stránka pre vaše podnikanie za pár minút</p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
                <Calendar className="text-blue-600" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Online rezervácie</h3>
              <p className="text-gray-600 text-sm">Zákazníci si môžu rezervovať termín priamo cez vašu stránku</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center mb-4">
                <Globe2 className="text-purple-600" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Vlastná doména</h3>
              <p className="text-gray-600 text-sm">Profesionálna adresa pre vašu firmu na webe</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-4">
                <Zap className="text-green-600" size={24} />
              </div>
              <h3 className="font-bold text-lg mb-2">Rýchle nastavenie</h3>
              <p className="text-gray-600 text-sm">Vytvorte si stránku za 5 minút bez technických znalostí</p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Showcase Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pozrite si ukážky</h2>
            <p className="text-gray-600 text-lg">Kliknutím na kartu zobrazíte demo profil</p>
          </div>

          {/* Tiltable Showcase Cards */}
          <ShowcaseCarousel showcases={showcases} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl p-12 shadow-2xl">
            <Sparkles className="mx-auto mb-6 text-blue-200" size={48} />
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Pripravení začať?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Vytvorte si profesionálnu stránku zadarmo za pár minút
            </p>
            <Link
              href="/register"
              className="inline-flex items-center justify-center w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-50 transition-all hover:shadow-xl hover:scale-105 active:scale-95 gap-2"
            >
              Vytvoriť stránku zadarmo <ArrowRight size={20} />
            </Link>
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
