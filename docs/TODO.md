# Anthist Development TODO

A human-readable checklist to get Anthist from scaffold to shippable.

**Last Updated:** February 2026

---

## Phase 1: Foundation Setup

- [x] Run `npm install` and fix any dependency issues
- [ ] Run `npx ampx sandbox` to deploy backend
- [ ] Set OpenAI API key: `npx ampx sandbox secret set OPENAI_API_KEY`
- [x] Run `npm start` and verify Expo loads
- [ ] Test on Expo Go (iOS or Android)

---

## Phase 2: Authentication Flow

- [x] Login screen renders correctly
- [x] Signup screen renders correctly
- [ ] Test signup flow (email + password) with real backend
- [ ] Test email confirmation code entry
- [ ] Test login flow with real backend
- [ ] Test logout
- [ ] Verify auth state persists on app restart
- [ ] Fix any auth-related bugs

---

## Phase 3: Content System

### Adding Content
- [ ] Test manual URL input on Add Content screen
- [ ] Verify content appears in feed after adding
- [ ] Test content type detection (YouTube vs Blog vs PDF)

### Content Extraction (Lambda)
- [x] Integrate Readability.js for blog content extraction
- [x] YouTube metadata extraction (title, thumbnail via oEmbed)
- [x] Wire up S3 upload for extracted blog HTML
- [x] PDF URL detection

### Content Display
- [x] BlogReader fetches from S3 with fallback
- [x] YouTubePlayer with distraction-free mode
- [x] PDF viewing via WebView/iframe
- [x] Themes apply correctly to BlogReader

---

## Phase 4: Feed & Navigation

- [ ] Test horizontal swipe between content items
- [ ] Verify swipe animations are smooth
- [ ] Test double-tap menu appears
- [ ] Verify "next" and "previous" navigation works
- [x] Empty feed state displays correctly
- [x] Onboarding overlay component ready
- [ ] Test onboarding dismisses and doesn't show again

---

## Phase 5: Content Management

- [ ] Test Content List screen loads all content
- [ ] Test filtering by content type
- [ ] Test hiding content (removes from feed)
- [ ] Test unhiding content (returns to feed)
- [ ] Test deleting content permanently
- [ ] Test bulk selection and actions

---

## Phase 6: Settings

- [ ] Verify user email displays correctly
- [ ] Test copy importer email to clipboard
- [ ] Test accessibility mode toggle saves
- [ ] Test theme preference saves
- [ ] Test logout works from settings

---

## Phase 7: Telemetry & Algorithm

- [x] Scroll tracking code implemented
- [x] Time-on-content tracking implemented
- [x] Gyroscope tracking (native only)
- [ ] Wire up telemetry submission to Engagement model
- [ ] Test algorithm returns ranked content
- [ ] Verify content order reflects algorithm output

---

## Phase 8: Polish & Edge Cases

- [ ] Add loading spinners to all async operations
- [ ] Add error boundaries for graceful failure
- [ ] Handle network offline gracefully
- [ ] Test with slow network (throttled)
- [x] Web runs without errors
- [ ] Test on iOS
- [ ] Test on Android

---

## Phase 9: Advanced Features (Post-MVP)

- [ ] Email import (SES configuration)
- [ ] Share extension (requires native build)
- [x] Bookmark parser implemented (HTML/JSON)
- [ ] OpenAI embeddings for recommendations
- [x] Semantic theme matching code ready

---

## Phase 10: Launch Prep

- [ ] Create app icons (all sizes)
- [ ] Create splash screen
- [ ] Write App Store description
- [ ] Write Play Store description
- [ ] Create screenshots for stores
- [ ] Build production apps with EAS
- [ ] Deploy production backend
- [x] Marketing website created

---

## Quick Reference

### Commands
```bash
# Start development
npm install
npx ampx sandbox
npm start

# Set secrets
npx ampx sandbox secret set OPENAI_API_KEY

# Build for testing
npx expo prebuild
npx expo run:ios
npx expo run:android

# Build for production
npx eas build --platform all
```

### Key Files
- `app/_layout.tsx` - Root navigation & auth check
- `lib/store/authStore.ts` - Authentication state
- `lib/store/feedStore.ts` - Content & feed state
- `amplify/data/resource.ts` - Database schema
- `amplify/functions/*/handler.ts` - Backend logic
