"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { checkSubdomainAvailability, createProfileFromOnboarding } from "../actions";
import { Language } from "@/lib/i18n";
import { OnboardingStepWrapper } from "@/components/onboarding/onboarding-step-wrapper";
import { StepBasicInfo } from "@/components/onboarding/steps/step-basic-info";
import { StepContactInfo } from "@/components/onboarding/steps/step-contact-info";
import { StepAppearance } from "@/components/onboarding/steps/step-appearance";
import { StepAddress } from "@/components/onboarding/steps/step-address";
import { StepSocialMedia } from "@/components/onboarding/steps/step-social-media";
import { StepOpeningHours } from "@/components/onboarding/steps/step-opening-hours";
import { OnboardingPaywall } from "@/components/onboarding/onboarding-paywall";
import ContactButtonsBlock from "@/components/blocks/contact-buttons-block";
import HoursBlock from "@/components/blocks/hours-block";
import SocialLinksBlock from "@/components/blocks/social-links-block";
import LocationBlock from "@/components/blocks/location-block";

const ONBOARDING_TRANSLATIONS = {
    sk: {
        title: "Vytvorte si profil",
        subtitle: "Vyplňte základné informácie a vytvorte si profesionálny online profil",
        basicInfo: "Základné informácie",
        companyName: "Názov firmy / Meno *",
        companyNameHelper: "Toto je názov, ktorý uvidia vaši zákazníci. Môžete ho kedykoľvek zmeniť.",
        subdomain: "Subdoména (URL adresa) *",
        subdomainHelper: "Toto bude vaša jedinečná webová adresa (napr. vase-meno.biztree.bio). Po vytvorení ju už NEMOŽNO zmeniť, preto si ju dobre premyslite!",
        checking: "Kontrolujem dostupnosť...",
        available: "je dostupná",
        subdomainTaken: "Táto subdoména už existuje",
        subdomainWww: "Subdoména nemôže byť 'www'",
        contactInfo: "Kontaktné informácie",
        about: "O vás / firme",
        phone: "Telefón",
        email: "Email",
        appearance: "Vzhľad",
        colorTheme: "Farebná téma",
        background: "Pozadie",
        address: "Adresa",
        addressOptional: "Adresa (voliteľné)",
        addressPlaceholder: "napr. Hlavná 123, Bratislava",
        socialMedia: "Sociálne siete",
        socialMediaDesc: "Pridajte odkazy na vaše sociálne siete (voliteľné)",
        openingHours: "Otváracie hodiny",
        openingHoursDesc: "Nastavte otváracie hodiny (voliteľné)",
        open: "Otvorené",
        days: ["Pondelok", "Utorok", "Streda", "Štvrtok", "Piatok", "Sobota", "Nedeľa"],
        submit: "Dokončiť a doplniť ďalšie",
        submitDesc: "Ďalšie detaily môžete pridať v admin paneli",
        livePreview: "Živý náhľad",
        yourSubdomain: "vasa-subdomena.biztree.bio",
        yourName: "Váš názov",
        startFilling: "Začnite vypĺňovať formulár",
        seePreview: "a uvidíte náhľad tu",
        notLoggedIn: "Nie ste prihlásený",
        fillRequired: "Vyplňte všetky povinné polia a vyberte dostupnú subdoménu",
        errorCreating: "Nastala chyba pri vytváraní profilu"
    },
    en: {
        title: "Create Your Profile",
        subtitle: "Fill in basic information and create your professional online profile",
        basicInfo: "Basic Information",
        companyName: "Company / Name *",
        companyNameHelper: "This is the name your customers will see. You can change it anytime.",
        subdomain: "Subdomain (URL address) *",
        subdomainHelper: "This will be your unique web address (e.g. your-name.biztree.bio). Once created, it CANNOT be changed, so choose carefully!",
        checking: "Checking availability...",
        available: "is available",
        subdomainTaken: "This subdomain is already taken",
        subdomainWww: "Subdomain cannot be 'www'",
        contactInfo: "Contact Information",
        about: "About you / company",
        phone: "Phone",
        email: "Email",
        appearance: "Appearance",
        colorTheme: "Color Theme",
        background: "Background",
        address: "Address",
        addressOptional: "Address (optional)",
        addressPlaceholder: "e.g. Main St 123, Bratislava",
        socialMedia: "Social Media",
        socialMediaDesc: "Add links to your social media (optional)",
        openingHours: "Opening Hours",
        openingHoursDesc: "Set opening hours (optional)",
        open: "Open",
        days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        submit: "Complete and Add More",
        submitDesc: "You can add more details in the admin panel",
        livePreview: "Live Preview",
        yourSubdomain: "your-subdomain.biztree.bio",
        yourName: "Your Name",
        startFilling: "Start filling the form",
        seePreview: "and you'll see a preview here",
        notLoggedIn: "You are not logged in",
        fillRequired: "Fill in all required fields and choose an available subdomain",
        errorCreating: "An error occurred while creating the profile"
    }
};

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

