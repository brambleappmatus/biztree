"use client";

import React, { useState, useEffect, useRef } from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    id: string;
    label: string;
    icon: string;
    featureKey?: string;
}

export default function SettingsSidebar() {
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [activeSection, setActiveSection] = useState("");
    const [indicatorStyle, setIndicatorStyle] = useState({ top: 0, height: 0, opacity: 0 });
    const [unlockedFeatures, setUnlockedFeatures] = useState<string[] | null>(null);
    const itemsRef = useRef<Map<string, HTMLButtonElement>>(new Map());

    // Fetch user features
    useEffect(() => {
        const fetchFeatures = async () => {
            try {
                const response = await fetch("/api/user/features");
                if (response.ok) {
                    const data = await response.json();
                    setUnlockedFeatures(data.features || []);
                }
            } catch (error) {
                console.error("Failed to fetch features:", error);
            }
        };
        fetchFeatures();
    }, []);

    // Auto-detect sections from DOM
    useEffect(() => {
        const detectSections = () => {
            const sections = document.querySelectorAll('[data-section]');
            const items: NavItem[] = Array.from(sections).map(section => ({
                id: section.id,
                label: section.getAttribute('data-section-label') || section.id,
                icon: section.getAttribute('data-section-icon') || 'Settings',
                featureKey: section.getAttribute('data-feature-key') || undefined
            }));
            setNavItems(items);
            if (items.length > 0 && !activeSection) {
                setActiveSection(items[0].id);
            }
        };

        // Detect sections after a short delay to ensure DOM is ready
        const timer = setTimeout(detectSections, 100);
        return () => clearTimeout(timer);
    }, []);

    // Handle scroll to update active section using Intersection Observer for smoother detection
    useEffect(() => {
        if (navItems.length === 0) return;

        const observerOptions = {
            root: null,
            rootMargin: '-20% 0px -70% 0px', // More forgiving detection area
            threshold: 0
        };

        const observerCallback = (entries: IntersectionObserverEntry[]) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const sectionId = entry.target.id;
                    setActiveSection(sectionId);
                }
            });
        };

        const observer = new IntersectionObserver(observerCallback, observerOptions);

        // Observe all sections
        navItems.forEach((item) => {
            const element = document.getElementById(item.id);
            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
        };
    }, [navItems]);

    // Update indicator position
    useEffect(() => {
        if (!activeSection) return;

        const activeItem = itemsRef.current.get(activeSection);
        if (activeItem) {
            setIndicatorStyle({
                top: activeItem.offsetTop + (activeItem.offsetHeight - 24) / 2, // Center the 24px indicator
                height: 24,
                opacity: 1
            });
        }
    }, [activeSection, navItems]);

    const scrollToSection = (sectionId: string) => {
        const element = document.getElementById(sectionId);
        if (element) {
            const offset = 100; // Offset from top
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth"
            });
        }
    };

    if (navItems.length === 0) return null;

    return (
        <nav className="relative">
            {/* Active indicator line */}
            <div
                className="absolute left-0 w-1 bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{
                    top: `${indicatorStyle.top}px`,
                    height: `${indicatorStyle.height}px`,
                    opacity: indicatorStyle.opacity
                }}
            />

            {/* Navigation items */}
            <ul className="space-y-1 pl-4">
                {navItems.map((item) => {
                    const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Settings;
                    const isActive = activeSection === item.id;
                    const isLocked = item.featureKey && unlockedFeatures && !unlockedFeatures.includes(item.featureKey);

                    return (
                        <li key={item.id}>
                            <button
                                ref={(el) => {
                                    if (el) itemsRef.current.set(item.id, el);
                                }}
                                onClick={() => scrollToSection(item.id)}
                                className={cn(
                                    "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all duration-200 text-left group",
                                    isActive
                                        ? "text-blue-600 font-medium"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <IconComponent
                                        className={cn(
                                            "w-4 h-4 transition-all duration-200",
                                            isActive
                                                ? "text-blue-600"
                                                : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                        )}
                                    />
                                    <span className="text-sm">{item.label}</span>
                                </div>
                                {isLocked && (
                                    <LucideIcons.Lock className="w-3 h-3 text-gray-400 opacity-70" />
                                )}
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
