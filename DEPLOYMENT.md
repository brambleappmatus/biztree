# Environment Variables for Vercel Deployment

## Required Environment Variables

Add these to your Vercel project settings (Settings → Environment Variables):

### Database
```
DATABASE_URL=your_supabase_database_url_here
```
**Note:** Use the Session Pooler connection string (port 6543) with `?pgbouncer=true`

### NextAuth
```
NEXTAUTH_SECRET=your_generated_secret_here
NEXTAUTH_URL=https://your-domain.vercel.app
```

Generate a secret with:
```bash
openssl rand -base64 32
```

### Supabase (for file uploads)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Unsplash (optional - for background images)
```
UNSPLASH_ACCESS_KEY=your_unsplash_access_key
```

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository

3. **Configure Environment Variables**
   - Add all the environment variables listed above
   - Make sure to use the production values

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be available at `https://your-project.vercel.app`

## Post-Deployment

1. Update `NEXTAUTH_URL` to your actual Vercel domain
2. Configure custom domain (optional)
3. Set up Supabase storage buckets:
   - Create `avatars` bucket (public)
   - Configure CORS if needed

## Troubleshooting

- **Build fails**: Check that `DATABASE_URL` is set correctly
- **Auth not working**: Verify `NEXTAUTH_SECRET` and `NEXTAUTH_URL`
- **Images not loading**: Check Supabase credentials and bucket permissions
