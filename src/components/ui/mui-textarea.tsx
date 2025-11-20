"use client";

import React, { TextareaHTMLAttributes, useState } from "react";
import { cn } from "@/lib/utils";

interface MuiTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export const MuiTextArea = React.forwardRef<HTMLTextAreaElement, MuiTextAreaProps>(
    ({ className, label, error, onFocus, onBlur, value, ...props }, ref) => {
        const [isFocused, setIsFocused] = useState(false);
        const hasValue = value !== "" && value !== undefined && value !== null;

        return (
            <div className="relative mb-4">
                <div
                    className={cn(
                        "relative w-full rounded-t-lg border-b-2 bg-gray-50 dark:bg-gray-800/50 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
                        isFocused ? "border-blue-600 bg-gray-100 dark:bg-gray-800" : "border-gray-300 dark:border-gray-700",
                        error ? "border-red-500" : "",
                        className
                    )}
                >
                    <textarea
                        ref={ref}
                        className="peer w-full resize-none bg-transparent px-3 pt-5 pb-2 text-gray-900 dark:text-gray-100 outline-none placeholder-transparent"
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

MuiTextArea.displayName = "MuiTextArea";
