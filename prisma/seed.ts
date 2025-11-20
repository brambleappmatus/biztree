import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    // Create a user
    const user = await prisma.user.upsert({
        where: { email: "admin@elektrikar.sk" },
        update: {},
        create: {
            email: "admin@elektrikar.sk",
            password: "hashed_password_here", // In real app, hash this
        },
    });

    // Create a profile
    const profile = await prisma.profile.upsert({
        where: { subdomain: "elektrikar" },
        update: {},
        create: {
            userId: user.id,
            subdomain: "elektrikar",
            name: "Ján Novák - Elektrikár",
            about: "Profesionálne elektroinštalačné práce v Bratislave a okolí. 15 rokov praxe.",
            phone: "+421 900 123 456",
            email: "jan@elektrikar.sk",
            theme: "blue",
            services: {
                create: [
                    {
                        name: "Oprava zásuvky",
                        price: 30,
                        duration: 30,
                    },
                    {
                        name: "Montáž svietidla",
                        price: 45,
                        duration: 60,
                    },
                    {
                        name: "Revízia elektroinštalácie",
                        price: 120,
                        duration: 120,
                    },
                ],
            },
            hours: {
                create: [
                    { dayOfWeek: 1, openTime: "08:00", closeTime: "17:00" }, // Monday
                    { dayOfWeek: 2, openTime: "08:00", closeTime: "17:00" },
                    { dayOfWeek: 3, openTime: "08:00", closeTime: "17:00" },
                    { dayOfWeek: 4, openTime: "08:00", closeTime: "17:00" },
                    { dayOfWeek: 5, openTime: "08:00", closeTime: "16:00" },
                ],
            },
        },
    });

    console.log({ user, profile });
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
