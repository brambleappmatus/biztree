-- 1. Check if the table exists and get the count of posts
SELECT count(*) as total_posts FROM "BlogPost";

-- 2. Insert a test post to verify the table structure and permissions
-- This uses ON CONFLICT to avoid errors if you run it multiple times
INSERT INTO "BlogPost" (
    "id",
    "title",
    "slug",
    "excerpt",
    "content",
    "isPublished",
    "publishedAt",
    "updatedAt"
) VALUES (
    'test-post-id-1',
    'Hello World - Test Post',
    'hello-world-test',
    'This is a test post to verify the blog system is working correctly.',
    '<h1>Welcome!</h1><p>If you can see this, your blog database table is correctly set up.</p>',
    true,
    NOW(),
    NOW()
) ON CONFLICT ("slug") DO NOTHING;

-- 3. Retrieve the test post to confirm it was saved
SELECT id, title, slug, isPublished FROM "BlogPost" WHERE slug = 'hello-world-test';
