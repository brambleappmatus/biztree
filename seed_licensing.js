const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding tiers and features...');

    // 1. Create Features
    const features = [
        { key: 'page_dashboard', name: 'Dashboard Access', description: 'Access to the main dashboard with statistics' },
        { key: 'page_services', name: 'Services Management', description: 'Ability to manage services' },
        { key: 'page_bookings', name: 'Bookings Management', description: 'Ability to manage bookings' },
        { key: 'page_seo', name: 'SEO Settings', description: 'Access to SEO configuration' },
        { key: 'component_gallery', name: 'Gallery Component', description: 'Ability to use the gallery component' },
        { key: 'component_documents', name: 'Dokumenty', description: 'Nahrávanie a zobrazovanie dokumentov na profile' },
        { key: 'component_contact', name: 'Contact Component', description: 'Ability to display contact information' },
        { key: 'component_business_card', name: 'Business Card', description: 'Ability to enable business card downloads' },
        { key: 'component_custom_links', name: 'Custom Links', description: 'Ability to add custom links' },
        { key: 'component_social_links', name: 'Social Links', description: 'Ability to add social media links' },
        { key: 'component_hours', name: 'Opening Hours', description: 'Ability to set opening hours' },
        { key: 'component_map', name: 'Google Maps Integration', description: 'Ability to embed Google Maps on profile' },
        { key: 'component_background_images', name: 'Background Images (Unsplash)', description: 'Access to Unsplash background images' },
        { key: 'component_background_upload', name: 'Custom Background Upload', description: 'Ability to upload custom background images' },
        { key: 'disable_branding', name: 'Disable Branding', description: 'Remove "Powered by BizTree" branding' },
    ];

    for (const f of features) {
        await prisma.feature.upsert({
            where: { key: f.key },
            update: {},
            create: f,
        });
    }
    console.log('Features seeded.');

    // 2. Create Tiers
    const tiers = [
        { name: 'Free', price: 0 },
        { name: 'Business', price: 3.9 },
        { name: 'Pro', price: 8.9 },
    ];

    for (const t of tiers) {
        await prisma.tier.upsert({
            where: { name: t.name },
            update: { price: t.price },
            create: t,
        });
    }
    console.log('Tiers seeded.');

    // 3. Assign Features to Tiers (Default configuration)
    const freeTier = await prisma.tier.findUnique({ where: { name: 'Free' } });
    const businessTier = await prisma.tier.findUnique({ where: { name: 'Business' } });
    const proTier = await prisma.tier.findUnique({ where: { name: 'Pro' } });

    const allFeatures = await prisma.feature.findMany();

    // Free: Only Dashboard (example)
    // Business: Dashboard, Services, Bookings
    // Pro: All

    if (freeTier) {
        // Free gets nothing or just basic profile (which isn't a feature key here yet)
        // Let's say Free gets Dashboard
        const dashboard = allFeatures.find(f => f.key === 'page_dashboard');
        if (dashboard) {
            await prisma.tierFeature.upsert({
                where: {
                    tierId_featureId: { tierId: freeTier.id, featureId: dashboard.id }
                },
                update: {},
                create: { tierId: freeTier.id, featureId: dashboard.id }
            });
        }
    }

    if (businessTier) {
        const businessFeatures = allFeatures.filter(f => ['page_dashboard', 'page_services', 'page_bookings'].includes(f.key));
        for (const f of businessFeatures) {
            await prisma.tierFeature.upsert({
                where: {
                    tierId_featureId: { tierId: businessTier.id, featureId: f.id }
                },
                update: {},
                create: { tierId: businessTier.id, featureId: f.id }
            });
        }
    }

    if (proTier) {
        for (const f of allFeatures) {
            await prisma.tierFeature.upsert({
                where: {
                    tierId_featureId: { tierId: proTier.id, featureId: f.id }
                },
                update: {},
                create: { tierId: proTier.id, featureId: f.id }
            });
        }
    }

    console.log('Tier features assigned.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
