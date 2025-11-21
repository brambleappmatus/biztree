import React from "react";
import Link from "next/link";
import { getTranslation } from "@/lib/i18n";
import { ArrowRight, Star } from "lucide-react";
import prisma from "@/lib/prisma";
import ShowcaseCarousel from "@/components/showcase-carousel";
import LandingNav from "@/components/landing-nav";

export default async function LandingPage() {
  // Fetch active showcases from database
  const showcases = await prisma.showcase.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  const t = getTranslation("sk");

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      {/* Navbar */}
      <LandingNav />

      {/* Hero */}
      <section className="pt-32 pb-12 px-4 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6 opacity-0 animate-fade-up">
          <Star size={12} fill="currentColor" /> New v1.0
        </div>
        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-6 text-gray-900 opacity-0 animate-fade-up" style={{ animationDelay: "0.1s" }}>
          {t.landing.heroTitle}
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed opacity-0 animate-fade-up" style={{ animationDelay: "0.2s" }}>
          {t.landing.heroSubtitle}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 opacity-0 animate-fade-up" style={{ animationDelay: "0.3s" }}>
          <Link
            href="/register"
            className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center gap-2"
          >
            {t.landing.ctaStart} <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* Demo Carousel Section */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Pozrite si ukážky</h2>
            <p className="text-gray-500 text-lg">Kliknutím na telefón zobrazíte demo profil</p>
          </div>

          {/* Infinite Carousel */}
          <div className="relative">
            <ShowcaseCarousel showcases={showcases} />
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
