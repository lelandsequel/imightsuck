# Deploying to Vercel with Custom Domain

## Step 1: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Click "Add New Project"
4. Import your repository: `lelandsequel/imightsuck`
5. Vercel will auto-detect it's a static site
6. Click "Deploy"

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
cd "/Users/sokpyeon/Do I suck"
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? (select your account)
# - Link to existing project? No
# - Project name? imightsuck (or press enter)
# - Directory? ./
# - Override settings? No
```

## Step 2: Add Custom Domain

1. Go to your Vercel dashboard
2. Click on your project (`imightsuck`)
3. Go to **Settings** → **Domains**
4. Click **Add Domain**
5. Enter: `imightsuck.com`
6. Click **Add**

## Step 3: Configure DNS Records

Vercel will show you the DNS records you need to add. You'll need to add these at your domain registrar (where you bought `imightsuck.com`):

### For Root Domain (imightsuck.com):
Add an **A Record**:
- **Type**: A
- **Name**: @ (or leave blank)
- **Value**: `76.76.21.21` (Vercel's IP - check Vercel dashboard for current IP)
- **TTL**: 3600 (or default)

### For WWW Subdomain (www.imightsuck.com):
Add a **CNAME Record**:
- **Type**: CNAME
- **Name**: www
- **Value**: `cname.vercel-dns.com` (or what Vercel shows you)
- **TTL**: 3600 (or default)

## Step 4: Wait for DNS Propagation

- DNS changes can take 24-48 hours to propagate globally
- Usually works within a few minutes to a few hours
- You can check propagation status at: https://www.whatsmydns.net

## Step 5: SSL Certificate

Vercel automatically provisions SSL certificates via Let's Encrypt once DNS is configured correctly. This usually happens automatically within a few minutes after DNS propagates.

## Troubleshooting

### If domain doesn't work:
1. Check DNS records are correct at your registrar
2. Wait for DNS propagation (can take up to 48 hours)
3. Check Vercel dashboard for any errors
4. Make sure domain is verified in Vercel

### Common DNS Providers:
- **Namecheap**: Go to Domain List → Manage → Advanced DNS
- **GoDaddy**: Go to My Products → DNS → Records
- **Google Domains**: Go to DNS → Custom records
- **Cloudflare**: Go to DNS → Records

## After Setup

Your site will be available at:
- `https://imightsuck.com`
- `https://www.imightsuck.com`

Both will work automatically!

