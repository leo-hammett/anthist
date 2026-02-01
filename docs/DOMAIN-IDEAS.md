# Email Domain Configuration

**Selected Domain:** `anthist.com`

The Anthist app uses `anthist.com` as the primary domain. Users can forward links to their personal import email address.

## Email Format

```
{random12chars}@import.anthist.com
```

Example: `a7bx2k9m4p1q@import.anthist.com`

---

## Original Domain Brainstorming

For historical reference, here were the domain ideas considered:

### Tier 1: Best Options
| Domain | Format | Pros | Cons |
|--------|--------|------|------|
| **feedme.io** | `abc123@feedme.io` | Short, memorable, action-oriented | May be taken |
| **myfeed.app** | `abc123@myfeed.app` | Clear purpose, modern TLD | Generic |
| **readlater.app** | `abc123@readlater.app` | Describes the action perfectly | Slightly long |
| **curate.me** | `abc123@curate.me` | Elegant, fits the curation concept | Abstract |

### Tier 2: Creative Options
| Domain | Format | Vibe |
|--------|--------|------|
| **slowfeed.app** | `abc123@slowfeed.app` | Anti-algorithm, mindful |
| **chosen.feed** | `abc123@chosen.feed` | You choose your content |
| **feedom.io** | `abc123@feedom.io` | Freedom + Feed pun |
| **savedfor.me** | `abc123@savedfor.me` | Saved for me |
| **watchlist.io** | `abc123@watchlist.io` | For video focus |
| **readinglist.app** | `abc123@readinglist.app` | Traditional, clear |
| **mybookmarks.io** | `abc123@mybookmarks.io` | Familiar concept |

### Tier 3: Fun/Quirky Options
| Domain | Format | Vibe |
|--------|--------|------|
| **im-bored.app** | `abc123@im-bored.app` | For when you're bored |
| **freed-me.io** | `abc123@freed-me.io` | Freedom from algorithms |
| **sendme.read** | `abc123@sendme.read` | Action-oriented |
| **tosave.it** | `abc123@tosave.it` | Playful |
| **laterbox.io** | `abc123@laterbox.io` | Pocket-like |
| **feedqueue.app** | `abc123@feedqueue.app` | Technical, queue metaphor |

---

## Format Considerations

### User Email Address Format
Each user gets a unique, randomly generated email address:

```
{random}@{domain}
```

**Options for `{random}` part:**
- 12 alphanumeric: `a7bx2k9m4p1q@feedme.io` (current)
- UUID prefix: `f47ac10b@feedme.io`
- Word combo: `blue-tiger-42@feedme.io` (memorable but longer)
- Username-based: `john-doe-a7bx@feedme.io` (privacy concern)

**Recommendation:** Keep 12 alphanumeric for security (hard to guess) and simplicity.

---

## Email Flow

1. User shares link via email to their unique address
2. AWS SES receives at `*@{domain}`
3. Lambda parses email, extracts URLs
4. Content added to user's feed

---

## Domain Registration

**Recommended registrars:**
- Cloudflare Registrar (cheapest, good DNS)
- Google Domains (simple, reliable)
- Namecheap (budget-friendly)

**DNS Setup:**
- MX records → AWS SES
- SPF, DKIM for deliverability (important for replies)

---

## Cost

| Registrar | .io | .app | .me |
|-----------|-----|------|-----|
| Cloudflare | $33/yr | $14/yr | $16/yr |
| Namecheap | $35/yr | $14/yr | $5/yr |

**Recommendation:** `.app` TLD - modern, affordable, HTTPS-required (Google)

---

## Availability Check (as of planning)

Run `whois` or check registrar for availability:
- feedme.io - Likely taken
- myfeed.app - Check availability
- readlater.app - Check availability
- curate.me - Check availability
- slowfeed.app - Likely available
- feedom.io - Likely available

---

## Final Recommendation

**Primary choice:** `feedme.app` or `myfeed.app`
**Backup choice:** `slowfeed.app` (fits the anti-algorithm narrative)
**Budget choice:** `curate.me` or any `.me` domain

The domain should:
1. Be short and memorable
2. Hint at the app's purpose
3. Be easy to type on mobile
4. Not conflict with major brands
