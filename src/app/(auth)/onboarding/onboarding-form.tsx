"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiTextArea } from "@/components/ui/mui-textarea";
import { MuiButton } from "@/components/ui/mui-button";
import { checkSubdomainAvailability, createProfileFromOnboarding } from "../actions";
import { Check, Sparkles, Globe } from "lucide-react";
import { cn } from "@/lib/utils";
import { Language } from "@/lib/i18n";
import ContactButtonsBlock from "@/components/blocks/contact-buttons-block";
import HoursBlock from "@/components/blocks/hours-block";
import SocialLinksBlock from "@/components/blocks/social-links-block";
import LocationBlock from "@/components/blocks/location-block";

const THEMES = [
    { id: "blue", name: "Blue", color: "#007AFF" },
    { id: "emerald", name: "Emerald", color: "#34C759" },
    { id: "coral", name: "Coral", color: "#FF2D55" },
    { id: "amber", name: "Amber", color: "#FF9500" },
    { id: "lavender", name: "Lavender", color: "#AF52DE" },
    { id: "graphite", name: "Graphite", color: "#8E8E93" },
];

const BACKGROUNDS = [
    { id: "black", name: "Black", gradient: "linear-gradient(to bottom, #000000, #1a1a1a)" },
    { id: "dark", name: "Dark Gray", gradient: "linear-gradient(to bottom, #1a1a1a, #2d2d2d)" },
    { id: "blue-purple", name: "Blue Purple", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { id: "pink-orange", name: "Pink Orange", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { id: "green-blue", name: "Green Blue", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
    { id: "sunset", name: "Sunset", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
    { id: "ocean", name: "Ocean", gradient: "linear-gradient(135deg, #2e3192 0%, #1bffff 100%)" },
    { id: "forest", name: "Forest", gradient: "linear-gradient(135deg, #0ba360 0%, #3cba92 100%)" },
];

export default function OnboardingForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [subdomainChecking, setSubdomainChecking] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);

    const [formData, setFormData] = useState({
        subdomain: "",
        name: "",
        about: "",
        phone: "",
        email: "",
        language: "sk" as Language,
        theme: "blue",
        bgType: "gradient" as "gradient" | "unsplash",
        bgImage: "black",
        address: "",
        hours: [
            { day: 1, isOpen: true, openTime: "09:00", closeTime: "17:00" }, // Monday
            { day: 2, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 3, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 4, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 5, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 6, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Saturday
            { day: 0, isOpen: false, openTime: "09:00", closeTime: "17:00" }, // Sunday
        ],
        socialLinks: {
            instagram: "",
            facebook: "",
            tiktok: "",
            linkedin: "",
            twitter: "",
            youtube: ""
        }
    });

    const checkSubdomain = async (subdomain: string) => {
        if (!subdomain || subdomain.length < 3) {
            setSubdomainAvailable(null);
            return;
        }

        setSubdomainChecking(true);
        const result = await checkSubdomainAvailability(subdomain);
        setSubdomainAvailable(result.available);
        setSubdomainChecking(false);
    };

    const handleSubdomainChange = (value: string) => {
        const sanitized = value.toLowerCase().replace(/[^a-z0-9-]/g, "");
        setFormData({ ...formData, subdomain: sanitized });

        if (sanitized === "www") {
            setSubdomainAvailable(false);
            return;
        }

        if (sanitized.length >= 3) {
            const timer = setTimeout(() => checkSubdomain(sanitized), 500);
            return () => clearTimeout(timer);
        } else {
            setSubdomainAvailable(null);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!session?.user?.id) {
            setError("Nie ste prihlásený");
            return;
        }

        if (!formData.subdomain || !formData.name || !subdomainAvailable) {
            setError("Vyplňte všetky povinné polia a vyberte dostupnú subdoménu");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Convert social links object to array
            const socialLinksArray = Object.entries(formData.socialLinks)
                .filter(([_, url]) => url && url.trim() !== '')
                .map(([platform, url]) => ({ platform, url }));

            console.log('Submitting onboarding data...');
            const result = await createProfileFromOnboarding(session.user.id, {
                ...formData,
                socialLinks: socialLinksArray
            });

            console.log('Onboarding result:', result);

            if (result.error) {
                console.error('Onboarding error:', result.error);
                setError(result.error);
                setLoading(false);
            } else {
                console.log('Onboarding successful, redirecting to admin...');
                // Redirect to admin - don't set loading to false, let the redirect happen
                window.location.href = '/admin';
            }
        } catch (err) {
            console.error('Onboarding exception:', err);
            setError("Nastala chyba pri vytváraní profilu");
            setLoading(false);
        }
    };

    const selectedTheme = THEMES.find(t => t.id === formData.theme);
    const selectedBg = BACKGROUNDS.find(b => b.id === formData.bgImage);

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            {/* Left Side - Form */}
            <div className="w-full lg:w-3/5 p-6 lg:p-12 overflow-y-auto">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                                <img src="/logo.svg" alt="BizTree Logo" className="w-full h-full object-cover" />
                            </div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">BizTree</h1>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                            Vytvorte si profil
                        </h2>
                        <p className="text-gray-600 dark:text-gray-400">
                            Vyplňte základné informácie a vytvorte si profesionálny online profil
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Basic Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Základné informácie
                            </h3>

                            {/* Language Selector */}
                            <div className="flex gap-2 mb-4">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: "sk" })}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all",
                                        formData.language === "sk"
                                            ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <span className="text-xl">🇸🇰</span>
                                    <span className="font-medium">Slovensky</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, language: "en" })}
                                    className={cn(
                                        "flex-1 py-2 px-4 rounded-lg border flex items-center justify-center gap-2 transition-all",
                                        formData.language === "en"
                                            ? "bg-blue-50 border-blue-500 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                                            : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                                    )}
                                >
                                    <span className="text-xl">🇺🇸</span>
                                    <span className="font-medium">English</span>
                                </button>
                            </div>

                            <MuiInput
                                label="Názov firmy / Meno *"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />

                            <div>
                                <MuiInput
                                    label="Subdoména (URL adresa) *"
                                    value={formData.subdomain}
                                    onChange={(e) => handleSubdomainChange(e.target.value)}
                                    required
                                />
                                {formData.subdomain && (
                                    <div className="mt-2 text-sm">
                                        {subdomainChecking ? (
                                            <span className="text-gray-500">Kontrolujem dostupnosť...</span>
                                        ) : subdomainAvailable === true ? (
                                            <span className="text-green-600 dark:text-green-400">
                                                ✓ {formData.subdomain}.biztree.bio je dostupná
                                            </span>
                                        ) : subdomainAvailable === false ? (
                                            <span className="text-red-600 dark:text-red-400">
                                                {formData.subdomain === "www" ? "✗ Subdoména nemôže byť 'www'" : "✗ Táto subdoména už existuje"}
                                            </span>
                                        ) : null}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Kontaktné informácie
                            </h3>

                            <MuiTextArea
                                label="O vás / firme"
                                value={formData.about}
                                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                                rows={3}
                            />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MuiInput
                                    label="Telefón"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                />

                                <MuiInput
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Vzhľad
                            </h3>

                            {/* Theme Selection */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Farebná téma</h4>
                                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                                    {THEMES.map((theme) => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, theme: theme.id })}
                                            className={cn(
                                                "p-3 rounded-lg border-2 transition-all flex flex-col items-center gap-2",
                                                formData.theme === theme.id
                                                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                    : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                            )}
                                        >
                                            <div
                                                className="w-8 h-8 rounded-full shadow-sm"
                                                style={{ backgroundColor: theme.color }}
                                            />
                                            <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                                                {theme.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Background Selection */}
                            <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Pozadie</h4>
                                <div className="flex overflow-x-auto gap-3 pb-2 snap-x scrollbar-hide -mx-2 px-2">
                                    {BACKGROUNDS.map((bg) => (
                                        <button
                                            key={bg.id}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, bgImage: bg.id })}
                                            className={cn(
                                                "h-24 w-32 flex-shrink-0 rounded-lg border-2 transition-all relative overflow-hidden snap-start",
                                                formData.bgImage === bg.id
                                                    ? "border-blue-500 ring-2 ring-blue-200"
                                                    : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                                            )}
                                        >
                                            <div
                                                className="w-full h-full"
                                                style={{
                                                    background: bg.gradient,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center"
                                                }}
                                            />
                                            {formData.bgImage === bg.id && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20">
                                                    <Check className="text-white" size={24} />
                                                </div>
                                            )}
                                            <span className="absolute bottom-1 left-1 text-[10px] font-medium text-white drop-shadow-md bg-black/20 px-1.5 py-0.5 rounded">
                                                {bg.name}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Address */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Adresa
                            </h3>
                            <MuiInput
                                label="Adresa (voliteľné)"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="napr. Hlavná 123, Bratislava"
                            />
                        </div>

                        {/* Social Media */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Sociálne siete
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Pridajte odkazy na vaše sociálne siete (voliteľné)
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MuiInput
                                    label="Instagram"
                                    value={formData.socialLinks.instagram}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                                    })}
                                    placeholder="https://instagram.com/..."
                                />
                                <MuiInput
                                    label="Facebook"
                                    value={formData.socialLinks.facebook}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, facebook: e.target.value }
                                    })}
                                    placeholder="https://facebook.com/..."
                                />
                                <MuiInput
                                    label="TikTok"
                                    value={formData.socialLinks.tiktok}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, tiktok: e.target.value }
                                    })}
                                    placeholder="https://tiktok.com/@..."
                                />
                                <MuiInput
                                    label="LinkedIn"
                                    value={formData.socialLinks.linkedin}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, linkedin: e.target.value }
                                    })}
                                    placeholder="https://linkedin.com/..."
                                />
                                <MuiInput
                                    label="Twitter / X"
                                    value={formData.socialLinks.twitter}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, twitter: e.target.value }
                                    })}
                                    placeholder="https://twitter.com/..."
                                />
                                <MuiInput
                                    label="YouTube"
                                    value={formData.socialLinks.youtube}
                                    onChange={(e) => setFormData({
                                        ...formData,
                                        socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                                    })}
                                    placeholder="https://youtube.com/..."
                                />
                            </div>
                        </div>

                        {/* Opening Hours */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Otváracie hodiny
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Nastavte otváracie hodiny (voliteľné)
                            </p>
                            <div className="space-y-3">
                                {["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"].map((dayName, index) => {
                                    const dayIndex = index === 6 ? 0 : index + 1; // Sunday is 0
                                    const dayData = formData.hours.find(h => h.day === dayIndex);
                                    if (!dayData) return null;

                                    return (
                                        <div key={dayIndex} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <div className="w-24 text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {dayName}
                                            </div>
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={dayData.isOpen}
                                                    onChange={(e) => {
                                                        const newHours = formData.hours.map(h =>
                                                            h.day === dayIndex ? { ...h, isOpen: e.target.checked } : h
                                                        );
                                                        setFormData({ ...formData, hours: newHours });
                                                    }}
                                                    className="w-4 h-4 text-blue-600 rounded"
                                                />
                                                <span className="text-sm text-gray-600 dark:text-gray-400">Otvorené</span>
                                            </label>
                                            {dayData.isOpen && (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={dayData.openTime}
                                                        onChange={(e) => {
                                                            const newHours = formData.hours.map(h =>
                                                                h.day === dayIndex ? { ...h, openTime: e.target.value } : h
                                                            );
                                                            setFormData({ ...formData, hours: newHours });
                                                        }}
                                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                                    />
                                                    <span className="text-gray-500">-</span>
                                                    <input
                                                        type="time"
                                                        value={dayData.closeTime}
                                                        onChange={(e) => {
                                                            const newHours = formData.hours.map(h =>
                                                                h.day === dayIndex ? { ...h, closeTime: e.target.value } : h
                                                            );
                                                            setFormData({ ...formData, hours: newHours });
                                                        }}
                                                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm"
                                                    />
                                                </>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Submit Button */}

                        {/* Submit Button */}
                        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                            <MuiButton
                                type="submit"
                                loading={loading}
                                disabled={loading || !formData.subdomain || !formData.name || !subdomainAvailable}
                                startIcon={<Sparkles size={18} />}
                                className="w-full"
                            >
                                Dokončiť a doplniť ďalšie
                            </MuiButton>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                                Ďalšie detaily môžete pridať v admin paneli
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Side - Live Preview */}
            <div className="hidden lg:block lg:w-2/5 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 sticky top-0 h-screen overflow-hidden">
                <div className="p-8 h-full flex flex-col">
                    <div className="mb-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                            <span>Živý náhľad</span>
                        </div>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {formData.subdomain ? `${formData.subdomain}.biztree.bio` : "vasa-subdomena.biztree.bio"}
                        </p>
                    </div>

                    {/* Preview Phone Mockup */}
                    <div className="flex-1 flex items-center justify-center">
                        <div className="w-[300px] h-[600px] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border-8 border-gray-800 dark:border-gray-700 overflow-hidden relative">
                            {/* Phone notch */}
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 dark:bg-gray-700 rounded-b-2xl z-10"></div>

                            {/* Preview Content */}
                            <div
                                className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                                style={{
                                    background: selectedBg?.gradient || BACKGROUNDS[0].gradient,
                                    '--primary': selectedTheme?.color || '#007AFF',
                                } as React.CSSProperties}
                            >
                                <div className="min-h-full flex flex-col items-center p-6 pt-12 space-y-4">
                                    {/* Avatar Placeholder */}
                                    <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 mb-2 flex items-center justify-center">
                                        <span className="text-3xl text-white/60">
                                            {formData.name ? formData.name[0].toUpperCase() : "?"}
                                        </span>
                                    </div>

                                    {/* Name */}
                                    <h1 className="text-2xl font-bold text-white text-center">
                                        {formData.name || "Váš názov"}
                                    </h1>

                                    {/* About */}
                                    {formData.about && (
                                        <p className="text-sm text-white/80 text-center max-w-[250px]">
                                            {formData.about}
                                        </p>
                                    )}

                                    {/* Contact Buttons */}
                                    {(formData.phone || formData.email) && (
                                        <div className="w-full px-2">
                                            <ContactButtonsBlock
                                                profile={{
                                                    phone: formData.phone || null,
                                                    email: formData.email || null,
                                                    whatsapp: null,
                                                    address: null,
                                                    services: [],
                                                    socialLinks: [],
                                                    links: [],
                                                    hours: []
                                                } as any}
                                                lang={formData.language}
                                                bgImage={formData.bgImage}
                                                themeColor={selectedTheme?.color}
                                            />
                                        </div>
                                    )}

                                    {/* Social Links */}
                                    {Object.values(formData.socialLinks).some(url => url && url.trim() !== '') && (
                                        <div className="w-full px-2">
                                            <SocialLinksBlock
                                                profile={{
                                                    socialLinks: Object.entries(formData.socialLinks)
                                                        .filter(([_, url]) => url && url.trim() !== '')
                                                        .map(([platform, url]) => ({
                                                            id: platform,
                                                            platform,
                                                            url,
                                                            profileId: ''
                                                        })),
                                                    services: [],
                                                    links: [],
                                                    hours: []
                                                } as any}
                                                lang={formData.language}
                                                bgImage={formData.bgImage}
                                                themeColor={selectedTheme?.color}
                                            />
                                        </div>
                                    )}

                                    {/* Opening Hours */}
                                    {formData.hours.some(h => h.isOpen) && (
                                        <div className="w-full px-2">
                                            <HoursBlock
                                                profile={{
                                                    hours: formData.hours
                                                        .filter(h => h.isOpen)
                                                        .map(h => ({
                                                            id: `hour-${h.day}`,
                                                            dayOfWeek: h.day,
                                                            openTime: h.openTime,
                                                            closeTime: h.closeTime,
                                                            isClosed: false,
                                                            profileId: ''
                                                        })),
                                                    services: [],
                                                    socialLinks: [],
                                                    links: []
                                                } as any}
                                                lang="sk"
                                                bgImage={formData.bgImage}
                                                themeColor={selectedTheme?.color}
                                            />
                                        </div>
                                    )}

                                    {/* Location */}
                                    {formData.address && (
                                        <div className="w-full px-2">
                                            <LocationBlock
                                                profile={{
                                                    address: formData.address,
                                                    mapEmbed: null,
                                                    locationLat: null,
                                                    locationLng: null,
                                                    services: [],
                                                    socialLinks: [],
                                                    links: [],
                                                    hours: []
                                                } as any}
                                                lang="sk"

                                                bgImage={formData.bgImage}
                                                themeColor={selectedTheme?.color}
                                            />
                                        </div>
                                    )}

                                    {/* Empty state */}
                                    {!formData.name && !formData.about && (
                                        <div className="text-center text-white/40 text-sm mt-8">
                                            <p>Začnite vyplňovať formulár</p>
                                            <p>a uvidíte náhľad tu</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