interface OnboardingFormProps {
    businessPriceId: string;
    proPriceId: string;
}

export default function OnboardingForm({ businessPriceId, proPriceId }: OnboardingFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentStep, setCurrentStep] = useState(0);
    const [subdomainChecking, setSubdomainChecking] = useState(false);
    const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<'free' | 'business' | 'pro' | null>('business');

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
            { day: 1, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 2, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 3, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 4, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 5, isOpen: true, openTime: "09:00", closeTime: "17:00" },
            { day: 6, isOpen: false, openTime: "09:00", closeTime: "17:00" },
            { day: 0, isOpen: false, openTime: "09:00", closeTime: "17:00" },
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
            setSubdomainChecking(false);
            return;
        }

        if (sanitized.length < 3) {
            setSubdomainAvailable(null);
            setSubdomainChecking(false);
        }
    };

    useEffect(() => {
        if (!formData.subdomain || formData.subdomain.length < 3 || formData.subdomain === "www") {
            return;
        }

        const timer = setTimeout(() => {
            checkSubdomain(formData.subdomain);
        }, 500);

        return () => clearTimeout(timer);
    }, [formData.subdomain]);

    const handleComplete = async (planOverride?: 'free' | 'business' | 'pro') => {
        const t = ONBOARDING_TRANSLATIONS[formData.language];
        const finalPlan = planOverride || selectedPlan;

        if (!session?.user?.id) {
            setError(t.notLoggedIn);
            return;
        }

        if (!formData.subdomain || !formData.name || !subdomainAvailable) {
            setError(t.fillRequired);
            return;
        }

        // If on paywall step and no plan selected, show error
        if (currentStep === 6 && !finalPlan) {
            setError("Vyberte plán");
            return;
        }
        setLoading(true);
        setError("");

        try {
            // Prepare social links array
            const socialLinksArray = Object.entries(formData.socialLinks)
                .filter(([_, url]) => url && url.trim() !== '')
                .map(([platform, url]) => ({ platform, url }));

            console.log('Submitting onboarding data...');

            // Create profile first (for all plans)
            const result = await createProfileFromOnboarding(session.user.id, {
                ...formData,
                socialLinks: socialLinksArray
            });

            console.log('Onboarding result:', result);

            if (result.error) {
                console.error('Onboarding error:', result.error);
                setError(result.error);
                setLoading(false);
                return;
            }

            // Profile created successfully
            console.log('Profile created successfully');

            // If paid plan selected, redirect to Stripe checkout
            if (finalPlan === 'business' || finalPlan === 'pro') {
                const { createCheckoutSession } = await import("@/app/admin/subscription/actions");
                const priceId = finalPlan === 'business' ? businessPriceId : proPriceId;

                if (!priceId) {
                    setError("Price ID not configured");
                    setLoading(false);
                    return;
                }

                console.log('Creating Stripe checkout session for', finalPlan, 'plan...');
                const url = await createCheckoutSession(priceId, undefined, 'subscription');

                if (url) {
                    console.log('Redirecting to Stripe checkout...');
                    // Redirect to Stripe checkout
                    window.location.href = url;
                    // Don't set loading to false, let the redirect happen
                } else {
                    setError("Failed to create checkout session");
                    setLoading(false);
                }
                return;
            }

            // For free plan, just redirect to admin
            console.log('Free plan selected, redirecting to admin...');
            window.location.href = '/admin';
        } catch (err) {
            console.error('Onboarding exception:', err);
            setError(t.errorCreating);
            setLoading(false);
        }
    };

    // Skip handler - moves to next step
    const handleSkip = () => {
        if (currentStep < 6) { // Don't skip paywall
            setCurrentStep(currentStep + 1);
        }
    };

    const selectedTheme = THEMES.find(t => t.id === formData.theme);
    const selectedBg = BACKGROUNDS.find(b => b.id === formData.bgImage);
    const t = ONBOARDING_TRANSLATIONS[formData.language];

    // Define steps
    const steps = [
        {
            id: "basic-info",
            title: t.basicInfo,
            isRequired: true, // REQUIRED
            component: (
                <StepBasicInfo
                    formData={{
                        language: formData.language,
                        name: formData.name,
                        subdomain: formData.subdomain
                    }}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                    onSubdomainChange={handleSubdomainChange}
                    subdomainChecking={subdomainChecking}
                    subdomainAvailable={subdomainAvailable}
                    translations={t}
                />
            ),
            isValid: !!(formData.name && formData.subdomain && subdomainAvailable)
        },
        {
            id: "contact-info",
            title: t.contactInfo,
            isRequired: false, // OPTIONAL
            component: (
                <StepContactInfo
                    formData={{
                        about: formData.about,
                        phone: formData.phone,
                        email: formData.email
                    }}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                    translations={t}
                />
            ),
            isValid: true
        },
        {
            id: "appearance",
            title: t.appearance,
            isRequired: false, // OPTIONAL
            component: (
                <StepAppearance
                    formData={{
                        theme: formData.theme,
                        bgImage: formData.bgImage
                    }}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                    translations={t}
                />
            ),
            isValid: true
        },
        {
            id: "address",
            title: t.address,
            isRequired: false, // OPTIONAL
            component: (
                <StepAddress
                    formData={{ address: formData.address }}
                    onChange={(data) => setFormData({ ...formData, ...data })}
                    translations={t}
                />
            ),
            isValid: true
        },
        {
            id: "social-media",
            title: t.socialMedia,
            isRequired: false, // OPTIONAL
            component: (
                <StepSocialMedia
                    formData={formData.socialLinks}
                    onChange={(data) => setFormData({ ...formData, socialLinks: { ...formData.socialLinks, ...data } })}
                />
            ),
            isValid: true
        },
        {
            id: "opening-hours",
            title: t.openingHours,
            isRequired: false, // OPTIONAL
            component: (
                <StepOpeningHours
                    formData={formData.hours}
                    onChange={(hours) => setFormData({ ...formData, hours })}
                    translations={t}
                />
            ),
            isValid: true
        },
        {
            id: "paywall",
            title: "Vyberte plán",
            isRequired: true, // REQUIRED
            component: (
                <OnboardingPaywall
                    onSelectPlan={(plan) => {
                        setSelectedPlan(plan);
                        if (plan === 'free') {
                            handleComplete('free');
                        }
                    }}
                    selectedPlan={selectedPlan}
                    businessPriceId={businessPriceId}
                    proPriceId={proPriceId}
                />
            ),
            isValid: selectedPlan !== null
        }
    ];

    // Preview component
    const preview = (
        <div className="p-8 h-full flex flex-col">
            <div className="mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span>{t.livePreview}</span>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formData.subdomain ? `${formData.subdomain}.biztree.bio` : t.yourSubdomain}
                </p>
            </div>

            <div className="flex-1 flex items-center justify-center">
                <div className="w-[300px] h-[600px] bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border-8 border-gray-800 dark:border-gray-700 overflow-hidden relative">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-gray-800 dark:bg-gray-700 rounded-b-2xl z-10"></div>

                    <div
                        className="w-full h-full overflow-y-auto scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent"
                        style={{
                            background: selectedBg?.gradient || BACKGROUNDS[0].gradient,
                            '--primary': selectedTheme?.color || '#007AFF',
                        } as React.CSSProperties}
                    >
                        <div className="min-h-full flex flex-col items-center p-6 pt-12 space-y-4">
                            <div className="w-24 h-24 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 mb-2 flex items-center justify-center">
                                <span className="text-3xl text-white/60">
                                    {formData.name ? formData.name[0].toUpperCase() : "?"}
                                </span>
                            </div>

                            <h1 className="text-2xl font-bold text-white text-center">
                                {formData.name || t.yourName}
                            </h1>

                            {formData.about && (
                                <p className="text-sm text-white/80 text-center max-w-[250px]">
                                    {formData.about}
                                </p>
                            )}

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

                            {!formData.name && !formData.about && (
                                <div className="text-center text-white/40 text-sm mt-8">
                                    <p>{t.startFilling}</p>
                                    <p>{t.seePreview}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {error && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4">
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400">
                        {error}
                    </div>
                </div>
            )}
            <OnboardingStepWrapper
                steps={steps}
                currentStep={currentStep}
                onStepChange={setCurrentStep}
                onComplete={() => handleComplete()}
                onSkip={handleSkip}
                preview={preview}
                loading={loading}
            />
        </>
    );
}
