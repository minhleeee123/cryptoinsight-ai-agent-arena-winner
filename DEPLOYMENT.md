# 🚀 DEPLOYMENT GUIDE - Railway + Vercel

## 📦 Files Created

✅ `backend/.gitignore` - Ignore node_modules, dist, .env  
✅ `railway.toml` - Railway configuration  
✅ `.env.example` - Environment variables template  
✅ `backend/package.json` - Already exists with correct dependencies  
✅ `backend/tsconfig.json` - Already exists with correct config  

## 🔧 Files Updated

✅ `services/apiClient.ts` - Dynamic API URL from environment  
✅ `backend/server.ts` - CORS for Vercel domains  

---

## 🎯 DEPLOYMENT STEPS

### **STEP 1: Deploy Backend to Railway**

#### 1.1 Push code to GitHub
```bash
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

#### 1.2 Create Railway account
1. Go to https://railway.app
2. Sign up with GitHub
3. Grant access to your repository

#### 1.3 Create new project
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Choose `minhleeee123/for_hackathon_t12`

#### 1.4 Configure Railway
**⚠️ IMPORTANT:** Railway needs to know backend is in `backend/` folder

**Option A: Use railway.toml (Recommended - Already created)**
- Railway will automatically read `railway.toml` from root
- It's configured to point to backend directory

**Option B: Manual configuration**
If railway.toml doesn't work:
1. Go to project Settings
2. Find "Root Directory" or "Working Directory"
3. Set to: `backend`

#### 1.5 Set Environment Variables
1. Go to project → Variables
2. Add variable:
   - **Name:** `GOOGLE_API_KEY`
   - **Value:** Your Gemini API key (from https://makersuite.google.com/app/apikey)

#### 1.6 Deploy
- Railway will automatically:
  - Run `npm install` in backend/
  - Run `npm run build` (compile TypeScript)
  - Run `npm start` (start server)
  
#### 1.7 Get Backend URL
- After deployment succeeds
- Go to Settings → Domains
- Copy your URL: `https://your-app-name.up.railway.app`
- **Save this URL** - you'll need it for frontend

#### 1.8 Test Backend
```bash
curl https://your-app-name.up.railway.app/health
```
Expected response:
```json
{"status":"ok","service":"CryptoInsight Backend (IQ ADK)"}
```

---

### **STEP 2: Deploy Frontend to Vercel**

#### 2.1 Create Vercel account
1. Go to https://vercel.com
2. Sign up with GitHub
3. Grant access to your repository

#### 2.2 Import Project
1. Dashboard → "Add New Project"
2. Import Git Repository
3. Select `minhleeee123/for_hackathon_t12`

#### 2.3 Configure Build Settings
Vercel should auto-detect:
- **Framework Preset:** Vite
- **Root Directory:** `.` (leave empty = root)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

**⚠️ DO NOT set Root Directory to backend** - Vercel needs root for frontend

#### 2.4 Set Environment Variables
**CRITICAL:** Add before deploying
1. Go to project settings (or during import)
2. Environment Variables section
3. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-app-name.up.railway.app` (from Step 1.7)
   - **Environment:** Production, Preview, Development (select all)

#### 2.5 Deploy
- Click "Deploy"
- Vercel will build and deploy
- Wait for deployment to complete

#### 2.6 Get Frontend URL
- Copy your Vercel URL: `https://your-app.vercel.app`

#### 2.7 Test Frontend
1. Open `https://your-app.vercel.app` in browser
2. Open DevTools → Network tab
3. Try "Analyze Bitcoin"
4. Verify API calls go to Railway backend
5. Check for successful responses

---

## 🔍 VERIFICATION CHECKLIST

### Backend (Railway)
- [ ] Deployment successful
- [ ] `/health` endpoint returns 200 OK
- [ ] `GOOGLE_API_KEY` environment variable set
- [ ] No errors in Railway logs
- [ ] API endpoints accessible

### Frontend (Vercel)
- [ ] Deployment successful
- [ ] App loads in browser
- [ ] `VITE_API_URL` environment variable set correctly
- [ ] API calls reach Railway backend (check Network tab)
- [ ] No CORS errors
- [ ] Coin analysis works

---

## 🛠️ NIXPACKS / ROLLUP BUILD ISSUE (Fix applied)

If you see an error like:

```
Error: Cannot find module @rollup/rollup-linux-x64-gnu
```

This happens because Rollup may include optional, platform-native binaries that don't match the CI runtime. To avoid this during Nixpacks/CI builds we added a `.npmrc` with `optional=false`, which prevents npm from installing optional native binaries.

