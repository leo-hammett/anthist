# Anthist

**Your personal anthology. A TikTok for blogs and videos you actually want to watch.**

*Anthist* (from "Anthology") is a distraction-free content reader that lets you curate your own beautiful collection of content. Swipe through articles and videos you've chosen, with a smart recommendation system that learns your preferences—not one designed to keep you scrolling forever.

**Website:** [anthist.com](https://anthist.com)

## Features

- **Horizontal Swipe Navigation** - TikTok-style swiping but horizontal (for blogs that need vertical scroll)
- **Distraction-Free Reading** - Clean reader mode with 100 beautiful themes
- **YouTube Without Distractions** - Watch videos without recommendations or autoplay
- **Smart Recommendations** - Algorithm learns from your engagement (time, scroll, attention)
- **Multiple Import Methods**:
  - Share from any app
  - Email links to your personal import address
  - Bulk import bookmarks
  - PDF uploads
- **Privacy-Focused** - You own your data, open source

## Why "Anthist"?

An **anthology** is a curated collection of literary works chosen for their quality. Anthist puts you in control of your own anthology—a personal collection of blogs, videos, and documents that matter to you, not what an algorithm thinks will maximize your screen time.

## Tech Stack

### Mobile App
- **Expo** (React Native)
- **TypeScript** for type safety
- **Zustand** for state management
- **React Native Reanimated Carousel** for smooth swipe animations
- **Expo Sensors** for engagement tracking (gyroscope)

### Backend (AWS Amplify Gen 2)
- **Cognito** - Authentication
- **AppSync + DynamoDB** - GraphQL API & database
- **S3** - Blog content storage
- **Lambda** - Content processing, algorithm, email handling
- **SES** - Inbound email processing

### Algorithm
- **OpenAI text-embedding-3-small** - Content embeddings
- **Multi-signal ranking** - Time, scroll, gyro, completion rate
- **Semantic theme matching** - Themes match content type

## Project Structure

```
anthist/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Login/signup
│   └── (main)/            # Feed, settings, content list
├── components/
│   ├── feed/              # SwipeContainer, ContentCard
│   ├── reader/            # BlogReader, YouTubePlayer, PDFViewer
│   ├── themes/            # 100 reader themes
│   └── tutorial/          # Onboarding
├── lib/
│   ├── algorithm/         # Ranking, animations, embeddings
│   ├── content/           # Extraction, bookmarks, paywall
│   ├── telemetry/         # Engagement tracking
│   └── store/             # Zustand stores
├── amplify/
│   ├── auth/              # Cognito config
│   ├── data/              # DynamoDB schema
│   ├── storage/           # S3 config
│   └── functions/         # Lambda functions
├── docs/
│   ├── SETUP.md           # Full setup guide
│   ├── SECRETS.md         # API keys & security
│   ├── PROJECT-STATUS.md  # What's done, what's not
│   ├── FUTURE-FEATURES.md # Roadmap
│   ├── PRICING.md         # AWS cost estimates
│   └── DOMAIN-IDEAS.md    # Email domain config
└── website/               # Marketing site for anthist.com
```

## Quick Start

```bash
# Clone & install
git clone https://github.com/anthist/anthist.git
cd anthist
npm install

# Set up secrets (required for content processing)
npx ampx sandbox secret set OPENAI_API_KEY
# Paste your OpenAI key when prompted

# Start Amplify sandbox (creates cloud resources)
npx ampx sandbox

# In another terminal - start the app
npm start
```

**Full setup guide:** [docs/SETUP.md](docs/SETUP.md)

## Documentation

| Document | Description |
|----------|-------------|
| [SETUP.md](docs/SETUP.md) | Complete setup and deployment guide |
| [SECRETS.md](docs/SECRETS.md) | API keys and security management |
| [PROJECT-STATUS.md](docs/PROJECT-STATUS.md) | Current state - what's done, what's placeholder |
| [FUTURE-FEATURES.md](docs/FUTURE-FEATURES.md) | Roadmap and planned features |
| [PRICING.md](docs/PRICING.md) | Detailed AWS cost breakdown |

## Required API Keys

| Service | Purpose | Get From | Cost |
|---------|---------|----------|------|
| OpenAI | Content embeddings | [platform.openai.com](https://platform.openai.com/api-keys) | ~$0.02/1000 items |
| AWS | Backend infrastructure | Auto via Amplify CLI | See pricing doc |

See [docs/SECRETS.md](docs/SECRETS.md) for secure setup instructions.

## Architecture

### Content Flow

1. User shares/emails/imports a URL
2. Lambda extracts metadata and content
3. Content stored in DynamoDB, HTML in S3
4. OpenAI generates embedding for recommendations
5. Algorithm ranks content based on user patterns

### Recommendation Algorithm

The algorithm considers:
- **Time of day** - When you engage most
- **Content embeddings** - Similar to high-engagement items
- **Scroll behavior** - Fast scroll = less interest
- **Completion rates** - Finish similar content?
- **Recency** - Fresh content boost
- **Resume state** - Continue unfinished content

### Theme System

100 themes organized by:
- **Dark (40)** - Night reading optimized
- **Light (40)** - Day reading optimized
- **Specialty (20)** - Accessibility, seasonal, mood

Algorithm matches content semantic tags to appropriate theme.

## Cost Estimates

| MAU | AWS | OpenAI | Total |
|-----|-----|--------|-------|
| 1-10 | ~$0 (free tier) | ~$1 | **~$1/mo** |
| 100 | ~$16 | ~$10 | **~$26/mo** |
| 1,000 | ~$140 | ~$100 | **~$240/mo** |

See [docs/PRICING.md](docs/PRICING.md) for detailed breakdown.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Philosophy

This app follows the **grug brain developer** philosophy:
- Simple > Complex
- Readable > Clever
- Working > Perfect
- Small changes > Big rewrites

We prioritize user experience, privacy, and code maintainability over adding more features.

## Future Features

See [docs/FUTURE-FEATURES.md](docs/FUTURE-FEATURES.md) for our roadmap including:
- Quote maker & exporter (text to beautiful images/PDFs)
- Favorites system
- Social sharing & friend feeds
- And more...

---

**Website:** [anthist.com](https://anthist.com)

**Note**: This is an open source project. The cloud backend is provided free for the first 1,000 users. Self-hosting instructions coming soon.
