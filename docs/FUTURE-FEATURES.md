# Future Features Roadmap

This document outlines planned features for future versions of Anthist. These are ideas we're excited about but haven't implemented yet.

---

## Quote Maker & Exporter

**Priority:** High  
**Complexity:** Medium

### Overview
Allow users to select text from any blog or article and transform it into beautiful, shareable images or printable PDFs. Turn meaningful passages into art you can display in your life.

### Features

#### Text Selection
- Long-press to select text within blog reader
- Select entire paragraphs or custom ranges
- Option to select entire article for full export

#### Export Formats
- **Image (PNG/JPG)** - Share on social media, set as wallpaper
- **Wallpaper** - Optimized dimensions for phone/desktop backgrounds
- **PDF** - High-quality print-ready format
- **Poster** - Large format for printing and framing

#### Design Options
- Multiple quote templates (minimal, elegant, bold, artistic)
- Background options (solid colors, gradients, patterns, blur)
- Font selection from curated typography
- Auto-match to content's reader theme
- Custom sizing (Instagram square, story, Twitter, desktop)

#### Attribution
- Auto-include source title and author
- Optional URL or QR code
- "via Anthist" watermark (optional, removable for premium)

### User Flow
1. While reading, long-press on text to select
2. Tap "Create Quote" from context menu
3. Choose template and customize
4. Preview and adjust
5. Export or share directly

### Technical Notes
- Use `react-native-view-shot` for image generation
- Canvas-based rendering for quality
- PDF generation via `react-native-pdf-lib`
- Consider server-side rendering for complex designs

---

## Playlist System
In the menu we're going to upgrade My Content to have Playlists.
Each playlist can be shown, hidden, renamed (not in bulk) or deleted, or opened to see it's individual content.
Each user must have a default playlist where imported content is added by default.
When individual playlists are opened, their content can be moved (to a different playlist), deleted, shown or hidden.
Duplicated content (in two playlists) can be recommended often but the recommendation algorithms should be intelligent enough to relalise the user has already seen this.

## Social Features (Future)

**Priority:** Medium  
**Complexity:** High

### Follow playlists
Playlists can be followed by sharing a secret code to them.
Playlist admins can see the email addresses of each follower and block them if they wish from that playlist, at which point the follower cannot see the playlist in my content etc.
Followers who are not editors can show or hide the playlist to decide wether or not it is in their own feed, but cannot move content into the playlist or out of it (they can copy out of it if they want instead)
Playlist followers can also be promoted to editors by the admins, where the editors can now contribute to the playlist by adding content too.
Playlists are synced between everyone forever.

---

## Reading Statistics

**Priority:** Medium  
**Complexity:** Medium

### Personal Analytics
- Daily/weekly/monthly reading time
- Articles completed
- Reading streak tracking
- Content type breakdown
- Peak reading hours
- Words read estimation

### Insights
- "You read 12 articles this week, 3 more than last week"
- "Your favorite topic: Technology"
- "Best reading day: Sunday morning"
- we want to make a predictor of how focused the user is at each time and when

---

## Offline Mode

**Priority:** Medium  
**Complexity:** Medium

### Features
- Download content for offline reading
- Automatic sync when online
- Storage management
- Allow the user to decide how many articles to download at each point in time.

### Technical
- Use Expo FileSystem for storage
- Background download queue

---

## Browser Extension - hopefully redundant.

**Priority:** Low  
**Complexity:** Medium

### Overview
One-click saving from any browser.

### Features
- "Save to Anthist" button
- Right-click context menu
- Keyboard shortcut
- Chrome, Firefox, Safari, Edge support

---

## Widgets

**Priority:** Low  
**Complexity:** Medium

### iOS Widgets
- Next up in your feed
- Reading progress
- Daily reading goal
- Random favorite quote

### Android Widgets
- Similar functionality
- Home screen quick actions

---

## Contributing Ideas

Have a feature idea? We'd love to hear it!

1. Open an issue on GitHub
2. Tag it with `feature-request`
3. Describe the use case and why it matters

Community-driven features get priority consideration.


## Podcasts, music, notes collection, 

Paylwlllaa

paw

paywall bypasser


