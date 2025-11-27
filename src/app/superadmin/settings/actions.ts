"use server";

import fs from 'fs/promises';
import path from 'path';

export async function toggleLifetimeDeals(enabled: boolean) {
    try {
        const envPath = path.join(process.cwd(), '.env');
        let envContent = await fs.readFile(envPath, 'utf-8');

        // Check if ENABLE_LIFETIME_DEALS exists
        if (envContent.includes('ENABLE_LIFETIME_DEALS=')) {
            // Replace existing value
            envContent = envContent.replace(
                /ENABLE_LIFETIME_DEALS=(true|false)/,
                `ENABLE_LIFETIME_DEALS=${enabled}`
            );
        } else {
            // Add new line
            envContent += `\nENABLE_LIFETIME_DEALS=${enabled}\n`;
        }

        await fs.writeFile(envPath, envContent, 'utf-8');

        return { success: true };
    } catch (error: any) {
        console.error('Error toggling lifetime deals:', error);
        throw new Error(error.message || 'Failed to update settings');
    }
}

export async function getLifetimeDealsStatus() {
    return process.env.ENABLE_LIFETIME_DEALS === 'true';
}
