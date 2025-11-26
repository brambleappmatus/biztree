"use client";

import React, { useState } from "react";
import { Profile, WorkingHours } from "@prisma/client";
import { updateProfile, updateWorkingHours } from "@/app/actions";
import { Loader2, Save, User, Phone, Mail, MapPin, Globe, Image as ImageIcon, Palette, Type, Trash2, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { LANGUAGES } from "@/lib/i18n";
import { MuiInput } from "@/components/ui/mui-input";
import { MuiTextArea } from "@/components/ui/mui-textarea";
import { MuiButton } from "@/components/ui/mui-button";
import { MuiCard } from "@/components/ui/mui-card";
import LinksManager from "./links-manager";
import SocialLinksManager from "./social-links-manager";
import GalleryManager from "./gallery-manager";
import DocumentsManager from "./documents-manager";
import { useToast } from "@/components/ui/toast";
import { LockedComponentWrapper } from "./LockedComponentWrapper";

interface ProfileFormProps {
    profile: Profile & { socialLinks: any[], hours: WorkingHours[], links: any[], bgNoise?: boolean };
}

const THEMES = [
    { id: "blue", name: "Blue Pulse", color: "#007AFF" },
    { id: "emerald", name: "Emerald", color: "#34C759" },
    { id: "coral", name: "Coral", color: "#FF2D55" },
    { id: "graphite", name: "Graphite", color: "#8E8E93" },
    { id: "lavender", name: "Lavender", color: "#AF52DE" },
    { id: "amber", name: "Amber", color: "#FF9500" },
    { id: "sunshine", name: "Sunshine", color: "#FFD60A" },
    { id: "teal", name: "Teal", color: "#30B0C7" },
    { id: "indigo", name: "Indigo", color: "#5856D6" },
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
    { id: "yellow", name: "Golden", gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)" },
    { id: "red", name: "Fire Red", gradient: "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)" },
    { id: "navy", name: "Navy Blue", gradient: "linear-gradient(135deg, #134e5e 0%, #71b280 100%)" },
    { id: "charcoal", name: "Charcoal", gradient: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
    { id: "burgundy", name: "Burgundy", gradient: "linear-gradient(135deg, #7b4397 0%, #dc2430 100%)" },
    { id: "teal", name: "Teal", gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
    // New premium gradients
    { id: "peach-fade", name: "Peach Fade", gradient: "linear-gradient(135deg, #ff9a56 0%, #ffecd2 100%)" },
    { id: "lavender-fade", name: "Lavender Fade", gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
    { id: "mint-fade", name: "Mint Fade", gradient: "linear-gradient(135deg, #00d2ff 0%, #e0f9ff 100%)" },
    { id: "rose-fade", name: "Rose Fade", gradient: "linear-gradient(135deg, #ff6b9d 0%, #ffc3d8 100%)" },
    { id: "sky-fade", name: "Sky Fade", gradient: "linear-gradient(135deg, #4facfe 0%, #e0f4ff 100%)" },
    { id: "rainbow", name: "Rainbow", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" },
    { id: "tropical", name: "Tropical", gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #ffd200 100%)" },
    { id: "aurora", name: "Aurora", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #43e97b 100%)" },
    { id: "cosmic", name: "Cosmic", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 33%, #f093fb 66%, #f5576c 100%)" },
    // Premium mesh/ray gradients
    { id: "sunset-rays", name: "Sunset Rays", gradient: "radial-gradient(circle at 20% 50%, rgba(255, 107, 107, 0.9) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(78, 205, 196, 0.9) 0%, transparent 50%), radial-gradient(circle at 50% 80%, rgba(255, 159, 64, 0.8) 0%, transparent 50%), linear-gradient(135deg, #2c3e50 0%, #34495e 100%)" },
    { id: "neon-dreams", name: "Neon Dreams", gradient: "radial-gradient(circle at 30% 30%, rgba(138, 43, 226, 0.8) 0%, transparent 50%), radial-gradient(circle at 70% 70%, rgba(255, 20, 147, 0.8) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(0, 191, 255, 0.6) 0%, transparent 60%), linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" },
    { id: "ocean-depths", name: "Ocean Depths", gradient: "radial-gradient(circle at 40% 40%, rgba(64, 224, 208, 0.7) 0%, transparent 50%), radial-gradient(circle at 60% 60%, rgba(72, 209, 204, 0.7) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(32, 178, 170, 0.6) 0%, transparent 50%), linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)" },
    { id: "fire-ice", name: "Fire & Ice", gradient: "radial-gradient(circle at 20% 80%, rgba(255, 69, 0, 0.8) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(0, 191, 255, 0.8) 0%, transparent 50%), radial-gradient(circle at 50% 50%, rgba(138, 43, 226, 0.5) 0%, transparent 60%), linear-gradient(135deg, #232526 0%, #414345 100%)" },
];

const DAYS = [
    { id: 1, name: "Pondelok" },
    { id: 2, name: "Utorok" },
    { id: 3, name: "Streda" },
    { id: 4, name: "Štvrtok" },
    { id: 5, name: "Piatok" },
    { id: 6, name: "Sobota" },
    { id: 0, name: "Nedeľa" },
];

export default function ProfileForm({ profile }: ProfileFormProps) {
    const router = useRouter();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: profile.name,
        about: profile.about || "",
        phone: profile.phone || "",
        email: profile.email || "",
        address: profile.address || "",
        mapEmbed: profile.mapEmbed || "",
        theme: profile.theme,
        language: profile.language || "sk",
        bgImage: profile.bgImage === "none" ? "black" : (profile.bgImage || "black"),
        bgBlur: profile.bgBlur || false,
        bgNoise: profile.bgNoise || false,
        avatarUrl: profile.avatarUrl || "",
        showBusinessCard: profile.showBusinessCard !== undefined ? profile.showBusinessCard : true,
    });

    // Avatar upload handler
    // Avatar upload handler
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            showToast("Obrázok je príliš veľký. Maximálna veľkosť je 2MB.", "error");
            return;
        }

        // Validate file type
        if (!file.type.startsWith("image/")) {
            showToast("Prosím nahrajte obrázok.", "error");
            return;
        }

        try {
            setLoading(true);

            // Create FormData for upload
            const formData = new FormData();
            formData.append("file", file);
            formData.append("bucket", "avatars");

            // Upload via API route to keep secrets on server
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            setFormData(prev => ({ ...prev, avatarUrl: data.url }));
            showToast("Profilová fotka nahraná", "success");
        } catch (error) {
            console.error("Error uploading avatar:", error);
            showToast("Nepodarilo sa nahrať obrázok. Skúste to prosím znova.", "error");
        } finally {
            setLoading(false);
        }
    };

    // Working Hours State
    const [hours, setHours] = useState(() => {
        return DAYS.map((day) => {
            const existing = profile.hours.find((h) => h.dayOfWeek === day.id);
            return {
                dayOfWeek: day.id,
                openTime: existing?.openTime || "09:00",
                closeTime: existing?.closeTime || "17:00",
                isClosed: existing ? existing.isClosed : false,
            };
        });
    });

    // Unsplash search state
    const [bgType, setBgType] = useState<"gradient" | "image" | "upload">("gradient");
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    // Auto-search as user types (debounced)
    React.useEffect(() => {
        if (bgType === "image") {
            const timer = setTimeout(() => {
                searchImages(searchQuery);
            }, 500); // Wait 500ms after user stops typing

            return () => clearTimeout(timer);
        }
    }, [searchQuery, bgType]);

    // Load trending images when switching to image tab
    React.useEffect(() => {
        if (bgType === "image" && searchResults.length === 0) {
            loadTrendingImages();
        }
    }, [bgType]);

    const searchImages = async (query: string) => {
        if (!query) return;
        setSearching(true);
        try {
            const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(query)}`);
            const data = await res.json();

            if (data.photos) {
                setSearchResults(data.photos);
            } else {
                // Fallback if API fails or limit reached
                console.warn("Using fallback images due to API error");
                setSearchResults([
                    { id: 1, urls: { regular: "https://images.unsplash.com/photo-1497366216548-37526070297c", thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=200" }, alt: "Office" },
                    { id: 2, urls: { regular: "https://images.unsplash.com/photo-1497215728101-856f4ea42174", thumb: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?w=200" }, alt: "Work" },
                    { id: 3, urls: { regular: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0", thumb: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=200" }, alt: "Meeting" },
                ]);
            }
        } catch (error) {
            console.error("Failed to search images", error);
        } finally {
            setSearching(false);
        }
    };

    const loadTrendingImages = async () => {
        setSearching(true);
        try {
            const response = await fetch(`/api/unsplash/search`);
            const data = await response.json();
            if (data.photos) {
                setSearchResults(data.photos);
            } else if (data.error) {
                console.error("Unsplash error:", data.error, data.details);
            }
        } catch (error) {
            console.error("Error loading trending images:", error);
        } finally {
            setSearching(false);
        }
    };

    const handleTimeChange = (dayId: number, field: "openTime" | "closeTime", value: string) => {
        setHours((prev) =>
            prev.map((h) => (h.dayOfWeek === dayId ? { ...h, [field]: value } : h))
        );
    };

    const toggleClosed = (dayId: number) => {
        setHours((prev) =>
            prev.map((h) => (h.dayOfWeek === dayId ? { ...h, isClosed: !h.isClosed } : h))
        );
    };

    // Auto-save logic
    const isFirstRun = React.useRef(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);

    React.useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }

        setLoading(true);
        const timer = setTimeout(() => {
            handleAutoSave();
        }, 1000);

        return () => clearTimeout(timer);
    }, [formData, hours]);

    const handleAutoSave = async () => {
        try {
            // Update profile
            await updateProfile(profile.id, formData);

            // Update hours
            await updateWorkingHours(profile.id, hours);

            setLastSaved(new Date());

            // Dispatch event for preview refresh
            window.dispatchEvent(new Event('profile-updated'));

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const selectImage = (imageUrl: string) => {
        setFormData({ ...formData, bgImage: imageUrl });
    };

    return (
        <div className="space-y-8 max-w-4xl pb-12">
            {/* Identity Section */}
            <div id="identita" data-section data-section-label="Identita" data-section-icon="User">
                <MuiCard title="Identita" subtitle="Základné informácie o vašej firme">
                    <div className="space-y-4">
                        {/* Avatar Upload */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                                {formData.avatarUrl ? (
                                    <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ImageIcon size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Logo / Profilová fotka</label>
                                <div className="flex gap-2 items-center">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    />
                                    {formData.avatarUrl && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, avatarUrl: "" }))}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                            title="Odstrániť fotku"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Odporúčame štvorcový obrázok (PNG, JPG)</p>
                            </div>
                        </div>

                        <MuiInput
                            label="Názov firmy / Meno"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            startIcon={<User size={18} />}
                            required
                        />
                        <MuiTextArea
                            label="O mne / firme"
                            value={formData.about}
                            onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                            rows={3}
                        />
                    </div>
                </MuiCard>
            </div>

            {/* Contact Card */}
            <div id="kontakt" data-section data-section-label="Kontakt" data-section-icon="Phone" data-feature-key="component_contact">
                <LockedComponentWrapper featureKey="component_contact">
                    <MuiCard
                        title="Kontakt"
                        subtitle="Ako vás môžu zákazníci kontaktovať"
                    >
                        <div className="grid gap-2 mt-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <MuiInput
                                    label="Telefón"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    startIcon={<Phone className="w-5 h-5" />}
                                />
                                <MuiInput
                                    label="Email"
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    startIcon={<Mail className="w-5 h-5" />}
                                />
                            </div>
                            <MuiInput
                                label="Adresa"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Ulica 123, Mesto"
                                startIcon={<MapPin className="w-5 h-5" />}
                            />
                        </div>
                    </MuiCard>
                </LockedComponentWrapper>

                {/* Google Maps - Separate Lock */}
                <div className="mt-4" id="google-maps" data-section data-section-label="Google Maps" data-section-icon="Map" data-feature-key="component_map">
                    <LockedComponentWrapper featureKey="component_map">
                        <MuiCard title="Google Maps" subtitle="Vložte mapu vašej lokácie">
                            <MuiTextArea
                                label="Google Maps Iframe"
                                value={formData.mapEmbed}
                                onChange={(e) => setFormData({ ...formData, mapEmbed: e.target.value })}
                                placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
                                rows={3}
                                className="font-mono text-xs"
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 ml-2 mt-2">
                                Vložte iframe kód z Google Maps (Zdieľať → Vložiť mapu)
                            </p>
                        </MuiCard>
                    </LockedComponentWrapper>
                </div>

                {/* Business Card Toggle - Separate Lock */}
                <div className="mt-4" id="vizitka" data-section data-section-label="Vizitka" data-section-icon="Contact" data-feature-key="component_business_card">
                    <LockedComponentWrapper featureKey="component_business_card">
                        <MuiCard>
                            <div className="flex items-center justify-between p-4">
                                <div className="flex-1">
                                    <label htmlFor="showBusinessCard" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Zobraziť vizitku
                                    </label>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        Umožniť návštevníkom stiahnuť vašu vizitku do telefónu
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer ml-4">
                                    <input
                                        type="checkbox"
                                        id="showBusinessCard"
                                        className="sr-only peer"
                                        checked={formData.showBusinessCard}
                                        onChange={(e) => setFormData({ ...formData, showBusinessCard: e.target.checked })}
                                    />
                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                </label>
                            </div>
                        </MuiCard>
                    </LockedComponentWrapper>
                </div>
            </div>

            <div id="links" data-section data-section-label="Odkazy" data-section-icon="Link" data-feature-key="component_custom_links">
                <LockedComponentWrapper featureKey="component_custom_links">
                    <LinksManager profile={profile} />
                </LockedComponentWrapper>
            </div>

            {/* Documents Section */}
            <div id="documents" data-section data-section-label="Dokumenty" data-section-icon="FileText" data-feature-key="component_documents">
                <LockedComponentWrapper
                    featureKey="component_documents"
                >
                    <DocumentsManager profile={profile} />
                </LockedComponentWrapper>
            </div>

            {/* Gallery Manager */}
            <div id="gallery" data-section data-section-label="Galéria" data-section-icon="Image" data-feature-key="component_gallery">
                <LockedComponentWrapper featureKey="component_gallery">
                    <GalleryManager profile={profile} />
                </LockedComponentWrapper>
            </div>

            {/* Social Media Manager */}
            <div id="social-links" data-section data-section-label="Social links" data-section-icon="Share2" data-feature-key="component_social_links">
                <LockedComponentWrapper featureKey="component_social_links">
                    <SocialLinksManager profile={profile} />
                </LockedComponentWrapper>
            </div>

            {/* Working Hours Card */}
            <div id="hours" data-section data-section-label="Otváracie hodiny" data-section-icon="Clock" data-feature-key="component_hours">
                <LockedComponentWrapper featureKey="component_hours">
                    <MuiCard
                        title="Otváracie hodiny"
                        subtitle="Nastavte si, kedy ste k dispozícii pre zákazníkov"
                    >
                        <div className="space-y-1 mt-2">
                            {hours.map((day) => {
                                const dayName = DAYS.find((d) => d.id === day.dayOfWeek)?.name;

                                return (
                                    <div
                                        key={day.dayOfWeek}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-lg transition-colors",
                                            day.isClosed ? "bg-gray-50 dark:bg-gray-900/50 opacity-70" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        )}
                                    >
                                        <div className="font-medium text-sm text-gray-900 dark:text-gray-100 w-24">
                                            {dayName}
                                        </div>

                                        <div className="flex items-center gap-2 flex-1 justify-center">
                                            {!day.isClosed ? (
                                                <>
                                                    <input
                                                        type="time"
                                                        value={day.openTime}
                                                        onChange={(e) => handleTimeChange(day.dayOfWeek, "openTime", e.target.value)}
                                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-24"
                                                    />
                                                    <span className="text-gray-400 text-sm">–</span>
                                                    <input
                                                        type="time"
                                                        value={day.closeTime}
                                                        onChange={(e) => handleTimeChange(day.dayOfWeek, "closeTime", e.target.value)}
                                                        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 outline-none w-24"
                                                    />
                                                </>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">
                                                    Zatvorené
                                                </span>
                                            )}
                                        </div>

                                        <label className="relative inline-flex items-center cursor-pointer ml-4">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={!day.isClosed}
                                                onChange={() => toggleClosed(day.dayOfWeek)}
                                            />
                                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>
                    </MuiCard>
                </LockedComponentWrapper>
            </div>

            {/* Appearance Card */}
            <div id="appearance" data-section data-section-label="Vzhľad" data-section-icon="Palette">
                <MuiCard
                    title="Vzhľad"
                    subtitle="Prispôsobte si dizajn profilu"
                >
                    <div className="space-y-6 mt-2">
                        {/* Language */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                                <Globe className="w-4 h-4" /> Jazyk profilu
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, language: lang.code })}
                                        className={cn(
                                            "px-4 py-2 rounded-full border transition-all text-sm font-medium flex items-center gap-2",
                                            formData.language === lang.code
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                        )}
                                    >
                                        <span>{lang.flag}</span>
                                        {lang.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                                <Palette className="w-4 h-4" /> Farebná téma
                            </label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, theme: theme.id })}
                                        className={cn(
                                            "p-3 rounded-xl border transition-all flex items-center gap-3",
                                            formData.theme === theme.id
                                                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500"
                                                : "border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        )}
                                    >
                                        <div
                                            className="w-6 h-6 rounded-full shadow-sm"
                                            style={{ backgroundColor: theme.color }}
                                        />
                                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{theme.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Background */}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" /> Pozadie
                            </label>

                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl mb-4 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setBgType("gradient")}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                        bgType === "gradient"
                                            ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    )}
                                >
                                    Gradienty
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBgType("image")}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                        bgType === "image"
                                            ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    )}
                                >
                                    Obrázky (Unsplash)
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setBgType("upload")}
                                    className={cn(
                                        "px-4 py-1.5 rounded-lg text-sm font-medium transition-all",
                                        bgType === "upload"
                                            ? "bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100"
                                            : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                                    )}
                                >
                                    Vlastný obrázok
                                </button>
                            </div>

                            {bgType === "gradient" && (
                                <>
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

                                    {/* Noise toggle for gradients */}
                                    <div className="flex items-center gap-2 mt-4 mb-2">
                                        <input
                                            type="checkbox"
                                            id="bgNoise"
                                            checked={formData.bgNoise}
                                            onChange={(e) => setFormData({ ...formData, bgNoise: e.target.checked })}
                                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                        />
                                        <label htmlFor="bgNoise" className="text-sm text-gray-700 dark:text-gray-300">
                                            Pridať šum (grain texture pre prémiový vzhľad)
                                        </label>
                                    </div>
                                </>
                            )}

                            {bgType === "image" && (
                                <LockedComponentWrapper featureKey="component_background_images">
                                    <div className="space-y-4">
                                        <MuiInput
                                            label="Hľadať obrázky"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            placeholder="napr. nature, office, abstract..."
                                        />

                                        {formData.bgImage?.startsWith("http") && (
                                            <div className="flex items-center gap-2 mb-2">
                                                <input
                                                    type="checkbox"
                                                    id="bgBlur"
                                                    checked={formData.bgBlur}
                                                    onChange={(e) => setFormData({ ...formData, bgBlur: e.target.checked })}
                                                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                                />
                                                <label htmlFor="bgBlur" className="text-sm text-gray-700 dark:text-gray-300">
                                                    Rozmazať pozadie (pre lepšiu čitateľnosť textu)
                                                </label>
                                            </div>
                                        )}


                                        <div className="grid grid-cols-3 gap-3 max-h-[600px] overflow-y-auto p-1">
                                            {searchResults.map((photo) => (
                                                <button
                                                    key={photo.id}
                                                    type="button"
                                                    onClick={() => selectImage(photo.urls.regular)}
                                                    className={cn(
                                                        "relative h-24 rounded-xl border-2 transition-all overflow-hidden group hover:shadow-md",
                                                        formData.bgImage === photo.urls.regular
                                                            ? "border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
                                                            : "border-transparent"
                                                    )}
                                                >
                                                    <img
                                                        src={photo.urls.thumb}
                                                        alt={photo.alt}
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all" />
                                                </button>
                                            ))}
                                        </div>
                                        {searchResults.length === 0 && !searching && (
                                            <p className="text-center text-sm text-gray-500 py-4">Žiadne obrázky sa nenašli.</p>
                                        )}
                                    </div>
                                </LockedComponentWrapper>
                            )}

                            {bgType === "upload" && (
                                <LockedComponentWrapper featureKey="component_background_upload">
                                    <div className="space-y-4">
                                        <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-blue-500 transition-colors">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0];
                                                    if (!file) return;

                                                    // Validate file size (max 5MB)
                                                    if (file.size > 5 * 1024 * 1024) {
                                                        showToast("Obrázok je príliš veľký. Maximálna veľkosť je 5MB.", "error");
                                                        return;
                                                    }

                                                    try {
                                                        setLoading(true);
                                                        const formData = new FormData();
                                                        formData.append("file", file);
                                                        formData.append("bucket", "backgrounds");

                                                        const response = await fetch("/api/upload", {
                                                            method: "POST",
                                                            body: formData,
                                                        });

                                                        if (!response.ok) throw new Error("Upload failed");

                                                        const data = await response.json();
                                                        setFormData(prev => ({ ...prev, bgImage: data.url }));
                                                        showToast("Pozadie nahrané", "success");
                                                    } catch (error) {
                                                        console.error("Error uploading background:", error);
                                                        showToast("Nepodarilo sa nahrať obrázok", "error");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="hidden"
                                                id="bg-upload"
                                            />
                                            <label htmlFor="bg-upload" className="cursor-pointer">
                                                <ImageIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    Kliknite pre nahratie vlastného pozadia
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG (max. 5MB)
                                                </p>
                                            </label>
                                        </div>

                                        {formData.bgImage?.startsWith("http") && !formData.bgImage.includes("unsplash") && (
                                            <div className="relative rounded-xl overflow-hidden border-2 border-blue-500">
                                                <img
                                                    src={formData.bgImage}
                                                    alt="Custom background"
                                                    className="w-full h-48 object-cover"
                                                />
                                                <div className="absolute top-2 right-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, bgImage: "black" }))}
                                                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </LockedComponentWrapper>
                            )}
                        </div>
                    </div>
                </MuiCard>
            </div>

            {/* Saving Indicator - Commented out per user request */}
            {/* <div className="fixed bottom-6 right-6 z-50">
                <div className={cn(
                    "bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 rounded-full px-6 py-3 flex items-center gap-3 transition-all duration-300",
                    loading ? "translate-y-0 opacity-100" : lastSaved ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
                )}>
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Ukladám zmeny...</span>
                        </>
                    ) : (
                        <>
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Uložené</span>
                        </>
                    )}
                </div>
            </div> */}
        </div>
    );
}
