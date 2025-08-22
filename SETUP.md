# SkyRadar Web Setup

## Environment Variables

Create a `.env.local` file in the root directory with the following content:

```
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_access_token_here
```

Replace `your_mapbox_access_token_here` with your actual Mapbox access token.

## Getting a Mapbox Access Token

1. Sign up for a free account at [Mapbox](https://www.mapbox.com/)
2. Go to your [Account page](https://account.mapbox.com/)
3. Copy your default public token
4. Paste it in the `.env.local` file

## Installation

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:3000`

## Features

- ✅ Mobile-first responsive design
- ✅ Mapbox integration for flight tracking
- ✅ Clean, modern UI with SkyRadar branding
- ✅ Flight number input with SMS updates
- ✅ Hamburger menu navigation
