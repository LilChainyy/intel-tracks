# Adamsmyth - Investment Theme Discovery

Discover where smart money is flowing. Spotify playlists for stocks - find investment themes that match your style.

## Getting Started

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd intel-tracks

# Step 3: Install the necessary dependencies
npm install

# Step 4: Start the development server
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase

## Environment Variables

Make sure to set up the following environment variables:

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Your Supabase anon/public key

## Deployment

This project is configured for deployment on Vercel. See `VERCEL_DEPLOYMENT.md` for detailed deployment instructions.

## Development

```sh
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```
