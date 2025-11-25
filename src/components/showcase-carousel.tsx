"use client";

import React, { useState, useEffect } from "react";
import Tilt from "react-parallax-tilt";
import { ExternalLink, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
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
    autoPlayInterval = 10000
}: ShowcaseCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [direction, setDirection] = useState(0); // 1 for next, -1 for previous

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
            if (!document.hidden) {
                setDirection(1);
                setCurrentIndex((prev) => (prev + 1) % showcases.length);
            }
        }, autoPlayInterval);

        return () => clearInterval(interval);
    }, [isHovered, showcases.length, autoPlayInterval]);

    const goToNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % showcases.length);
    };

    const goToPrevious = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + showcases.length) % showcases.length);
    };

    const goToIndex = (index: number) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const currentShowcase = showcases[currentIndex];

    // Slide variants for smooth horizontal transitions
    const slideVariants = {
        enter: (direction: number) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.95
        }),
        center: {
            x: 0,
            opacity: 1,
            scale: 1
        },
        exit: (direction: number) => ({
            x: direction > 0 ? -300 : 300,
            opacity: 0,
            scale: 0.95
        })
    };

    return (
        <div className="relative w-full max-w-7xl mx-auto px-4 py-8">
            {/* Modern card-based layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Left Column: Phone Mockup */}
                <div
                    className="relative flex items-center justify-center lg:justify-start"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <Tilt
                        tiltMaxAngleX={8}
                        tiltMaxAngleY={8}
                        perspective={1200}
                        scale={1.03}
                        transitionSpeed={2000}
                        gyroscope={false}
                        glareEnable={true}
                        glareMaxOpacity={0.15}
                        glareColor="#ffffff"
                        glarePosition="all"
                        className="cursor-pointer"
                        style={{ transformStyle: "preserve-3d" }}
                    >
                        <button
                            onClick={() => window.open(currentShowcase.profileUrl, '_blank')}
                            className="relative block group"
                            style={{ transformStyle: "preserve-3d" }}
                        >
                            {/* iPhone Frame */}
                            <div
                                className="relative bg-gray-900 rounded-[3rem] p-3 shadow-2xl transition-all duration-500 group-hover:shadow-blue-500/20"
                                style={{
                                    width: '320px',
                                    boxShadow: '0 30px 60px -15px rgba(0, 0, 0, 0.5)',
                                    transformStyle: "preserve-3d"
                                }}
                            >
                                {/* Notch */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-gray-900 rounded-b-2xl z-10"></div>

                                {/* Screen Area with Slide Animation */}
                                <div
                                    className="relative w-full aspect-[9/19]"
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    <AnimatePresence mode="wait" custom={direction}>
                                        <motion.div
                                            key={currentShowcase.id}
                                            custom={direction}
                                            variants={slideVariants}
                                            initial="enter"
                                            animate="center"
                                            exit="exit"
                                            transition={{
                                                x: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.3 },
                                                scale: { duration: 0.3 }
                                            }}
                                            className="absolute inset-0 w-full h-full"
                                            style={{ transformStyle: 'preserve-3d' }}
                                        >
                                            {/* Clipped Base Screen (Background) */}
                                            <div className="absolute inset-0 bg-white rounded-[2.5rem] overflow-hidden">
                                                {/* Base Image */}
                                                {currentShowcase.imageUrl && (
                                                    <div className="absolute inset-0 w-full h-full">
                                                        <img
                                                            src={currentShowcase.imageUrl}
                                                            alt={currentShowcase.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                )}

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

                                            {/* Floating Parallax Layers (Unclipped) - These float ABOVE the base screen */}
                                            {currentShowcase.layers && currentShowcase.layers
                                                .sort((a, b) => a.order - b.order)
                                                .map((layer) => (
                                                    <div
                                                        key={layer.id}
                                                        className="absolute inset-0 w-full h-full pointer-events-none rounded-[2.5rem]"
                                                        style={{
                                                            transform: `translateZ(${layer.depth * 5}px)`,
                                                            zIndex: layer.order + 10,
                                                            transformStyle: 'preserve-3d'
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
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Hover overlay */}
                                <div className="absolute inset-0 rounded-[3rem] bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-300 pointer-events-none" />
                            </div>
                        </button>
                    </Tilt>
                </div>

                {/* Right Column: Content */}
                <div className="space-y-6 text-center lg:text-left">
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100 text-blue-700 text-sm font-semibold"
                    >
                        ✨ Ukážka profesionálnej stránky
                    </motion.div>

                    {/* Showcase Name with Slide Animation */}
                    <div className="overflow-hidden">
                        <AnimatePresence mode="wait" custom={direction}>
                            <motion.h3
                                key={currentShowcase.id}
                                custom={direction}
                                initial={{ x: direction > 0 ? 100 : -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: direction > 0 ? -100 : 100, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-700 to-gray-900 bg-clip-text text-transparent"
                            >
                                {currentShowcase.name}
                            </motion.h3>
                        </AnimatePresence>
                    </div>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg text-gray-600 leading-relaxed max-w-xl mx-auto lg:mx-0"
                    >
                        Pozrite si, ako môže vyzerať vaša profesionálna stránka s BizTree
                    </motion.p>

                    {/* CTA Buttons */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                    >
                        <button
                            onClick={() => window.open(currentShowcase.profileUrl, '_blank')}
                            className="inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl text-base font-semibold hover:from-blue-700 hover:to-blue-800 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:scale-105 active:scale-95 gap-2"
                        >
                            Otvoriť demo <ExternalLink size={18} />
                        </button>
                        <a
                            href="/register"
                            className="inline-flex items-center justify-center bg-white text-blue-600 border-2 border-blue-200 px-8 py-4 rounded-xl text-base font-semibold hover:border-blue-300 hover:bg-blue-50 transition-all hover:scale-105 active:scale-95 gap-2"
                        >
                            Vytvoriť vlastnú <ArrowRight size={18} />
                        </a>
                    </motion.div>

                    {/* Navigation Controls */}
                    {showcases.length > 1 && (
                        <div className="flex items-center gap-6 justify-center lg:justify-start pt-4">
                            {/* Arrows */}
                            <div className="flex gap-3">
                                <button
                                    onClick={goToPrevious}
                                    className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900 p-3 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm"
                                    aria-label="Previous showcase"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={goToNext}
                                    className="bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 text-gray-900 p-3 rounded-xl transition-all hover:scale-110 active:scale-95 shadow-sm"
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
                                        onClick={() => goToIndex(index)}
                                        className={cn(
                                            "rounded-full transition-all duration-300",
                                            index === currentIndex
                                                ? "bg-blue-600 w-10 h-2.5"
                                                : "bg-gray-300 hover:bg-gray-400 w-2.5 h-2.5"
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
