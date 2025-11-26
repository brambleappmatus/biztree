import React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
    title: string;
    description?: string;
    children?: React.ReactNode;
    className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
    return (
        <div className={cn("relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 dark:from-gray-800 dark:via-gray-900 dark:to-black text-white shadow-2xl mb-8", className)}>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative p-8 md:p-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2 max-w-3xl">
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                            {title}
                        </h1>
                        {description && (
                            <p className="text-lg text-gray-300 max-w-2xl">
                                {description}
                            </p>
                        )}
                    </div>
                    {children && (
                        <div className="flex items-center gap-3">
                            {children}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
