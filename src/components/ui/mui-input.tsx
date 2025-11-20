"use client";

import React, { InputHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface MuiInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    startIcon?: React.ReactNode;
    containerClassName?: string;
}

export const MuiInput = React.forwardRef<HTMLInputElement, MuiInputProps>(
    ({ className, containerClassName, label, error, startIcon, onFocus, onBlur, value, ...props }, ref) => {
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
                    {startIcon && (
                        <div className="pl-3 text-gray-500 dark:text-gray-400">
                            {startIcon}
                        </div>
                    )}
                    <input
                        ref={ref}
                        className={cn(
                            "peer w-full bg-transparent px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none placeholder-transparent",
                            startIcon ? "pl-2" : ""
                        )}
                        placeholder={label}
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
                    />
                    <label
                        className={cn(
                            "pointer-events-none absolute left-3 top-4 origin-[0] -translate-y-3 scale-75 transform text-gray-500 duration-200 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-3 peer-focus:scale-75 peer-focus:text-blue-600 dark:text-gray-400 dark:peer-focus:text-blue-400",
                            startIcon ? "left-9" : "",
                            (isFocused || hasValue) ? "-translate-y-3 scale-75" : ""
                        )}
                    >
                        {label}
                    </label>
                </div>
                {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
            </div>
        );
    }
);

MuiInput.displayName = "MuiInput";
