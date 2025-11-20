import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize Supabase client with service role key for backend operations
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const bucket = formData.get("bucket") as string || "avatars";

        if (!file) {
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split(".").pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return NextResponse.json({ url: publicUrl });
    } catch (error) {
        console.error("Upload handler error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
