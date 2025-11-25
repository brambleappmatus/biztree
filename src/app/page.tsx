import React from "react";
import prisma from "@/lib/prisma";
import LandingNav from "@/components/landing-nav";
import LandingContent from "@/components/landing-content";

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

  // Fetch tiers for pricing section
  const tiers = await prisma.tier.findMany({
    include: {
      features: {
        include: {
          feature: true
        }
      }
    },
    orderBy: { price: 'asc' }
  });

  // Convert Decimal to number for client components
  const serializedTiers = tiers.map(tier => ({
    ...tier,
    price: tier.price ? Number(tier.price) : 0
  }));

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 overflow-hidden">
      {/* Navbar */}
      <LandingNav />

      {/* Animated background gradient with floating orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />
      </div>

      {/* Client-side content with language context */}
      <LandingContent showcases={showcases} serializedTiers={serializedTiers} />

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 text-center text-gray-400 text-sm bg-white">
        <p>&copy; 2024 BizTree. All rights reserved.</p>
      </footer>
    </div>
  );
}
