"use client";

import { MuiInput } from "@/components/ui/mui-input";
import { MuiTextArea } from "@/components/ui/mui-textarea";

interface StepContactInfoProps {
    formData: {
        about: string;
        phone: string;
        email: string;
    };
    onChange: (data: Partial<StepContactInfoProps['formData']>) => void;
    translations: {
        about: string;
        phone: string;
        email: string;
    };
}

export function StepContactInfo({ formData, onChange, translations: t }: StepContactInfoProps) {
    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Kontaktné informácie 📞
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                    Pomôžte zákazníkom sa s vami spojiť
                </p>
            </div>

            <MuiTextArea
                label={t.about}
                value={formData.about}
                onChange={(e) => onChange({ about: e.target.value })}
                rows={4}
                placeholder="Napíšte niečo o sebe alebo vašej firme..."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MuiInput
                    label={t.phone}
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => onChange({ phone: e.target.value })}
                    placeholder="+421 900 000 000"
                />

                <MuiInput
                    label={t.email}
                    type="email"
                    value={formData.email}
                    onChange={(e) => onChange({ email: e.target.value })}
                    placeholder="vas@email.sk"
                />
            </div>
        </div>
    );
}
