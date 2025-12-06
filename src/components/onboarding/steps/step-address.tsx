"use client";

import { MuiInput } from "@/components/ui/mui-input";

interface StepAddressProps {
    formData: {
        address: string;
    };
    onChange: (data: Partial<StepAddressProps['formData']>) => void;
    translations: {
        addressOptional: string;
        addressPlaceholder: string;
    };
}

export function StepAddress({ formData, onChange, translations: t }: StepAddressProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Adresa 📍
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Kde vás zákazníci môžu nájsť? (voliteľné)
                </p>
            </div>

            <MuiInput
                label={t.addressOptional}
                value={formData.address}
                onChange={(e) => onChange({ address: e.target.value })}
                placeholder={t.addressPlaceholder}
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                    💡 <strong>Tip:</strong> Ak zadáte adresu, zákazníci ju uvidia na vašom profile a budú môcť ľahko nájsť vašu prevádzku.
                </p>
            </div>
        </div>
    );
}
