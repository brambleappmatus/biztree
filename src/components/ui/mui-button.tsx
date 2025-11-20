import React, { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface MuiButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "contained" | "outlined" | "text";
    color?: "primary" | "secondary" | "danger";
    loading?: boolean;
    startIcon?: React.ReactNode;
}

export const MuiButton = React.forwardRef<HTMLButtonElement, MuiButtonProps>(
    ({ className, variant = "contained", color = "primary", loading, startIcon, children, disabled, ...props }, ref) => {

        const baseStyles = "relative overflow-hidden rounded-full px-6 py-2.5 text-sm font-medium uppercase tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

        const variants = {
            contained: {
                primary: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md shadow-sm",
                secondary: "bg-gray-200 text-gray-900 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600",
                danger: "bg-red-600 text-white hover:bg-red-700 hover:shadow-md shadow-sm",
            },
            outlined: {
                primary: "border border-blue-600 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                secondary: "border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800",
                danger: "border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
            },
            text: {
                primary: "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20",
                secondary: "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                danger: "text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20",
            }
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant][color], className)}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {!loading && startIcon}
                {children}
            </button>
        );
    }
);

MuiButton.displayName = "MuiButton";
