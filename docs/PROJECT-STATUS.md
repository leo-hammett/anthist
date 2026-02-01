# Anthist Project Status

> Last updated: February 2026

This document provides an honest assessment of what's built, what's placeholder, and what's needed to ship.

---

## Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Complete and tested |
| 🏗️ | Scaffolded but needs work |
| 📝 | Placeholder/stub only |
| ❌ | Not started |

---

## Frontend (Expo/React Native)

### Navigation & Layout
| Component | Status | Notes |
|-----------|--------|-------|
| Root layout with auth routing | 🏗️ | Structure exists, needs runtime testing |
| Auth screens (login/signup) | 🏗️ | UI complete, Amplify integration untested |
| Main feed screen | 🏗️ | Structure complete, needs polish |
| Settings screen | 🏗️ | Basic UI, actions need wiring |
| Content list screen | 🏗️ | List view works, bulk actions untested |
| Add content screen | 🏗️ | URL input works, imports are stubs |

### Feed Components
| Component | Status | Notes |
|-----------|--------|-------|
| SwipeContainer (carousel) | 🏗️ | Using reanimated-carousel, untested |
| ContentCard | 🏗️ | Routing to readers works |
| EmptyFeed | ✅ | Simple component, should work |
| OnboardingOverlay | 🏗️ | UI complete, dismiss action needs testing |

### Content Readers
| Component | Status | Notes |
|-----------|--------|-------|
| BlogReader | 🏗️ | HTML rendering exists, S3 fetch is placeholder |
| YouTubePlayer | 🏗️ | Using youtube-iframe, playback untested |
| PDFViewer | 📝 | Literal placeholder, react-native-pdf not integrated |

### Themes
| Feature | Status | Notes |
|---------|--------|-------|
| 100 theme definitions | ✅ | All themes defined with colors/fonts |
| Theme application to BlogReader | 🏗️ | Basic application, needs refinement |
| Semantic theme matching | 📝 | Basic tag matching, no ML/embeddings |

### State Management
| Store | Status | Notes |
|-------|--------|-------|
| authStore (Zustand) | 🏗️ | Actions defined, Amplify calls untested |
| feedStore (Zustand) | 🏗️ | CRUD actions exist, API integration untested |

### Telemetry
| Feature | Status | Notes |
|---------|--------|-------|
| TelemetryTracker class | 🏗️ | Logic exists, debouncing untested |
| Scroll tracking | 🏗️ | Wired in BlogReader, accuracy unknown |
| Gyroscope tracking | 📝 | Expo Sensors imported, not activated |
| Data submission to backend | 📝 | Engagement model exists, submission untested |

---

## Backend (AWS Amplify Gen 2)

### Authentication
| Feature | Status | Notes |
|---------|--------|-------|
| Cognito user pool | 🏗️ | Configured for email login |
| Custom attributes | 🏗️ | importerEmail, hasSeenTutorial, preferredTheme defined |
| Sign up flow | 🏗️ | Needs `ampx sandbox` deployment to test |
| Sign in flow | 🏗️ | Needs deployment to test |

### Data (AppSync + DynamoDB)
| Model | Status | Notes |
|-------|--------|-------|
| User | 🏗️ | Schema defined, not tested |
| Content | 🏗️ | Schema defined with all fields |
| Engagement | 🏗️ | Telemetry storage model |
| Playlist | 🏗️ | For future playlist feature |
| ContentRanking | 🏗️ | Algorithm output storage |

### Storage (S3)
| Feature | Status | Notes |
|---------|--------|-------|
| Bucket configuration | 🏗️ | feedContentBucket defined |
| Blog HTML storage | 📝 | Path defined, upload logic missing |
| PDF storage | 📝 | Path defined, upload logic missing |
| Thumbnail storage | 📝 | Path defined, generation missing |

### Lambda Functions
| Function | Status | Notes |
|----------|--------|-------|
| content-processor | 🏗️ | Basic metadata extraction, no Readability.js |
| algorithm | 🏗️ | Scoring logic exists, no real ML |
| email-handler | 📝 | SES event parsing, no user lookup |
| youtube-extractor | 🏗️ | Playlist parsing via scraping |

### External Services (Not Set Up)
| Service | Status | Notes |
|---------|--------|-------|
| SES for inbound email | ❌ | Requires AWS Console setup |
| Custom domain (anthist.com) | ❌ | DNS configuration needed |
| CloudFront CDN | ❌ | Optional but recommended |

---

## Utilities & Libraries

### Content Processing
| Utility | Status | Notes |
|---------|--------|-------|
| URL extractor | ✅ | Basic regex extraction |
| Content type detection | ✅ | YouTube/PDF/Blog detection |
| Bookmark parser (HTML) | 🏗️ | Netscape format parsing, untested |
| Bookmark parser (JSON) | 🏗️ | Firefox format parsing, untested |
| Paywall detection | 📝 | Known providers list, no real detection |

### Algorithm
| Utility | Status | Notes |
|---------|--------|-------|
| Embedding helpers | 📝 | Utility functions, no OpenAI calls |
| Animation selection | 🏗️ | Logic exists, carousel config untested |

### Share Handling
| Feature | Status | Notes |
|---------|--------|-------|
| Deep link parsing | 🏗️ | URL parsing logic exists |
| Share intent handling | 📝 | Requires native dev build |
| Expo Linking setup | 🏗️ | Configured in app.config.ts |

---

## What's Needed to Ship MVP

### Critical Path (Must Have)
1. Run `npm install` and fix dependency issues
2. Run `npx ampx sandbox` and fix backend deployment
3. Test auth flow end-to-end
4. Wire up content fetching to real API
5. Implement actual blog content extraction (Readability.js in Lambda)
6. Test YouTube player with real videos
7. Fix any carousel/swipe issues

### Important (Should Have)
8. Implement PDF viewing with react-native-pdf
9. Wire S3 upload for blog content
10. Test telemetry submission
11. Verify theme application looks good
12. Add proper loading states everywhere
13. Add error boundaries

### Nice to Have (Can Wait)
14. OpenAI embeddings integration
15. SES email import setup
16. Share extension (requires native build)
17. Advanced algorithm tuning
18. Semantic theme matching

---

## Estimated Effort to MVP

| Phase | Tasks | Estimate |
|-------|-------|----------|
| Phase 1: Foundation | Install, sandbox, fix errors | 2-4 hours |
| Phase 2: Auth | Test signup/login flow | 1-2 hours |
| Phase 3: Content | Blog extraction, YouTube, basic feed | 4-8 hours |
| Phase 4: Polish | Loading states, errors, themes | 4-6 hours |
| **Total** | | **11-20 hours** |

This assumes no major architectural issues discovered during testing.

---

## Known Risks

1. **react-native-reanimated-carousel** - May have gesture conflicts
2. **react-native-youtube-iframe** - WebView quirks on different devices
3. **Amplify Gen 2** - Relatively new, fewer community examples
4. **Lambda cold starts** - May cause slow first content loads
5. **Readability.js in Lambda** - Needs jsdom or similar, increases bundle size
