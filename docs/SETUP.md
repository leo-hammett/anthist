# Anthist Setup Guide

Complete guide to setting up Anthist for development and production.

---

## Prerequisites

- Node.js 18+ 
- npm or yarn
- AWS Account with admin access
- OpenAI API account (for embeddings)
- Expo Go app on your phone (for testing)

---

## 1. Clone & Install

```bash
git clone https://github.com/anthist/anthist.git
cd anthist
npm install
```

---

## 2. Environment Variables

### Create Local Environment File

```bash
cp .env.example .env.local
```

### Required Variables

Edit `.env.local` with your values:

```bash
# OpenAI (required for content embeddings)
OPENAI_API_KEY=sk-...

# Optional: Override Amplify environment
# AWS_REGION=us-east-1
```

### Where to Get API Keys

#### OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Name it "Anthist Development"
4. Copy the key (starts with `sk-`)
5. Add to `.env.local` as `OPENAI_API_KEY`

**Cost estimate:** ~$0.02 per 1000 content items embedded

---

## 3. AWS Amplify Setup

### First-Time Setup

```bash
# Install Amplify CLI if not already installed
npm install -g @aws-amplify/cli

# Configure AWS credentials (one-time)
amplify configure
```

This will:
1. Open AWS Console to create an IAM user
2. Ask you to enter the access key and secret
3. Save credentials to `~/.aws/credentials`

### Start Development Backend

```bash
npx ampx sandbox
```

This creates a personal cloud sandbox with:
- Cognito user pool
- AppSync GraphQL API
- DynamoDB tables
- S3 bucket
- Lambda functions

**First run takes 5-10 minutes.** Subsequent runs are faster.

The sandbox outputs a file at `amplify_outputs.json` which the app uses to connect.

---

## 4. Run the App

### Development (Expo Go)

```bash
npm start
```

Scan the QR code with:
- **iOS:** Camera app → tap the banner
- **Android:** Expo Go app → Scan QR

### Development Build (Native Features)

For share extensions and full native access:

```bash
# iOS
npx expo prebuild --platform ios
npx expo run:ios

# Android  
npx expo prebuild --platform android
npx expo run:android
```

---

## 5. Production Deployment

### Deploy Amplify Backend

```bash
# Deploy to production environment
npx ampx pipeline-deploy --branch main
```

Or connect to Amplify Hosting:
1. Go to AWS Amplify Console
2. Connect your GitHub repo
3. Amplify auto-deploys on push

### Build Mobile Apps

```bash
# Build for app stores
npx eas build --platform all
```

---

## API Keys Reference

| Service | Key Name | Where Used | How to Get |
|---------|----------|------------|------------|
| OpenAI | `OPENAI_API_KEY` | Lambda functions | platform.openai.com |
| AWS | Auto-configured | Amplify CLI | `amplify configure` |

### Future APIs (Not Currently Used)

| Service | Purpose | When Needed |
|---------|---------|-------------|
| Sentry | Error tracking | Production monitoring |
| PostHog | Analytics | User behavior tracking |
| RevenueCat | Subscriptions | Premium tier |

---

## Environment-Specific Configuration

### Development
- Uses Amplify sandbox (personal cloud)
- Hot reloading enabled
- Debug logs visible

### Staging  
- Shared test environment
- Connected to `staging` branch
- Same AWS account, isolated resources

### Production
- Connected to `main` branch
- Amplify Hosting auto-deploys
- CloudFront CDN enabled

---

## Troubleshooting

### "amplify_outputs.json not found"
Run `npx ampx sandbox` first to generate it.

### "Cognito user pool not configured"
The sandbox may have failed. Check terminal output for errors.

### "Lambda timeout"
Increase timeout in `amplify/functions/*/resource.ts`:
```typescript
timeoutSeconds: 60, // Increase from 30
```

### "CORS error on API calls"
AppSync handles CORS automatically. If you see this, check that `amplify_outputs.json` is being loaded correctly.

---

## Security Notes

### Never Commit
- `.env.local`
- `amplify_outputs.json` (contains resource IDs)
- `aws-exports.js` (legacy, shouldn't exist)
- Any file with API keys

### Safe to Commit
- `.env.example` (template only)
- `amplify/` folder (infrastructure as code)
- All source code

### Secrets in Production
Use AWS Secrets Manager or Amplify environment variables:

```bash
# Set production secret
npx ampx secret set OPENAI_API_KEY
# Prompts for value securely
```
