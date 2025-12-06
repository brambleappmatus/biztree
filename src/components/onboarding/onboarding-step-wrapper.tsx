"use client";

import { ReactNode, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { ChevronLeft, ChevronRight, SkipForward } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { MuiButton } from "@/components/ui/mui-button";

interface OnboardingStepWrapperProps {
    steps: {
        id: string;
        title: string;
        component: ReactNode;
        isValid?: boolean;
        isRequired?: boolean; // NEW: Mark required steps
    }[];
    currentStep: number;
    onStepChange: (step: number) => void;
    onComplete: () => void;
    onSkip?: () => void; // NEW: Skip callback
    preview?: ReactNode;
    loading?: boolean;
}

export function OnboardingStepWrapper({
    steps,
    currentStep,
    onStepChange,
    onComplete,
    onSkip,
    preview,
    loading = false
}: OnboardingStepWrapperProps) {
    const [direction, setDirection] = useState<'left' | 'right'>('right');

    const currentStepData = steps[currentStep];
    const canGoNext = currentStep < steps.length - 1 && (currentStepData.isValid ?? true);
    const canGoPrev = currentStep > 0;
    const isLastStep = currentStep === steps.length - 1;
    const canSkip = !currentStepData.isRequired && !isLastStep && onSkip;

    const handleNext = () => {
        if (canGoNext) {
            setDirection('right');
            onStepChange(currentStep + 1);
        } else if (isLastStep) {
            onComplete();
        }
    };

    const handlePrev = () => {
        if (canGoPrev) {
            setDirection('left');
            onStepChange(currentStep - 1);
        }
    };

    const handleSkip = () => {
        if (canSkip && onSkip) {
            setDirection('right');
            onSkip();
        }
    };

    const handlers = useSwipeable({
        onSwipedLeft: () => handleNext(),
        onSwipedRight: () => handlePrev(),
        trackMouse: false,
        preventScrollOnSwipe: true,
    });

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            {/* Left Side - Steps */}
            <div className="w-full lg:w-3/5 flex flex-col">
                {/* Progress Bar */}
                <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 px-4 py-4">
                    <div className="max-w-2xl mx-auto">
                        {/* Progress Dots */}
                        <div className="flex items-center justify-between mb-2">
                            {steps.map((step, index) => (
                                <div key={step.id} className="flex items-center flex-1">
                                    <button
                                        onClick={() => {
                                            if (index < currentStep || (steps[index].isValid ?? true)) {
                                                setDirection(index > currentStep ? 'right' : 'left');
                                                onStepChange(index);
                                            }
                                        }}
                                        className={cn(
                                            "relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all",
                                            index === currentStep
                                                ? "bg-blue-600 text-white scale-110 shadow-lg shadow-blue-500/30"
                                                : index < currentStep
                                                    ? "bg-green-500 text-white"
                                                    : "bg-gray-200 dark:bg-gray-700 text-gray-500"
                                        )}
                                    >
                                        {index + 1}
                                        {/* Required indicator */}
                                        {step.isRequired && index >= currentStep && (
                                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                    </button>
                                    {index < steps.length - 1 && (
                                        <div className={cn(
                                            "flex-1 h-1 mx-1 rounded-full transition-all",
                                            index < currentStep ? "bg-green-500" : "bg-gray-200 dark:bg-gray-700"
                                        )} />
                                    )}
                                </div>
                            ))}
                        </div>
                        {/* Step Title */}
                        <div className="text-center">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {currentStepData.title}
                                {!currentStepData.isRequired && (
                                    <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(optional)</span>
                                )}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Krok {currentStep + 1} z {steps.length}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Step Content */}
                <div className="flex-1 overflow-y-auto">
                    <div {...handlers} className="min-h-full">
                        <div className="max-w-2xl mx-auto p-6 lg:p-12">
                            {/* Animated Step Container with Framer Motion */}
                            <AnimatePresence mode="wait" custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    initial={{ opacity: 0, x: direction === 'right' ? 50 : -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: direction === 'right' ? -50 : 50 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                >
                                    {currentStepData.component}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="sticky bottom-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-t border-gray-200 dark:border-gray-800 px-4 py-4">
                    <div className="max-w-2xl mx-auto">
                        {/* Skip button for optional steps */}
                        {canSkip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center mb-3"
                            >
                                <button
                                    onClick={handleSkip}
                                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 inline-flex items-center gap-1 transition-colors"
                                >
                                    <SkipForward className="w-4 h-4" />
                                    Skip for now
                                </button>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    You can complete this later in settings
                                </p>
                            </motion.div>
                        )}

                        <div className="flex gap-3">
                            {canGoPrev && (
                                <MuiButton
                                    variant="outlined"
                                    onClick={handlePrev}
                                    startIcon={<ChevronLeft size={18} />}
                                    className="flex-1"
                                >
                                    Späť
                                </MuiButton>
                            )}
                            <MuiButton
                                onClick={handleNext}
                                disabled={!canGoNext && !isLastStep}
                                loading={loading}
                                endIcon={!isLastStep ? <ChevronRight size={18} /> : undefined}
                                className={cn("flex-1", !canGoPrev && "w-full")}
                            >
                                {isLastStep ? "Dokončiť" : "Ďalej"}
                            </MuiButton>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Preview (Desktop Only) */}
            {preview && (
                <div className="hidden lg:block lg:w-2/5 bg-gray-100 dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 sticky top-0 h-screen overflow-hidden">
                    {preview}
                </div>
            )}
        </div>
    );
}
