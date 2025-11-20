import React from "react";
import { cn } from "@/lib/utils";

interface MuiCardProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
    subtitle?: string;
    action?: React.ReactNode;
}

export const MuiCard = React.forwardRef<HTMLDivElement, MuiCardProps>(
    ({ className, title, subtitle, action, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden",
                    className
                )}
                {...props}
            >
                {(title || action) && (
                    <div className="px-6 pt-6 pb-4 flex justify-between items-start">
                        <div>
                            {title && <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100">{title}</h3>}
                            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
                        </div>
                        {action && <div>{action}</div>}
                    </div>
                )}
                <div className="px-6 pb-6">
                    {children}
                </div>
            </div>
        );
    }
);

MuiCard.displayName = "MuiCard";
