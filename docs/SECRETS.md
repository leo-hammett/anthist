# Secrets & API Keys Management

This document explains how to securely manage API keys and secrets for Anthist.

---

## Overview

Anthist uses **AWS Amplify Secrets** to manage sensitive values. This keeps secrets out of your code and version control while making them available to Lambda functions at runtime.

---

## Required Secrets

| Secret Name | Service | Required For | Cost |
|-------------|---------|--------------|------|
| `OPENAI_API_KEY` | OpenAI | Content embeddings, semantic matching | ~$0.02/1000 items |

---

## Setting Up Secrets

### 1. Get Your OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click **"Create new secret key"**
4. Name it "Anthist" (for your reference)
5. **Copy the key immediately** - you can't see it again
6. The key starts with `sk-`

### 2. Add Secret to Amplify

For **development sandbox**:

```bash
npx ampx sandbox secret set OPENAI_API_KEY
# Paste your key when prompted (input is hidden)
```

For **production**:

```bash
npx ampx secret set OPENAI_API_KEY --branch main
# Paste your key when prompted
```

### 3. Verify Secret is Set

```bash
# List all secrets
npx ampx sandbox secret list

# Check specific secret (shows if set, not the value)
npx ampx sandbox secret get OPENAI_API_KEY
```

---

## How Secrets Work

### In Lambda Function Definitions

```typescript
// amplify/functions/content-processor/resource.ts
import { defineFunction, secret } from '@aws-amplify/backend';

export const contentProcessor = defineFunction({
  environment: {
    OPENAI_API_KEY: secret('OPENAI_API_KEY'),
  },
});
```

### In Lambda Handler Code

```typescript
// amplify/functions/content-processor/handler.ts
export const handler = async (event) => {
  // Access like any environment variable
  const apiKey = process.env.OPENAI_API_KEY;
  
  // Use it
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
    },
  });
};
```

---

## Security Best Practices

### Never Do This

```typescript
// ❌ NEVER hardcode secrets
const apiKey = 'sk-abc123...';

// ❌ NEVER commit .env files with real values
OPENAI_API_KEY=sk-abc123...

// ❌ NEVER log secrets
console.log('API Key:', process.env.OPENAI_API_KEY);
```

### Always Do This

```typescript
// ✅ Use Amplify secrets
OPENAI_API_KEY: secret('OPENAI_API_KEY'),

// ✅ Use .env.example as template (no real values)
OPENAI_API_KEY=sk-your-key-here

// ✅ Check if secret exists before using
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY not configured');
}
```

---

## Files That Must NEVER Be Committed

These are in `.gitignore` but double-check:

```
.env
.env.local
.env.*.local
amplify_outputs.json
```

### Verify Before Pushing

```bash
# Check what would be committed
git status

# If you accidentally staged a secret file
git reset HEAD .env.local
```

---

## Rotating Secrets

If a secret is compromised:

### 1. Generate New Key
Go to the service dashboard (e.g., OpenAI) and create a new key.

### 2. Update in Amplify

```bash
# Update the secret value
npx ampx sandbox secret set OPENAI_API_KEY
# Enter the new key

# For production
npx ampx secret set OPENAI_API_KEY --branch main
```

### 3. Revoke Old Key
Go back to the service dashboard and delete the old key.

### 4. Redeploy (if needed)

```bash
# Sandbox auto-updates, but for production:
npx ampx pipeline-deploy --branch main
```

---

## Troubleshooting

### "Secret not found" Error

```bash
# Make sure you've set the secret
npx ampx sandbox secret set OPENAI_API_KEY

# Restart sandbox to pick up new secrets
# Ctrl+C then:
npx ampx sandbox
```

### "Invalid API key" Error

1. Check the key is correct (no extra spaces)
2. Verify the key is active in OpenAI dashboard
3. Check you have API credits/billing set up

### Lambda Can't Access Secret

1. Ensure `secret()` is used in the function definition
2. Redeploy after adding secrets
3. Check CloudWatch logs for specific error

---

## Cost Management

### OpenAI Embeddings

**Model:** `text-embedding-3-small`  
**Cost:** $0.00002 per 1K tokens (~$0.02 per 1000 content items)

Set spending limits in OpenAI dashboard:
1. Go to https://platform.openai.com/account/limits
2. Set a monthly budget (e.g., $10)
3. Enable email alerts

### AWS Secrets Manager

Amplify secrets use AWS Secrets Manager under the hood.  
**Cost:** $0.40/secret/month + $0.05 per 10,000 API calls

For 1 secret with normal usage: **~$0.50/month**

---

## Future Secrets

When adding new services, follow this pattern:

```bash
# 1. Add to .env.example (template only)
echo "NEW_SERVICE_KEY=your-key-here" >> .env.example

# 2. Set the secret
npx ampx sandbox secret set NEW_SERVICE_KEY

# 3. Use in Lambda
import { secret } from '@aws-amplify/backend';
environment: {
  NEW_SERVICE_KEY: secret('NEW_SERVICE_KEY'),
}
```
