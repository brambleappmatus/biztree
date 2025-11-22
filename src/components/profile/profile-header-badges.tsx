"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { Share, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { SocialIcon } from "@/components/ui/social-icon";

interface ProfileHeaderBadgesProps {
    profile: {
        name: string;
        avatarUrl: string | null;
        about: string | null;
        theme: string;
    };
}

export function ProfileHeaderBadges({ profile }: ProfileHeaderBadgesProps) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [activeModal, setActiveModal] = useState<"none" | "share" | "biztree">("none");

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            // Hide when scrolling down and past 50px
            if (currentScrollY > 50 && currentScrollY > lastScrollY) {
                setIsVisible(false);
            } else {
                // Show when scrolling up or at top
                setIsVisible(true);
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    const { showToast } = useToast();

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            showToast("Link skopírovaný!", "success");
        } catch (err) {
            console.error("Failed to copy:", err);
            showToast("Nepodarilo sa skopírovať link", "error");
        }
    };

    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    const shareText = `Check out ${profile.name} on BizTree!`;

    return (
        <>
            {/* Left Badge: BizTree CTA */}
            <button
                onClick={() => setActiveModal("biztree")}
                className={cn(
                    "fixed top-4 left-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/5 backdrop-blur-sm border border-white/5 text-white transition-all duration-300 ease-in-out hover:bg-black/10 pt-safe",
                    isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
                )}
                aria-label="Create your own BizTree"
            >
                <svg width="24" height="24" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
                    <path d="M256 384V128" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M256 320L160 224" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M256 256L352 160" stroke="white" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="160" cy="224" r="24" fill="white" />
                    <circle cx="352" cy="160" r="24" fill="white" />
                    <circle cx="256" cy="128" r="24" fill="white" />
                    <circle cx="256" cy="384" r="24" fill="white" />
                </svg>
            </button>

            {/* Right Badge: Share Button */}
            <button
                onClick={() => setActiveModal("share")}
                className={cn(
                    "fixed top-4 right-4 z-50 flex items-center justify-center w-10 h-10 rounded-full bg-black/5 backdrop-blur-sm border border-white/5 text-white transition-all duration-300 ease-in-out hover:bg-black/10 pt-safe",
                    isVisible ? "translate-y-0 opacity-100" : "-translate-y-10 opacity-0 pointer-events-none"
                )}
                aria-label="Share Profile"
            >
                <Share className="w-5 h-5" />
            </button>

            {/* Share Modal */}
            <BottomSheet
                isOpen={activeModal === "share"}
                onClose={() => setActiveModal("none")}
                title="Share BizTree"
            >
                <div className="flex flex-col items-center space-y-6 pb-8">
                    {/* Profile Preview Card */}
                    <div className="w-full rounded-2xl bg-black p-6 text-center shadow-lg ring-1 ring-white/10">
                        {profile.avatarUrl ? (
                            <img
                                src={profile.avatarUrl}
                                alt={profile.name}
                                className="mx-auto h-20 w-20 rounded-full object-cover ring-2 ring-white/20"
                            />
                        ) : (
                            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gray-800 text-2xl font-bold text-white ring-2 ring-white/20">
                                {profile.name.charAt(0)}
                            </div>
                        )}
                        <h3 className="mt-4 text-xl font-bold text-white">{profile.name}</h3>
                        <p className="mt-1 text-sm text-gray-400">@{typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : profile.name.toLowerCase().replace(/\s+/g, '')}</p>
                    </div>

                    {/* Share Options Carousel */}
                    <div className="w-full overflow-x-auto pb-4 no-scrollbar">
                        <div className="flex space-x-6 px-4 min-w-max">
                            <ShareOption
                                icon={<Copy className="h-6 w-6" />}
                                label="Copy Link"
                                onClick={handleCopyLink}
                            />
                            <ShareOption
                                icon={<SocialIcon network="x" className="h-10 w-10" fgColor="white" />}
                                label="X"
                                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                            />
                            <ShareOption
                                icon={<SocialIcon network="facebook" className="h-10 w-10" fgColor="white" />}
                                label="Facebook"
                                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                            />
                            <ShareOption
                                icon={<SocialIcon network="instagram" className="h-10 w-10" fgColor="white" />}
                                label="Instagram"
                                onClick={handleCopyLink}
                            />
                            <ShareOption
                                icon={<SocialIcon network="linkedin" className="h-10 w-10" fgColor="white" />}
                                label="LinkedIn"
                                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
                            />
                            <ShareOption
                                icon={<SocialIcon network="email" className="h-10 w-10" fgColor="white" />}
                                label="Email"
                                href={`mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(shareUrl)}`}
                            />
                            <ShareOption
                                icon={<SocialIcon network="snapchat" className="h-10 w-10" fgColor="white" />}
                                label="Snapchat"
                                href={`https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(shareUrl)}`}
                            />
                            <ShareOption
                                icon={<SocialIcon network="whatsapp" className="h-10 w-10" fgColor="white" />}
                                label="WhatsApp"
                                href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`}
                            />
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="w-full border-t border-white/10 pt-6 text-center">
                        <h3 className="text-lg font-bold text-white">Join {profile.name} on BizTree</h3>
                        <p className="mt-1 text-sm text-gray-400 px-4">
                            Get your own free BizTree. The only link in bio trusted by businesses.
                        </p>
                        <div className="mt-6 flex gap-3 px-4">
                            <a href="https://biztree.bio/register" className="flex-1 rounded-full bg-white py-3 text-sm font-bold text-black transition-transform active:scale-95 hover:bg-gray-200">
                                Sign up free
                            </a>
                            <a href="https://biztree.bio" className="flex-1 rounded-full border border-white/20 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10">
                                Find out more
                            </a>
                        </div>
                    </div>
                </div>
            </BottomSheet>

            {/* BizTree CTA Modal */}
            <BottomSheet
                isOpen={activeModal === "biztree"}
                onClose={() => setActiveModal("none")}
                className="bg-[#007AFF]" // Brand Blue
            >
                <div className="flex flex-col items-center space-y-6 pb-8 text-center text-white">
                    <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-lg">
                        <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M256 384V128" stroke="#007AFF" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M256 320L160 224" stroke="#007AFF" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M256 256L352 160" stroke="#007AFF" strokeWidth="32" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="160" cy="224" r="24" fill="#007AFF" />
                            <circle cx="352" cy="160" r="24" fill="#007AFF" />
                            <circle cx="256" cy="128" r="24" fill="#007AFF" />
                            <circle cx="256" cy="384" r="24" fill="#007AFF" />
                        </svg>
                    </div>

                    <h2 className="text-3xl font-extrabold leading-tight tracking-tight">
                        Join the only link in bio trusted by businesses.
                    </h2>

                    <p className="text-lg font-medium opacity-90">
                        One link to share everything you create, curate and sell.
                    </p>

                    <div className="w-full space-y-3">
                        <div className="relative flex items-center justify-center rounded-xl bg-white p-1 shadow-sm">
                            <div className="flex w-full items-center justify-center px-3">
                                <input
                                    type="text"
                                    placeholder="yourname"
                                    className="min-w-0 flex-1 border-none bg-transparent p-3 text-right text-lg font-semibold text-black placeholder-gray-300 focus:ring-0"
                                />
                                <span className="flex-none pl-1 text-lg font-medium text-gray-400">.biztree.bio</span>
                            </div>
                        </div>
                        <a href="/register" className="block w-full rounded-xl bg-white py-4 text-lg font-bold text-[#007AFF] transition-transform active:scale-95 hover:bg-gray-50 text-center">
                            Claim your BizTree
                        </a>
                    </div>

                    <div className="pt-4">
                        <a href="https://biztree.bio" className="text-sm font-semibold underline decoration-2 underline-offset-4 opacity-80 hover:opacity-100">
                            Find out more
                        </a>
                    </div>
                </div>
            </BottomSheet>
        </>
    );
}

function ShareOption({ icon, label, onClick, href }: { icon: React.ReactNode, label: string, onClick?: () => void, href?: string }) {
    const content = (
        <div className="flex flex-col items-center space-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20">
                {icon}
            </div>
            <span className="text-xs font-medium text-gray-400">{label}</span>
        </div>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block">
                {content}
            </a>
        );
    }

    return (
        <button onClick={onClick} className="block w-full">
            {content}
        </button>
    );
}
