"use client";

import { useState, useEffect, useRef } from "react";
import { Check, AlertCircle, Loader2, Sparkles, Globe, ArrowRight, Pencil } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [localSubdomain, setLocalSubdomain] = useState(formData.subdomain);
    const [isTyping, setIsTyping] = useState(false);
    const [showInput, setShowInput] = useState(!!formData.subdomain);
    const firstRender = useRef(true);

    // Update local state if prop changes (e.g. going back/forward)
    useEffect(() => {
        if (formData.subdomain && !showInput) {
            setShowInput(true);
            setLocalSubdomain(formData.subdomain);
        }
    }, [formData.subdomain]);

    // Debounce subdomain changes
    useEffect(() => {
        // Skip calling onChange on first render to avoid double triggers
        if (firstRender.current) {
            firstRender.current = false;
            return;
        }

        if (!showInput) return;

        setIsTyping(true);
        const timer = setTimeout(() => {
            onSubdomainChange(localSubdomain);
            setIsTyping(false);
        }, 1000); // 1 second debounce

        return () => clearTimeout(timer);
    }, [localSubdomain, showInput]);

    const handleCreateLink = () => {
        if (!formData.name) return;

        const generated = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .substring(0, 30);

        setLocalSubdomain(generated);
        setShowInput(true);
        // Trigger immediate check safely through the effect by setting local state
    };

    const handleSubdomainChange = (value: string) => {
        // Allow only valid characters
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, '');
        setLocalSubdomain(sanitized);
    };

    const getSubdomainStatus = () => {
        if (!localSubdomain || localSubdomain.length < 3) return null;
        if (localSubdomain === 'www') return 'invalid';
        if (isTyping || subdomainChecking) return 'checking';
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
        createLink: formData.language === 'sk' ? 'Vytvoriť môj odkaz' : 'Create my link',
        taken: formData.language === 'sk' ? 'Tento odkaz je už obsadený' : 'This link is already taken',
        tryThese: formData.language === 'sk' ? 'Skúste' : 'Try',
        chooseDifferent: formData.language === 'sk' ? 'Prosím zvoľte iný odkaz' : 'Please choose a different link',
        available: formData.language === 'sk' ? 'Perfektné! Tento odkaz je dostupný' : 'Perfect! This link is available',
        checking: formData.language === 'sk' ? 'Overujem...' : 'Checking...',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="space-y-8 max-w-2xl mx-auto"
        >
            {/* Title */}
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

            {/* Language Selection */}
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

            {/* Business Name Input */}
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

            {/* Create Link Button */}
            <AnimatePresence>
                {formData.name && !showInput && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="flex justify-center"
                    >
                        <button
                            onClick={handleCreateLink}
                            className="group flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/30 transition-all hover:scale-105"
                        >
                            <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                            {texts.createLink}
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Subdomain Input */}
            <AnimatePresence>
                {showInput && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3"
                    >
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Sparkles className="w-4 h-4" />
                            <span>{texts.yourLink}</span>
                        </div>

                        <div className="relative group max-w-lg mx-auto">
                            <div className={`
                                flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-xl border transition-all duration-300
                                ${status === 'available' ? 'border-green-500/30 bg-green-50/5' : ''}
                                ${status === 'taken' ? 'border-red-500/30 bg-red-50/5' : ''}
                                ${status === 'checking' ? 'border-blue-500/30' : ''}
                                ${!status ? 'border-gray-200 dark:border-gray-700 hover:border-blue-300/50 dark:hover:border-blue-700/50' : ''}
                                focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10
                            `}>
                                <div className="pl-4 text-gray-400 flex items-center gap-2">
                                    <Globe size={18} />
                                    <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700 mx-1" />
                                    <Pencil size={14} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    value={localSubdomain}
                                    onChange={(e) => handleSubdomainChange(e.target.value)}
                                    className="flex-1 px-3 py-4 bg-transparent text-gray-900 dark:text-gray-100 font-mono text-lg outline-none text-right placeholder-gray-400"
                                    placeholder="your-business"
                                />
                                <div className="pr-4 py-4 text-lg font-mono text-gray-500 dark:text-gray-400 select-none bg-transparent">
                                    .biztree.bio
                                </div>
                                <div className="pr-4 min-w-[40px] flex justify-end">
                                    {status === 'available' && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Check className="w-5 h-5 text-green-500" />
                                        </motion.div>
                                    )}
                                    {status === 'checking' && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                                        </motion.div>
                                    )}
                                    {status === 'taken' && (
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                            <AlertCircle className="w-5 h-5 text-red-500" />
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Status Messages */}
                            <div className="h-6 mt-2">
                                <AnimatePresence mode="wait">
                                    {status === 'taken' && (
                                        <motion.p
                                            key="taken"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="text-center text-sm text-red-500 font-medium"
                                        >
                                            {texts.taken}
                                        </motion.p>
                                    )}
                                    {status === 'checking' && (
                                        <motion.p
                                            key="checking"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="text-center text-sm text-blue-500 font-medium"
                                        >
                                            {texts.checking}
                                        </motion.p>
                                    )}
                                    {status === 'available' && (
                                        <motion.p
                                            key="available"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="text-center text-sm text-green-500 font-medium"
                                        >
                                            {texts.available}
                                        </motion.p>
                                    )}
                                    {status === 'invalid' && (
                                        <motion.p
                                            key="invalid"
                                            initial={{ opacity: 0, y: -5 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 5 }}
                                            className="text-center text-sm text-amber-500 font-medium"
                                        >
                                            {texts.chooseDifferent}
                                        </motion.p>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
