import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Initialize Supabase client with service role key for backend operations
// We initialize inside the handler to ensure env vars are loaded and to catch config errors
const createSupabaseClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("Initializing Supabase Client");
    console.log("URL exists:", !!supabaseUrl);
    console.log("Key exists:", !!supabaseKey);

    if (!supabaseUrl || !supabaseKey) {
        throw new Error("Missing Supabase environment variables");
    }

    return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: NextRequest) {
    console.log("Upload API called");
    try {
        const supabase = createSupabaseClient();

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            console.error("Upload failed: Unauthorized");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        console.log("User authenticated:", session.user.id);

        const formData = await request.formData();
        const file = formData.get("file") as File;
        const bucket = formData.get("bucket") as string || "avatars";

        console.log("File received:", file ? file.name : "No file", "Bucket:", bucket);

        if (!file) {
            console.error("Upload failed: No file uploaded");
            return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileExt = file.name.split(".").pop();
        const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Ensure bucket exists (create if missing)
        console.log("Checking/Creating bucket:", bucket);
        const { error: bucketErr } = await supabase.storage.createBucket(bucket, { public: true });

        if (bucketErr) {
            console.log("Bucket creation error (might exist):", bucketErr);
            // If creation failed, check if bucket actually exists
            const { error: getError } = await supabase.storage.getBucket(bucket);

            // If we can't get the bucket, then the creation failure was fatal
            if (getError) {
                console.error("Failed to create bucket and it does not exist:", bucketErr);
                return NextResponse.json({ error: `Bucket creation failed: ${bucketErr.message}` }, { status: 500 });
            }
            console.log("Bucket exists, proceeding.");
        }

        console.log("Uploading file to path:", filePath);
        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true,
            });

        if (error) {
            console.error("Supabase upload error:", error);
            // Ensure error message is a string
            const errorMessage = error.message || JSON.stringify(error);
            return NextResponse.json({ error: errorMessage }, { status: 500 });
        }

        console.log("Upload successful, getting public URL");
        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        console.log("Public URL generated:", publicUrl);
        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error("Upload handler error:", error);
        const errorMessage = error?.message || "Internal server error";
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
