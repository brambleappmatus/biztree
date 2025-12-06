"use client";

import { useState, useEffect } from "react";
import { Check, AlertCircle, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

interface StepBasicInfoProps {
    formData: {
        language: string;
        name: string;
        subdomain: string;
    };
    onChange: (data: any) => void;
    onSubdomainChange: (subdomain: string) => void;
    subdomainChecking: boolean;
    subdomainAvailable: boolean | null;
    translations: any;
}

export function StepBasicInfo({
    formData,
    onChange,
    onSubdomainChange,
    subdomainChecking,
    subdomainAvailable,
    translations: t
}: StepBasicInfoProps) {
    const [isEditingSubdomain, setIsEditingSubdomain] = useState(false);
    const [customSubdomain, setCustomSubdomain] = useState(formData.subdomain);

    // Auto-generate subdomain from business name
    useEffect(() => {
        if (!isEditingSubdomain && formData.name && !formData.subdomain) {
            const generated = formData.name
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, '')
                .replace(/\s+/g, '-')
                .replace(/-+/g, '-')
                .substring(0, 30);

            if (generated) {
                onSubdomainChange(generated);
                setCustomSubdomain(generated);
            }
        }
    }, [formData.name, isEditingSubdomain]);

    const handleSubdomainEdit = (value: string) => {
        setCustomSubdomain(value);
        onSubdomainChange(value);
    };

    const getSubdomainStatus = () => {
        if (!customSubdomain || customSubdomain.length < 3) return null;
        if (customSubdomain === 'www') return 'invalid';
        if (subdomainChecking) return 'checking';
        if (subdomainAvailable === true) return 'available';
        if (subdomainAvailable === false) return 'taken';
        return null;
    };

    const status = getSubdomainStatus();

    // Translations
    const texts = {
        title: formData.language === 'sk' ? 'Vytvorte si profil ✨' : 'Create your profile ✨',
        subtitle: formData.language === 'sk'
            ? 'Nerobte si starosti, všetko môžete upraviť neskôr'
            : "Don't worry, you can customize everything later",
        businessName: formData.language === 'sk' ? 'Názov vašej firmy' : 'Your Business Name',
        placeholder: formData.language === 'sk' ? 'Moja Kaviareň' : 'My Coffee Shop',
        yourLink: formData.language === 'sk' ? 'Váš odkaz' : 'Your link',
        edit: formData.language === 'sk' ? 'Upraviť' : 'Edit',
        done: formData.language === 'sk' ? 'Hotovo' : 'Done',
        taken: formData.language === 'sk' ? 'Tento odkaz je už obsadený' : 'This link is already taken',
        tryThese: formData.language === 'sk' ? 'Skúste' : 'Try',
        chooseDifferent: formData.language === 'sk' ? 'Prosím zvoľte iný odkaz' : 'Please choose a different link',
        available: formData.language === 'sk' ? 'Perfektné! Tento odkaz je dostupný' : 'Perfect! This link is available',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 max-w-2xl mx-auto"
        >
            {/* Title - No SplitText animation to avoid input issues */}
            <div className="text-center space-y-3">
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100"
                >
                    {texts.title}
                </motion.h2>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-gray-600 dark:text-gray-400 text-sm"
                >
                    {texts.subtitle}
                </motion.p>
            </div>

            {/* Language Selection - Subtle */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="flex justify-center gap-2"
            >
                {['sk', 'en'].map((lang) => (
                    <button
                        key={lang}
                        onClick={() => onChange({ language: lang })}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${formData.language === lang
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                            }`}
                    >
                        {lang === 'sk' ? '🇸🇰 Slovenčina' : '🇬🇧 English'}
                    </button>
                ))}
            </motion.div>

            {/* Business Name Input - Large, Centered */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="space-y-3"
            >
                <label className="block text-center text-sm font-medium text-gray-700 dark:text-gray-300">
                    {texts.businessName}
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => onChange({ name: e.target.value })}
                    placeholder={texts.placeholder}
                    className="w-full text-center text-2xl md:text-3xl font-semibold px-6 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                    autoFocus
                />
            </motion.div>

            {/* Auto-generated Subdomain */}
            {formData.name && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1, duration: 0.3 }}
                    className="space-y-3"
                >
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Sparkles className="w-4 h-4" />
                        <span>{texts.yourLink}</span>
                    </div>

                    {!isEditingSubdomain ? (
                        <div className="flex items-center justify-center gap-3 group">
                            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
                                <span className="font-mono text-lg text-gray-900 dark:text-gray-100">
                                    {customSubdomain || 'your-business'}.biztree.bio
                                </span>
                                {status === 'available' && (
                                    <Check className="w-5 h-5 text-green-500" />
                                )}
                                {status === 'checking' && (
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                )}
                                {status === 'taken' && (
                                    <AlertCircle className="w-5 h-5 text-red-500" />
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditingSubdomain(true)}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                {texts.edit}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={customSubdomain}
                                    onChange={(e) => handleSubdomainEdit(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 transition-all outline-none"
                                    placeholder="your-business"
                                />
                                <span className="text-gray-500 dark:text-gray-400 font-mono">.biztree.bio</span>
                                {status === 'available' && (
                                    <Check className="w-5 h-5 text-green-500" />
                                )}
                                {status === 'checking' && (
                                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                )}
                            </div>
                            <button
                                onClick={() => setIsEditingSubdomain(false)}
                                className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                            >
                                {texts.done}
                            </button>
                        </div>
                    )}

                    {/* Helpful Status Messages */}
                    {status === 'taken' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl"
                        >
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-red-700 dark:text-red-400">
                                <p className="font-medium">{texts.taken}</p>
                                <p className="text-xs mt-1">{texts.tryThese}: {customSubdomain}-shop, {customSubdomain}-official, my-{customSubdomain}</p>
                            </div>
                        </motion.div>
                    )}

                    {status === 'invalid' && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl"
                        >
                            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-700 dark:text-amber-400">
                                {texts.chooseDifferent}
                            </p>
                        </motion.div>
                    )}

                    {status === 'available' && !isEditingSubdomain && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400"
                        >
                            <Check className="w-4 h-4" />
                            <span>{texts.available}</span>
                        </motion.div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
