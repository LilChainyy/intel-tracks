# Step-by-Step Vercel Deployment Guide

## Prerequisites
- A GitHub account (or GitLab/Bitbucket)
- A Vercel account (sign up at https://vercel.com)
- Your Supabase credentials ready

## Step 1: Prepare Your Code

✅ **Already done:**
- `vercel.json` configuration file created
- Vite config cleaned up (removed Lovable dependencies)

## Step 2: Push to GitHub

If your code isn't already in a Git repository:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Vercel deployment"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com/dashboard
   - Sign in or create an account

2. **Import Your Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository: `intel-tracks`

3. **Configure Project Settings**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (should auto-fill)
   - **Output Directory:** `dist` (should auto-fill)
   - **Install Command:** `npm install` (should auto-fill)

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   - **Name:** `VITE_SUPABASE_URL`
     **Value:** Your Supabase project URL
   - **Name:** `VITE_SUPABASE_PUBLISHABLE_KEY`
     **Value:** Your Supabase anon/public key

   ⚠️ **Important:** Make sure to add these for all environments:
   - Production
   - Preview
   - Development

5. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete (usually 1-2 minutes)

### Option B: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```
   
   Follow the prompts:
   - Link to existing project? **No** (first time)
   - Project name: **intel-tracks** (or your preferred name)
   - Directory: **./** (default)
   - Override settings? **No** (default)

4. **Add Environment Variables**
   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_PUBLISHABLE_KEY
   ```
   
   Enter your values when prompted.

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

## Step 4: Verify Deployment

1. **Check Build Logs**
   - Go to your project dashboard on Vercel
   - Check the "Deployments" tab
   - Click on the latest deployment to see build logs

2. **Test Your App**
   - Visit the deployment URL (e.g., `https://your-project.vercel.app`)
   - Test all routes:
     - `/` (landing page)
     - `/home`
     - `/stocks`
     - `/saved`
   - Verify Supabase connection works

## Step 5: Configure Custom Domain (Optional)

1. **Add Domain**
   - Go to Project Settings → Domains
   - Add your custom domain
   - Follow DNS configuration instructions

2. **Update Environment Variables**
   - If your Supabase project has redirect URLs configured, add your Vercel domain to allowed redirect URLs in Supabase dashboard

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version (Vercel uses Node 18.x by default)

### Environment Variables Not Working
- Make sure variables start with `VITE_` prefix
- Redeploy after adding environment variables
- Check that variables are added to all environments (Production, Preview, Development)

### Routes Not Working (404 errors)
- Verify `vercel.json` is in the root directory
- Check that `rewrites` configuration is correct
- Ensure React Router is configured correctly

### Supabase Connection Issues
- Verify environment variables are set correctly
- Check Supabase project settings
- Ensure CORS is configured in Supabase if needed

## Next Steps

- Set up automatic deployments (already enabled by default when connected to GitHub)
- Configure preview deployments for pull requests
- Set up monitoring and analytics
- Configure edge functions if needed (for Supabase Edge Functions)

## Useful Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Remove a deployment
vercel rm <deployment-url>
```
