"use client";

import React, { useState, useEffect } from "react";
import * as LucideIcons from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
    id: string;
    label: string;
    icon: string;
}

export default function SettingsSidebar() {
    const [navItems, setNavItems] = useState<NavItem[]>([]);
    const [activeSection, setActiveSection] = useState("");

    // Auto-detect sections from DOM
    useEffect(() => {
        const detectSections = () => {
            const sections = document.querySelectorAll('[data-section]');
            const items: NavItem[] = Array.from(sections).map(section => ({
                id: section.id,
                label: section.getAttribute('data-section-label') || section.id,
                icon: section.getAttribute('data-section-icon') || 'Settings'
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

    const activeIndex = navItems.findIndex(item => item.id === activeSection);
    // Each button is py-2.5 (10px top + 10px bottom = 20px) + text height (~16px) = ~36px total
    // Plus space-y-1 (4px gap) between items
    // So each item takes up approximately 40px (36px + 4px gap)
    // To center the 24px indicator: (40px - 24px) / 2 = 8px offset

    return (
        <nav className="relative">
            {/* Active indicator line */}
            <div
                className="absolute left-0 w-1 bg-blue-600 rounded-full transition-all duration-300 ease-out"
                style={{
                    top: `${activeIndex * 40 + 8}px`, // 40px per item + 8px to center the 24px bar
                    height: "24px"
                }}
            />

            {/* Navigation items */}
            <ul className="space-y-1 pl-4">
                {navItems.map((item) => {
                    const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Settings;
                    const isActive = activeSection === item.id;

                    return (
                        <li key={item.id}>
                            <button
                                onClick={() => scrollToSection(item.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 text-left group",
                                    isActive
                                        ? "text-blue-600 font-medium"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                                )}
                            >
                                <IconComponent
                                    className={cn(
                                        "w-4 h-4 transition-all duration-200",
                                        isActive
                                            ? "text-blue-600"
                                            : "text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                                    )}
                                />
                                <span className="text-sm">{item.label}</span>
                            </button>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