What we changed:
- Added `.npmrc` with `optional=false` at the repository root.

Alternative fixes (if you still see issues):
- In Railway/CI, set environment variable `NPM_CONFIG_OPTIONAL=false` for the build.
- Remove `package-lock.json` and `node_modules` locally, then run `npm install` on a Linux machine (or in WSL) and commit the regenerated `package-lock.json`.

Local recovery commands (run if you see the same error locally):
```powershell
# from repo root
rm -r node_modules package-lock.json
npm install
npm run build
```

If you prefer Railway to skip optional deps only for CI, set this env var in Railway project settings:
`NPM_CONFIG_OPTIONAL=false`


---

## 🚨 TROUBLESHOOTING

### Issue: Railway says "No package.json found"
**Solution:**
1. Check railway.toml exists in root
2. Verify it has `[deploy]` section with `startCommand`
3. Or manually set Root Directory to `backend` in Railway settings

### Issue: Railway build fails - "Cannot find module"
**Solution:**
1. Check `backend/package.json` has all dependencies
2. Make sure `@iqai/adk`, `express`, `cors`, `dotenv`, `zod` are in `dependencies` (not devDependencies)
3. Redeploy

### Issue: Railway deploys but crashes
**Solution:**
1. Check Railway logs (Dashboard → Deployments → View Logs)
2. Common issues:
   - Missing `GOOGLE_API_KEY` → Add in Variables
   - Port binding → Server should use `process.env.PORT` (already configured)
   - TypeScript errors → Run `npm run build` locally first

### Issue: Frontend can't connect to backend - CORS error
**Solution:**
1. Check `backend/server.ts` has correct CORS config (already updated)
2. Verify Vercel domain is `.vercel.app`
3. Check Railway logs for CORS errors
4. Redeploy backend after CORS changes

### Issue: Frontend shows "API call failed"
**Solution:**
1. Check `VITE_API_URL` in Vercel environment variables
2. Must be full URL: `https://your-app.up.railway.app` (no trailing slash)
3. Redeploy frontend after changing env vars
4. Clear browser cache

### Issue: API returns 500 errors
**Solution:**
1. Check Railway logs for error details
2. Common causes:
   - Invalid/missing `GOOGLE_API_KEY`
   - API rate limits
   - Gemini API issues
3. Test backend directly with curl
4. Check error messages in logs

---

## 📝 LOCAL DEVELOPMENT SETUP

### Backend
1. Create `backend/.env`:
```env
GOOGLE_API_KEY=your_actual_key_here
PORT=3001
NODE_ENV=development
```

2. Run backend:
```bash
cd backend
npm install
npm run dev
```

### Frontend
1. Create `.env.local` in root:
```env
VITE_API_URL=http://localhost:3001
```

2. Run frontend:
```bash
npm install
npm run dev
```

---

## 🔄 CONTINUOUS DEPLOYMENT

Both platforms auto-deploy on git push:

```bash
# Make changes to code
git add .
git commit -m "feat: add new feature"
git push origin main

# Railway automatically deploys backend
# Vercel automatically deploys frontend
```

---

## 💰 COST & LIMITS

### Railway Free Tier
- $5 credit/month
- ~500 execution hours
- Enough for hobby projects
- No credit card required for trial

### Vercel Free Tier
- 100GB bandwidth/month
- Unlimited deployments
- Serverless function execution
- Commercial use allowed
- No credit card required

---

## 🎯 QUICK REFERENCE

### Railway Dashboard URLs
- Project: https://railway.app/project/{your-project-id}
- Logs: Dashboard → Deployments → View Logs
- Variables: Dashboard → Variables
- Settings: Dashboard → Settings

### Vercel Dashboard URLs
- Project: https://vercel.com/{username}/{project}
- Deployments: Project → Deployments
- Env Vars: Project → Settings → Environment Variables
- Build Logs: Deployment → View Build Logs

### Important URLs (Save these)
- Backend API: `https://your-app.up.railway.app`
- Frontend App: `https://your-app.vercel.app`
- Health Check: `https://your-app.up.railway.app/health`

---

## ✅ READY TO DEPLOY

All files are prepared. Follow the steps above to deploy:
1. Push to GitHub
2. Deploy backend to Railway (set GOOGLE_API_KEY)
3. Deploy frontend to Vercel (set VITE_API_URL to Railway URL)
4. Test and verify

**Good luck! 🚀**
