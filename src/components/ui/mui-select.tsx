"use client";

import React, { SelectHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface MuiSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    error?: string;
    options: { value: string; label: string }[];
    containerClassName?: string;
}

export const MuiSelect = React.forwardRef<HTMLSelectElement, MuiSelectProps>(
    ({ className, containerClassName, label, error, options, onFocus, onBlur, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = value !== "" && value !== undefined && value !== null;

        return (
            <div className={cn("relative mb-4", containerClassName)}>
                <div
                    className={cn(
                        "relative flex items-center w-full rounded-t-lg border-b-2 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                        isFocused ? "border-blue-600 bg-gray-100 dark:bg-gray-800" : "border-gray-300 dark:border-gray-700",
                        error ? "border-red-500" : "",
                        className
                    )}
                >
                    <select
                        ref={ref}
                        className="peer w-full appearance-none bg-transparent px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none"
                        value={value}
                        onFocus={(e) => {
                            setIsFocused(true);
                            onFocus?.(e);
                        }}
                        onBlur={(e) => {
                            setIsFocused(false);
                            onBlur?.(e);
                        }}
                        {...props}
                    >
                        {options.map((opt) => (
                            <option key={opt.value} value={opt.value} className="bg-white dark:bg-gray-900">
                                {opt.label}
                            </option>
                        ))}
                    </select>
                    <label
                        className={cn(
                            "pointer-events-none absolute left-3 top-4 origin-[0] -translate-y-3 scale-75 transform text-gray-500 duration-200 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-blue-600 dark:text-gray-400 dark:peer-focus:text-blue-400",
                            (isFocused || hasValue) ? "-translate-y-3 scale-75" : ""
                        )}
                    >
                        {label}
                    </label>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

MuiSelect.displayName = "MuiSelect";
