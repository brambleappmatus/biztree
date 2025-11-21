import { Loader2 } from "lucide-react";

export default function AdminLoading() {
    return (
        <div className="h-full w-full flex items-center justify-center min-h-[400px]">
            <div className="flex flex-col items-center gap-3 text-gray-400 animate-in fade-in duration-500">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm font-medium">Načítavam...</p>
            </div>
        </div>
    );
}
