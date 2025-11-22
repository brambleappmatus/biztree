import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="min-h-[100dvh] w-full flex justify-center">
            <main className="w-full max-w-[480px] min-h-[100dvh] relative z-10 flex flex-col pb-8 pt-safe pb-safe p-4 space-y-6 opacity-0 animate-[fadeIn_0.8s_ease-in-out_1s_forwards]">
                {/* Profile Header Skeleton */}
                <div className="flex flex-col items-center space-y-4 mt-8">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="space-y-2 text-center w-full flex flex-col items-center">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="grid grid-cols-2 gap-3 w-full">
                    <Skeleton className="h-14 rounded-2xl" />
                    <Skeleton className="h-14 rounded-2xl" />
                </div>

                {/* Content Block Skeleton */}
                <Skeleton className="h-32 w-full rounded-2xl" />

                {/* Another Content Block Skeleton */}
                <Skeleton className="h-48 w-full rounded-2xl" />
            </main>
        </div>
    );
}
