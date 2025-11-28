import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixTrialData() {
    // Fix specific user (buritco)
    const user = await prisma.user.findUnique({
        where: { email: 'buritco@gmail.com' },
        include: { profiles: true }
    })

    if (user && user.profiles && user.profiles.length > 0) {
        const profile = user.profiles[0]

        if (!profile.trialEndsAt) {
            console.log(`Fixing trial data for ${user.email}`)

            // Set trialEndsAt to a past date to indicate they've used their trial
            await prisma.profile.update({
                where: { id: profile.id },
                data: {
                    trialEndsAt: new Date('2025-11-27T00:00:00Z')
                }
            })

            console.log(`✅ Fixed trial data for ${user.email}`)
        } else {
            console.log(`User ${user.email} already has trialEndsAt set: ${profile.trialEndsAt}`)
        }
    } else {
        console.log(`User not found or has no profile`)
    }

    // Optionally: Fix all users who had trials but trialEndsAt is null
    const subscriptionHistory = await prisma.subscriptionHistory.findMany({
        where: {
            notes: {
                contains: 'trial'
            }
        },
        include: {
            profile: true
        },
        distinct: ['profileId']
    })

    console.log(`\nFound ${subscriptionHistory.length} profiles with trial history`)

    for (const history of subscriptionHistory) {
        if (!history.profile.trialEndsAt) {
            console.log(`Fixing profile ${history.profileId}`)
            await prisma.profile.update({
                where: { id: history.profileId },
                data: {
                    trialEndsAt: history.createdAt
                }
            })
            console.log(`✅ Fixed profile ${history.profileId}`)
        }
    }

    console.log('\n✅ All trial data fixed!')
}

fixTrialData()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
