# Anthist Marketing Website

A modern React-based landing page for Anthist, built with Vite, TypeScript, and Tailwind CSS.

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
website/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── Navbar.tsx      # Sticky navigation with glass effect
│   │   ├── Hero.tsx        # Main hero section with app preview
│   │   ├── LogoCloud.tsx   # Social proof logos
│   │   ├── Problem.tsx     # Pain points section
│   │   ├── HowItWorks.tsx  # 3-step solution
│   │   ├── Features.tsx    # Feature grid
│   │   ├── Stats.tsx       # Investor metrics
│   │   ├── Testimonials.tsx # User testimonials
│   │   ├── OpenSource.tsx  # Open source CTA
│   │   ├── CTA.tsx         # Email signup
│   │   └── Footer.tsx      # Site footer
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Entry point
│   └── index.css           # Tailwind + custom styles
├── index.html              # HTML template
└── vite.config.ts          # Vite configuration
```

## Deployment

### Vercel / Netlify
Connect your repository and set the build command to `npm run build` and output directory to `dist`.

### AWS S3 + CloudFront
```bash
npm run build
aws s3 sync dist/ s3://anthist.com
```

### Docker
```dockerfile
FROM node:20-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Customization

### Waitlist Form
The CTA component currently handles form submission client-side. Connect to your preferred form handler:

```tsx
// In CTA.tsx
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  await fetch('https://your-api.com/waitlist', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  setSubmitted(true);
};
```

### Colors
Edit the gradient and accent colors in `src/index.css`:

```css
.gradient-text {
  background: linear-gradient(135deg, #6366f1, #8b5cf6, #d946ef);
}

.gradient-accent {
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
}
```

### Fonts
The site uses Inter (sans) and Fraunces (serif) loaded from Google Fonts. Update in `index.html`.

## License

MIT
