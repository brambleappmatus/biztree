"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MuiSwitchProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
    disabled?: boolean;
    className?: string;
}

export function MuiSwitch({ checked, onChange, label, disabled = false, className }: MuiSwitchProps) {
    return (
        <label className={cn("inline-flex items-center gap-3 cursor-pointer", disabled && "opacity-50 cursor-not-allowed", className)}>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={disabled}
                onClick={() => !disabled && onChange(!checked)}
                className={cn(
                    "relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
                    checked ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-600",
                    disabled && "cursor-not-allowed"
                )}
            >
                <span
                    className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out"
                    style={{ transform: checked ? 'translateX(20px)' : 'translateX(0px)' }}
                />
            </button>
            {label && (
                <span className="text-sm text-gray-700 dark:text-gray-300 select-none">
                    {label}
                </span>
            )}
        </label>
    );
}
