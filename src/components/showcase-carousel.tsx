"use client";

import React, { useState, useEffect } from "react";
import Tilt from "react-parallax-tilt";
import { ExternalLink, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextRoll } from "@/components/motion-primitives/text-roll";
import { AnimatePresence, motion } from "framer-motion";

interface ShowcaseLayer {
    id: string;
    imageUrl: string;
    depth: number;
    order: number;
}

interface Showcase {
    id: string;
    name: string;
    imageUrl: string;
    profileUrl: string;
    layers?: ShowcaseLayer[];
}

interface ShowcaseCarouselProps {
    showcases: Showcase[];
    autoPlayInterval?: number;
}

export default function ShowcaseCarousel({
    showcases,
    autoPlayInterval = 5000
}: ShowcaseCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    if (showcases.length === 0) {
        return (
            <div className="text-center py-12 text-gray-500">
                <p>Žiadne ukážky zatiaľ nie sú k dispozícii.</p>
            </div>
        );
    }

    // Auto-play carousel
    useEffect(() => {
        if (isHovered || showcases.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % showcases.length);
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isHovered, showcases.length, autoPlayInterval]);

    const goToNext = () => {
        setCurrentIndex((prev) => (prev + 1) % showcases.length);
    };

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev - 1 + showcases.length) % showcases.length);
    };

    const currentShowcase = showcases[currentIndex];

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4 py-12">
            {/* Two-column layout: Phone on left, Content on right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

                {/* Left Column: Tilted Phone - Takes up 5 columns, positioned more to the left */}
                <div
                    className="lg:col-span-5 relative flex items-center justify-start"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    {/* Default tilt wrapper - rotated to look left */}
                    <div
                        className="relative"
                        style={{
                            transform: 'perspective(1000px) rotateY(-15deg) rotateX(5deg)',
                            transformStyle: 'preserve-3d'
                        }}
                    >
                        <Tilt
                            tiltMaxAngleX={10}
                            tiltMaxAngleY={10}
                            perspective={1000}
                            scale={1.02}
                            transitionSpeed={2500}
                            gyroscope={false}
                            glareEnable={true}
                            glareMaxOpacity={0.1}
                            glareColor="#ffffff"
                            glarePosition="all"
                            tiltReverse={true}
                            className="cursor-pointer"
                        >
                            <button
                                onClick={() => window.open(currentShowcase.profileUrl, '_blank')}
                                className="relative block"
                            >
                                {/* iPhone Frame - Smaller size */}
                                <div
                                    className="relative bg-gray-900 rounded-[2.5rem] p-2.5 shadow-2xl transition-all duration-500"
                                    style={{
                                        width: '280px',
                                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)'
                                    }}
                                >
                                    {/* Notch */}
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-5 bg-gray-900 rounded-b-xl z-10"></div>

                                    {/* Screen with Parallax Layers */}
                                    <div
                                        className="relative bg-white rounded-[2rem] overflow-hidden aspect-[9/19]"
                                        style={{ transformStyle: 'preserve-3d' }}
                                    >
                                        {/* Base Image */}
                                        {currentShowcase.imageUrl && (
                                            <div
                                                className="absolute inset-0 w-full h-full"
                                                style={{ transform: 'translateZ(0px)' }}
                                            >
                                                <img
                                                    src={currentShowcase.imageUrl}
                                                    alt={currentShowcase.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        )}

                                        {/* Parallax Layers */}
                                        {currentShowcase.layers && currentShowcase.layers
                                            .sort((a, b) => a.order - b.order)
                                            .map((layer) => (
                                                <div
                                                    key={layer.id}
                                                    className="absolute inset-0 w-full h-full pointer-events-none"
                                                    style={{
                                                        transform: `translateZ(${layer.depth * 2}px)`,
                                                        zIndex: layer.order + 10,
                                                    }}
                                                >
                                                    <img
                                                        src={layer.imageUrl}
                                                        alt={`Layer ${layer.order}`}
                                                        className="w-full h-full object-contain"
                                                    />
                                                </div>
                                            ))
                                        }

                                        {/* Placeholder */}
                                        {!currentShowcase.imageUrl && (
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
                                                <div className="text-center text-gray-300">
                                                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full"></div>
                                                    <div className="w-24 h-2 bg-gray-100 rounded mb-1.5 mx-auto"></div>
                                                    <div className="w-16 h-2 bg-gray-100 rounded mx-auto"></div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        </Tilt>
                    </div>
                </div>

                {/* Right Column: Info & CTA - Takes up 7 columns */}
                <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-wide">
                        ✨ Ukážka
                    </div>

                    {/* Showcase Name with Text Roll Animation */}
                    <div className="space-y-3">
                        <div className="h-12 overflow-hidden"> {/* Fixed height container to prevent layout shifts */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentShowcase.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.1 }} // Fast fade for container
                                >
                                    <h3 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                        <TextRoll
                                            duration={0.5}
                                            getEnterDelay={(i) => i * 0.05} // Faster stagger
                                            transition={{ ease: 'circOut' }}
                                        >
                                            {currentShowcase.name}
                                        </TextRoll>
                                    </h3>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.p
                                key={`desc-${currentShowcase.id}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3, delay: 0.1 }}
                                className="text-lg text-gray-600"
                            >
                                Pozrite si, ako môže vyzerať vaša profesionálna stránka
                            </motion.p>
                        </AnimatePresence>
                    </div>

                    {/* CTA Buttons */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`cta-${currentShowcase.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3, delay: 0.2 }}
                            className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start"
                        >
                            <button
                                onClick={() => window.open(currentShowcase.profileUrl, '_blank')}
                                className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-full text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-xl hover:scale-105 active:scale-95 gap-2"
                            >
                                Otvoriť demo <ExternalLink size={18} />
                            </button>
                            <a
                                href="/register"
                                className="inline-flex items-center justify-center bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-full text-base font-semibold hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 gap-2"
                            >
                                Vytvoriť vlastnú <ArrowRight size={18} />
                            </a>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Controls */}
                    {showcases.length > 1 && (
                        <div className="flex items-center gap-4 justify-center lg:justify-start pt-4">
                            {/* Arrows */}
                            <div className="flex gap-2">
                                <button
                                    onClick={goToPrevious}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-full transition-all hover:scale-110 active:scale-95"
                                    aria-label="Previous showcase"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-900 p-2 rounded-full transition-all hover:scale-110 active:scale-95"
                                    aria-label="Next showcase"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>

                            {/* Dots */}
                            <div className="flex gap-2">
                                {showcases.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={cn(
                                            "w-2 h-2 rounded-full transition-all duration-300",
                                            index === currentIndex
                                                ? "bg-blue-600 w-8"
                                                : "bg-gray-300 hover:bg-gray-400"
                                        )}
                                        aria-label={`Go to showcase ${index + 1}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
