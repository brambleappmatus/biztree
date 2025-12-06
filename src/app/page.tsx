import React from "react";
import prisma from "@/lib/prisma";
import LandingNav from "@/components/landing-nav";
import LandingContent from "@/components/landing-content";
import LandingFooter from "@/components/landing-footer";
import { getStripePrices } from "@/lib/stripe";

// Use ISR (Incremental Static Regeneration) instead of force-dynamic
// Revalidate every 3600 seconds (1 hour)
export const revalidate = 3600;

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

  // Get all features for comparison
  const allFeatures = await prisma.feature.findMany({
    orderBy: { name: 'asc' }
  });

  // Fetch latest blog posts
  const blogPosts = await prisma.blogPost.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: 3
  });

  // Serialize data for client components
  const serializedShowcases = showcases.map(showcase => ({
    ...showcase,
    createdAt: showcase.createdAt.toISOString(),
    updatedAt: showcase.updatedAt.toISOString(),
    layers: showcase.layers.map(layer => ({
      ...layer,
      createdAt: layer.createdAt.toISOString(),
      updatedAt: layer.updatedAt.toISOString(),
    }))
  }));

  const serializedTiers = tiers.map(tier => ({
    ...tier,
    price: tier.price ? Number(tier.price) : 0,
    createdAt: tier.createdAt.toISOString(),
    updatedAt: tier.updatedAt.toISOString(),
    features: tier.features.map(tf => ({
      ...tf,
      // TierFeature doesn't have createdAt/updatedAt in schema but let's be safe if it did
      // It has relation fields which are fine.
      // But we need to verify if TierFeature has Date fields. Schema says no.
      // But it includes 'feature' which has Date fields.
      feature: {
        ...tf.feature,
        createdAt: tf.feature.createdAt.toISOString(),
        updatedAt: tf.feature.updatedAt.toISOString(),
      }
    }))
  }));

  const serializedFeatures = allFeatures.map(feature => ({
    ...feature,
    createdAt: feature.createdAt.toISOString(),
    updatedAt: feature.updatedAt.toISOString(),
  }));

  const serializedBlogPosts = blogPosts.map(post => ({
    ...post,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt ? post.publishedAt.toISOString() : null,
  }));

  // Define pricing structure for PricingSection
  const priceIds = {
    monthly: {
      'Business': process.env.STRIPE_BUSINESS_PRICE_ID || '',
      'Pro': process.env.STRIPE_PRO_PRICE_ID || '',
    },
    yearly: {
      'Business': process.env.STRIPE_BUSINESS_YEARLY_PRICE_ID || '',
      'Pro': process.env.STRIPE_PRO_YEARLY_PRICE_ID || '',
    },
    lifetime: {
      'Business': process.env.STRIPE_BUSINESS_LIFETIME_PRICE_ID || '',
      'Pro': process.env.STRIPE_PRO_LIFETIME_PRICE_ID || '',
    }
  };

  // Fetch prices from Stripe
  const allPriceIds = [
    priceIds.monthly['Business'],
    priceIds.monthly['Pro'],
    priceIds.yearly['Business'],
    priceIds.yearly['Pro'],
    priceIds.lifetime['Business'],
    priceIds.lifetime['Pro'],
  ].filter(Boolean);

  const stripePrices = await getStripePrices(allPriceIds);

  const getPriceAmount = (id: string, fallback: number) => {
    const price = stripePrices.find(p => p.id === id);
    return price && price.unit_amount ? price.unit_amount / 100 : fallback;
  };

  const monthlyPrices = {
    'Free': 0,
    'Business': getPriceAmount(priceIds.monthly['Business'], 3.90),
    'Pro': getPriceAmount(priceIds.monthly['Pro'], 8.90),
  };

  const prices = {
    monthly: monthlyPrices,
    yearly: {
      'Free': 0,
      'Business': getPriceAmount(priceIds.yearly['Business'], 35.00),
      'Pro': getPriceAmount(priceIds.yearly['Pro'], 79.00),
    },
    lifetime: {
      'Free': 0,
      'Business': getPriceAmount(priceIds.lifetime['Business'], parseFloat(process.env.STRIPE_BUSINESS_LIFETIME_PRICE || '69')),
      'Pro': getPriceAmount(priceIds.lifetime['Pro'], parseFloat(process.env.STRIPE_PRO_LIFETIME_PRICE || '119')),
    }
  };

  // Check if lifetime deals are enabled from database
  const lifetimeSetting = await prisma.systemSettings.findUnique({
    where: { key: 'ENABLE_LIFETIME_DEALS' }
  });
  const enableLifetime = lifetimeSetting?.value === 'true';

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
      <LandingContent
        showcases={serializedShowcases}
        serializedTiers={serializedTiers}
        allFeatures={serializedFeatures}
        priceIds={priceIds}
        prices={prices}
        enableLifetime={enableLifetime}
        blogPosts={serializedBlogPosts}
      />

      {/* Footer */}
      <LandingFooter />
    </div>
  );
}
