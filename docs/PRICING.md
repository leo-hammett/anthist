# AWS Pricing Estimates for Anthist

This document provides cost estimates for running the Feed app backend on AWS at various scales.

## Assumptions

- Each user has ~50 content items on average
- Users engage with ~10 items per day
- Algorithm runs ~20 times per day per active user
- Blog content averages 100KB stored HTML
- OpenAI embeddings generated once per content item
- Prices are in USD (us-east-1 region)

---

## Cost Breakdown by Service

### Amazon Cognito (Authentication)
- **Pricing**: Free for first 50,000 MAUs
- **Notes**: Email-only auth means no additional SMS costs

| MAU | Monthly Cost |
|-----|-------------|
| 1 | $0.00 |
| 10 | $0.00 |
| 100 | $0.00 |
| 1,000 | $0.00 |

### Amazon DynamoDB (Database)
- **Pricing**: 
  - On-demand: $1.25 per million write requests, $0.25 per million read requests
  - Storage: $0.25 per GB-month
- **Estimates**: 
  - ~100 writes/user/day (engagement, content updates)
  - ~500 reads/user/day (feed loads, rankings)

| MAU | Writes/mo | Reads/mo | Storage | Monthly Cost |
|-----|-----------|----------|---------|-------------|
| 1 | 3K | 15K | 5MB | $0.00 (free tier) |
| 10 | 30K | 150K | 50MB | $0.00 (free tier) |
| 100 | 300K | 1.5M | 500MB | ~$2.00 |
| 1,000 | 3M | 15M | 5GB | ~$15.00 |

### Amazon S3 (Blog Storage)
- **Pricing**: 
  - Storage: $0.023 per GB-month (Standard)
  - Requests: $0.0004 per 1,000 GET requests
- **Estimates**: 
  - ~5MB stored content per user
  - ~50 GETs per user per day

| MAU | Storage | GET Requests/mo | Monthly Cost |
|-----|---------|-----------------|-------------|
| 1 | 5MB | 1.5K | $0.01 |
| 10 | 50MB | 15K | $0.05 |
| 100 | 500MB | 150K | $0.50 |
| 1,000 | 5GB | 1.5M | $5.00 |

### AWS Lambda (Functions)
- **Pricing**: 
  - $0.20 per 1M requests
  - $0.0000166667 per GB-second
- **Functions**:
  - Algorithm: 256MB, ~200ms, 20 calls/user/day
  - Content Processor: 512MB, ~2s, 2 calls/user/day (new content)
  - Email Handler: 256MB, ~100ms, sporadic

| MAU | Invocations/mo | GB-seconds | Monthly Cost |
|-----|----------------|------------|-------------|
| 1 | 700 | 15 | $0.00 (free tier) |
| 10 | 7K | 150 | $0.00 (free tier) |
| 100 | 70K | 1.5K | ~$5.00 |
| 1,000 | 700K | 15K | ~$40.00 |

### AWS AppSync (GraphQL API)
- **Pricing**: 
  - $4.00 per million Query/Mutation requests
  - $2.00 per million real-time updates
- **Estimates**: 
  - ~100 API calls per user per day

| MAU | Requests/mo | Monthly Cost |
|-----|-------------|-------------|
| 1 | 3K | $0.00 (free tier) |
| 10 | 30K | ~$1.00 |
| 100 | 300K | ~$8.00 |
| 1,000 | 3M | ~$75.00 |

### Amazon SES (Email Import)
- **Pricing**: 
  - Receiving: $0.10 per 1,000 emails
  - First 1,000 emails free
- **Estimates**: 
  - ~5 emails per user per month

| MAU | Emails/mo | Monthly Cost |
|-----|-----------|-------------|
| 1 | 5 | $0.00 |
| 10 | 50 | $0.00 |
| 100 | 500 | $0.50 |
| 1,000 | 5K | $5.00 |

### OpenAI Embeddings (External)
- **Pricing**: 
  - text-embedding-3-small: $0.02 per 1M tokens
- **Estimates**: 
  - ~1,000 tokens per content item
  - 50 content items per user
  - Only charged once per content item

| MAU | Tokens | Monthly Cost |
|-----|--------|-------------|
| 1 | 50K | $0.10 |
| 10 | 500K | $1.00 |
| 100 | 5M | $10.00 |
| 1,000 | 50M | $100.00 |

---

## Total Monthly Cost Summary

| MAU | AWS Services | OpenAI | **Total** |
|-----|-------------|--------|-----------|
| 1 | ~$0.01 | $0.10 | **~$0.11** |
| 10 | ~$1.05 | $1.00 | **~$2.05** |
| 100 | ~$16.00 | $10.00 | **~$26.00** |
| 1,000 | ~$140.00 | $100.00 | **~$240.00** |

---

## Cost Optimization Tips

1. **Use DynamoDB On-Demand** for unpredictable workloads, switch to Provisioned for steady traffic
2. **Enable S3 Intelligent-Tiering** for automatic storage class optimization
3. **Batch OpenAI API calls** using the Batch API for 50% discount (24-hour turnaround)
4. **Cache algorithm results** to reduce Lambda invocations
5. **Use Lambda ARM64** (Graviton2) for 34% better price-performance
6. **Consider reserved capacity** for Cognito if exceeding 50K MAU

---

## Free Tier Coverage

For the first **10 MAU**, most costs are covered by AWS Free Tier:
- Lambda: 1M requests/month free
- DynamoDB: 25GB storage, 25 WCU/RCU free
- S3: 5GB storage free
- Cognito: 50K MAU free
- AppSync: 250K queries/month free (first 12 months)

**Self-hosting cost for 1-10 users: Effectively $1-2/month** (mostly OpenAI)

---

## Notes

- Prices subject to change; check AWS pricing pages for current rates
- Estimates assume moderate usage patterns
- Heavy users or content-heavy feeds may increase costs
- Video content is NOT stored (streamed from YouTube) to keep S3 costs low
