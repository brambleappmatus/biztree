-- Check for the user by email
SELECT * FROM "User" WHERE email = 'biztreebio@gmail.com';

-- Check for any accounts linked to this user (if the user exists, replace USER_ID_HERE with the actual ID)
-- You can also join them directly:
SELECT a.* 
FROM "Account" a
JOIN "User" u ON u.id = a."userId"
WHERE u.email = 'biztreebio@gmail.com';

-- Check if there are any orphaned accounts (accounts with this email in the provider data, though NextAuth usually stores ID)
-- Note: ProviderAccountId is usually the Google ID, not email.

-- Check sessions for this user
SELECT s.* 
FROM "Session" s
JOIN "User" u ON u.id = s."userId"
WHERE u.email = 'biztreebio@gmail.com';
